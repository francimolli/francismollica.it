"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { getToonGradient } from "./toon";
import { OUTLINE, SHIP } from "./palette";
import { bridge, flightInput, useUniverseStore } from "./store";

const FOLLOW = 14; // rigidità dell'inseguimento (più alto = meno scia)
const LOCAL_OFFSET = new THREE.Vector3(0, -2.4, -10);
const SHIP_SCALE = 0.55;

// La navicella del viaggiatore, in terza persona: un pupazzetto alla guida
// di uno slittino spaziale, sempre in primo piano davanti alla camera.
// Insegue la camera con un filo di ritardo, così curve e virate si sentono.
export function Ship() {
    const gradient = useMemo(() => getToonGradient(), []);
    const outer = useRef<THREE.Group>(null);
    const inner = useRef<THREE.Group>(null);
    const flameL = useRef<THREE.Mesh>(null);
    const flameR = useRef<THREE.Mesh>(null);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const flying = useUniverseStore((s) => s.flying);

    const target = useRef(new THREE.Vector3());
    const targetQuat = useRef(new THREE.Quaternion());

    useFrame((state, dt) => {
        if (!outer.current || !inner.current) return;
        const cam = state.camera;
        const t = state.clock.elapsedTime;

        // posizione/rotazione bersaglio = camera + offset locale
        target.current.copy(LOCAL_OFFSET).applyQuaternion(cam.quaternion).add(cam.position);
        targetQuat.current.copy(cam.quaternion);

        // inseguimento smorzato (piccola scia nelle virate)
        const k = 1 - Math.exp(-FOLLOW * dt);
        outer.current.position.lerp(target.current, reducedMotion ? 1 : k);
        outer.current.quaternion.slerp(targetQuat.current, reducedMotion ? 1 : k);

        // banking e beccheggio dai comandi, bob in idle
        const moving = flightInput.x !== 0 || flightInput.z !== 0 || flying;
        const bank = -flightInput.x * 0.45;
        const pitch = flightInput.pitch * 0.2 - (flightInput.z > 0 ? 0.07 : 0);
        inner.current.rotation.z = THREE.MathUtils.lerp(inner.current.rotation.z, bank, 0.12);
        inner.current.rotation.x = THREE.MathUtils.lerp(inner.current.rotation.x, pitch, 0.12);
        inner.current.position.y = reducedMotion ? 0 : Math.sin(t * 2.1) * 0.07;

        // fiamme dei motori: più fiamma quando si viaggia, molta col boost
        const flame = (moving ? 1 : 0.45) * (bridge.boost ? 1.9 : 1);
        [flameL.current, flameR.current].forEach((f, i) => {
            if (!f) return;
            const flicker = 1 + Math.sin(t * 22 + i * 3) * 0.18;
            f.scale.set(flame * 0.8, flame * flicker, flame * 0.8);
        });
    });

    return (
        <group ref={outer}>
            <group ref={inner} scale={SHIP_SCALE}>
                {/* scocca: slittino spaziale */}
                <mesh scale={[1.5, 0.55, 2.4]}>
                    <sphereGeometry args={[0.6, 16, 12]} />
                    <meshToonMaterial color={SHIP.hull} gradientMap={gradient} />
                    <Outlines thickness={0.03} color={OUTLINE} />
                </mesh>
                {/* muso */}
                <mesh position={[0, 0.08, -1.45]} scale={[0.55, 0.3, 0.5]}>
                    <sphereGeometry args={[0.6, 12, 10]} />
                    <meshToonMaterial color={SHIP.trim} gradientMap={gradient} />
                </mesh>
                {/* parabrezza */}
                <mesh position={[0, 0.4, -0.55]} rotation={[0.5, 0, 0]} scale={[0.7, 0.5, 0.35]}>
                    <sphereGeometry args={[0.6, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshBasicMaterial color={SHIP.helmet} transparent opacity={0.3} depthWrite={false} />
                </mesh>
                {/* pinne laterali */}
                <mesh position={[0.85, -0.05, 0.5]} rotation={[0, 0, -0.35]} scale={[0.5, 0.1, 0.9]}>
                    <sphereGeometry args={[0.6, 8, 6]} />
                    <meshToonMaterial color={SHIP.trim} gradientMap={gradient} />
                </mesh>
                <mesh position={[-0.85, -0.05, 0.5]} rotation={[0, 0, 0.35]} scale={[0.5, 0.1, 0.9]}>
                    <sphereGeometry args={[0.6, 8, 6]} />
                    <meshToonMaterial color={SHIP.trim} gradientMap={gradient} />
                </mesh>

                {/* pilota: pupazzetto con casco, visto di spalle */}
                <group position={[0, 0.5, 0.25]}>
                    <mesh position={[0, 0.05, 0]}>
                        <sphereGeometry args={[0.28, 12, 10]} />
                        <meshToonMaterial color={SHIP.pilot} gradientMap={gradient} />
                        <Outlines thickness={0.015} color={OUTLINE} />
                    </mesh>
                    {/* casco trasparente */}
                    <mesh position={[0, 0.08, 0]}>
                        <sphereGeometry args={[0.36, 12, 10]} />
                        <meshBasicMaterial color={SHIP.helmet} transparent opacity={0.22} depthWrite={false} />
                    </mesh>
                    {/* antennina */}
                    <mesh position={[0, 0.45, 0]}>
                        <cylinderGeometry args={[0.015, 0.015, 0.2, 4]} />
                        <meshBasicMaterial color={OUTLINE} />
                    </mesh>
                    <mesh position={[0, 0.58, 0]}>
                        <sphereGeometry args={[0.05, 8, 6]} />
                        <meshBasicMaterial color={SHIP.flame} />
                    </mesh>
                    {/* manine sul manubrio */}
                    <mesh position={[0.18, -0.12, -0.28]}>
                        <sphereGeometry args={[0.08, 8, 6]} />
                        <meshToonMaterial color={SHIP.pilot} gradientMap={gradient} />
                    </mesh>
                    <mesh position={[-0.18, -0.12, -0.28]}>
                        <sphereGeometry args={[0.08, 8, 6]} />
                        <meshToonMaterial color={SHIP.pilot} gradientMap={gradient} />
                    </mesh>
                </group>
                {/* sellino */}
                <mesh position={[0, 0.28, 0.35]} scale={[0.6, 0.25, 0.7]}>
                    <sphereGeometry args={[0.6, 10, 8]} />
                    <meshToonMaterial color={SHIP.seat} gradientMap={gradient} />
                </mesh>

                {/* motori + fiamme */}
                {[-0.45, 0.45].map((x, i) => (
                    <group key={i} position={[x, -0.05, 1.25]}>
                        <mesh rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.2, 0.26, 0.5, 10]} />
                            <meshToonMaterial color="#9aa3b8" gradientMap={gradient} />
                        </mesh>
                        <mesh ref={i === 0 ? flameL : flameR} position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                            <coneGeometry args={[0.16, 0.6, 8]} />
                            <meshBasicMaterial color={SHIP.flame} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
                        </mesh>
                    </group>
                ))}
            </group>
        </group>
    );
}
