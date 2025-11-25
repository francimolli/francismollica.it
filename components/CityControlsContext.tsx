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
    systemStatus: 'NORMAL' | 'BLACKOUT' | 'REBOOTING';
    manualSetTime: (v: number) => void;
    timeSpeed: number;
    setTimeSpeed: (v: number) => void;
    flyTo: (x: number, z: number) => void;
    stopFlying: () => void;
    resetView: () => void;
    resetTrigger: number; // Counter to trigger reset effect
    cameraTarget: { x: number, z: number } | null;
}

const CityControlsContext = createContext<CityControls | undefined>(undefined);

export function CityControlsProvider({ children }: { children: ReactNode }) {
    // --- 1. IMPOSTA QUI I TUOI VALORI DI DEFAULT ---
    const DEFAULT_TIME = 7.4;       // Ore 07:24
    const DEFAULT_FOG = 30;        // 30% Nebbia
    const DEFAULT_TRAFFIC = 80;    // 80% Traffico

    // Lo zoom lo gestiamo dinamicamente
    const [zoom, setZoom] = useState(1.0);
    const [time, setTime] = useState(DEFAULT_TIME);
    const [fogDensity, setFogDensity] = useState(DEFAULT_FOG);
    const [trafficLevel, setTrafficLevel] = useState(DEFAULT_TRAFFIC);
    const [systemStatus, setSystemStatus] = useState<'NORMAL' | 'BLACKOUT' | 'REBOOTING'>('NORMAL');
    const [timeSpeed, setTimeSpeed] = useState(1.0);
    const [cameraTarget, setCameraTarget] = useState<{ x: number, z: number } | null>(null);
    const [resetTrigger, setResetTrigger] = useState(0);

    // --- 2. RILEVAMENTO MOBILE (ZOOM DEFAULT) ---
    useEffect(() => {
        // Se lo schermo è piccolo (<768px), partiamo più lontani (0.6)
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setZoom(0.6);
        } else {
            setZoom(1.0);
        }

        // --- CALCOLO TEMPO INIZIALE BASATO SULLA SESSIONE ---
        const cookieName = "galactic_session_start";
        const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
        if (match) {
            const startTimestamp = parseInt(match[2]);
            const now = Date.now();
            const elapsedMs = now - startTimestamp;

            // Calcolo ore simulate passate
            // Base speed: 1 ora ogni 20000ms (20s)
            // Ore passate = (elapsedMs / 20000) * timeSpeed
            // Nota: timeSpeed qui è quello di default (1.0) perché lo stato non è ancora stato modificato dall'utente in questa sessione "fresca"
            // Se volessimo persistere anche la velocità, dovremmo salvarla nei cookie/localStorage.
            // Per ora assumiamo che al reload la velocità torni a 1.0 o usiamo quella corrente se fosse persistita.

            const hoursPassed = (elapsedMs / 20000) * 1.0;
            const newTime = (DEFAULT_TIME + hoursPassed) % 24;
            setTime(newTime);
        }
    }, []);

    // --- 3. AUTOMATIC TIME PROGRESSION ---
    useEffect(() => {
        if (systemStatus !== 'NORMAL') return;

        // Base speed: 1 hour every 20 seconds (20000ms).
        // We update every 100ms for smoother clock.
        // Increment per 100ms = (1 hour / 20000ms) * 100ms = 0.005 hours.
        // We multiply by timeSpeed.
        const interval = setInterval(() => {
            setTime(prev => ((prev + 0.005 * timeSpeed) % 24 + 24) % 24);
        }, 100);

        return () => clearInterval(interval);
    }, [systemStatus, timeSpeed]);

    // --- 4. JAILBREAK SEQUENCE (User attempts to change time) ---
    const manualSetTime = (v: number) => {
        if (systemStatus !== 'NORMAL') return;

        // Trigger Blackout
        setSystemStatus('BLACKOUT');
        setTime(0); // 00:00

        // After 1.5s -> Reboot
        setTimeout(() => {
            setSystemStatus('REBOOTING');
            // Random time start
            setTime(Math.floor(Math.random() * 24));

            // After 1.5s -> Back to Normal
            setTimeout(() => {
                setSystemStatus('NORMAL');
            }, 1500);
        }, 1500);
    };

    const resetDefaults = () => {
        const isMobile = window.innerWidth < 768;
        // setTime(DEFAULT_TIME); // Time is preserved
        setFogDensity(DEFAULT_FOG);
        setTrafficLevel(DEFAULT_TRAFFIC);
        setZoom(isMobile ? 0.6 : 1.0);
        setSystemStatus('NORMAL');
        setTimeSpeed(1.0);
        setCameraTarget(null); // Reset camera target
    };

    const flyTo = (x: number, z: number) => {
        setCameraTarget({ x, z });
    };

    const stopFlying = () => {
        setCameraTarget(null);
    };

    const resetView = () => {
        setResetTrigger(prev => prev + 1);
        setCameraTarget(null); // Stop any active flying
    };

    return (
        <CityControlsContext.Provider
            value={{
                time, setTime,
                fogDensity, setFogDensity,
                trafficLevel, setTrafficLevel,
                zoom, setZoom,
                resetDefaults,
                systemStatus,
                manualSetTime,
                timeSpeed, setTimeSpeed,
                cameraTarget, flyTo, stopFlying,
                resetView, resetTrigger
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