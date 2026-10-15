"use client";

import { useEffect, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FLIGHT, OVERVIEW, PLANETS, SECRET_ARTIFACTS } from "./config";
import { easeInOutCubic } from "./toon";
import { artifactWorldPosition } from "./Artifacts";
import { bridge, flightInput, lastInteraction, useUniverseStore } from "./store";

type ControlsRef = ComponentRef<typeof OrbitControls>;

interface Flight {
    t: number;
    duration: number;
    curve: THREE.CubicBezierCurve3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    id: string;
}

const UP = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();
const offset = new THREE.Vector3();
const localRight = new THREE.Vector3();
const planetCenter = new THREE.Vector3();

// Ancora d'atterraggio: ci si avvicina dal lato da cui si arriva, un po'
// dall'alto, guardando il pianeta. "overview" è la vista d'insieme.
function resolveAnchor(id: string, camera: THREE.Camera) {
    if (id === "overview") {
        return {
            to: new THREE.Vector3(...OVERVIEW.position),
            toTarget: new THREE.Vector3(...OVERVIEW.lookAt),
        };
    }
    const p = PLANETS.find((pl) => pl.id === id);
    if (!p) return null;
    const center = new THREE.Vector3(...p.position);
    const dir = camera.position.clone().sub(center);
    if (dir.lengthSq() < 1e-4) dir.set(0, 0.3, 1);
    dir.normalize();
    const to = center
        .clone()
        .addScaledVector(dir, p.radius * FLIGHT.landDistanceFactor)
        .add(new THREE.Vector3(0, p.radius * 0.7, 0));
    return { to, toTarget: center };
}

interface FlightRigProps {
    setCoordinates: (coords: { lat: number; long: number }) => void;
}

