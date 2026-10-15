"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Outlines, useCursor } from "@react-three/drei";
import { getToonGradient, onSurface } from "./toon";
import { OUTLINE, PLANET_PALETTES } from "./palette";
import { Abitante } from "./Abitante";
import { SHY_SPOTS, Timido } from "./Fauna";
import { bridge, useUniverseStore } from "./store";
import type { PlanetConfig } from "./config";
import { DECORATIONS } from "./decorations";

const tmpVec = new THREE.Vector3();

// Chiazze di terreno: template fisso, colori dalla palette del pianeta.
const PATCH_TEMPLATE = [
    { lat: 18, lon: 10, size: 0.45 },
    { lat: -12, lon: 95, size: 0.36 },
    { lat: 40, lon: 200, size: 0.3 },
    { lat: -35, lon: 290, size: 0.4 },
    { lat: 5, lon: 330, size: 0.24 },
];

interface PlanetProps {
    config: PlanetConfig;
    label: string;
    phrases: string[];
}

export function Planet({ config, label, phrases }: PlanetProps) {
    const { id, radius: R } = config;
    const palette = PLANET_PALETTES[id] ?? PLANET_PALETTES.casa;
    const gradient = useMemo(() => getToonGradient(), []);
    const whole = useRef<THREE.Group>(null);
    const spin = useRef<THREE.Group>(null);
    const distEl = useRef<HTMLSpanElement>(null);
    const [hovered, setHovered] = useState(false);
    const [labelVisible, setLabelVisible] = useState(true);
    useCursor(hovered);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const requestFlight = useUniverseStore((s) => s.requestFlight);
    const density = useUniverseStore((s) => s.density);
    const Deco = DECORATIONS[id];

    const center = useMemo(() => new THREE.Vector3(...config.position), [config.position]);
    const creatureCount = Math.max(2, Math.round(2 + 3 * density));
    const distThrottle = useRef(0);

    useFrame((state, dt) => {
        // rotazione lenta su se stesso, al passo col Flusso del Tempo
        if (spin.current && !reducedMotion) spin.current.rotation.y += dt * 0.03 * bridge.timeScale;
        if (whole.current) {
            const target = hovered ? 1.04 : 1;
            whole.current.scale.lerp(tmpVec.setScalar(target), 0.1);
        }
        const dist = state.camera.position.distanceTo(center);
        // da vicino l'etichetta non serve (e coprirebbe la scena)
        const close = dist < R + 35;
        if (close === labelVisible) setLabelVisible(!close);
        // distanza in "AU" aggiornata senza re-render
        distThrottle.current += dt;
        if (distEl.current && distThrottle.current > 0.5) {
            distThrottle.current = 0;
            distEl.current.textContent = `${Math.max(1, Math.round(dist / 10))} AU`;
        }
    });

    return (
        <group position={config.position}>
            <group ref={whole}>
                <group ref={spin}>
                    {/* corpo del pianeta */}
                    <mesh
                        onClick={(e) => { e.stopPropagation(); requestFlight(id); }}
                        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                        onPointerOut={() => setHovered(false)}
                    >
                        <sphereGeometry args={[R, 48, 36]} />
                        {/* un filo di emissiva: i pianetini restano pastello anche lontani, nella nebbia */}
                        <meshToonMaterial
                            color={palette.ground}
                            emissive={palette.ground}
                            emissiveIntensity={0.22}
                            gradientMap={gradient}
                        />
                        <Outlines thickness={0.09} color={OUTLINE} />
                    </mesh>

                    {/* chiazze di terreno */}
                    {PATCH_TEMPLATE.map((p, i) => {
                        const size = p.size * R;
                        const { position, quaternion } = onSurface(p.lat, p.lon, R - size * 0.18);
                        return (
                            <mesh key={i} position={position} quaternion={quaternion} scale={[size, size * 0.3, size]}>
                                <sphereGeometry args={[1, 14, 10]} />
                                <meshToonMaterial color={i % 2 === 0 ? palette.patchA : palette.patchB} gradientMap={gradient} />
                            </mesh>
                        );
                    })}

                    {/* decorazioni tematiche */}
                    {Deco && <Deco r={R} />}

                    {/* un timido, dove previsto */}
                    {SHY_SPOTS[id] && (
                        <Timido
                            planetRadius={R}
                            lat={SHY_SPOTS[id][0]}
                            lon={SHY_SPOTS[id][1]}
                            seed={R / 10}
                        />
                    )}

                    {/* abitanti */}
                    {Array.from({ length: creatureCount }, (_, i) => (
                        <Abitante
                            key={i}
                            planetId={id}
                            planetRadius={R}
                            seed={(i + 0.5) / creatureCount}
                            color={palette.creatures[i % palette.creatures.length]}
                            phrases={phrases}
                        />
                    ))}
                </group>
            </group>

            {/* waypoint in stile diario di bordo (dimensione costante a schermo) */}
            {labelVisible && (
                <Html position={[0, R + 4, 0]} center zIndexRange={[25, 5]}>
                    <button
                        onClick={() => requestFlight(id)}
                        className={`pointer-events-auto flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-2 px-3 py-1 font-heading font-bold text-[11px] tracking-[0.15em] uppercase backdrop-blur-sm transition-all duration-300 ${
                            hovered
                                ? "border-u-sun bg-u-surface2/90 text-u-sun shadow-[0_0_18px_rgba(255,217,138,0.35)]"
                                : "border-u-lime/40 bg-u-surface/80 text-u-lime"
                        }`}
                    >
                        ✦ {label}
                        <span ref={distEl} className="text-[9px] text-u-sky/80" />
                    </button>
                </Html>
            )}
        </group>
    );
}
