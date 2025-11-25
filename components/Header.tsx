"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, RotateCcw, Settings2, SlidersHorizontal, Globe, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCityControls } from "@/components/CityControlsContext";
import { useFloatingSection } from "@/components/FloatingSectionContext";

// --- PROFESSIONAL SLIDER COMPONENT ---
const ControlSlider = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    unit = "",
    displayValue
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    unit?: string,
    displayValue?: string
}) => (
    <div className="group flex flex-col gap-1.5 w-full max-w-[140px] relative">
        {/* Label Row */}
        <div className="flex justify-between items-end text-[10px] font-mono tracking-widest uppercase">
            <span className="text-cyan-600 group-hover:text-cyan-400 transition-colors">{label}</span>
            <span className="text-cyan-100">{displayValue || value}{unit}</span>
        </div>

        {/* Slider Input */}
        <div className="relative h-4 flex items-center">
            {/* Custom Track Background */}
            <div className="absolute w-full h-[2px] bg-cyan-900/40 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-500/50"
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

            {/* Custom Thumb Visual (Calculated position) */}
            <div
                className="pointer-events-none absolute h-3 w-3 bg-black border border-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:scale-110 transition-transform"
                style={{
                    left: `calc(${((value - min) / (max - min)) * 100}% - 6px)`
                }}
            />
        </div>
    </div>
);

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useLanguage();

    const {
        time, setTime,
        trafficLevel, setTrafficLevel,
        zoom, setZoom,
        resetDefaults,
        manualSetTime,
        timeSpeed, setTimeSpeed,
        resetView
    } = useCityControls();

    const { setExpandedSection } = useFloatingSection();

    // Check if currently online (8:00-24:00 Rome time)
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkOnlineStatus = () => {
            const now = new Date();
            const romeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
            const hour = romeTime.getHours();
            setIsOnline(hour >= 8 && hour < 24);
        };

        checkOnlineStatus();
        const interval = setInterval(checkOnlineStatus, 600000); // Check every 10 minute

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* Glassmorphism Background with bottom border */}
            <div className="absolute inset-0 h-20 bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-md border-b border-white/5 shadow-2xl z-0" />

            <div className="container relative z-10 grid grid-cols-[auto_1fr_auto] h-20 items-center px-6 md:px-8 pointer-events-auto">

                {/* 1. SINISTRA: Identity Module */}
                <div className="flex items-center gap-4 justify-self-start">
                    <Link
                        href="/"
                        className="flex items-center gap-3 group"
                        onClick={(e) => {
                            e.preventDefault();
                            resetView();
                            setExpandedSection('home');
                        }}
                    >
                        <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-950/30 border border-cyan-500/20 rounded-sm group-hover:border-cyan-400/50 transition-colors overflow-hidden">
                            {/* Animated Corner Accents */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-500 opacity-50" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-500 opacity-50" />

                            <span className="font-mono font-bold text-lg text-white tracking-tighter">☊</span>
                        </div>
                    </Link>

                    <div className="hidden sm:flex flex-col">
                        <span className="font-sans text-sm font-bold text-white tracking-wide hover:text-cyan-400 transition-colors">
                            <a href="mailto:francesco.mollica@outlook.com" className="underline">francesco@mollica.dev</a>
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: isOnline ? 'rgb(8 145 178)' : 'rgb(107 114 128)' }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'bg-gray-500'}`} />
                            {isOnline ? 'Awake' : 'Asleep'}
                        </span>
                    </div>
                </div>

                {/* 2. CENTRO: Control Deck (Desktop Only) */}
                <div className="hidden lg:flex justify-self-center items-center">
                    <div className="flex items-center gap-6 px-8 py-3 bg-black/40 border border-white/10 rounded-full backdrop-blur-md shadow-inner relative overflow-hidden">
                        {/* Subtle scanline effect inside the control deck */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] pointer-events-none" />

                        <div className="flex items-center gap-8 relative z-10">
                            <ControlSlider label="Time" value={time} displayValue={time.toFixed(0)} min={0} max={24} step={0.5} onChange={manualSetTime} unit="h" />

                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                            <ControlSlider label="Speed" value={timeSpeed} min={-5} max={5} step={0.25} onChange={setTimeSpeed} unit="x" />

                            {/* Vertical Separator */}
                            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                            <ControlSlider label="Traffic" value={trafficLevel} min={0} max={100} step={1} onChange={setTrafficLevel} unit="%" />
                        </div>

                        <button
                            onClick={resetDefaults}
                            className="ml-4 p-2 rounded-full border border-white/5 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 text-white/40 transition-all duration-300 group"
                            title="System Reset"
                        >
                            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* 3. DESTRA: Settings & Mobile Trigger */}
                <div className="flex items-center gap-4 justify-self-end">

                    {/* Desktop Language Switch */}
                    <div className="hidden md:flex items-center bg-black/40 rounded-full border border-white/10 p-1">
                        <button
                            onClick={() => setLanguage("en")}
                            data-text="EN"
                            className={`glitch-hover px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all duration-300 ${language === "en" ? "bg-cyan-900/50 text-cyan-400 shadow-[0_0_10px_rgba(8,145,178,0.2)]" : "text-white/40 hover:text-white"
                                }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage("it")}
                            data-text="IT"
                            className={`glitch-hover px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all duration-300 ${language === "it" ? "bg-cyan-900/50 text-cyan-400 shadow-[0_0_10px_rgba(8,145,178,0.2)]" : "text-white/40 hover:text-white"
                                }`}
                        >
                            IT
                        </button>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="outline" size="icon" className="bg-black/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 hover:border-cyan-400">
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[85%] sm:w-[400px] border-l border-cyan-900/50 bg-black/95 backdrop-blur-xl p-0 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                            <div className="flex flex-col h-full bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_40%)]">

                                {/* Mobile Header */}
                                <SheetHeader className="p-6 border-b border-white/10">
                                    <SheetTitle className="flex items-center gap-2 text-cyan-400 font-mono uppercase tracking-widest text-sm">
                                        <Settings2 className="w-4 h-4" />
                                        System Configuration
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Mobile Controls */}
                                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-white/50 text-xs font-mono uppercase border-b border-white/5 pb-2 mb-4">
                                            <span>Environment Variables</span>
                                        </div>

                                        {/* Mobile Sliders need full width */}
                                        <div className="space-y-6 [&_div]:max-w-full">
                                            <ControlSlider label="Time Speed" value={timeSpeed} min={-5} max={5} step={0.25} onChange={setTimeSpeed} unit="x" />
                                            <ControlSlider label="Traffic Density" value={trafficLevel} min={0} max={100} step={1} onChange={setTrafficLevel} unit="%" />
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={resetDefaults}
                                        className="w-full border-dashed border-white/20 hover:border-cyan-500 text-black/60 hover:text-cyan-400 hover:bg-cyan-950/20 font-mono text-xs uppercase tracking-widest h-10"
                                    >
                                        <RotateCcw className="mr-2 h-3 w-3" /> Restore Defaults
                                    </Button>
                                </div>

                                {/* Mobile Footer / Language */}
                                <div className="p-6 border-t border-white/10 bg-white/5">
                                    <div className="flex items-center justify-between mb-2 text-xs text-white/40 font-mono uppercase">
                                        <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Localization</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { setLanguage("en"); setIsOpen(false); }}
                                            className={`flex items-center justify-between px-4 py-3 rounded border text-xs font-mono transition-all ${language === "en"
                                                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400"
                                                : "bg-black border-white/10 text-white/50"
                                                }`}
                                        >
                                            ENGLISH {language === "en" && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" />}
                                        </button>
                                        <button
                                            onClick={() => { setLanguage("it"); setIsOpen(false); }}
                                            className={`flex items-center justify-between px-4 py-3 rounded border text-xs font-mono transition-all ${language === "it"
                                                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400"
                                                : "bg-black border-white/10 text-white/50"
                                                }`}
                                        >
                                            ITALIANO {language === "it" && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </header>
    );
}