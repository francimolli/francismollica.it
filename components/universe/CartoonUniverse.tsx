"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import { bridge, bumpInteraction, flightInput, lastControlInput, QUALITY_PRESETS, useUniverseStore } from "./store";
import { NIGHT } from "./palette";
import { OVERVIEW, PLANETS, SECTION_PLANET } from "./config";
import { Ambient } from "./Ambient";
import { Planet } from "./Planet";
import { Fauna } from "./Fauna";
import { Guida } from "./Guida";
import { Artifacts } from "./Artifacts";
import { Mood } from "./Mood";
import { Ship } from "./Ship";
import { FlightRig } from "./FlightRig";
import { MobileControls } from "./MobileControls";
import { useFloatingSection } from "../FloatingSectionContext";
import { useCityControls } from "../CityControlsContext";
import { useUniverseColor } from "../UniverseColorContext";
import { CREATURE_EGG_GOAL } from "./store";
import { TOUR } from "./config";
import { TourOverlay } from "./TourOverlay";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

// Sonda diagnostica: contatori del renderer + stato camera/tour per il debug.
function DebugProbe() {
    const gl = useThree((s) => s.gl);
    const camera = useThree((s) => s.camera);
    useEffect(() => {
        (window as unknown as Record<string, unknown>).__glinfo = gl.info;
        (window as unknown as Record<string, unknown>).__univ = () => {
            const s = useUniverseStore.getState();
            return {
                cam: camera.position.toArray().map((v) => Math.round(v * 10) / 10),
                flyTo: s.flyTo,
                flying: s.flying,
                arrivedAt: s.arrivedAt,
                guide: s.guide,
                phase: s.tour?.phase ?? null,
                stop: s.tour?.stopIndex ?? null,
                paused: (s.tour?.pausedUntil ?? 0) > Date.now(),
            };
        };
    }, [gl, camera]);
    return null;
}

