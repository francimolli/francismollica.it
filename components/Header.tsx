"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { RotateCcw, Settings2, SlidersHorizontal, RefreshCw, Rocket, Zap, Menu as MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCityControls } from "@/components/CityControlsContext";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { translations } from "@/lib/translations";

// --- PROFESSIONAL SLIDER COMPONENT (Bigger & Better) ---
const ControlSlider = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    unit = "",
    displayValue,
    width = "w-32" // Default width increased
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    unit?: string,
    displayValue?: string,
    width?: string
}) => (
    <div className={`group flex flex-col gap-2 relative ${width}`}>
        {/* Label Row */}
        <div className="flex justify-between items-end text-[11px] font-mono tracking-widest uppercase font-semibold">
            <span className="text-cyan-600/90 group-hover:text-cyan-400 transition-colors">{label}</span>
            <span className="text-cyan-50 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{displayValue || value}{unit}</span>
        </div>

        {/* Slider Input */}
        <div className="relative h-4 flex items-center">
            {/* Track */}
            <div className="absolute w-full h-[4px] bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div
                    className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                    style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                />
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full absolute z-10 opacity-0 cursor-pointer h-full"
            />

            {/* Thumb Visual */}
            <div
                className="pointer-events-none absolute h-4 w-4 bg-cyan-950 border-2 border-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] group-hover:scale-125 transition-transform duration-200"
                style={{
                    left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`
                }}
            />
        </div>
    </div>
);

// --- SEPARATOR ---
const VerticalDivider = () => (
    <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-4" />
);

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useLanguage();
    const t = translations[language];

    const {
        time, setTime,
        trafficLevel, setTrafficLevel,
        zoom, setZoom,
        resetDefaults,
        manualSetTime,
        timeSpeed, setTimeSpeed,
        resetView,
        coordinates, regenerateSimulation,
        triggerEscape, invertYAxis, setInvertYAxis
    } = useCityControls();

    const { setExpandedSection } = useFloatingSection();

    // Escape Coordinates
    const escapeCoordinates = [
        { x: 850, y: 480, z: 850, name: "Nebula Cluster" },
        { x: -900, y: 600, z: 550, name: "Stellar Gateway" },
        { x: 580, y: 750, z: -880, name: "Cosmic Cathedral" },
    ];

    // Online Status
    const [isOnline, setIsOnline] = useState(false);
    useEffect(() => {
        const checkOnlineStatus = () => {
            const now = new Date();
            const romeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
            const hour = romeTime.getHours();
            setIsOnline(hour >= 8 && hour < 24);
        };
        checkOnlineStatus();
    }, []);

    // Cooldowns
    const [cooldown, setCooldown] = useState(0);
    const [escapeCooldown, setEscapeCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) { const timer = setInterval(() => setCooldown(c => c - 1), 1000); return () => clearInterval(timer); }
    }, [cooldown]);

    useEffect(() => {
        if (escapeCooldown > 0) { const timer = setInterval(() => setEscapeCooldown(c => c - 1), 1000); return () => clearInterval(timer); }
    }, [escapeCooldown]);

    const handleRegenerate = () => {
        if (cooldown > 0) return;
        const randomTime = Math.random() * 24;
        const randomSpeed = (Math.random() * 10) - 5;
        const randomTraffic = Math.floor(Math.random() * 100);
        manualSetTime(randomTime);
        setTimeSpeed(randomSpeed);
        setTrafficLevel(randomTraffic);
        regenerateSimulation();
        setCooldown(145);
        setIsOpen(false);
    };

    const handleEscape = () => {
        if (escapeCooldown > 0) return;
        const randomCoord = escapeCoordinates[Math.floor(Math.random() * escapeCoordinates.length)];
        triggerEscape({ x: randomCoord.x, y: randomCoord.y, z: randomCoord.z });
        setEscapeCooldown(55);
    };

    const formatTime = (val: number) => {
        const hours = Math.floor(val);
        const minutes = Math.floor((val - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">

            {/* --- VISUAL FOUNDATION (Increased Height) --- */}
            <div className="absolute inset-0 h-24 bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl z-0">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent opacity-60" />
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="relative z-10 w-full h-24 max-w-[1920px] mx-auto px-6 pointer-events-auto flex items-center justify-between">

                {/* 1. LEFT: IDENTITY (Fixed Width Desktop) */}
                <div className="flex items-center gap-6 lg:w-[400px] shrink-0">
                    <Link
                        href="/"
                        className="flex items-center gap-4 group"
                        onClick={(e) => { e.preventDefault(); resetView(); setExpandedSection('contact'); }}
                    >
                        {/* Logo Mark - Bigger
                        <div className="relative w-12 h-12 flex items-center justify-center bg-cyan-950/30 border border-cyan-500/40 rounded-md group-hover:bg-cyan-900/30 group-hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                            <span className="font-mono font-bold text-2xl text-cyan-50 pb-1">^</span>
                        </div> */}

                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-base text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                                francesco@mollica.dev
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse' : 'bg-gray-600'}`} />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                                    {isOnline ? "Available" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 2. CENTER: COMMAND CONSOLE (Desktop Only - Bigger) */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center px-8 py-3 bg-black/60 border border-white/10 rounded-full backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]">

                        {/* Sliders */}
                        <div className="flex items-center gap-6">
                            <ControlSlider label="Local Time" value={time} displayValue={formatTime(time)} min={0} max={24} step={0.25} onChange={manualSetTime} unit="" width="w-36" />
                            <VerticalDivider />
                            <ControlSlider label="Time Warp" value={timeSpeed} min={-5} max={5} step={0.25} onChange={setTimeSpeed} unit="x" width="w-24" />
                            <VerticalDivider />
                            <ControlSlider label="Density" value={trafficLevel} min={0} max={100} step={1} onChange={setTrafficLevel} unit="%" width="w-24" />
                        </div>

                        {/* Integrated Reset */}
                        <div className="pl-6 ml-4 border-l border-white/10">
                            <button
                                onClick={resetDefaults}
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-950/30 transition-all duration-300"
                                title="System Reset"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT: TOOLS (Desktop & Mobile) */}
                <div className="flex items-center justify-end gap-3 lg:gap-4 lg:w-[400px] shrink-0">

                    {/* Telemetry (Desktop Only) */}
                    <div className="hidden xl:flex flex-col items-end text-[10px] font-mono text-cyan-600/70 leading-tight tracking-widest mr-4">
                        <span>LAT {coordinates.lat.toFixed(4)}</span>
                        <span>LON {coordinates.long.toFixed(4)}</span>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex items-center gap-3 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={() => setLanguage(language === "en" ? "it" : "en")}
                            className="h-9 px-4 rounded-full text-xs font-bold font-mono text-cyan-100 hover:bg-white/10 hover:text-cyan-400 transition-all border border-transparent hover:border-white/5"
                        >
                            {language.toUpperCase()}
                        </button>

                        <div className="w-px h-5 bg-white/10" />

                        <button
                            onClick={handleRegenerate}
                            disabled={cooldown > 0}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border border-transparent ${cooldown > 0 ? 'text-red-400 cursor-not-allowed opacity-50' : 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30'}`}
                            title="Regenerate"
                        >
                            <RefreshCw size={16} className={cooldown > 0 ? "" : "hover:rotate-180 transition-transform duration-500"} />
                        </button>

                        <button
                            onClick={handleEscape}
                            disabled={escapeCooldown > 0}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border border-transparent ${escapeCooldown > 0 ? 'text-yellow-400 cursor-not-allowed opacity-50' : 'text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}
                            title="Escape Velocity"
                        >
                            {escapeCooldown > 0 ? <span className="text-[9px] font-mono">{escapeCooldown}</span> : <Rocket size={16} className="-rotate-45" />}
                        </button>
                    </div>

                    {/* --- MOBILE ICONS (ALWAYS VISIBLE ON MOBILE) --- */}
                    <div className="flex md:hidden items-center gap-3">

                        {/* 1. Razzo Mobile - Visibile */}
                        <button
                            onClick={handleEscape}
                            disabled={escapeCooldown > 0}
                            className={`w-10 h-10 flex items-center justify-center rounded-full border bg-black/40 backdrop-blur-md transition-all 
                            ${escapeCooldown > 0
                                    ? 'border-yellow-900/50 text-yellow-500 opacity-50'
                                    : 'border-purple-500/30 text-purple-400 hover:bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                }`}
                        >
                            {escapeCooldown > 0 ? (
                                <span className="text-[10px] font-bold font-mono">{escapeCooldown}</span>
                            ) : (
                                <Rocket size={18} className="-rotate-45" />
                            )}
                        </button>

                        {/* 2. Menu Mobile Trigger - Visibile */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="w-10 h-10 rounded-full bg-black/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-200 hover:border-cyan-400 backdrop-blur-md">
                                    <MenuIcon className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>

                            {/* Mobile Sheet Content */}
                            <SheetContent side="right" className="w-[85%] border-l border-cyan-900/50 bg-black/95 backdrop-blur-xl p-0 z-[60]">
                                <div className="flex flex-col h-full bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_50%)]">
                                    <SheetHeader className="p-6 border-b border-white/10 bg-white/5">
                                        <SheetTitle className="flex items-center gap-3 text-cyan-400 font-mono uppercase tracking-widest text-sm">
                                            <Settings2 className="w-4 h-4" />
                                            {t.header.controls.systemControls || "System Controls"}
                                        </SheetTitle>
                                    </SheetHeader>

                                    <div className="p-8 space-y-10 flex-1 overflow-y-auto">
                                        <div className="space-y-8">
                                            <ControlSlider label={t.header.controls.timeSpeed} value={timeSpeed} min={-5} max={5} step={0.25} onChange={setTimeSpeed} unit="x" width="w-full" />
                                            <ControlSlider label={t.header.controls.trafficDensity} value={trafficLevel} min={0} max={100} step={1} onChange={setTrafficLevel} unit="%" width="w-full" />
                                            <ControlSlider label={t.header.controls.timeOfDay || "Time of Day"} value={time} displayValue={formatTime(time)} min={0} max={24} step={0.25} onChange={manualSetTime} unit="" width="w-full" />

                                            {/* Invert Y Toggle */}
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 font-bold">Invert Look Y</span>
                                                <button
                                                    onClick={() => setInvertYAxis(!invertYAxis)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${invertYAxis ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/10 border border-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${invertYAxis ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <Button variant="outline" onClick={resetDefaults} className="h-12 border-white/20 text-cyan-400/70 hover:text-cyan-400 hover:border-cyan-400 hover:bg-white/5 uppercase text-xs tracking-widest font-mono">
                                                <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                            </Button>
                                            <Button variant="outline" onClick={() => { handleRegenerate(); setIsOpen(false); }} disabled={cooldown > 0} className="h-12 border-cyan-500/30 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-900/40 hover:border-cyan-400 uppercase text-xs tracking-widest font-mono">
                                                <Zap className="mr-2 h-4 w-4" /> {cooldown > 0 ? `${cooldown}s` : "Reload"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-white/10 bg-white/5">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => { setLanguage("en"); setIsOpen(false); }} className={`py-3 rounded border text-xs font-mono font-bold transition-all ${language === "en" ? "bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "bg-black/50 border-white/10 text-white/40"}`}>
                                                ENGLISH
                                            </button>
                                            <button onClick={() => { setLanguage("it"); setIsOpen(false); }} className={`py-3 rounded border text-xs font-mono font-bold transition-all ${language === "it" ? "bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "bg-black/50 border-white/10 text-white/40"}`}>
                                                ITALIANO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                </div>
            </div>
        </header>
    );
}