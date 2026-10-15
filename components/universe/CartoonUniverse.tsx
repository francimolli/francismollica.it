"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { bridge, bumpInteraction, flightInput, QUALITY_PRESETS, useUniverseStore } from "./store";
import { NIGHT } from "./palette";
import { OVERVIEW, PLANETS, SECTION_PLANET } from "./config";
import { Ambient } from "./Ambient";
import { Planet } from "./Planet";
import { Artifacts } from "./Artifacts";
import { Mood } from "./Mood";
import { Ship } from "./Ship";
import { FlightRig } from "./FlightRig";
import { MobileControls } from "./MobileControls";
import { useFloatingSection } from "../FloatingSectionContext";
import { useCityControls } from "../CityControlsContext";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

// Sonda diagnostica: espone i contatori del renderer (draw call, programmi).
function DebugProbe() {
    const gl = useThree((s) => s.gl);
    useEffect(() => {
        (window as unknown as Record<string, unknown>).__glinfo = gl.info;
    }, [gl]);
    return null;
}

// Radice dell'universo cartoon. Qui (fuori dal Canvas) facciamo da ponte tra
// i context dell'app (CityControls, lingua, sezioni) e lo store/bridge letti
// dentro la scena, dove i context React non arrivano.
export function CartoonUniverse() {
    const { setExpandedSection } = useFloatingSection();
    const {
        setCoordinates,
        boostActive,
        timeSpeed,
        trafficLevel,
        time,
        invertXAxis,
        resetTrigger,
        escapeTrigger,
        flyArcTarget,
        setFlyArcTarget,
        unlockedSecrets,
        unlockSecret,
    } = useCityControls();
    const { language } = useLanguage();
    const t = translations[language] as (typeof translations)["it"];

    const tier = useUniverseStore((s) => s.tier);
    const flying = useUniverseStore((s) => s.flying);
    const warping = useUniverseStore((s) => s.warping);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const arrivedAt = useUniverseStore((s) => s.arrivedAt);
    const proximitySection = useUniverseStore((s) => s.proximitySection);
    const unlockedCount = useUniverseStore((s) => s.unlockedSecretIds.length);
    const preset = QUALITY_PRESETS[tier];

    const [toast, setToast] = useState<string | null>(null);
    // suggerimento comandi al primo ingresso (solo desktop; componente client-only)
    const [showHint, setShowHint] = useState(() => {
        try {
            return !localStorage.getItem("orbit_tutorials_seen") && window.innerWidth >= 768;
        } catch {
            return false;
        }
    });
    const prevReset = useRef(resetTrigger);
    const prevEscape = useRef(escapeTrigger);

    // --- preferenze di sistema e qualità ---
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => useUniverseStore.getState().setReducedMotion(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches) {
            useUniverseStore.setState({ tier: "medium" });
        }
    }, []);

    // --- ponte CityControls → scena (valori letti per-frame) ---
    useEffect(() => { bridge.boost = boostActive; }, [boostActive]);
    useEffect(() => { bridge.timeScale = timeSpeed / 3; }, [timeSpeed]); // 3x = ritmo "naturale"
    useEffect(() => { bridge.invertX = invertXAxis; }, [invertXAxis]);
    useEffect(() => { bridge.time = time; }, [time]);
    useEffect(() => {
        const d = Math.round((trafficLevel / 100) * 10) / 10;
        if (d !== useUniverseStore.getState().density) useUniverseStore.getState().setDensity(d);
    }, [trafficLevel]);
    useEffect(() => {
        useUniverseStore.getState().setUnlockedSecretIds(unlockedSecrets);
    }, [unlockedSecrets]);

    // --- tastiera: WASD / frecce, identici al vecchio universo ---
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW": case "ArrowUp": flightInput.z = 1; break;
                case "KeyS": case "ArrowDown": flightInput.z = -1; break;
                case "KeyA": case "ArrowLeft": flightInput.x = -1; break;
                case "KeyD": case "ArrowRight": flightInput.x = 1; break;
                default: return;
            }
            if (e.code.startsWith("Arrow")) e.preventDefault();
            bumpInteraction();
            setShowHint(false);
            localStorage.setItem("orbit_tutorials_seen", "true");
        };
        const up = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW": case "KeyS": case "ArrowUp": case "ArrowDown": flightInput.z = 0; break;
                case "KeyA": case "KeyD": case "ArrowLeft": case "ArrowRight": flightInput.x = 0; break;
            }
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    // qualunque interazione conta per i trigger di prossimità (come prima)
    useEffect(() => {
        const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "wheel", "touchstart"];
        events.forEach((ev) => window.addEventListener(ev, bumpInteraction));
        return () => events.forEach((ev) => window.removeEventListener(ev, bumpInteraction));
    }, []);

    // --- navigazione esistente → voli ---
    // LOGBOOK: flyArcToSection(id) apre già la sezione, noi voliamo soltanto
    useEffect(() => {
        if (!flyArcTarget) return;
        const planet = SECTION_PLANET[flyArcTarget];
        if (planet) useUniverseStore.getState().requestFlight(planet, false);
        setFlyArcTarget(null);
    }, [flyArcTarget, setFlyArcTarget]);

    // reset (Home / logo): vista d'insieme
    useEffect(() => {
        if (resetTrigger !== prevReset.current) {
            prevReset.current = resetTrigger;
            useUniverseStore.getState().requestFlight("overview", false);
        }
    }, [resetTrigger]);

    // wormhole: salto rapido verso un pianeta a caso
    useEffect(() => {
        if (escapeTrigger === prevEscape.current) return;
        prevEscape.current = escapeTrigger;
        const store = useUniverseStore.getState();
        const candidates = PLANETS.filter(
            (p) => p.id !== store.arrivedAt && (!p.secret || unlockedCount >= 3),
        );
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        store.setWarping(true);
        store.requestFlight(target.id, false);
    }, [escapeTrigger, unlockedCount]);

    // --- scena → app ---
    // atterraggio: si apre la sezione del pianeta (se il volo lo prevede)
    useEffect(() => {
        if (!arrivedAt) return;
        const store = useUniverseStore.getState();
        const section = PLANETS.find((p) => p.id === arrivedAt)?.section;
        if (!section || !store.openOnArrive) return;
        const timer = setTimeout(() => {
            setExpandedSection(section);
            store.setArrived(null);
        }, 450);
        return () => clearTimeout(timer);
    }, [arrivedAt, setExpandedSection]);

    // prossimità in volo libero: come i vecchi beacon
    useEffect(() => {
        if (!proximitySection) return;
        setExpandedSection(proximitySection);
        useUniverseStore.getState().setProximitySection(null);
    }, [proximitySection, setExpandedSection]);

    // artefatto trovato: sblocco + toast (riusa il sistema del LOGBOOK)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const unsub = useUniverseStore.subscribe((s, prev) => {
            if (!s.pendingUnlock || s.pendingUnlock === prev.pendingUnlock) return;
            unlockSecret(s.pendingUnlock);
            const secretT = (t as never as Record<string, Record<string, { message?: string }>>).secrets;
            setToast(secretT?.[s.pendingUnlock]?.message ?? s.pendingUnlock);
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setToast(null);
                useUniverseStore.getState().setPendingUnlock(null);
            }, 6000);
        });
        return () => {
            unsub();
            if (timer) clearTimeout(timer);
        };
    }, [unlockSecret, t]);

    // --- etichette ---
    const planetLabels = useMemo(() => {
        const names = t.universe?.planets ?? ({} as Record<string, string>);
        const nav = t.nav as unknown as Record<string, string>;
        return Object.fromEntries(
            PLANETS.map((p) => {
                const name = (names as Record<string, string>)[p.id] ?? p.id;
                const section = p.section ? nav[p.section] : null;
                return [p.id, section ? `${name} · ${section}` : name];
            }),
        );
    }, [t]);
    const phrases = t.universe?.phrases ?? [];

    const visiblePlanets = PLANETS.filter((p) => !p.secret || unlockedCount >= 3);

    return (
        <div className="absolute inset-0">
            <Canvas
                flat
                dpr={preset.dpr}
                camera={{ position: OVERVIEW.position, fov: 42, near: 0.1, far: 2000 }}
                gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
            >
                <color attach="background" args={[NIGHT.bg]} />
                <fog attach="fog" args={[NIGHT.fog, 260, 1200]} />

                <Mood />
                <DebugProbe />

                <PerformanceMonitor
                    onDecline={() => useUniverseStore.getState().degrade()}
                    flipflops={2}
                >
                    <Suspense fallback={null}>
                        <Ambient />
                        {visiblePlanets.map((p) => (
                            <Planet key={p.id} config={p} label={planetLabels[p.id]} phrases={phrases} />
                        ))}
                        <Artifacts />
                        <Ship />
                    </Suspense>
                </PerformanceMonitor>

                <FlightRig setCoordinates={setCoordinates} />
            </Canvas>

            {/* velo: dissolvenza (reduced motion) o lampo violetto del wormhole */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    backgroundColor: warping ? "#2a1a4f" : "#0a0a23",
                    opacity: reducedMotion && flying ? 1 : warping ? 0.5 : 0,
                }}
            />

            {/* suggerimento comandi (desktop, prima visita) */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="pointer-events-none absolute bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[#c9b6f5]/30 bg-[#1c1433]/80 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9b6f5] backdrop-blur-sm"
                    >
                        {t.universe?.hint}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* toast segreto trovato */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="absolute bottom-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-[#ffd98a]/50 bg-[#2a2150]/90 p-4 shadow-[0_0_25px_rgba(255,217,138,0.3)] backdrop-blur-md"
                    >
                        <div className="animate-pulse rounded-full bg-[#ffd98a] p-2">
                            <div className="h-2 w-2 rounded-full bg-[#2a2150]" />
                        </div>
                        <div>
                            <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#ffd98a]">
                                {(t as never as Record<string, Record<string, Record<string, string>>>).secrets?.alert?.wow}
                            </div>
                            <div className="font-mono text-sm font-bold text-white">{toast}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MobileControls moveLabel={t.hud?.move} />
        </div>
    );
}
