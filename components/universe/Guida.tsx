"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Outlines, Trail } from "@react-three/drei";
import { getToonGradient } from "./toon";
import { OUTLINE, PASTEL } from "./palette";
import { BOUNDS } from "./config";
import { useUniverseStore } from "./store";

// La Lucciola Guardiana: dorme su un posatoio ai margini dell'universo e si
// sveglia quando un viaggiatore si allontana troppo. Lo raggiunge, gli gira
// intorno preoccupata e, oltre il confine, gli fa strada verso casa. Il volo
// di rientro lo comanda FlightRig: lei è la coreografia e la lanterna.

const REST = new THREE.Vector3(0, 46, -BOUNDS.warn); // posatoio al bordo nord
const target = new THREE.Vector3();
const camForward = new THREE.Vector3();
const lookPoint = new THREE.Vector3();

export function Guida() {
    const gradient = useMemo(() => getToonGradient(), []);
    const group = useRef<THREE.Group>(null);
    const wingL = useRef<THREE.Mesh>(null);
    const wingR = useRef<THREE.Mesh>(null);
    const lantern = useRef<THREE.PointLight>(null);
    const camera = useThree((s) => s.camera);
    const guide = useUniverseStore((s) => s.guide);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);

    useFrame(({ clock }, dt) => {
        const g = group.current;
        if (!g) return;
        const t = clock.elapsedTime;
        const awake = guide !== "idle";

        if (guide === "approaching") {
            // ti orbita intorno, agitata
            const a = t * (reducedMotion ? 0.3 : 1.4);
            target.copy(camera.position);
            target.x += Math.cos(a) * 7;
            target.z += Math.sin(a) * 7;
            target.y += 1.5 + Math.sin(t * 2.3) * 1.2;
            lookPoint.copy(camera.position);
        } else if (guide === "escorting") {
            // vola davanti alla camera, facendo strada verso casa
            camera.getWorldDirection(camForward);
            target.copy(camera.position).addScaledVector(camForward, 22);
            target.y += Math.sin(t * 1.8) * 0.8;
            lookPoint.copy(camera.position).addScaledVector(camForward, 60);
        } else {
            // sonnecchia sul posatoio, dondolando piano
            target.set(
                REST.x + Math.sin(t * 0.4) * 3,
                REST.y + Math.sin(t * 0.7) * 2,
                REST.z,
            );
            lookPoint.set(0, 30, 0); // sogna i pianetini
        }

        // inseguimento morbido, stabile a qualsiasi framerate; in scorta
        // l'aggancio è rigido, o il volo rapido se la lascerebbe alle spalle
        const k = guide === "escorting" ? 8 : awake ? 2.5 : 0.6;
        g.position.lerp(target, 1 - Math.exp(-k * dt));
        g.lookAt(lookPoint);

        // battito d'ali: frenetico da sveglia, pigro nel sonno
        const flap = Math.sin(t * (awake ? 14 : 2)) * (awake ? 0.7 : 0.25);
        if (wingL.current) wingL.current.rotation.z = 0.5 + flap;
        if (wingR.current) wingR.current.rotation.z = -0.5 - flap;

        // la lanterna pulsa: fioca nel sonno, viva quando ti cerca
        if (lantern.current) {
            const base = awake ? 3.2 : 1.1;
            lantern.current.intensity = base + Math.sin(t * (awake ? 5 : 1.3)) * base * 0.35;
        }
    });

    return (
        <group ref={group} position={REST.toArray()} scale={2.2}>
            <Trail width={2} length={4.5} decay={1.4} color={PASTEL.warmYellow} attenuation={(w) => w * w}>
                <group>
                    {/* corpo tondo */}
                    <mesh>
                        <sphereGeometry args={[0.55, 14, 12]} />
                        <meshToonMaterial color={PASTEL.warmYellow} gradientMap={gradient} />
                        <Outlines thickness={0.03} color={OUTLINE} />
                    </mesh>
                    {/* pancino-lanterna */}
                    <mesh position={[0, -0.32, 0.18]}>
                        <sphereGeometry args={[0.32, 12, 10]} />
                        <meshToonMaterial
                            color={PASTEL.warmYellow}
                            emissive={PASTEL.warmYellow}
                            emissiveIntensity={1.4}
                            gradientMap={gradient}
                        />
                    </mesh>
                    {/* occhioni */}
                    <mesh position={[-0.18, 0.12, 0.47]}>
                        <sphereGeometry args={[0.11, 8, 6]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[0.18, 0.12, 0.47]}>
                        <sphereGeometry args={[0.11, 8, 6]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh position={[-0.18, 0.12, 0.56]}>
                        <sphereGeometry args={[0.05, 6, 6]} />
                        <meshBasicMaterial color={OUTLINE} />
                    </mesh>
                    <mesh position={[0.18, 0.12, 0.56]}>
                        <sphereGeometry args={[0.05, 6, 6]} />
                        <meshBasicMaterial color={OUTLINE} />
                    </mesh>
                    {/* alette */}
                    <mesh ref={wingL} position={[-0.45, 0.35, -0.1]} rotation={[0, 0, 0.5]}>
                        <sphereGeometry args={[0.3, 8, 6]} />
                        <meshToonMaterial color={PASTEL.sky} gradientMap={gradient} transparent opacity={0.75} />
                    </mesh>
                    <mesh ref={wingR} position={[0.45, 0.35, -0.1]} rotation={[0, 0, -0.5]}>
                        <sphereGeometry args={[0.3, 8, 6]} />
                        <meshToonMaterial color={PASTEL.sky} gradientMap={gradient} transparent opacity={0.75} />
                    </mesh>
                    <pointLight ref={lantern} color={PASTEL.warmYellow} intensity={1.1} distance={26} decay={2} />
                </group>
            </Trail>
        </group>
    );
}
