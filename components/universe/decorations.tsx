"use client";

import { useMemo, useRef, type FC } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { getToonGradient, onSurface } from "./toon";
import { OUTLINE, PASTEL, PLANET_CASA as C } from "./palette";
import { bridge, useUniverseStore } from "./store";

// Decorazioni tematiche di superficie, una collezione per pianeta.
// Tutte procedurali da primitive, tutte con una piccola animazione idle.

export interface DecoProps { r: number }

// --- pezzi riusabili -------------------------------------------------------

function Smoke({ origin }: { origin: [number, number, number] }) {
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const N = 4;
    useFrame(({ clock }) => {
        const speed = reducedMotion ? 0.08 : 0.22;
        refs.current.forEach((m, i) => {
            if (!m) return;
            const t = (clock.elapsedTime * speed + i / N) % 1;
            m.position.set(origin[0] + Math.sin(t * 6 + i * 2) * 0.18, origin[1] + t * 2.4, origin[2]);
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

function Tree({ r, lat, lon, seed }: DecoProps & { lat: number; lon: number; seed: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, r - 0.05), [lat, lon, r]);
    const foliage = useRef<THREE.Group>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const h = 0.8 + seed * 0.6;
    useFrame(({ clock }) => {
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

function Lamp({ r, lat, lon, color = C.glow }: DecoProps & { lat: number; lon: number; color?: string }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, r - 0.05), [lat, lon, r]);
    const light = useRef<THREE.PointLight>(null);
    useFrame(({ clock }) => {
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
                <meshBasicMaterial color={color} />
            </mesh>
            <pointLight ref={light} position={[0, 1.85, 0]} color={color} intensity={6} distance={8} decay={2} />
        </group>
    );
}

// --- CASA ------------------------------------------------------------------

function House({ r, lat, lon }: DecoProps & { lat: number; lon: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, r - 0.1), [lat, lon, r]);
    const windowMat = useRef<THREE.MeshToonMaterial>(null);
    useFrame(({ clock }) => {
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
                <meshToonMaterial ref={windowMat} color={C.window} emissive={C.glow} emissiveIntensity={1} gradientMap={gradient} />
            </mesh>
            <mesh position={[0.62, 0.42, 0.82]}>
                <boxGeometry args={[0.36, 0.7, 0.08]} />
                <meshToonMaterial color={C.trunk} gradientMap={gradient} />
            </mesh>
            <mesh position={[0.55, 2.0, -0.35]}>
                <boxGeometry args={[0.3, 0.7, 0.3]} />
                <meshToonMaterial color={C.groundDark} gradientMap={gradient} />
            </mesh>
            <Smoke origin={[0.55, 2.4, -0.35]} />
        </group>
    );
}

function Moon({ r }: DecoProps) {
    const gradient = useMemo(() => getToonGradient(), []);
    const orbit = useRef<THREE.Group>(null);
    const angle = useRef(1.2);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    useFrame((_, dt) => {
        if (!orbit.current) return;
        if (!reducedMotion) angle.current += dt * 0.14 * bridge.timeScale;
        const t = angle.current;
        orbit.current.position.set(Math.cos(t) * (r + 7), Math.sin(t * 0.7) * 3 + 4, Math.sin(t) * (r + 7));
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

const CasaDeco: FC<DecoProps> = ({ r }) => (
    <>
        <House r={r} lat={22} lon={15} />
        <Lamp r={r} lat={14} lon={32} />
        <Tree r={r} lat={30} lon={-10} seed={0.2} />
        <Tree r={r} lat={8} lon={60} seed={0.7} />
        <Tree r={r} lat={-18} lon={100} seed={0.45} />
        <Tree r={r} lat={-30} lon={280} seed={0.9} />
        <Moon r={r} />
    </>
);

// --- OFFICINA ----------------------------------------------------------------

function Gear({ r, lat, lon, size, dir }: DecoProps & { lat: number; lon: number; size: number; dir: number }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, r), [lat, lon, r]);
    const gear = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (gear.current) gear.current.rotation.y += dt * dir * 0.8 * bridge.timeScale;
    });
    return (
        <group position={position} quaternion={quaternion}>
            <group ref={gear} position={[0, size * 0.6, 0]}>
                <mesh>
                    <cylinderGeometry args={[size, size, size * 0.3, 8]} />
                    <meshToonMaterial color="#b8c0d4" gradientMap={gradient} />
                    <Outlines thickness={0.03} color={OUTLINE} />
                </mesh>
                <mesh>
                    <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.45, 8]} />
                    <meshToonMaterial color={PASTEL.warmYellow} gradientMap={gradient} />
                </mesh>
            </group>
        </group>
    );
}

const OfficinaDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const crane = useMemo(() => onSurface(10, 70, r - 0.1), [r]);
    const sparkRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (sparkRef.current) {
            const on = Math.sin(clock.elapsedTime * 13) > 0.4;
            sparkRef.current.scale.setScalar(on ? 0.22 : 0.02);
        }
    });
    return (
        <>
            <Gear r={r} lat={25} lon={20} size={1.1} dir={1} />
            <Gear r={r} lat={17} lon={34} size={0.7} dir={-1.6} />
            {/* gru */}
            <group position={crane.position} quaternion={crane.quaternion}>
                <mesh position={[0, 1.4, 0]}>
                    <boxGeometry args={[0.3, 2.8, 0.3]} />
                    <meshToonMaterial color={PASTEL.warmYellow} gradientMap={gradient} />
                    <Outlines thickness={0.03} color={OUTLINE} />
                </mesh>
                <mesh position={[0.9, 2.7, 0]}>
                    <boxGeometry args={[2.2, 0.22, 0.22]} />
                    <meshToonMaterial color={PASTEL.warmYellow} gradientMap={gradient} />
                </mesh>
                <mesh position={[1.8, 2.1, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 1.1, 4]} />
                    <meshBasicMaterial color="#8a92a8" />
                </mesh>
                <mesh position={[1.8, 1.5, 0]}>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshToonMaterial color="#9aa3b8" gradientMap={gradient} />
                </mesh>
                {/* scintille di saldatura */}
                <mesh ref={sparkRef} position={[-0.6, 0.35, 0.5]}>
                    <sphereGeometry args={[1, 6, 4]} />
                    <meshBasicMaterial color="#fff6e0" />
                </mesh>
                <pointLight position={[-0.6, 0.5, 0.5]} color={PASTEL.warmYellow} intensity={4} distance={6} decay={2} />
            </group>
        </>
    );
};

