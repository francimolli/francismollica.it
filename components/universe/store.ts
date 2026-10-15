"use client";

import { create } from "zustand";
import type { TourShot } from "./config";

// Stato dell'universo in zustand (non context React): deve attraversare il
// confine del reconciler di react-three-fiber, dove i context non arrivano.

// --- Valori letti ogni frame: oggetti mutabili, fuori da React -------------

// Input di volo (tastiera desktop, joystick e frecce su mobile).
export const flightInput = { x: 0, z: 0, yaw: 0, pitch: 0 };

// Ponte dai controlli esistenti (CityControls) verso la scena.
export const bridge = {
    boost: false,
    timeScale: 1, // da "Flusso del Tempo" (timeSpeed/3, può essere negativo)
    invertX: true,
    time: 18.25, // "Ora Locale", guida il mood delle luci
    magia: "NORMAL" as "NORMAL" | "BLACKOUT" | "REBOOTING", // mood dell'universo
    gyro: { x: 0, y: 0 }, // giroscopio mobile, per la parallasse
};

// Ultima interazione dell'utente (i trigger di prossimità scattano solo
// se si sta pilotando davvero, come nel vecchio universo).
export const lastInteraction = { at: 0 };
export const bumpInteraction = () => { lastInteraction.at = Date.now(); };

// Input "veri" (click, tasti, rotella, touch — NON il semplice mousemove):
// guidano la pausa del tour e il conto alla rovescia dello screensaver.
export const lastControlInput = { at: Date.now() };
export const bumpControlInput = () => { lastControlInput.at = Date.now(); };

// --- Stato reattivo --------------------------------------------------------

export type QualityTier = "high" | "medium" | "low";

// La Lucciola Guardiana dei confini: dorme, ti raggiunge, o ti scorta a casa.
export type GuideState = "idle" | "approaching" | "escorting";

export const QUALITY_PRESETS: Record<
    QualityTier,
    { dpr: [number, number]; stars: number; dust: number; nebula: number }
> = {
    high: { dpr: [1, 2], stars: 2500, dust: 400, nebula: 7 },
    medium: { dpr: [1, 1.5], stars: 1200, dust: 200, nebula: 5 },
    low: { dpr: [0.75, 1], stars: 600, dust: 80, nebula: 3 },
};

interface UniverseStore {
    tier: QualityTier;
    degrade: () => void;
    reducedMotion: boolean;
    setReducedMotion: (v: boolean) => void;
    // volo della camera
    flyTo: string | null; // id pianeta o "overview"
    flyShot: TourShot | null; // inquadratura richiesta (regia del tour)
    flightSeq: number; // contatore richieste: ogni volo è un fronte nuovo, anche verso lo stesso id
    openOnArrive: boolean; // la sezione si apre all'arrivo (click diretto sì, logbook no)
    flying: boolean;
    warping: boolean; // salto wormhole: velo violetto + volo rapido
    arrivedAt: string | null;
    requestFlight: (id: string, openOnArrive?: boolean, shot?: TourShot | null) => void;
    cancelFlight: () => void; // il pilota riprende i comandi: pulisce TUTTO lo stato di volo
    setFlying: (v: boolean) => void;
    setWarping: (v: boolean) => void;
    setArrived: (id: string | null) => void;
    // la visita guidata
    tour: {
        source: "manual" | "screensaver";
        stopIndex: number;
        phase: "traveling" | "dwelling" | "finale";
        pausedUntil: number; // timestamp ms: > adesso = in pausa
    } | null;
    startTour: (source: "manual" | "screensaver") => void;
    updateTour: (patch: Partial<NonNullable<UniverseStore["tour"]>>) => void;
    stopTour: () => void;
    // ponte scena → DOM
    proximitySection: string | null; // sezione da aprire per prossimità
    setProximitySection: (id: string | null) => void;
    pendingUnlock: string | null; // artefatto segreto da sbloccare
    setPendingUnlock: (id: string | null) => void;
    // ponte DOM → scena
    density: number; // 0..1 da "Densità"
    setDensity: (v: number) => void;
    unlockedSecretIds: string[];
    setUnlockedSecretIds: (ids: string[]) => void;
    // easter egg: fai amicizia (click) con abbastanza creaturine
    creatureFriends: string[];
    addCreatureFriend: (id: string) => void;
    setCreatureFriends: (ids: string[]) => void;
}

export const CREATURE_EGG_GOAL = 10;

export const useUniverseStore = create<UniverseStore>((set) => ({
    tier: "high",
    degrade: () =>
        set((s) => ({ tier: s.tier === "high" ? "medium" : "low" })),
    reducedMotion: false,
    setReducedMotion: (v) => set({ reducedMotion: v }),
    flyTo: null,
    flyShot: null,
    flightSeq: 0,
    openOnArrive: true,
    flying: false,
    warping: false,
    arrivedAt: null,
    requestFlight: (id, openOnArrive = true, shot = null) =>
        set((s) => ({
            flyTo: id,
            arrivedAt: null,
            openOnArrive,
            flyShot: shot,
            flightSeq: s.flightSeq + 1,
        })),
    cancelFlight: () =>
        set({ flyTo: null, flyShot: null, flying: false, warping: false }),
    tour: null,
    startTour: (source) =>
        set({ tour: { source, stopIndex: 0, phase: "traveling", pausedUntil: 0 } }),
    updateTour: (patch) =>
        set((s) => (s.tour ? { tour: { ...s.tour, ...patch } } : s)),
    stopTour: () => set({ tour: null }),
    setFlying: (v) => set({ flying: v }),
    setWarping: (v) => set({ warping: v }),
    setArrived: (id) => set({ arrivedAt: id, flying: false, flyTo: null }),
    proximitySection: null,
    setProximitySection: (id) => set({ proximitySection: id }),
    pendingUnlock: null,
    setPendingUnlock: (id) => set({ pendingUnlock: id }),
    density: 0.8,
    setDensity: (v) => set({ density: v }),
    unlockedSecretIds: [],
    setUnlockedSecretIds: (ids) => set({ unlockedSecretIds: ids }),
    creatureFriends: [],
    addCreatureFriend: (id) =>
        set((s) => {
            if (s.creatureFriends.includes(id)) return s;
            const creatureFriends = [...s.creatureFriends, id];
            try {
                localStorage.setItem("orbit_creature_friends", JSON.stringify(creatureFriends));
            } catch { /* storage non disponibile: l'uovo vive solo in sessione */ }
            return { creatureFriends };
        }),
    setCreatureFriends: (ids) => set({ creatureFriends: ids }),
}));
