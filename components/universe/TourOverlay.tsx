"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PLANETS, TOUR, TOUR_ROUTE, TOUR_SECRET_STOP, type TourShot } from "./config";
import { bumpControlInput, useUniverseStore } from "./store";
import { translations } from "@/lib/translations";

type Lang = keyof typeof translations;

interface TourOverlayProps {
    language: Lang;
    planetLabels: Record<string, string>;
    secretVisible: boolean;
    openSection: (section: string) => void;
}

// Typewriter leggero per le didascalie (testo pieno con reduced-motion).
function useTypewriter(text: string, enabled: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!enabled) return;
        let i = 0;
        const interval = setInterval(() => {
            i += 2;
            setCount(i);
            if (i >= text.length) clearInterval(interval);
        }, 24);
        return () => {
            clearInterval(interval);
            setCount(0);
        };
    }, [text, enabled]);
    return enabled ? text.slice(0, count) : text;
}

// Il conduttore della visita guidata + la sua UI da cinema:
// letterbox, didascalia da diario di bordo, progresso, pausa, gran finale.
export function TourOverlay({ language, planetLabels, secretVisible, openSection }: TourOverlayProps) {
    const t = translations[language] as (typeof translations)["it"];
    const tourT = t.universe?.tour;

    const tour = useUniverseStore((s) => s.tour);
    const reducedMotion = useUniverseStore((s) => s.reducedMotion);
    const [pausedNow, setPausedNow] = useState(false);

    // rotta corrente: narrativa fissa, col segreto prima del finale se sbloccato
    const route = useMemo<{ id: string; shot: TourShot }[]>(
        () => (secretVisible
            ? [...TOUR_ROUTE.slice(0, -1), TOUR_SECRET_STOP, TOUR_ROUTE[TOUR_ROUTE.length - 1]]
            : TOUR_ROUTE),
        [secretVisible],
    );
    const routeRef = useRef(route);
    useEffect(() => { routeRef.current = route; }, [route]);

    const active = !!tour;
    const stopIndex = tour?.stopIndex ?? 0;
    const phase = tour?.phase ?? "traveling";
    const currentStop = route[Math.min(stopIndex, route.length - 1)];

    // --- input "veri": pausa (manuale) o uscita (screensaver) -------------
    useEffect(() => {
        const onInput = (e: Event) => {
            bumpControlInput();
            const s = useUniverseStore.getState();
            if (!s.tour) return;
            // i click sulla UI del tour non contano come "riprendo io i comandi"
            if (e.target instanceof Element && e.target.closest("[data-tour-ui]")) return;
            if (e instanceof KeyboardEvent) {
                const moveKeys = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
                if (!moveKeys.includes(e.code)) return;
            }
            if (s.tour.source === "screensaver") s.stopTour();
            else s.updateTour({ pausedUntil: Date.now() + TOUR.pauseMs });
        };
        const events: (keyof WindowEventMap)[] = ["pointerdown", "wheel", "touchstart", "keydown"];
        events.forEach((ev) => window.addEventListener(ev, onInput, { passive: true }));
        return () => events.forEach((ev) => window.removeEventListener(ev, onInput));
    }, []);

    // --- avvio tappa: vola verso la sosta corrente -------------------------
    useEffect(() => {
        if (!active || phase !== "traveling") return;
        const stop = routeRef.current[Math.min(stopIndex, routeRef.current.length - 1)];
        useUniverseStore.getState().requestFlight(stop.id, false, stop.shot);
    }, [active, phase, stopIndex]);

    // --- arrivo → sosta ----------------------------------------------------
    useEffect(() => {
        const unsub = useUniverseStore.subscribe((s, prev) => {
            if (!s.tour || s.tour.phase !== "traveling") return;
            const stop = routeRef.current[Math.min(s.tour.stopIndex, routeRef.current.length - 1)];
            if (s.arrivedAt === stop.id && prev.arrivedAt !== stop.id) {
                s.updateTour({ phase: "dwelling" });
            }
        });
        return unsub;
    }, []);

    // --- orologio del tour: fine sosta, ripresa dopo pausa, finale ---------
    useEffect(() => {
        if (!active) return;
        let dwellEnd = Date.now() + TOUR.dwellMs;
        let finaleEnd = Date.now() + TOUR.finaleMs;
        let lastPhase = "";
        const tick = setInterval(() => {
            const s = useUniverseStore.getState();
            if (!s.tour) return;
            const now = Date.now();
            const paused = s.tour.pausedUntil > now;
            setPausedNow(paused);
            if (s.tour.phase !== lastPhase) {
                lastPhase = s.tour.phase;
                dwellEnd = now + TOUR.dwellMs;
                finaleEnd = now + TOUR.finaleMs;
            }
            if (paused) {
                // la pausa congela i timer e, a fine pausa, si riparte da dove si era
                dwellEnd = Math.max(dwellEnd, s.tour.pausedUntil + 3000);
                finaleEnd = Math.max(finaleEnd, s.tour.pausedUntil + 3000);
                return;
            }
            if (s.tour.phase === "traveling" && !s.flying && !s.flyTo) {
                // il volo era stato interrotto (input utente): si riprende la rotta
                const stop = routeRef.current[Math.min(s.tour.stopIndex, routeRef.current.length - 1)];
                s.requestFlight(stop.id, false, stop.shot);
            } else if (s.tour.phase === "dwelling" && now >= dwellEnd) {
                const next = s.tour.stopIndex + 1;
                if (next >= routeRef.current.length) {
                    s.updateTour({ phase: "finale" });
                    s.requestFlight("overview", false);
                } else {
                    s.updateTour({ stopIndex: next, phase: "traveling" });
                }
            } else if (s.tour.phase === "finale" && now >= finaleEnd) {
                // si ricomincia il giro, finché resti in Tour
                s.updateTour({ stopIndex: 0, phase: "traveling" });
            }
        }, 250);
        return () => clearInterval(tick);
    }, [active]);

    // --- HUD attenuato durante il tour -------------------------------------
    useEffect(() => {
        if (active) document.body.dataset.tour = "on";
        else delete document.body.dataset.tour;
        return () => { delete document.body.dataset.tour; };
    }, [active]);

    const caption = useTypewriter(
        phase === "finale"
            ? tourT?.finaleText ?? ""
            : (tourT?.captions as Record<string, string> | undefined)?.[currentStop.id] ?? "",
        active && phase !== "traveling" && !reducedMotion,
    );

    const section = PLANETS.find((p) => p.id === currentStop.id)?.section;

    return (
        <>
            {/* LETTERBOX */}
            <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 z-40 h-[9vh] bg-[#05040f] transition-transform duration-700 ease-out ${active ? "translate-y-0" : "-translate-y-full"}`}
            />
            <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[9vh] bg-[#05040f] transition-transform duration-700 ease-out ${active ? "translate-y-0" : "translate-y-full"}`}
            />

            {/* DIDASCALIA + PROGRESSO */}
            <AnimatePresence>
                {active && phase !== "traveling" && (
                    <motion.div
                        key={phase === "finale" ? "finale" : currentStop.id}
                        data-tour-ui
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        className="pointer-events-auto absolute bottom-[11vh] left-1/2 z-50 w-[min(92vw,540px)] -translate-x-1/2"
                    >
                        <div className="clay px-6 py-4 text-center">
                            <div className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-u-lime">
                                {phase === "finale" ? tourT?.finaleTitle : planetLabels[currentStop.id]}
                            </div>
                            <p className="mt-2 min-h-[2.6em] font-sans text-[13px] leading-relaxed text-u-cream/90">
                                {caption}
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-4">
                                {phase === "finale" ? (
                                    <button
                                        onClick={() => openSection("contact")}
                                        className="clay-press cursor-pointer rounded-full border-2 border-u-sun/60 bg-u-sun/15 px-4 py-1.5 font-heading text-xs font-extrabold uppercase tracking-widest text-u-sun hover:bg-u-sun/25"
                                    >
                                        {tourT?.finaleCta}
                                    </button>
                                ) : (
                                    section && (
                                        <button
                                            onClick={() => {
                                                useUniverseStore.getState().updateTour({ pausedUntil: Date.now() + TOUR.pauseMs * 3 });
                                                openSection(section);
                                            }}
                                            className="clay-press cursor-pointer rounded-full border-2 border-u-sun/60 bg-u-sun/15 px-4 py-1.5 font-heading text-xs font-extrabold uppercase tracking-widest text-u-sun hover:bg-u-sun/25"
                                        >
                                            {tourT?.land}
                                        </button>
                                    )
                                )}
                                {phase !== "finale" && (
                                    <div className="flex items-center gap-2" aria-label={`${tourT?.stop} ${stopIndex + 1}/${route.length}`}>
                                        {route.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === stopIndex ? "bg-u-lime" : i < stopIndex ? "bg-u-lime/40" : "bg-white/15"}`}
                                            />
                                        ))}
                                        <span className="ml-1 font-mono text-[10px] text-u-sky/70">
                                            {stopIndex + 1}/{route.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CHIP DI PAUSA */}
            <AnimatePresence>
                {active && pausedNow && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="pointer-events-none absolute top-[11vh] left-1/2 z-50 -translate-x-1/2 rounded-full border border-u-lime/30 bg-u-surface/85 px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-u-lime backdrop-blur-sm"
                    >
                        {tourT?.paused}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