// --- GALLERIA ----------------------------------------------------------------

const GALLERY_COLORS = [PASTEL.rose, PASTEL.mint, PASTEL.sky];

const GalleriaDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const frames = useRef<THREE.Group>(null);
    useFrame(({ clock }, dt) => {
        if (!frames.current) return;
        frames.current.rotation.y += dt * 0.12 * bridge.timeScale;
        frames.current.children.forEach((f, i) => {
            f.position.y = Math.sin(clock.elapsedTime * 0.8 + i * 2.1) * 0.6;
        });
    });
    return (
        <>
            {/* quadri fluttuanti in orbita bassa */}
            <group ref={frames}>
                {GALLERY_COLORS.map((color, i) => {
                    const a = (i / GALLERY_COLORS.length) * Math.PI * 2;
                    return (
                        <group key={i} position={[Math.cos(a) * (r + 2.5), 0, Math.sin(a) * (r + 2.5)]} rotation={[0, -a + Math.PI / 2, 0]}>
                            <mesh>
                                <boxGeometry args={[1.7, 1.3, 0.12]} />
                                <meshToonMaterial color={C.wall} gradientMap={gradient} />
                                <Outlines thickness={0.03} color={OUTLINE} />
                            </mesh>
                            <mesh position={[0, 0, 0.08]}>
                                <boxGeometry args={[1.3, 0.9, 0.04]} />
                                <meshToonMaterial color={color} gradientMap={gradient} />
                            </mesh>
                        </group>
                    );
                })}
            </group>
            <Lamp r={r} lat={30} lon={40} color={PASTEL.rose} />
        </>
    );
};

// --- FARO --------------------------------------------------------------------

const FaroDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const base = useMemo(() => onSurface(32, 20, r - 0.1), [r]);
    const beam = useRef<THREE.Group>(null);
    useFrame((_, dt) => {
        if (beam.current) beam.current.rotation.y += dt * 0.9 * bridge.timeScale;
    });
    return (
        <group position={base.position} quaternion={base.quaternion}>
            {/* torre a strisce */}
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[0, 0.55 + i * 1.05, 0]}>
                    <cylinderGeometry args={[0.78 - i * 0.14, 0.88 - i * 0.14, 1.05, 10]} />
                    <meshToonMaterial color={i % 2 === 0 ? C.roofColor : C.wall} gradientMap={gradient} />
                    {i === 0 && <Outlines thickness={0.035} color={OUTLINE} />}
                </mesh>
            ))}
            {/* lanterna */}
            <mesh position={[0, 3.45, 0]}>
                <sphereGeometry args={[0.42, 10, 8]} />
                <meshBasicMaterial color={PASTEL.warmYellow} />
            </mesh>
            <mesh position={[0, 3.95, 0]}>
                <coneGeometry args={[0.5, 0.5, 8]} />
                <meshToonMaterial color={C.roofColor} gradientMap={gradient} />
            </mesh>
            <pointLight position={[0, 3.5, 0]} color={PASTEL.warmYellow} intensity={10} distance={18} decay={2} />
            {/* fascio rotante */}
            <group ref={beam} position={[0, 3.45, 0]}>
                <mesh position={[2.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.55, 5.2, 10, 1, true]} />
                    <meshBasicMaterial
                        color={PASTEL.warmYellow}
                        transparent
                        opacity={0.22}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </group>
    );
};

