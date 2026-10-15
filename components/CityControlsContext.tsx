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
    playExplosionSound: () => void;
    playBoostSound: (duration: number) => void;
    flyArcTarget: string | null;
    setFlyArcTarget: (id: string | null) => void;
    flyArcToSection: (id: string) => void;
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
    const [soundEnabled, setSoundEnabledState] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('orbit_sound_enabled');
        if (stored) {
            setSoundEnabledState(stored === 'true');
        }
    }, []);

    const [unlockVisualTrigger, setUnlockVisualTrigger] = useState(0);
    const [flyArcTarget, setFlyArcTarget] = useState<string | null>(null);
    const flyArcToSection = (id: string) => {
        setFlyArcTarget(id);
        const sectionCoords: Record<string, { x: number, z: number }> = {
            "about": { x: 0, z: -200 },
            "timeline": { x: 200, z: 0 },
            "projects": { x: 200, z: 0 },
            "portfolio": { x: -250, z: -150 },
            "contact": { x: -200, z: 0 },
            "music": { x: 0, z: 200 },
            "market": { x: 250, z: 150 },
            "roadmap": { x: -250, z: 150 },
        };
        const coords = sectionCoords[id];
        if (coords) {
            flyTo(coords.x, coords.z, 110);
        }
    };

    const setSoundEnabled = (enabled: boolean) => {
        setSoundEnabledState(enabled);
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbit_sound_enabled', String(enabled));
        }
    };

    // GAMIFICATION: UNLOCKED SECRETS
    const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('orbit_unlocked_secrets');
        if (stored) {
            try {
                setUnlockedSecrets(JSON.parse(stored));
            } catch {
                setUnlockedSecrets([]);
            }
        }
    }, []);

    // Musica ambiente: carillon spaziale (in tema con l'universo cartoon).
    // Pad caldo e morbido + note pentatoniche "pizzicate" a caso, come un
    // carillon che suona piano tra le stelle. Sempre opt-in.
    useEffect(() => {
        if (!soundEnabled) return;

        let audioContext: AudioContext | undefined;
        const running: OscillatorNode[] = [];
        let pluckTimer: ReturnType<typeof setTimeout> | null = null;
        let stopped = false;

        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const master = audioContext.createGain();
            master.gain.value = 0.12;
            master.connect(audioContext.destination);

            // Pad caldo (Do3 + Sol3), respira lentamente
            [130.81, 196.0].forEach((freq, i) => {
                const osc = audioContext!.createOscillator();
                const gain = audioContext!.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.value = 0.09;

                const lfo = audioContext!.createOscillator();
                const lfoGain = audioContext!.createGain();
                lfo.frequency.value = 0.06 + i * 0.04;
                lfoGain.gain.value = 0.035;
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);

                osc.connect(gain);
                gain.connect(master);
                osc.start();
                lfo.start();
                running.push(osc, lfo);
            });

            // Carillon: pentatonica di Do su due ottave, con una seconda voce
            // leggermente scordata per il luccichio da scatola musicale
            const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
            const pluck = () => {
                if (stopped || !audioContext) return;
                const now = audioContext.currentTime;
                const freq = SCALE[Math.floor(Math.random() * SCALE.length)];

                const note = audioContext.createOscillator();
                const shimmer = audioContext.createOscillator();
                const env = audioContext.createGain();
                const shimmerGain = audioContext.createGain();

                note.type = 'sine';
                note.frequency.value = freq;
                shimmer.type = 'sine';
                shimmer.frequency.value = freq * 2.012;
                shimmerGain.gain.value = 0.25;

                env.gain.setValueAtTime(0, now);
                env.gain.linearRampToValueAtTime(0.2, now + 0.012);
                env.gain.exponentialRampToValueAtTime(0.0004, now + 1.9);

                note.connect(env);
                shimmer.connect(shimmerGain);
                shimmerGain.connect(env);
                env.connect(master);

                note.start(now);
                shimmer.start(now);
                note.stop(now + 2);
                shimmer.stop(now + 2);

                pluckTimer = setTimeout(pluck, 900 + Math.random() * 2400);
            };
            pluckTimer = setTimeout(pluck, 700);
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }

        return () => {
            stopped = true;
            if (pluckTimer) clearTimeout(pluckTimer);
            running.forEach(osc => {
                try { osc.stop(); } catch { }
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
        playBoostSound(12000); // Trigger NOS sound
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

    // "Esplosione" in chiave cartoon: un soffio morbido + scia di campanellini,
    // al posto del vecchio boato cupo (usato da wormhole e rigenera).
    const playExplosionSound = () => {
        if (!soundEnabled || typeof window === 'undefined') return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = audioContext.currentTime;

            // --- 1. SOFFIO (rumore filtrato, sweep veloce verso il basso) ---
            const bufferSize = Math.floor(audioContext.sampleRate * 0.9);
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 1.2;
            filter.frequency.setValueAtTime(1800, now);
            filter.frequency.exponentialRampToValueAtTime(220, now + 0.8);

            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(0, now);
            noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            noise.start(now);
            noise.stop(now + 1);

            // --- 2. SCIA DI CAMPANELLINI (arpeggio veloce verso l'alto) ---
            [783.99, 987.77, 1318.51].forEach((freq, i) => {
                const t = now + 0.12 + i * 0.09;
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(t);
                osc.stop(t + 0.9);
            });

            setTimeout(() => audioContext.close(), 2200);
        } catch (e) {
            console.warn('Whoosh sound failed:', e);
        }
    };

    const playBoostSound = (durationMs: number) => {
        if (!soundEnabled || typeof window === 'undefined') return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = audioContext.currentTime;
            const duration = durationMs / 1000;

            // --- 1. THE ION DRIVE (Clean Electronic Hum) ---
            const mainOsc = audioContext.createOscillator();
            const mainGain = audioContext.createGain();
            mainOsc.type = 'triangle'; // Softer than sawtooth, feels more high-tech
            mainOsc.frequency.setValueAtTime(60, now);
            mainOsc.frequency.exponentialRampToValueAtTime(140, now + 1.5);
            mainOsc.frequency.linearRampToValueAtTime(120, now + duration);

            mainGain.gain.setValueAtTime(0, now);
            mainGain.gain.linearRampToValueAtTime(0.15, now + 1.0);
            mainGain.gain.linearRampToValueAtTime(0, now + duration);

            // --- 2. PLASMA SHIMMER (High-frequency Resonance) ---
            const shimmerOsc = audioContext.createOscillator();
            const shimmerGain = audioContext.createGain();
            shimmerOsc.type = 'sine';
            shimmerOsc.frequency.setValueAtTime(800, now);
            shimmerOsc.frequency.exponentialRampToValueAtTime(1200, now + 2);

            shimmerGain.gain.setValueAtTime(0, now);
            shimmerGain.gain.linearRampToValueAtTime(0.04, now + 1.5);
            shimmerGain.gain.linearRampToValueAtTime(0, now + duration);

            // --- 3. PULSING THRUSTERS (Modulated Resonant Noise) ---
            const bufferSize = audioContext.sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
            const noise = audioContext.createBufferSource();
            noise.buffer = buffer;

            const sweepFilter = audioContext.createBiquadFilter();
            sweepFilter.type = 'lowpass';
            sweepFilter.Q.value = 12; // High resonance for that "whoosh" effect
            sweepFilter.frequency.setValueAtTime(200, now);
            sweepFilter.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
            sweepFilter.frequency.exponentialRampToValueAtTime(500, now + duration);

            const pulseLFO = audioContext.createOscillator();
            const pulseGain = audioContext.createGain();
            pulseLFO.frequency.value = 8; // 8Hz pulsing
            pulseGain.gain.value = 0.08;
            pulseLFO.connect(pulseGain);

            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(0, now);
            noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
            noiseGain.gain.linearRampToValueAtTime(0, now + duration);

            // Audio Routing
            mainOsc.connect(mainGain).connect(audioContext.destination);
            shimmerOsc.connect(shimmerGain).connect(audioContext.destination);

            noise.connect(sweepFilter);
            sweepFilter.connect(noiseGain);
            pulseGain.connect(noiseGain.gain); // Pulse the volume of the thrust
            noiseGain.connect(audioContext.destination);

            // Ignition
            mainOsc.start(now);
            shimmerOsc.start(now);
            noise.start(now);
            pulseLFO.start(now);

            // Shutdown
            mainOsc.stop(now + duration + 0.1);
            shimmerOsc.stop(now + duration + 0.1);
            noise.stop(now + duration + 0.1);
            pulseLFO.stop(now + duration + 0.1);

            setTimeout(() => audioContext.close(), (duration + 1) * 1000);
        } catch (e) {
            console.warn('Cosmic Boost synthesis failed:', e);
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
                unlockVisualTrigger,
                playExplosionSound,
                playBoostSound,
                flyArcTarget, setFlyArcTarget, flyArcToSection
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