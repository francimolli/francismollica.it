"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FLIGHT_ANCHORS, type FlightAnchor } from "./config";
import { easeInOutCubic, onSurface } from "./toon";
import { planetRefs, useUniverseStore } from "./store";

// Risolve l'ancora: se ha un punto di superficie, lo segue nella rotazione
// del pianeta, così si atterra sempre davanti agli elementi giusti.
function resolveAnchor(anchor: FlightAnchor): { to: THREE.Vector3; toTarget: THREE.Vector3 } {
    if (anchor.surface) {
        const ref = planetRefs[anchor.surface.planet];
        if (ref) {
            const s = anchor.surface;
            const { position } = onSurface(s.lat, s.lon, s.distance);
            const look = onSurface(s.lookAt.lat, s.lookAt.lon, s.lookAt.radius);
            return {
                to: ref.localToWorld(position),
                toTarget: ref.localToWorld(look.position),
            };
        }
    }
    return {
        to: new THREE.Vector3(...anchor.position),
        toTarget: new THREE.Vector3(...anchor.lookAt),
    };
}

type ControlsRef = ComponentRef<typeof OrbitControls>;

interface Flight {
    t: number;
    duration: number;
    curve: THREE.CubicBezierCurve3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    id: string;
}

// Regia della camera: orbita libera in idle, volo su curva di Bézier verso
// i pianetini. Con prefers-reduced-motion il volo diventa una dissolvenza
// (il velo è nel DOM, vedi CartoonUniverse).
export function CameraRig() {
    const controls = useRef<ControlsRef>(null);
    const camera = useThree((s) => s.camera);
    const flight = useRef<Flight | null>(null);
    const teleportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flyTo = useUniverseStore((s) => s.flyTo);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);

    useEffect(() => {
        if (!flyTo || !controls.current) return;
        const anchor = FLIGHT_ANCHORS[flyTo];
        if (!anchor) return;
        const store = useUniverseStore.getState();
        const from = camera.position.clone();
        const { to, toTarget } = resolveAnchor(anchor);
        const dist = from.distanceTo(to);

        if (store.reducedMotion) {
            // niente volo: dissolvenza e teletrasporto a metà velo
            store.setFlying(true);
            teleportTimer.current = setTimeout(() => {
                camera.position.copy(to);
                controls.current?.target.copy(toTarget);
                useUniverseStore.getState().setArrived(flyTo);
            }, 350);
            return;
        }

        // curva morbida: punti di controllo sollevati rispetto alla congiungente
        const mid1 = from.clone().lerp(to, 0.3);
        const mid2 = from.clone().lerp(to, 0.7);
        const lift = Math.min(dist * 0.3, 26); // arco proporzionato anche sui salti brevi
        mid1.y += lift;
        mid2.y += lift * 0.6;

        flight.current = {
            t: 0,
            duration: THREE.MathUtils.clamp(dist / 14, 1.4, 5.5), // durata ∝ distanza
            curve: new THREE.CubicBezierCurve3(from, mid1, mid2, to),
            fromTarget: controls.current.target.clone(),
            toTarget,
            id: flyTo,
        };
        store.setFlying(true);
        controls.current.enabled = false;
    }, [flyTo, camera]);

    useEffect(() => () => {
        if (teleportTimer.current) clearTimeout(teleportTimer.current);
    }, []);

    useFrame((_, dt) => {
        const f = flight.current;
        const ctl = controls.current;
        if (!f || !ctl) return;
        f.t = Math.min(f.t + dt / f.duration, 1);
        const e = easeInOutCubic(f.t);
        f.curve.getPoint(e, camera.position);
        ctl.target.lerpVectors(f.fromTarget, f.toTarget, e);
        if (f.t >= 1) {
            flight.current = null;
            ctl.enabled = true;
            useUniverseStore.getState().setArrived(f.id);
        }
    });

    return (
        <OrbitControls
            ref={controls}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={14}
            maxDistance={95}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.25}
        />
    );
}
