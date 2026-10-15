"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Outlines, useCursor } from "@react-three/drei";
import { getToonGradient, onSurface } from "./toon";
import { OUTLINE } from "./palette";
import { bridge, useUniverseStore } from "./store";

interface AbitanteProps {
    planetId: string;
    planetRadius: number;
    seed: number; // 0..1, differenzia ogni individuo
    color: string;
    phrases: string[];
}

const tmpVec = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// Piccolo abitante tondo che cammina sulla curvatura del pianeta.
// Animazione 100% procedurale: hop, squash & stretch, palpebre, sguardo.
export function Abitante({ planetId, planetRadius, seed, color, phrases }: AbitanteProps) {
    const group = useRef<THREE.Group>(null);
    const body = useRef<THREE.Group>(null);
    const eyeL = useRef<THREE.Group>(null);
    const eyeR = useRef<THREE.Group>(null);
    const pupilL = useRef<THREE.Mesh>(null);
    const pupilR = useRef<THREE.Mesh>(null);

    const [bubble, setBubble] = useState<string | null>(null);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    const gradient = useMemo(() => getToonGradient(), []);
    const bellyColor = useMemo(
        () => new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45),
        [color],
    );

    // Variazioni individuali: nessuna creatura è identica.
    const traits = useMemo(
        () => ({
            size: 1.0 + seed * 0.5,
            speed: (8 + seed * 7) * (seed > 0.5 ? 1 : -1), // gradi di longitudine al secondo
            hopFreq: 5 + seed * 3,
            phase: seed * Math.PI * 2,
            baseLat: -35 + seed * 70,
        }),
        [seed],
    );

    const nav = useRef({ lon: seed * 360, blinkUntil: 0, nextBlink: 1 + seed * 3 });
    const greetUntil = useRef(0);
    const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const arrivedAt = useUniverseStore((s) => s.arrivedAt);

    // All'atterraggio della camera le creaturine salutano saltando.
    useEffect(() => {
        if (arrivedAt === planetId) greetUntil.current = performance.now() + 2800;
    }, [arrivedAt, planetId]);

    useEffect(() => () => {
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    }, []);

    useFrame((state, dt) => {
        if (!group.current || !body.current) return;
        const t = state.clock.elapsedTime;
        const greeting = performance.now() < greetUntil.current;
        const walking = !reducedMotion && !hovered && !bubble && !greeting;

        // --- camminata lungo la superficie (al passo col Flusso del Tempo) ---
        if (walking) nav.current.lon += traits.speed * bridge.timeScale * dt;
        const lat = traits.baseLat + Math.sin(t * 0.12 + traits.phase) * 8;
        const { position, quaternion } = onSurface(lat, nav.current.lon, planetRadius);
        group.current.position.copy(position);
        // orientati con l'up lungo la normale, poi guarda nella direzione di marcia
        group.current.quaternion.copy(quaternion);
        const heading = traits.speed > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.current.quaternion.multiply(tmpQuat.setFromAxisAngle(Y_AXIS, heading));

        // --- hop + squash & stretch ---
        const hopAmp = reducedMotion ? 0.02 : greeting ? 0.5 : walking ? 0.16 : 0.05;
        const hop = Math.abs(Math.sin(t * traits.hopFreq + traits.phase));
        body.current.position.y = hop * hopAmp;
        const stretch = 1 + Math.sin(t * traits.hopFreq * 2 + traits.phase) * (reducedMotion ? 0.02 : 0.08);
        body.current.scale.set(1 - (stretch - 1) * 0.5, stretch, 1 - (stretch - 1) * 0.5);

        // --- curiosità: su hover si gonfia un filo ---
        const targetScale = traits.size * (hovered ? 1.15 : 1);
        group.current.scale.lerp(tmpVec.setScalar(targetScale), 0.12);

        // --- palpebre casuali ---
        if (t > nav.current.nextBlink) {
            nav.current.blinkUntil = t + 0.12;
            nav.current.nextBlink = t + 1.5 + ((seed * 7919) % 1) * 3.5 + Math.random() * 2;
        }
        const blinking = t < nav.current.blinkUntil;
        const lidTarget = blinking ? 0.12 : 1;
        if (eyeL.current) eyeL.current.scale.y = THREE.MathUtils.lerp(eyeL.current.scale.y, lidTarget, 0.5);
        if (eyeR.current) eyeR.current.scale.y = THREE.MathUtils.lerp(eyeR.current.scale.y, lidTarget, 0.5);

        // --- lo sguardo segue il cursore ---
        const px = state.pointer.x * 0.045;
        const py = state.pointer.y * 0.03;
        if (pupilL.current) pupilL.current.position.set(px, py, 0.055);
        if (pupilR.current) pupilR.current.position.set(px, py, 0.055);
    });

    const onClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (phrases.length > 0) {
            setBubble(phrases[Math.floor(Math.random() * phrases.length)]);
            if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
            bubbleTimer.current = setTimeout(() => setBubble(null), 3200);
        }
        greetUntil.current = performance.now() + 1200; // saltello di risposta
    };

    return (
        <group ref={group}>
            <group ref={body}>
                {/* area di click generosa (invisibile) */}
                <mesh
                    position={[0, 0.4, 0]}
                    onClick={onClick}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                    onPointerOut={() => setHovered(false)}
                >
                    <sphereGeometry args={[0.62, 8, 6]} />
                    <meshBasicMaterial visible={false} />
                </mesh>
                {/* corpo tondo */}
                <mesh position={[0, 0.35, 0]}>
                    <sphereGeometry args={[0.35, 14, 12]} />
                    <meshToonMaterial color={color} gradientMap={gradient} />
                    <Outlines thickness={0.018} color={OUTLINE} />
                </mesh>
                {/* pancia chiara */}
                <mesh position={[0, 0.3, 0.2]} scale={[0.62, 0.52, 0.42]}>
                    <sphereGeometry args={[0.35, 10, 8]} />
                    <meshToonMaterial color={bellyColor} gradientMap={gradient} />
                </mesh>
                {/* occhi */}
                <group position={[0, 0.46, 0.26]}>
                    <group ref={eyeL} position={[-0.11, 0, 0]}>
                        <mesh>
                            <sphereGeometry args={[0.085, 10, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <mesh ref={pupilL} position={[0, 0, 0.055]}>
                            <sphereGeometry args={[0.042, 8, 6]} />
                            <meshBasicMaterial color={OUTLINE} />
                        </mesh>
                    </group>
                    <group ref={eyeR} position={[0.11, 0, 0]}>
                        <mesh>
                            <sphereGeometry args={[0.085, 10, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <mesh ref={pupilR} position={[0, 0, 0.055]}>
                            <sphereGeometry args={[0.042, 8, 6]} />
                            <meshBasicMaterial color={OUTLINE} />
                        </mesh>
                    </group>
                </group>
                {/* ciuffo-antenna */}
                <mesh position={[0, 0.74, 0]} rotation={[0.25, 0, 0.15]}>
                    <coneGeometry args={[0.05, 0.22, 6]} />
                    <meshToonMaterial color={bellyColor} gradientMap={gradient} />
                </mesh>
                {/* piedini */}
                <mesh position={[-0.13, 0.04, 0.05]} scale={[1, 0.5, 1.3]}>
                    <sphereGeometry args={[0.09, 8, 6]} />
                    <meshToonMaterial color={color} gradientMap={gradient} />
                </mesh>
                <mesh position={[0.13, 0.04, 0.05]} scale={[1, 0.5, 1.3]}>
                    <sphereGeometry args={[0.09, 8, 6]} />
                    <meshToonMaterial color={color} gradientMap={gradient} />
                </mesh>
            </group>

            {/* fumetto */}
            {bubble && (
                <Html position={[0, 1.15, 0]} center distanceFactor={16} zIndexRange={[30, 10]}>
                    <div className="pointer-events-none max-w-[180px] rounded-2xl rounded-bl-sm border border-black/10 bg-[#fffaf0] px-3 py-2 text-center font-mono text-[11px] leading-snug text-[#3a2d52] shadow-lg">
                        {bubble}
                    </div>
                </Html>
            )}
        </group>
    );
}
