"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { QUALITY_PRESETS, useUniverseStore } from "./store";
import { PASTEL } from "./palette";

// Texture radiale morbida generata una volta sola (niente asset esterni).
let glowTexture: THREE.CanvasTexture | null = null;
function getGlowTexture(): THREE.CanvasTexture {
    if (glowTexture) return glowTexture;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.3)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    glowTexture = new THREE.CanvasTexture(canvas);
    return glowTexture;
}

// Nuvole di nebulosa: posizioni fisse (scelte a mano, non casuali) per
// comporre lo sfondo come un fondale dipinto.
const NEBULAE: { pos: [number, number, number]; scale: number; color: string; opacity: number }[] = [
    { pos: [-120, 40, -160], scale: 190, color: PASTEL.deepLilac, opacity: 0.2 },
    { pos: [140, -20, -180], scale: 230, color: PASTEL.deepBlue, opacity: 0.18 },
    { pos: [60, 80, -220], scale: 170, color: PASTEL.mint, opacity: 0.07 },
    { pos: [-180, -60, -120], scale: 210, color: PASTEL.rose, opacity: 0.08 },
    { pos: [10, -90, -200], scale: 250, color: "#4a3f8f", opacity: 0.14 },
    { pos: [200, 60, -80], scale: 160, color: PASTEL.lilac, opacity: 0.1 },
    { pos: [-60, 130, -100], scale: 150, color: PASTEL.warmYellow, opacity: 0.05 },
];

function Nebulae({ count }: { count: number }) {
    const group = useRef<THREE.Group>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const map = useMemo(() => getGlowTexture(), []);

    useFrame((state, dt) => {
        if (!group.current || reducedMotion) return;
        group.current.rotation.y += dt * 0.004;
        // respiro lentissimo di tutto il fondale
        const breath = 1 + Math.sin(state.clock.elapsedTime * 0.15) * 0.02;
        group.current.scale.setScalar(breath);
    });

    return (
        <group ref={group}>
            {NEBULAE.slice(0, count).map((n, i) => (
                <sprite key={i} position={n.pos} scale={[n.scale, n.scale, 1]}>
                    <spriteMaterial
                        map={map}
                        color={n.color}
                        transparent
                        opacity={n.opacity}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        fog={false}
                    />
                </sprite>
            ))}
        </group>
    );
}

// Polvere luminosa che fluttua attorno al centro della scena.
function Dust({ count }: { count: number }) {
    const points = useRef<THREE.Points>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const map = useMemo(() => getGlowTexture(), []);

    const positions = useMemo(() => {
        // PRNG deterministico (mulberry32): rende puro il render e stabile la polvere
        let s = 1337;
        const rand = () => {
            s |= 0; s = (s + 0x6d2b79f5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // guscio sferico attorno al pianeta, mai troppo vicino
            const r = 18 + rand() * 45;
            const theta = rand() * Math.PI * 2;
            const phi = Math.acos(2 * rand() - 1);
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = r * Math.cos(phi) * 0.6;
            arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        return arr;
    }, [count]);

    useFrame((state, dt) => {
        if (!points.current || reducedMotion) return;
        points.current.rotation.y += dt * 0.012;
        points.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.6;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                map={map}
                color={PASTEL.warmYellow}
                size={0.5}
                transparent
                opacity={0.55}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}

export function Ambient() {
    const tier = useUniverseStore((s) => s.tier);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const preset = QUALITY_PRESETS[tier];

    return (
        <>
            <Stars
                radius={280}
                depth={60}
                count={preset.stars}
                factor={4}
                saturation={0.35}
                fade
                speed={reducedMotion ? 0 : 0.6}
            />
            <Nebulae count={preset.nebula} />
            <Dust count={preset.dust} />
        </>
    );
}
