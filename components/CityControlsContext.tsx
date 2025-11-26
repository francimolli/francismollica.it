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
    flyTo: (x: number, z: number, y?: number) => void;
    stopFlying: () => void;
    resetView: () => void;
    resetTrigger: number; // Counter to trigger reset effect
    cameraTarget: { x: number, y: number, z: number } | null;
    setCameraTarget: (target: { x: number, y: number, z: number } | null) => void;
    regenerationTrigger: number;
    regenerateSimulation: () => void;
    escapeTrigger: number;
    triggerEscape: (target: { x: number, y: number, z: number }) => void;
    coordinates: { lat: number, long: number };
    setCoordinates: (coords: { lat: number, long: number }) => void;
    invertYAxis: boolean;
    setInvertYAxis: (v: boolean) => void;
    triggerSystemReboot: () => void;
}

const CityControlsContext = createContext<CityControls | undefined>(undefined);

export function CityControlsProvider({ children }: { children: ReactNode }) {
    // --- 1. IMPOSTA QUI I TUOI VALORI DI DEFAULT ---
    const DEFAULT_TIME = 18.25;       // Ore 18:15
    const DEFAULT_FOG = 20;        // 30% Nebbia
    const DEFAULT_TRAFFIC = 80;    // 80% Traffico

    // Lo zoom lo gestiamo dinamicamente
    const [zoom, setZoom] = useState(1.0);
    const [time, setTime] = useState(DEFAULT_TIME);
    const [fogDensity, setFogDensity] = useState(DEFAULT_FOG);
    const [trafficLevel, setTrafficLevel] = useState(DEFAULT_TRAFFIC);
    const [systemStatus, setSystemStatus] = useState<'NORMAL' | 'BLACKOUT' | 'REBOOTING'>('NORMAL');
    const [timeSpeed, setTimeSpeed] = useState(3.0);
    const [cameraTarget, setCameraTarget] = useState<{ x: number, y: number, z: number } | null>(null);
    const [resetTrigger, setResetTrigger] = useState(0);
    const [regenerationTrigger, setRegenerationTrigger] = useState(0);
    const [escapeTrigger, setEscapeTrigger] = useState(0);
    const [coordinates, setCoordinates] = useState({ lat: 41.90, long: 12.49 });
    const [invertYAxis, setInvertYAxis] = useState(false);

    // --- 2. RILEVAMENTO MOBILE (ZOOM DEFAULT) ---
    useEffect(() => {
        // Se lo schermo è piccolo (<768px), partiamo più lontani (0.4)
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            setZoom(0.4);
        } else {
            setZoom(0.8);
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
    // --- 4. MANUAL TIME CONTROL ---
    const manualSetTime = (v: number) => {
        setTime(v);
    };

    const triggerSystemReboot = () => {
        if (systemStatus !== 'NORMAL') return;

        // Trigger Blackout
        setSystemStatus('BLACKOUT');

        // After 1.5s -> Reboot
        setTimeout(() => {
            setSystemStatus('REBOOTING');

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
        setZoom(isMobile ? 0.4 : 0.8);
        setSystemStatus('NORMAL');
        setTimeSpeed(3.0);
        setCameraTarget(null); // Reset camera target
    };

    const flyTo = (x: number, z: number, y: number = 110) => {
        setCameraTarget({ x, y, z });
    };

    const stopFlying = () => {
        setCameraTarget(null);
    };

    const resetView = () => {
        setResetTrigger(prev => prev + 1);
        setCameraTarget(null); // Stop any active flying
    };

    const regenerateSimulation = () => {
        setRegenerationTrigger(prev => prev + 1);
    };

    const triggerEscape = (target: { x: number, y: number, z: number }) => {
        setCameraTarget(target);
        setEscapeTrigger(prev => prev + 1);
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
                cameraTarget, setCameraTarget, flyTo, stopFlying,
                resetView, resetTrigger,
                regenerationTrigger, regenerateSimulation,
                escapeTrigger, triggerEscape,
                coordinates, setCoordinates,
                invertYAxis, setInvertYAxis,
                triggerSystemReboot
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