"use client";

import type * as THREE from "three";
import { create } from "zustand";

// Riferimenti ai gruppi rotanti dei pianeti (fuori da React: servono alla
// camera per calcolare ancore di volo che seguono la rotazione).
export const planetRefs: Record<string, THREE.Object3D | null> = {};

// Stato dell'universo in zustand (non context React): deve attraversare il
// confine del reconciler di react-three-fiber, dove i context non arrivano.

export type QualityTier = "high" | "medium" | "low";

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
    // volo camera
    flyTo: string | null; // id ancoraggio richiesto (vedi FLIGHT_ANCHORS)
    flying: boolean;
    arrivedAt: string | null; // id del pianeta su cui siamo appena atterrati
    requestFlight: (id: string) => void;
    setFlying: (v: boolean) => void;
    setArrived: (id: string | null) => void;
}

export const useUniverseStore = create<UniverseStore>((set) => ({
    tier: "high",
    degrade: () =>
        set((s) => ({ tier: s.tier === "high" ? "medium" : "low" })),
    reducedMotion: false,
    setReducedMotion: (v) => set({ reducedMotion: v }),
    flyTo: null,
    flying: false,
    arrivedAt: null,
    requestFlight: (id) => set({ flyTo: id, arrivedAt: null }),
    setFlying: (v) => set({ flying: v }),
    setArrived: (id) => set({ arrivedAt: id, flying: false, flyTo: null }),
}));