// --- GIARDINO SONORO -----------------------------------------------------------

function AlienPlant({ r, lat, lon, seed, color }: DecoProps & { lat: number; lon: number; seed: number; color: string }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const { position, quaternion } = useMemo(() => onSurface(lat, lon, r - 0.05), [lat, lon, r]);
    const bulb = useRef<THREE.Mesh>(null);
    const h = 1.2 + seed * 1.2;
    useFrame(({ clock }) => {
        if (!bulb.current) return;
        const pulse = 0.8 + Math.sin(clock.elapsedTime * (1.2 + seed) + seed * 10) * 0.25;
        bulb.current.scale.setScalar(pulse * (0.35 + seed * 0.2));
    });
    return (
        <group position={position} quaternion={quaternion} rotation-z={seed * 0.3 - 0.15}>
            <mesh position={[0, h / 2, 0]}>
                <cylinderGeometry args={[0.05, 0.1, h, 5]} />
                <meshToonMaterial color="#5fae7a" gradientMap={gradient} />
            </mesh>
            <mesh ref={bulb} position={[0, h + 0.15, 0]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
            <pointLight position={[0, h + 0.2, 0]} color={color} intensity={2.5} distance={5} decay={2} />
        </group>
    );
}

const GiardinoDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const shroom = useMemo(() => onSurface(-8, 75, r - 0.05), [r]);
    return (
        <>
            <AlienPlant r={r} lat={24} lon={18} seed={0.8} color={PASTEL.mint} />
            <AlienPlant r={r} lat={15} lon={40} seed={0.3} color={PASTEL.lilac} />
            <AlienPlant r={r} lat={-20} lon={120} seed={0.6} color={PASTEL.rose} />
            <AlienPlant r={r} lat={35} lon={300} seed={0.45} color={PASTEL.sky} />
            {/* fungo luminoso */}
            <group position={shroom.position} quaternion={shroom.quaternion}>
                <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.18, 0.26, 0.6, 8]} />
                    <meshToonMaterial color={C.wall} gradientMap={gradient} />
                </mesh>
                <mesh position={[0, 0.7, 0]}>
                    <sphereGeometry args={[0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshToonMaterial color={PASTEL.lilac} emissive={PASTEL.lilac} emissiveIntensity={0.6} gradientMap={gradient} />
                    <Outlines thickness={0.02} color={OUTLINE} />
                </mesh>
            </group>
            <Tree r={r} lat={-30} lon={200} seed={0.5} />
        </>
    );
};

// --- OSSERVATORIO ---------------------------------------------------------------

const OsservatorioDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const dome = useMemo(() => onSurface(28, 25, r - 0.1), [r]);
    const scope = useRef<THREE.Group>(null);
    const bars = useRef<THREE.Group>(null);
    useFrame(({ clock }, dt) => {
        if (scope.current) scope.current.rotation.y += dt * 0.15 * bridge.timeScale;
        if (bars.current) {
            bars.current.children.forEach((b, i) => {
                const h = 0.6 + (Math.sin(clock.elapsedTime * 0.9 + i * 1.7) * 0.5 + 0.5) * 1.4;
                b.scale.y = h;
                b.position.y = h / 2;
            });
            bars.current.rotation.y += dt * 0.2 * bridge.timeScale;
        }
    });
    return (
        <>
            <group position={dome.position} quaternion={dome.quaternion}>
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[1.2, 1.35, 1, 12]} />
                    <meshToonMaterial color="#6d7cb0" gradientMap={gradient} />
                    <Outlines thickness={0.035} color={OUTLINE} />
                </mesh>
                <group ref={scope} position={[0, 1, 0]}>
                    <mesh>
                        <sphereGeometry args={[1.15, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshToonMaterial color={C.wall} gradientMap={gradient} />
                        <Outlines thickness={0.035} color={OUTLINE} />
                    </mesh>
                    <mesh position={[0.55, 0.85, 0]} rotation={[0, 0, -0.7]}>
                        <cylinderGeometry args={[0.16, 0.22, 1.4, 8]} />
                        <meshToonMaterial color={PASTEL.sky} gradientMap={gradient} />
                    </mesh>
                </group>
            </group>
            {/* grafici fluttuanti (omaggio alla Bottega) */}
            <group position={[0, r + 2.2, 0]}>
                <group ref={bars}>
                    {[PASTEL.mint, PASTEL.warmYellow, PASTEL.rose].map((color, i) => (
                        <mesh key={i} position={[(i - 1) * 0.55, 0.5, 0]}>
                            <boxGeometry args={[0.35, 1, 0.35]} />
                            <meshToonMaterial color={color} emissive={color} emissiveIntensity={0.35} gradientMap={gradient} />
                        </mesh>
                    ))}
                </group>
            </group>
        </>
    );
};

