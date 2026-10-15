"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Outlines, useCursor } from "@react-three/drei";
import { getToonGradient, onSurface } from "./toon";
import { CREATURE_COLORS, OUTLINE, PLANET_CASA as C } from "./palette";
import { Abitante } from "./Abitante";
import { planetRefs, useUniverseStore } from "./store";

const R = 10; // raggio del pianeta Casa
const tmpVec = new THREE.Vector3();

// Chiazza di terreno: sfera schiacciata appoggiata alla superficie.
function Patch({ lat, lon, size, color }: { lat: number; lon: number; size: number; color: string }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, R - size * 0.18), [lat, lon, size]);
    return (
        <mesh position={position} quaternion={quaternion} scale={[size, size * 0.3, size]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshToonMaterial color={color} gradientMap={gradient} />
        </mesh>
    );
}

function Smoke({ origin }: { origin: [number, number, number] }) {
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const N = 4;
    useFrame(({ clock }) => {
        const speed = reducedMotion ? 0.08 : 0.22;
        refs.current.forEach((m, i) => {
            if (!m) return;
            const t = (clock.elapsedTime * speed + i / N) % 1;
            m.position.set(
                origin[0] + Math.sin(t * 6 + i * 2) * 0.18,
                origin[1] + t * 2.4,
                origin[2],
            );
            m.scale.setScalar(0.14 + t * 0.4);
            (m.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.4;
        });
    });
    return (
        <>
            {Array.from({ length: N }, (_, i) => (
                <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
                    <sphereGeometry args={[1, 8, 6]} />
                    <meshBasicMaterial color="#e8e4f5" transparent depthWrite={false} />
                </mesh>
            ))}
        </>
    );
}

function House({ lat, lon }: { lat: number; lon: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, R - 0.1), [lat, lon]);
    const windowMat = useRef<THREE.MeshToonMaterial>(null);
    useFrame(({ clock }) => {
        // la finestra respira: luce calda che si accende e si abbassa piano
        if (windowMat.current) {
            windowMat.current.emissiveIntensity = 0.9 + Math.sin(clock.elapsedTime * 1.4) * 0.3;
        }
    });
    return (
        <group position={position} quaternion={quaternion}>
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[1.8, 1.4, 1.6]} />
                <meshToonMaterial color={C.wall} gradientMap={gradient} />
                <Outlines thickness={0.035} color={OUTLINE} />
            </mesh>
            <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.65, 1.1, 4]} />
                <meshToonMaterial color={C.roofColor} gradientMap={gradient} />
                <Outlines thickness={0.035} color={OUTLINE} />
            </mesh>
            <mesh position={[0, 0.72, 0.82]}>
                <boxGeometry args={[0.5, 0.5, 0.08]} />
                <meshToonMaterial
                    ref={windowMat}
                    color={C.window}
                    emissive={C.glow}
                    emissiveIntensity={1}
                    gradientMap={gradient}
                />
            </mesh>
            {/* porta */}
            <mesh position={[0.62, 0.42, 0.82]}>
                <boxGeometry args={[0.36, 0.7, 0.08]} />
                <meshToonMaterial color={C.trunk} gradientMap={gradient} />
            </mesh>
            {/* comignolo */}
            <mesh position={[0.55, 2.0, -0.35]}>
                <boxGeometry args={[0.3, 0.7, 0.3]} />
                <meshToonMaterial color={C.groundDark} gradientMap={gradient} />
            </mesh>
            <Smoke origin={[0.55, 2.4, -0.35]} />
        </group>
    );
}

function Lamp({ lat, lon }: { lat: number; lon: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, R - 0.05), [lat, lon]);
    const light = useRef<THREE.PointLight>(null);
    useFrame(({ clock }) => {
        // leggero sfarfallio caldo
        if (light.current) light.current.intensity = 6 + Math.sin(clock.elapsedTime * 9) * 0.5;
    });
    return (
        <group position={position} quaternion={quaternion}>
            <mesh position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.05, 0.09, 1.8, 6]} />
                <meshToonMaterial color={OUTLINE} gradientMap={gradient} />
            </mesh>
            <mesh position={[0, 1.85, 0]}>
                <sphereGeometry args={[0.22, 10, 8]} />
                <meshBasicMaterial color={C.glow} />
            </mesh>
            <pointLight ref={light} position={[0, 1.85, 0]} color={C.glow} intensity={6} distance={8} decay={2} />
        </group>
    );
}

