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

    const playExplosionSound = () => {
        if (!soundEnabled || typeof window === 'undefined') return;
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = audioContext.currentTime;

            // --- 1. THE LOW RUMBLE (Brownian-ish noise/low osc) ---
            const lowOsc = audioContext.createOscillator();
            const lowGain = audioContext.createGain();
            lowOsc.type = 'triangle';
            lowOsc.frequency.setValueAtTime(40, now);
            lowOsc.frequency.exponentialRampToValueAtTime(10, now + 3);

            lowGain.gain.setValueAtTime(0, now);
            lowGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
            lowGain.gain.exponentialRampToValueAtTime(0.01, now + 3);

            // --- 2. THE EXPLOSION NOISE (White noise filtered) ---
            const bufferSize = audioContext.sampleRate * 2;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseSource = audioContext.createBufferSource();
            noiseSource.buffer = buffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 2);

            const noiseGain = audioContext.createGain();
            noiseGain.gain.setValueAtTime(0, now);
            noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

            // Connect Low Rumble
            lowOsc.connect(lowGain);
            lowGain.connect(audioContext.destination);

            // Connect Noise
            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);

            lowOsc.start(now);
            noiseSource.start(now);

            lowOsc.stop(now + 3.1);
            noiseSource.stop(now + 3.1);

            setTimeout(() => audioContext.close(), 4000);
        } catch (e) {
            console.warn('Explosion sound failed:', e);
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
                playBoostSound
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