// --- CANTIERE --------------------------------------------------------------------

const CantiereDeco: FC<DecoProps> = ({ r }) => {
    const gradient = useMemo(() => getToonGradient(), []);
    const site = useMemo(() => onSurface(20, 30, r - 0.1), [r]);
    const arm = useRef<THREE.Group>(null);
    const blink = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, dt) => {
        if (arm.current) arm.current.rotation.y += dt * 0.25 * bridge.timeScale;
        if (blink.current) {
            (blink.current.material as THREE.MeshBasicMaterial).color.set(
                Math.sin(clock.elapsedTime * 4) > 0 ? "#ffaa66" : "#5a3f22",
            );
        }
    });
    return (
        <group position={site.position} quaternion={site.quaternion}>
            {/* gru girevole */}
            <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[0.28, 3.2, 0.28]} />
                <meshToonMaterial color="#ffaa66" gradientMap={gradient} />
                <Outlines thickness={0.03} color={OUTLINE} />
            </mesh>
            <group ref={arm} position={[0, 3.1, 0]}>
                <mesh position={[1, 0, 0]}>
                    <boxGeometry args={[2.4, 0.2, 0.2]} />
                    <meshToonMaterial color="#ffaa66" gradientMap={gradient} />
                </mesh>
                <mesh position={[2, -0.55, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.9, 4]} />
                    <meshBasicMaterial color="#8a92a8" />
                </mesh>
                <mesh position={[2, -1.1, 0]}>
                    <boxGeometry args={[0.45, 0.3, 0.45]} />
                    <meshToonMaterial color="#c99a4e" gradientMap={gradient} />
                </mesh>
            </group>
            {/* travi accatastate + luce di segnalazione */}
            <mesh position={[-1.2, 0.25, 0.6]} rotation={[0, 0.4, 0]}>
                <boxGeometry args={[1.6, 0.22, 0.5]} />
                <meshToonMaterial color="#f2d694" gradientMap={gradient} />
            </mesh>
            <mesh position={[-1.1, 0.5, 0.55]} rotation={[0, 0.2, 0]}>
                <boxGeometry args={[1.3, 0.22, 0.45]} />
                <meshToonMaterial color="#c99a4e" gradientMap={gradient} />
            </mesh>
            <mesh ref={blink} position={[0, 3.45, 0]}>
                <sphereGeometry args={[0.16, 8, 6]} />
                <meshBasicMaterial color="#ffaa66" />
            </mesh>
        </group>
    );
};

// --- SEGRETO ---------------------------------------------------------------------

const SegretoDeco: FC<DecoProps> = ({ r }) => {
    const crystals = useRef<THREE.Group>(null);
    const ring = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, dt) => {
        if (crystals.current) {
            crystals.current.children.forEach((c, i) => {
                const m = c as THREE.Mesh;
                const pulse = 0.7 + Math.sin(clock.elapsedTime * 1.5 + i * 1.3) * 0.3;
                (m.material as THREE.MeshBasicMaterial).opacity = pulse * 0.9;
            });
        }
        if (ring.current) ring.current.rotation.z += dt * 0.1 * bridge.timeScale;
    });
    const spots = useMemo(
        () => [
            { lat: 30, lon: 10, s: 1.2 }, { lat: -15, lon: 80, s: 0.8 },
            { lat: 10, lon: 160, s: 1 }, { lat: -35, lon: 240, s: 0.9 },
            { lat: 45, lon: 300, s: 0.7 },
        ],
        [],
    );
    return (
        <>
            <group ref={crystals}>
                {spots.map((spot, i) => {
                    const { position, quaternion } = onSurface(spot.lat, spot.lon, r - 0.1);
                    return (
                        <mesh key={i} position={position} quaternion={quaternion} scale={spot.s}>
                            <octahedronGeometry args={[0.6, 0]} />
                            <meshBasicMaterial color={PASTEL.lilac} transparent opacity={0.8} />
                        </mesh>
                    );
                })}
            </group>
            <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
                <torusGeometry args={[r + 2.5, 0.12, 8, 48]} />
                <meshBasicMaterial color={PASTEL.lilac} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <pointLight color={PASTEL.lilac} intensity={8} distance={25} decay={2} />
        </>
    );
};

// --- registro --------------------------------------------------------------------

export const DECORATIONS: Record<string, FC<DecoProps>> = {
    casa: CasaDeco,
    officina: OfficinaDeco,
    galleria: GalleriaDeco,
    faro: FaroDeco,
    giardino: GiardinoDeco,
    osservatorio: OsservatorioDeco,
    cantiere: CantiereDeco,
    segreto: SegretoDeco,
};