// Regia di volo: controlli liberi identici al vecchio universo (WASD/frecce,
// joystick e frecce-sguardo su mobile, boost), più i voli automatici su
// curva di Bézier verso i pianetini. L'input manuale annulla l'autopilota.
export function FlightRig({ setCoordinates }: FlightRigProps) {
    const controls = useRef<ControlsRef>(null);
    const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
    const flight = useRef<Flight | null>(null);
    const teleportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const coordThrottle = useRef(0);
    const proximityThrottle = useRef(0);
    const lastOpenAt = useRef<Record<string, number>>({});

    const flyTo = useUniverseStore((s) => s.flyTo);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);

    useEffect(() => {
        if (!flyTo || !controls.current) return;
        const store = useUniverseStore.getState();
        const anchor = resolveAnchor(flyTo, camera);
        if (!anchor) return;
        const from = camera.position.clone();
        const dist = from.distanceTo(anchor.to);

        if (store.reducedMotion) {
            // niente volo: dissolvenza (velo nel DOM) e teletrasporto
            store.setFlying(true);
            teleportTimer.current = setTimeout(() => {
                camera.position.copy(anchor.to);
                controls.current?.target.copy(anchor.toTarget);
                useUniverseStore.getState().setArrived(flyTo);
            }, 350);
            return;
        }

        const mid1 = from.clone().lerp(anchor.to, 0.3);
        const mid2 = from.clone().lerp(anchor.to, 0.7);
        const lift = Math.min(dist * 0.3, 26);
        mid1.y += lift;
        mid2.y += lift * 0.6;

        flight.current = {
            t: 0,
            // il warp (wormhole) è un lampo, il volo normale prende il suo tempo
            duration: store.warping
                ? THREE.MathUtils.clamp(dist / 160, 0.9, 2.2)
                : THREE.MathUtils.clamp(dist / 40, 1.4, 6),
            curve: new THREE.CubicBezierCurve3(from, mid1, mid2, anchor.to),
            fromTarget: controls.current.target.clone(),
            toTarget: anchor.toTarget,
            id: flyTo,
        };
        store.setFlying(true);
        controls.current.enabled = false;
    }, [flyTo, camera]);

    useEffect(() => () => {
        if (teleportTimer.current) clearTimeout(teleportTimer.current);
    }, []);

    useFrame((state, dt) => {
        const ctl = controls.current;
        if (!ctl) return;
        const cam = state.camera as THREE.PerspectiveCamera;
        const store = useUniverseStore.getState();
        const moving =
            flightInput.x !== 0 || flightInput.z !== 0 ||
            flightInput.yaw !== 0 || flightInput.pitch !== 0;

        // --- volo automatico ---
        const f = flight.current;
        if (f) {
            if (moving) {
                // il pilota riprende i comandi
                flight.current = null;
                ctl.enabled = true;
                store.setFlying(false);
                if (store.warping) store.setWarping(false);
            } else {
                f.t = Math.min(f.t + dt / f.duration, 1);
                const e = easeInOutCubic(f.t);
                f.curve.getPoint(e, cam.position);
                ctl.target.lerpVectors(f.fromTarget, f.toTarget, e);
                if (f.t >= 1) {
                    flight.current = null;
                    ctl.enabled = true;
                    store.setArrived(f.id);
                    if (store.warping) store.setWarping(false);
                }
            }
        }

        // --- volo libero (controlli identici al vecchio universo) ---
        if (!flight.current && moving) {
            ctl.autoRotate = false;
            cam.getWorldDirection(forward).normalize();
            right.crossVectors(forward, UP).normalize();

            const speed = FLIGHT.speed * (bridge.boost ? FLIGHT.boostMultiplier : 1) * dt;
            move.set(0, 0, 0)
                .addScaledVector(right, flightInput.x)
                .addScaledVector(forward, flightInput.z);
            if (move.lengthSq() > 0) {
                move.normalize().multiplyScalar(speed);
                cam.position.add(move);
                ctl.target.add(move);
            }

            // sguardo (frecce mobile): ruota il target attorno alla camera
            if (flightInput.yaw !== 0 || flightInput.pitch !== 0) {
                offset.subVectors(ctl.target, cam.position);
                if (flightInput.yaw !== 0) {
                    offset.applyAxisAngle(UP, -flightInput.yaw * FLIGHT.lookSpeed * dt);
                }
                if (flightInput.pitch !== 0) {
                    localRight.crossVectors(offset, UP).normalize();
                    offset.applyAxisAngle(localRight, flightInput.pitch * FLIGHT.lookSpeed * dt);
                }
                ctl.target.copy(cam.position).add(offset);
            }

            // FOV dinamico: si allarga in accelerazione, di più col boost
            const targetFov = flightInput.z > 0 ? (bridge.boost ? 60 : 50) : 46;
            cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.06);
            cam.updateProjectionMatrix();
        } else if (!flight.current) {
            ctl.autoRotate = !store.reducedMotion;
            if (Math.abs(cam.fov - 42) > 0.05) {
                cam.fov = THREE.MathUtils.lerp(cam.fov, 42, 0.05);
                cam.updateProjectionMatrix();
            }
        }
        ctl.autoRotateSpeed = 0.25 * bridge.timeScale;

        // --- telemetria HUD (throttled, niente setState a ogni frame) ---
        coordThrottle.current += dt;
        if (coordThrottle.current > 0.4) {
            coordThrottle.current = 0;
            setCoordinates({
                lat: Math.round((cam.position.z / 10) * 100) / 100,
                long: Math.round((cam.position.x / 10) * 100) / 100,
            });
        }

        // --- prossimità: sezioni e segreti (throttled) ---
        proximityThrottle.current += dt;
        if (proximityThrottle.current > 0.25) {
            proximityThrottle.current = 0;
            const now = Date.now();
            const interacting = now - lastInteraction.at < 2500;

            if (interacting && !flight.current) {
                for (const p of PLANETS) {
                    if (!p.section) continue;
                    planetCenter.set(...p.position);
                    const d = cam.position.distanceTo(planetCenter);
                    if (d < p.radius + FLIGHT.proximityOpen) {
                        const last = lastOpenAt.current[p.id] ?? 0;
                        if (now - last > FLIGHT.proximityCooldownMs) {
                            lastOpenAt.current[p.id] = now;
                            store.setProximitySection(p.section);
                        }
                        break;
                    }
                }
            }

            for (const a of SECRET_ARTIFACTS) {
                if (store.unlockedSecretIds.includes(a.id) || store.pendingUnlock) continue;
                const d = cam.position.distanceTo(artifactWorldPosition(a.id));
                if (d < FLIGHT.secretRange) {
                    store.setPendingUnlock(a.id);
                    break;
                }
            }
        }
    });

    return (
        <OrbitControls
            ref={controls}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={4}
            maxDistance={600}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.25}
        />
    );
}
