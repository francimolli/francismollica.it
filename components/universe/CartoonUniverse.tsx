"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { QUALITY_PRESETS, useUniverseStore } from "./store";
import { NIGHT } from "./palette";
import { FLIGHT_ANCHORS, PLANET_SECTION } from "./config";
import { Ambient } from "./Ambient";
import { PlanetCasa } from "./PlanetCasa";
import { CameraRig } from "./CameraRig";
import { useFloatingSection } from "../FloatingSectionContext";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

// Radice dell'universo cartoon. Qui (fuori dal Canvas) facciamo da ponte tra
// i context React dell'app e lo store zustand letto dentro la scena.
export function CartoonUniverse() {
    const { setExpandedSection } = useFloatingSection();
    const { language } = useLanguage();
    const t = translations[language] as (typeof translations)["it"];

    const tier = useUniverseStore((s) => s.tier);
    const flying = useUniverseStore((s) => s.flying);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const arrivedAt = useUniverseStore((s) => s.arrivedAt);
    const preset = QUALITY_PRESETS[tier];

    // preferenza di sistema: prefers-reduced-motion
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => useUniverseStore.getState().setReducedMotion(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    // qualità iniziale più prudente su mobile / touch
    useEffect(() => {
        if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
            useUniverseStore.setState({ tier: "medium" });
        }
    }, []);

    // all'atterraggio su un pianetino si apre la sua sezione
    useEffect(() => {
        const section = arrivedAt ? PLANET_SECTION[arrivedAt] : undefined;
        if (!section) return;
        const timer = setTimeout(() => {
            setExpandedSection(section);
            useUniverseStore.getState().setArrived(null);
        }, 450);
        return () => clearTimeout(timer);
    }, [arrivedAt, setExpandedSection]);

    const phrases = t.universe?.phrases ?? [];
    const casaLabel = t.universe?.planets?.casa ?? "Casa";

    return (
        <div className="absolute inset-0">
            <Canvas
                flat
                dpr={preset.dpr}
                camera={{ position: FLIGHT_ANCHORS.overview.position, fov: 42, near: 0.1, far: 1000 }}
                gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
                onPointerMissed={(e) => {
                    // doppio click nel vuoto: si torna alla vista d'insieme
                    if (e.detail === 2) useUniverseStore.getState().requestFlight("overview");
                }}
            >
                <color attach="background" args={[NIGHT.bg]} />
                <fog attach="fog" args={[NIGHT.fog, 70, 340]} />

                <ambientLight intensity={0.65} color="#cfd8ff" />
                <directionalLight position={[30, 40, 20]} intensity={2.4} color="#fff1d6" />
                <directionalLight position={[-30, -10, -25]} intensity={0.5} color="#7a8cff" />

                <PerformanceMonitor
                    onDecline={() => useUniverseStore.getState().degrade()}
                    flipflops={2}
                >
                    <Suspense fallback={null}>
                        <Ambient />
                        <PlanetCasa label={casaLabel} phrases={phrases} />
                    </Suspense>
                </PerformanceMonitor>

                <CameraRig />
            </Canvas>

            {/* velo per la dissolvenza quando prefers-reduced-motion è attivo */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#0a0a23] transition-opacity duration-300"
                style={{ opacity: reducedMotion && flying ? 1 : 0 }}
            />
        </div>
    );
}
