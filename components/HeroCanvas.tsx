"use client";

import posthog from 'posthog-js';
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, OrbitControls, Float, Environment } from "@react-three/drei";
import { Suspense } from "react";

export function HeroCanvas() {
    return (
        <div className="w-full h-full flex items-center justify-center relative z-10">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                className="w-full h-full"
            >
                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[3, 2, 1]} intensity={1.5} />
                    <Float
                        speed={4}
                        rotationIntensity={1}
                        floatIntensity={2}
                    >
                        <Sphere args={[1, 100, 200]} scale={2.5} position={[1.5, 0, 0]}>
                            <MeshDistortMaterial
                                color="#8b5cf6"
                                attach="material"
                                distort={0.6}
                                speed={3}
                                roughness={0.2}
                                metalness={0.9}
                            />
                        </Sphere>
                    </Float>
                    <OrbitControls 
                        enableZoom={false} 
                        autoRotate 
                        autoRotateSpeed={0.5} 
                        onStart={() => posthog.capture('hero-canvas-interacted')}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
