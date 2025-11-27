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
    resetTrigger: number;
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
    invertXAxis: boolean;
    setInvertXAxis: (v: boolean) => void;
    triggerSystemReboot: () => void;
    boostActive: boolean;
    activateBoost: () => void;
    boostCooldown: number;
    unlockedSecrets: string[];
    unlockSecret: (id: string) => void;
    soundEnabled: boolean;
    setSoundEnabled: (v: boolean) => void;
    unlockVisualTrigger: number;
}

const CityControlsContext = createContext<CityControls | undefined>(undefined);

export function CityControlsProvider({ children }: { children: ReactNode }) {
    const DEFAULT_TIME = 18.25;
    const DEFAULT_FOG = 20;
    const DEFAULT_TRAFFIC = 80;

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
    const [invertXAxis, setInvertXAxis] = useState(true); // Default: ON for mobile comfort

    // Boost Logic
    const [boostActive, setBoostActive] = useState(false);
    const [boostCooldown, setBoostCooldown] = useState(0);

    // SOUND SYSTEM
    const [soundEnabled, setSoundEnabledState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('orbit_sound_enabled');
            return stored ? stored === 'true' : false;
        }
        return false;
    });

    const [unlockVisualTrigger, setUnlockVisualTrigger] = useState(0);

    const setSoundEnabled = (enabled: boolean) => {
        setSoundEnabledState(enabled);
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbit_sound_enabled', String(enabled));
        }
    };

    // GAMIFICATION: UNLOCKED SECRETS
    const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('orbit_unlocked_secrets');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    // Ambient Music (Procedural Synth Pad)
    useEffect(() => {
        if (!soundEnabled) return;

        let audioContext: AudioContext;
        let oscillators: OscillatorNode[] = [];

        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const frequencies = [65.41, 82.41, 98.00, 130.81];
            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0.08;
            masterGain.connect(audioContext.destination);

            frequencies.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.value = 0.25;
                const lfo = audioContext.createOscillator();
                const lfoGain = audioContext.createGain();
                lfo.frequency.value = 0.1 + (i * 0.05);
                lfoGain.gain.value = 0.05;
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start();
                lfo.start();

                oscillators.push(osc);
            });

        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }

        return () => {
            oscillators.forEach(osc => {
                try { osc.stop(); } catch (e) { }
            });
            if (audioContext) audioContext.close();
        };
    }, [soundEnabled]);

    // Save secrets to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbit_unlocked_secrets', JSON.stringify(unlockedSecrets));
        }
    }, [unlockedSecrets]);

    // Mobile detection & initial time
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        setZoom(isMobile ? 0.4 : 0.8);

        const cookieName = "galactic_session_start";
        const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
        if (match) {
            const startTimestamp = parseInt(match[2]);
            const elapsedMs = Date.now() - startTimestamp;
            const hoursPassed = (elapsedMs / 20000) * 1.0;
            const newTime = (DEFAULT_TIME + hoursPassed) % 24;
            setTime(newTime);
        }
    }, []);

    // Automatic time progression
    useEffect(() => {
        if (systemStatus !== 'NORMAL') return;
        const interval = setInterval(() => {
            setTime(prev => ((prev + 0.005 * timeSpeed) % 24 + 24) % 24);
        }, 100);
        return () => clearInterval(interval);
    }, [systemStatus, timeSpeed]);

    // Boost logic
    const activateBoost = () => {
        if (boostCooldown > 0 || boostActive) return;
        setBoostActive(true);
        setBoostCooldown(20);
        setTimeout(() => setBoostActive(false), 12000);
        const interval = setInterval(() => {
            setBoostCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const manualSetTime = (v: number) => setTime(v);

    const triggerSystemReboot = () => {
        if (systemStatus !== 'NORMAL') return;
        setSystemStatus('BLACKOUT');
        setTimeout(() => {
            setSystemStatus('REBOOTING');
            setTimeout(() => setSystemStatus('NORMAL'), 1500);
        }, 1500);
    };

    const resetDefaults = () => {
        const isMobile = window.innerWidth < 768;
        setFogDensity(DEFAULT_FOG);
        setTrafficLevel(DEFAULT_TRAFFIC);
        setZoom(isMobile ? 0.4 : 0.8);
        setSystemStatus('NORMAL');
        setTimeSpeed(3.0);
        setCameraTarget(null);
    };

    const flyTo = (x: number, z: number, y: number = 110) => setCameraTarget({ x, y, z });
    const stopFlying = () => setCameraTarget(null);
    const resetView = () => {
        setResetTrigger(prev => prev + 1);
        setCameraTarget(null);
    };
    const regenerateSimulation = () => setRegenerationTrigger(prev => prev + 1);
    const triggerEscape = (target: { x: number, y: number, z: number }) => {
        setCameraTarget(target);
        setEscapeTrigger(prev => prev + 1);
    };

    const unlockSecret = (id: string) => {
        if (!unlockedSecrets.includes(id)) {
            setUnlockedSecrets(prev => [...prev, id]);
            setUnlockVisualTrigger(prev => prev + 1);

            if (soundEnabled && typeof window !== 'undefined') {
                try {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const now = audioContext.currentTime;

                    const osc1 = audioContext.createOscillator();
                    const osc2 = audioContext.createOscillator();
                    const gain = audioContext.createGain();

                    osc1.type = 'sine';
                    osc2.type = 'sine';
                    osc1.frequency.value = 523.25;
                    osc2.frequency.value = 659.25;

                    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.6);
                    osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.6);

                    gain.gain.value = 0;
                    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

                    osc1.connect(gain);
                    osc2.connect(gain);
                    gain.connect(audioContext.destination);

                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + 0.8);
                    osc2.stop(now + 0.8);

                    setTimeout(() => audioContext.close(), 1000);
                } catch (e) {
                    console.warn('Audio playback failed:', e);
                }
            }
        }
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
                invertXAxis, setInvertXAxis,
                triggerSystemReboot,
                boostActive, activateBoost, boostCooldown,
                unlockedSecrets, unlockSecret,
                soundEnabled, setSoundEnabled,
                unlockVisualTrigger
            }}>
            {children}
        </CityControlsContext.Provider>
    );
}

export function useCityControls() {
    const ctx = useContext(CityControlsContext);
    if (!ctx) throw new Error('useCityControls must be used within a CityControlsProvider');
    return ctx;
}