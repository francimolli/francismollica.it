"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { bridge } from "./store";

// Il mood dell'universo segue "Ora Locale": alba, giorno, tramonto, notte.
// Tutte varianti pastello-notturne, così l'identità resta accogliente.
const KEYFRAMES = [
    { h: 0, sky: "#0a0a23", fog: "#15142f", dir: "#aab4ff", dirInt: 1.5, amb: "#8a92d8", ambInt: 0.55 }, // notte fonda
    { h: 6, sky: "#18163a", fog: "#241f4a", dir: "#ffd9b0", dirInt: 2.0, amb: "#bcc6ff", ambInt: 0.6 }, // alba
    { h: 12, sky: "#1b1f4a", fog: "#262b5c", dir: "#fff3d9", dirInt: 2.6, amb: "#d6defa", ambInt: 0.7 }, // giorno
    { h: 19, sky: "#241440", fog: "#2e1b4f", dir: "#ffb8c9", dirInt: 2.1, amb: "#c9b6f5", ambInt: 0.6 }, // tramonto
    { h: 24, sky: "#0a0a23", fog: "#15142f", dir: "#aab4ff", dirInt: 1.5, amb: "#8a92d8", ambInt: 0.55 }, // notte
];

const toColor = (hex: string) => new THREE.Color(hex);

export function Mood() {
    const scene = useThree((s) => s.scene);
    const dir = useRef<THREE.DirectionalLight>(null);
    const amb = useRef<THREE.AmbientLight>(null);
    const keys = useMemo(
        () =>
            KEYFRAMES.map((k) => ({
                ...k,
                skyC: toColor(k.sky),
                fogC: toColor(k.fog),
                dirC: toColor(k.dir),
                ambC: toColor(k.amb),
            })),
        [],
    );
    const sky = useRef(new THREE.Color("#0a0a23"));
    const fogColor = useRef(new THREE.Color("#15142f"));

    useFrame(({ clock }) => {
        const h = ((bridge.time % 24) + 24) % 24;
        let i = 0;
        while (i < keys.length - 2 && h >= keys[i + 1].h) i++;
        const a = keys[i];
        const b = keys[i + 1];
        const t = (h - a.h) / (b.h - a.h);

        // Magia in tempesta (Rigenera): le luci pulsano forte e virano lilla
        const storm = bridge.magia === "REBOOTING"
            ? 1.5 + Math.sin(clock.elapsedTime * 8) * 0.5
            : 1;

        sky.current.copy(a.skyC).lerp(b.skyC, t);
        fogColor.current.copy(a.fogC).lerp(b.fogC, t);
        if (scene.background instanceof THREE.Color) scene.background.lerp(sky.current, 0.05);
        if (scene.fog) scene.fog.color.lerp(fogColor.current, 0.05);
        if (dir.current) {
            dir.current.color.lerp(a.dirC.clone().lerp(b.dirC, t), 0.05);
            dir.current.intensity = THREE.MathUtils.lerp(
                dir.current.intensity,
                THREE.MathUtils.lerp(a.dirInt, b.dirInt, t) * storm,
                storm > 1 ? 0.3 : 0.05,
            );
        }
        if (amb.current) {
            amb.current.color.lerp(a.ambC.clone().lerp(b.ambC, t), 0.05);
            amb.current.intensity = THREE.MathUtils.lerp(
                amb.current.intensity,
                THREE.MathUtils.lerp(a.ambInt, b.ambInt, t),
                0.05,
            );
        }
    });

    return (
        <>
            <ambientLight ref={amb} intensity={0.65} color="#cfd8ff" />
            <directionalLight ref={dir} position={[120, 160, 80]} intensity={2.4} color="#fff1d6" />
            <directionalLight position={[-100, -40, -80]} intensity={0.4} color="#7a8cff" />
        </>
    );
}
