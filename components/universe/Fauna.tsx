"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Outlines, Trail, useCursor } from "@react-three/drei";
import { getToonGradient, onSurface } from "./toon";
import { OUTLINE, PASTEL } from "./palette";
import { PLANETS } from "./config";
import { bridge, useUniverseStore } from "./store";

// Le altre specie dell'universo. Tutte procedurali, tutte con variazioni
// individuali (seed), tutte al passo con il Flusso del Tempo.

// PRNG deterministico per varianti stabili tra i render.
function mulberry(seed: number) {
    let s = Math.floor(seed * 1e9) || 1;
    return () => {
        s |= 0; s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const MEDUSA_COLORS = [PASTEL.lilac, PASTEL.sky, PASTEL.rose, PASTEL.mint];

// --- FLUTTUANTI: meduse-palloncino che vagano lente tra i pianeti ---------

function Medusa({ seed }: { seed: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const dome = useRef<THREE.Mesh>(null);
    const tentacles = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const squishUntil = useRef(0);
    useCursor(hovered);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);

    const traits = useMemo(() => {
        const rand = mulberry(seed);
        const angle = rand() * Math.PI * 2;
        return {
            color: MEDUSA_COLORS[Math.floor(rand() * MEDUSA_COLORS.length)],
            radius: 55 + rand() * 90, // anello di deriva, tra i pianeti
            y: (rand() - 0.5) * 70,
            angle,
            drift: (0.008 + rand() * 0.012) * (rand() > 0.5 ? 1 : -1),
            size: 0.8 + rand() * 0.9,
            phase: rand() * Math.PI * 2,
            pulse: 1.2 + rand() * 0.8,
        };
    }, [seed]);

    const angleRef = useRef(traits.angle);

    useFrame(({ clock }, dt) => {
        if (!group.current) return;
        const t = clock.elapsedTime;
        if (!reducedMotion) angleRef.current += traits.drift * bridge.timeScale * dt * 10;
        const a = angleRef.current;
        group.current.position.set(
            Math.cos(a) * traits.radius,
            traits.y + Math.sin(t * 0.3 + traits.phase) * 6,
            Math.sin(a) * traits.radius,
        );
        // pulsazione a campana (nuoto da medusa)
        const squishing = performance.now() < squishUntil.current;
        const p = Math.sin(t * traits.pulse + traits.phase);
        const sy = squishing ? 0.5 : 1 + p * 0.12;
        const sxz = squishing ? 1.35 : 1 - p * 0.08;
        if (dome.current) dome.current.scale.set(sxz, sy, sxz);
        if (tentacles.current) {
            tentacles.current.children.forEach((c, i) => {
                c.rotation.x = Math.sin(t * traits.pulse + i * 1.5) * 0.25;
            });
        }
        group.current.scale.setScalar(traits.size * (hovered ? 1.12 : 1));
    });

    const onClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        squishUntil.current = performance.now() + 450; // squish & stretch di risposta
    };

    return (
        <group ref={group}>
            {/* campana */}
            <mesh
                ref={dome}
                onClick={onClick}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[0.9, 14, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
                <meshToonMaterial color={traits.color} gradientMap={gradient} transparent opacity={0.92} />
                <Outlines thickness={0.03} color={OUTLINE} />
            </mesh>
            {/* occhietti */}
            <mesh position={[-0.22, 0.1, 0.78]}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <meshBasicMaterial color={OUTLINE} />
            </mesh>
            <mesh position={[0.22, 0.1, 0.78]}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <meshBasicMaterial color={OUTLINE} />
            </mesh>
            {/* tentacoli */}
            <group ref={tentacles} position={[0, -0.15, 0]}>
                {[0, 1, 2, 3].map((i) => {
                    const a = (i / 4) * Math.PI * 2;
                    return (
                        <mesh key={i} position={[Math.cos(a) * 0.4, -0.45, Math.sin(a) * 0.4]}>
                            <coneGeometry args={[0.12, 0.9, 6]} />
                            <meshToonMaterial color={traits.color} gradientMap={gradient} transparent opacity={0.8} />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}

// --- MESSAGGERI: veloci, volano tra due pianeti lasciando una scia --------

function Messaggero({ seed }: { seed: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const body = useRef<THREE.Group>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const route = useRef<{ curve: THREE.CubicBezierCurve3; t: number; speed: number } | null>(null);
    const rand = useMemo(() => mulberry(seed + 7), [seed]);
    const tmp = useMemo(() => new THREE.Vector3(), []);

    const newRoute = (from?: THREE.Vector3) => {
        const visible = PLANETS.filter((p) => !p.secret);
        const a = from ?? new THREE.Vector3(...visible[Math.floor(rand() * visible.length)].position);
        let bPlanet = visible[Math.floor(rand() * visible.length)];
        for (let i = 0; i < 4 && a.distanceTo(new THREE.Vector3(...bPlanet.position)) < 60; i++) {
            bPlanet = visible[Math.floor(rand() * visible.length)];
        }
        const b = new THREE.Vector3(...bPlanet.position).add(
            new THREE.Vector3((rand() - 0.5) * 20, 14 + rand() * 10, (rand() - 0.5) * 20),
        );
        const m1 = a.clone().lerp(b, 0.33);
        const m2 = a.clone().lerp(b, 0.66);
        m1.y += 25 + rand() * 20;
        m2.y += 25 + rand() * 20;
        route.current = {
            curve: new THREE.CubicBezierCurve3(a, m1, m2, b),
            t: 0,
            speed: 0.06 + rand() * 0.05,
        };
    };

    useFrame((_, dt) => {
        if (!body.current) return;
        if (!route.current) newRoute();
        const r = route.current!;
        if (!reducedMotion) r.t += r.speed * Math.abs(bridge.timeScale) * dt;
        if (r.t >= 1) {
            newRoute(r.curve.v3.clone());
            return;
        }
        r.curve.getPoint(r.t, body.current.position);
        // orientati lungo la rotta
        r.curve.getPoint(Math.min(r.t + 0.01, 1), tmp);
        body.current.lookAt(tmp);
    });

    return (
        <Trail
            width={2.2}
            length={5}
            decay={1.2}
            color={PASTEL.warmYellow}
            attenuation={(w) => w * w}
        >
            <group ref={body}>
                {/* corpo a goccia */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.35, 1.2, 10]} />
                    <meshToonMaterial color={PASTEL.warmYellow} emissive={PASTEL.warmYellow} emissiveIntensity={0.5} gradientMap={gradient} />
                    <Outlines thickness={0.03} color={OUTLINE} />
                </mesh>
                {/* occhialoni da corridore */}
                <mesh position={[0, 0.18, 0.35]}>
                    <sphereGeometry args={[0.16, 8, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <pointLight color={PASTEL.warmYellow} intensity={2} distance={8} decay={2} />
            </group>
        </Trail>
    );
}

// --- TIMIDI: periscopi che si nascondono quando il cursore si avvicina ----

export function Timido({ planetRadius, lat, lon, seed }: { planetRadius: number; lat: number; lon: number; seed: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const stem = useRef<THREE.Group>(null);
    const hiddenUntil = useRef(0);
    const { position, quaternion } = useMemo(
        () => onSurface(lat, lon, planetRadius - 0.05),
        [lat, lon, planetRadius],
    );
    const color = useMemo(() => {
        const rand = mulberry(seed + 13);
        return MEDUSA_COLORS[Math.floor(rand() * MEDUSA_COLORS.length)];
    }, [seed]);

    useFrame(({ clock }) => {
        if (!stem.current) return;
        const hidden = performance.now() < hiddenUntil.current;
        const target = hidden ? 0.06 : 1 + Math.sin(clock.elapsedTime * 1.6 + seed * 9) * 0.05;
        stem.current.scale.y = THREE.MathUtils.lerp(stem.current.scale.y, target, 0.15);
    });

    return (
        <group position={position} quaternion={quaternion}>
            {/* zona di "paura": il cursore vicino lo fa nascondere */}
            <mesh
                onPointerOver={(e) => { e.stopPropagation(); hiddenUntil.current = performance.now() + 2500; }}
            >
                <sphereGeometry args={[1.6, 8, 6]} />
                <meshBasicMaterial visible={false} />
            </mesh>
            <group ref={stem}>
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.1, 0.14, 1, 6]} />
                    <meshToonMaterial color={color} gradientMap={gradient} />
                </mesh>
                {/* occhione periscopio */}
                <mesh position={[0, 1.05, 0]}>
                    <sphereGeometry args={[0.24, 10, 8]} />
                    <meshToonMaterial color={color} gradientMap={gradient} />
                    <Outlines thickness={0.015} color={OUTLINE} />
                </mesh>
                <mesh position={[0, 1.05, 0.17]}>
                    <sphereGeometry args={[0.11, 8, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 1.05, 0.25]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshBasicMaterial color={OUTLINE} />
                </mesh>
            </group>
        </group>
    );
}

// Una posa fissa per i timidi (lat, lon per pianeta): sono rari e preziosi.
// Renderizzati da Planet dentro il gruppo rotante, così girano col pianeta.
export const SHY_SPOTS: Record<string, [number, number]> = {
    casa: [-25, 200],
    officina: [32, 150],
    faro: [-20, 260],
    giardino: [28, 220],
    osservatorio: [-30, 60],
    cantiere: [25, 300],
};

// --- GIGANTE GENTILE: una balena spaziale lentissima sullo sfondo ---------

function Balena() {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const tail = useRef<THREE.Mesh>(null);
    const angle = useRef(0);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const tmp = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ clock }, dt) => {
        if (!group.current) return;
        const t = clock.elapsedTime;
        if (!reducedMotion) angle.current += 0.008 * bridge.timeScale * dt * 10;
        const a = angle.current;
        const R = 260;
        group.current.position.set(Math.cos(a) * R, -50 + Math.sin(t * 0.07) * 14, Math.sin(a) * R);
        // guarda avanti lungo l'orbita
        tmp.set(Math.cos(a + 0.02) * R, group.current.position.y, Math.sin(a + 0.02) * R);
        group.current.lookAt(tmp);
        if (tail.current) tail.current.rotation.y = Math.sin(t * 0.8) * 0.35;
    });

    return (
        <group ref={group} scale={14}>
            {/* corpo */}
            <mesh scale={[1, 0.75, 2.2]}>
                <sphereGeometry args={[1, 16, 12]} />
                <meshToonMaterial color={PASTEL.deepBlue} gradientMap={gradient} />
                <Outlines thickness={0.04} color={OUTLINE} />
            </mesh>
            {/* pancia chiara */}
            <mesh position={[0, -0.3, 0.2]} scale={[0.8, 0.5, 1.7]}>
                <sphereGeometry args={[1, 12, 10]} />
                <meshToonMaterial color={PASTEL.sky} gradientMap={gradient} />
            </mesh>
            {/* coda */}
            <mesh ref={tail} position={[0, 0.1, 2.3]} scale={[1.2, 0.18, 0.7]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshToonMaterial color={PASTEL.deepBlue} gradientMap={gradient} />
            </mesh>
            {/* occhio gentile */}
            <mesh position={[0.62, 0.12, -1.15]}>
                <sphereGeometry args={[0.12, 8, 6]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.68, 0.12, -1.2]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshBasicMaterial color={OUTLINE} />
            </mesh>
            {/* soffio di polvere luminosa dallo sfiatatoio */}
            <pointLight position={[0, 1, -0.5]} color={PASTEL.sky} intensity={3} distance={30} decay={2} />
        </group>
    );
}

// --- la fauna al completo ---------------------------------------------------

export function Fauna() {
    const density = useUniverseStore((s) => s.density);
    const meduse = Math.max(4, Math.round(10 * density));
    return (
        <>
            {Array.from({ length: meduse }, (_, i) => (
                <Medusa key={`m${i}`} seed={(i + 1) / (meduse + 1)} />
            ))}
            {[0.21, 0.55, 0.83].map((s, i) => (
                <Messaggero key={`msg${i}`} seed={s} />
            ))}
            <Balena />
        </>
    );
}
