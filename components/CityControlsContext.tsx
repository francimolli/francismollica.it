"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CityControls {
    time: number;
    setTime: (v: number) => void;
    fogDensity: number;
    setFogDensity: (v: number) => void;
    trafficLevel: number;
    setTrafficLevel: (v: number) => void;
    zoom: number;
    setZoom: (v: number) => void;
    resetDefaults: () => void;
}

const CityControlsContext = createContext<CityControls | undefined>(undefined);

export function CityControlsProvider({ children }: { children: ReactNode }) {
    // --- 1. IMPOSTA QUI I TUOI VALORI DI DEFAULT ---
    const DEFAULT_TIME = 4;       // Ore 18:00
    const DEFAULT_FOG = 30;        // 30% Nebbia
    const DEFAULT_TRAFFIC = 80;    // 80% Traffico

    // Lo zoom lo gestiamo dinamicamente
    const [zoom, setZoom] = useState(1.0);
    const [time, setTime] = useState(DEFAULT_TIME);
    const [fogDensity, setFogDensity] = useState(DEFAULT_FOG);
    const [trafficLevel, setTrafficLevel] = useState(DEFAULT_TRAFFIC);

    // --- 2. RILEVAMENTO MOBILE (ZOOM DEFAULT) ---
    useEffect(() => {
        // Se lo schermo è piccolo (<768px), partiamo più lontani (0.6)
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setZoom(0.6);
        } else {
            setZoom(1.0);
        }
    }, []);

    const resetDefaults = () => {
        const isMobile = window.innerWidth < 768;
        setTime(DEFAULT_TIME);
        setFogDensity(DEFAULT_FOG);
        setTrafficLevel(DEFAULT_TRAFFIC);
        setZoom(isMobile ? 0.6 : 1.0);
    };

    return (
        <CityControlsContext.Provider
            value={{
                time, setTime,
                fogDensity, setFogDensity,
                trafficLevel, setTrafficLevel,
                zoom, setZoom,
                resetDefaults
            }}
        >
            {children}
        </CityControlsContext.Provider>
    );
}

export function useCityControls() {
    const ctx = useContext(CityControlsContext);
    if (!ctx) throw new Error('useCityControls must be used within a CityControlsProvider');
    return ctx;
}