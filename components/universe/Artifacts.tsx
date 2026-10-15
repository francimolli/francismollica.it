"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { getToonGradient } from "./toon";
import { OUTLINE, PASTEL } from "./palette";
import { PLANETS, SECRET_ARTIFACTS } from "./config";
import { bridge } from "./store";

// Posizione assoluta di un artefatto (pianeta + offset).
export function artifactWorldPosition(artifactId: string): THREE.Vector3 {
    const a = SECRET_ARTIFACTS.find((x) => x.id === artifactId)!;
    const p = PLANETS.find((pl) => pl.id === a.planet)!;
    return new THREE.Vector3(
        p.position[0] + a.offset[0],
        p.position[1] + a.offset[1],
        p.position[2] + a.offset[2],
    );
}

function Satellite({ position }: { position: THREE.Vector3 }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const blink = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, dt) => {
        if (group.current) {
            group.current.rotation.y += dt * 0.3 * bridge.timeScale;
            group.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.2;
        }
        if (blink.current) {
            (blink.current.material as THREE.MeshBasicMaterial).color.set(
                Math.sin(clock.elapsedTime * 5) > 0 ? PASTEL.rose : "#4a2335",
            );
        }
    });
    return (
        <group ref={group} position={position}>
            <mesh>
                <dodecahedronGeometry args={[1.4, 0]} />
                <meshToonMaterial color="#b8c0d4" gradientMap={gradient} />
                <Outlines thickness={0.04} color={OUTLINE} />
            </mesh>
            {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 2.6, 0, 0]}>
                    <boxGeometry args={[3.2, 0.12, 1]} />
                    <meshToonMaterial color={PASTEL.sky} emissive={PASTEL.sky} emissiveIntensity={0.4} gradientMap={gradient} />
                </mesh>
            ))}
            <mesh ref={blink} position={[0, 1.9, 0]}>
                <sphereGeometry args={[0.2, 8, 6]} />
                <meshBasicMaterial color={PASTEL.rose} />
            </mesh>
            <pointLight color={PASTEL.sky} intensity={4} distance={14} decay={2} />
        </group>
    );
}

function Monolith({ position }: { position: THREE.Vector3 }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const aura = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, dt) => {
        if (group.current) group.current.rotation.y += dt * 0.08 * bridge.timeScale;
        if (aura.current) {
            (aura.current.material as THREE.MeshBasicMaterial).opacity = 0.18 + Math.sin(clock.elapsedTime * 2) * 0.1;
        }
    });
    return (
        <group ref={group} position={position}>
            <mesh>
                <boxGeometry args={[1.6, 4.6, 0.5]} />
                <meshToonMaterial color="#241f38" gradientMap={gradient} />
                <Outlines thickness={0.04} color={PASTEL.lilac} />
            </mesh>
            <mesh ref={aura}>
                <boxGeometry args={[1.9, 4.9, 0.8]} />
                <meshBasicMaterial color={PASTEL.lilac} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <pointLight color={PASTEL.lilac} intensity={4} distance={14} decay={2} />
        </group>
    );
}

function Relitto({ position }: { position: THREE.Vector3 }) {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const engine = useRef<THREE.Mesh>(null);
    useFrame(({ clock }, dt) => {
        if (group.current) {
            group.current.rotation.x += dt * 0.1 * bridge.timeScale;
            group.current.rotation.y += dt * 0.16 * bridge.timeScale;
        }
        if (engine.current) {
            (engine.current.material as THREE.MeshBasicMaterial).opacity =
                0.4 + Math.abs(Math.sin(clock.elapsedTime * 7)) * 0.5;
        }
    });
    return (
        <group ref={group} position={position}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.7, 1.3, 4, 6]} />
                <meshToonMaterial color="#8a92a8" gradientMap={gradient} />
                <Outlines thickness={0.04} color={OUTLINE} />
            </mesh>
            <mesh position={[0, 0, 0.8]} rotation={[0, 0, 0.25]}>
                <boxGeometry args={[3, 0.14, 1.3]} />
                <meshToonMaterial color="#6d7589" gradientMap={gradient} />
            </mesh>
            <mesh ref={engine} position={[0, 0, 2.2]}>
                <sphereGeometry args={[0.5, 8, 6]} />
                <meshBasicMaterial color={PASTEL.mint} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <pointLight color={PASTEL.mint} intensity={4} distance={14} decay={2} />
        </group>
    );
}

// I tre artefatti segreti sparsi per il cosmo: trovarli (volarci vicino)
// sblocca i segreti del LOGBOOK; con tutti e tre appare il pianeta segreto.
export function Artifacts() {
    const positions = useMemo(
        () => ({
            satellite: artifactWorldPosition("satellite"),
            monolith: artifactWorldPosition("monolith"),
            void_ship: artifactWorldPosition("void_ship"),
        }),
        [],
    );
    return (
        <>
            <Satellite position={positions.satellite} />
            <Monolith position={positions.monolith} />
            <Relitto position={positions.void_ship} />
        </>
    );
}