function Tree({ lat, lon, seed }: { lat: number; lon: number; seed: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, R - 0.05), [lat, lon]);
    const foliage = useRef<THREE.Group>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const h = 0.8 + seed * 0.6;
    useFrame(({ clock }) => {
        // chioma che ondeggia al vento
        if (foliage.current && !reducedMotion) {
            foliage.current.rotation.z = Math.sin(clock.elapsedTime * 1.1 + seed * 9) * 0.08;
        }
    });
    return (
        <group position={position} quaternion={quaternion}>
            <mesh position={[0, h / 2, 0]}>
                <cylinderGeometry args={[0.09, 0.15, h, 6]} />
                <meshToonMaterial color={C.trunk} gradientMap={gradient} />
            </mesh>
            <group ref={foliage} position={[0, h, 0]}>
                <mesh position={[0, 0.42, 0]}>
                    <sphereGeometry args={[0.55, 12, 10]} />
                    <meshToonMaterial color={C.foliage} gradientMap={gradient} />
                    <Outlines thickness={0.02} color={OUTLINE} />
                </mesh>
                <mesh position={[0.32, 0.68, 0.12]}>
                    <sphereGeometry args={[0.3, 10, 8]} />
                    <meshToonMaterial color={C.foliageLight} gradientMap={gradient} />
                </mesh>
            </group>
        </group>
    );
}

function Moon() {
    const gradient = useMemo(() => getToonGradient(), []);
    const orbit = useRef<THREE.Group>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    useFrame(({ clock }) => {
        if (!orbit.current) return;
        const t = reducedMotion ? 1.2 : clock.elapsedTime * 0.14;
        orbit.current.position.set(Math.cos(t) * 17, Math.sin(t * 0.7) * 3 + 4, Math.sin(t) * 17);
        orbit.current.rotation.y = t * 1.6;
    });
    return (
        <group ref={orbit}>
            <mesh>
                <sphereGeometry args={[1.1, 12, 10]} />
                <meshToonMaterial color={C.moon} gradientMap={gradient} />
                <Outlines thickness={0.025} color={OUTLINE} />
            </mesh>
        </group>
    );
}

interface PlanetCasaProps {
    label: string;
    phrases: string[];
}

export function PlanetCasa({ label, phrases }: PlanetCasaProps) {
    const gradient = useMemo(() => getToonGradient(), []);
    const whole = useRef<THREE.Group>(null);
    const spin = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const [labelVisible, setLabelVisible] = useState(true);
    useCursor(hovered);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const requestFlight = useUniverseStore((s) => s.requestFlight);

    // registra il gruppo rotante: serve alla camera per atterrare davanti alla casetta
    useEffect(() => {
        planetRefs.casa = spin.current;
        return () => { planetRefs.casa = null; };
    }, []);

    useFrame((state, dt) => {
        // rotazione lenta su se stesso: il mondo è vivo anche da fermo
        if (spin.current && !reducedMotion) spin.current.rotation.y += dt * 0.03;
        if (whole.current) {
            const target = hovered ? 1.04 : 1;
            whole.current.scale.lerp(tmpVec.setScalar(target), 0.1);
        }
        // da vicino l'etichetta non serve (e coprirebbe la scena)
        const close = state.camera.position.length() < 40;
        if (close === labelVisible) setLabelVisible(!close);
    });

    return (
        <group ref={whole}>
            <group ref={spin}>
                {/* corpo del pianeta */}
                <mesh
                    onClick={(e) => { e.stopPropagation(); requestFlight("casa"); }}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                    onPointerOut={() => setHovered(false)}
                >
                    <sphereGeometry args={[R, 48, 36]} />
                    <meshToonMaterial color={C.ground} gradientMap={gradient} />
                    <Outlines thickness={0.09} color={OUTLINE} />
                </mesh>

                {/* chiazze di prato e terra scura */}
                <Patch lat={18} lon={10} size={4.5} color={C.grass} />
                <Patch lat={-12} lon={95} size={3.6} color={C.grass} />
                <Patch lat={40} lon={200} size={3} color={C.groundDark} />
                <Patch lat={-35} lon={290} size={4} color={C.grass} />
                <Patch lat={5} lon={330} size={2.4} color={C.groundDark} />

                {/* elementi di superficie */}
                <House lat={22} lon={15} />
                <Lamp lat={14} lon={32} />
                <Tree lat={30} lon={-10} seed={0.2} />
                <Tree lat={8} lon={60} seed={0.7} />
                <Tree lat={-18} lon={100} seed={0.45} />
                <Tree lat={-30} lon={280} seed={0.9} />

                {/* abitanti */}
                {CREATURE_COLORS.map((color, i) => (
                    <Abitante
                        key={i}
                        planetRadius={R}
                        seed={(i + 0.5) / CREATURE_COLORS.length}
                        color={color}
                        phrases={phrases}
                    />
                ))}
            </group>

            <Moon />

            {/* etichetta in stile diario di bordo */}
            {labelVisible && (
            <Html position={[0, R + 4, 0]} center distanceFactor={48} zIndexRange={[25, 5]}>
                <button
                    onClick={() => requestFlight("casa")}
                    className={`pointer-events-auto cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 font-mono text-[12px] tracking-[0.18em] uppercase backdrop-blur-sm transition-all duration-300 ${
                        hovered
                            ? "border-[#ffd98a] bg-[#2a2150]/90 text-[#ffd98a] shadow-[0_0_18px_rgba(255,217,138,0.35)]"
                            : "border-[#c9b6f5]/40 bg-[#1c1433]/70 text-[#c9b6f5]"
                    }`}
                >
                    ✦ {label}
                </button>
            </Html>
            )}
        </group>
    );
}