// Radice dell'universo cartoon. Qui (fuori dal Canvas) facciamo da ponte tra
// i context dell'app (CityControls, lingua, sezioni) e lo store/bridge letti
// dentro la scena, dove i context React non arrivano.
export function CartoonUniverse() {
    const { expandedSection, setExpandedSection } = useFloatingSection();
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
        systemStatus,
    } = useCityControls();
    const { mode: visualMode } = useUniverseColor();
    const { language, onboardingComplete } = useLanguage();
    const t = translations[language] as (typeof translations)["it"];

    const tier = useUniverseStore((s) => s.tier);
    const flying = useUniverseStore((s) => s.flying);
    const warping = useUniverseStore((s) => s.warping);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const arrivedAt = useUniverseStore((s) => s.arrivedAt);
    const proximitySection = useUniverseStore((s) => s.proximitySection);
    const unlockedCount = useUniverseStore((s) => s.unlockedSecretIds.length);
    const friendCount = useUniverseStore((s) => s.creatureFriends.length);
    const tourActive = useUniverseStore((s) => !!s.tour);
    const creatureEgg = friendCount >= CREATURE_EGG_GOAL;
    const preset = QUALITY_PRESETS[tier];

    const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
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
    useEffect(() => { bridge.magia = systemStatus; }, [systemStatus]); // "Magia" = mood

    // giroscopio → parallasse (mobile; su iOS resta muto senza permesso esplicito)
    useEffect(() => {
        if (!window.matchMedia("(pointer: coarse)").matches) return;
        const onOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return;
            bridge.gyro.x = Math.max(-1, Math.min(1, e.gamma / 45));
            bridge.gyro.y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
        };
        window.addEventListener("deviceorientation", onOrientation);
        return () => window.removeEventListener("deviceorientation", onOrientation);
    }, []);

    // amicizie creaturine persistite (easter egg)
    useEffect(() => {
        try {
            const stored = localStorage.getItem("orbit_creature_friends");
            if (stored) useUniverseStore.getState().setCreatureFriends(JSON.parse(stored));
        } catch { /* niente storage, niente problema */ }
    }, []);

    // VISUALE = regia: "Tour" avvia la visita guidata (il conduttore vive
    // in TourOverlay); tornare su "Libera" la spegne.
    useEffect(() => {
        const store = useUniverseStore.getState();
        if (visualMode === "random") {
            store.startTour("manual");
        } else if (store.tour?.source === "manual") {
            store.stopTour();
        }
    }, [visualMode]);

    // Screensaver: dopo TOUR.idleMs senza input veri il tour parte da solo
    // (e si spegne al primo input, gestito da TourOverlay).
    useEffect(() => {
        const timer = setInterval(() => {
            const store = useUniverseStore.getState();
            if (store.tour || !onboardingComplete || expandedSection) return;
            if (Date.now() - lastControlInput.at > TOUR.idleMs) {
                store.startTour("screensaver");
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [onboardingComplete, expandedSection]);
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

    // artefatto trovato o easter egg delle amicizie: toast + sblocchi
    // Riferimenti sempre freschi per l'effect dei toast: le sue dipendenze
    // dirette (t, unlockSecret) cambiano identità ~10 volte al secondo con
    // l'orologio di CityControls, e ogni rimontaggio dell'effect cancellava
    // il timer dei 6s: i toast non sparivano MAI. L'effect ora monta una
    // volta sola e legge il presente da qui.
    const tRef = useRef(t);
    const unlockRef = useRef(unlockSecret);
    useEffect(() => {
        tRef.current = t;
        unlockRef.current = unlockSecret;
    }, [t, unlockSecret]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const lastShown: Record<string, number> = {};
        const show = (title: string, message: string, alsoClearPending: boolean) => {
            // lo stesso messaggio non si ripete a raffica: il timer dei 6s
            // non va MAI azzerato da un doppione (il toast deve spegnersi)
            const now = Date.now();
            if (now - (lastShown[message] ?? 0) < 20000) {
                if (alsoClearPending) useUniverseStore.getState().setPendingUnlock(null);
                return;
            }
            lastShown[message] = now;
            setToast({ title, message });
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setToast(null);
                if (alsoClearPending) useUniverseStore.getState().setPendingUnlock(null);
            }, 6000);
        };
        const unsub = useUniverseStore.subscribe((s, prev) => {
            const tNow = tRef.current;
            const wow = (tNow as never as Record<string, Record<string, Record<string, string>>>).secrets?.alert?.wow ?? "✦";
            if (s.pendingUnlock && s.pendingUnlock !== prev.pendingUnlock) {
                unlockRef.current(s.pendingUnlock);
                const secretT = (tNow as never as Record<string, Record<string, { message?: string }>>).secrets;
                show(wow, secretT?.[s.pendingUnlock]?.message ?? s.pendingUnlock, true);
            }
            // l'uovo scatta esattamente al traguardo (non ri-annuncia ai mount successivi)
            if (
                s.creatureFriends.length >= CREATURE_EGG_GOAL &&
                prev.creatureFriends.length < CREATURE_EGG_GOAL &&
                prev.creatureFriends.length > 0
            ) {
                show(wow, tNow.universe?.eggMessage ?? "✦", false);
            }
            // la Lucciola Guardiana ti ha trovato / ti scorta a casa
            const guideT = tNow.universe?.guide;
            if (s.guide === "approaching" && prev.guide === "idle") {
                show(guideT?.title ?? "✦", guideT?.found ?? "✦", false);
            }
            if (s.guide === "escorting" && prev.guide !== "escorting") {
                show(guideT?.title ?? "✦", guideT?.escort ?? "✦", false);
            }
        });
        return () => {
            unsub();
            if (timer) clearTimeout(timer);
        };
    }, []);

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

    // il pianeta segreto si svela con tutte le reliquie O con abbastanza amicizie
    const visiblePlanets = PLANETS.filter((p) => !p.secret || unlockedCount >= 3 || creatureEgg);


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

                {/* Montata PRIMA della Ship: a parità di priorità gli useFrame
                    girano in ordine di registrazione, e la navicella deve
                    leggere la camera DOPO che il rig l'ha mossa (niente jitter). */}
                <FlightRig setCoordinates={setCoordinates} />

                <PerformanceMonitor
                    onDecline={() => useUniverseStore.getState().degrade()}
                    flipflops={2}
                >
                    <Suspense fallback={null}>
                        <Ambient />
                        {visiblePlanets.map((p) => (
                            <Planet key={p.id} config={p} label={planetLabels[p.id]} phrases={phrases} />
                        ))}
                        <Fauna />
                        <Guida />
                        <Artifacts />
                        <Ship />
                    </Suspense>
                </PerformanceMonitor>

                {/* post leggero: bloom morbido + vignetta (spento sul tier basso) */}
                {tier !== "low" && (
                    <EffectComposer multisampling={tier === "high" ? 4 : 0}>
                        <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
                        <Vignette eskil={false} offset={0.28} darkness={tourActive ? 0.74 : 0.62} />
                    </EffectComposer>
                )}
            </Canvas>

            {/* velo: dissolvenza (reduced motion), lampo violetto del warp,
                o buio della Magia in blackout */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    backgroundColor: warping || systemStatus === "BLACKOUT" ? "#2a1a4f" : "#0a0a23",
                    opacity:
                        reducedMotion && flying ? 1
                        : warping ? 0.5
                        : systemStatus === "BLACKOUT" ? 0.65
                        : 0,
                }}
            />

            {/* suggerimento comandi (desktop, prima visita) */}
            <AnimatePresence>
                {showHint && !tourActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="pointer-events-none absolute bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full border border-u-lime/30 bg-u-surface/80 px-5 py-2 font-heading font-bold text-[11px] uppercase tracking-[0.2em] text-u-lime backdrop-blur-sm"
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
                            <div className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#ffd98a]">
                                {toast.title}
                            </div>
                            <div className="font-sans text-sm font-medium text-white">{toast.message}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <TourOverlay
                language={language}
                planetLabels={planetLabels}
                secretVisible={unlockedCount >= 3 || creatureEgg}
                openSection={setExpandedSection}
            />

            <MobileControls moveLabel={t.hud?.move} />
        </div>
    );
}
