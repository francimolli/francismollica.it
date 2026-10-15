"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { RotateCcw, Settings2, Zap, Menu as MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCityControls } from "@/components/CityControlsContext";
import { translations } from "@/lib/translations";
import React from "react";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, setOnboardingComplete } = useLanguage();
    const t = translations[language];

    const {
        resetDefaults,
        resetView,
        coordinates,
        invertYAxis, setInvertYAxis,
        invertXAxis, setInvertXAxis,
        soundEnabled, setSoundEnabled,
        activateBoost, boostActive, boostCooldown
    } = useCityControls();

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

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">

            {/* --- VISUAL FOUNDATION (Increased Height) --- */}
            <div className="absolute inset-0 h-24 bg-u-deep/85 backdrop-blur-xl border-b border-u-lilac/15 shadow-2xl z-0">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-u-lilac/60 to-transparent opacity-60" />
            </div>

            {/* --- CONTENT CONTAINER --- */}
            <div className="relative z-10 w-full h-24 max-w-[1920px] mx-auto px-6 pointer-events-auto flex items-center justify-between">

                {/* 1. LEFT: IDENTITY (Fixed Width Desktop) */}
                <div
                    className="flex items-center gap-4 group lg:w-[400px] shrink-0 cursor-pointer pointer-events-auto"
                    onClick={() => {
                        resetView();
                        setTimeout(() => setOnboardingComplete(false), 500);
                    }}
                >
                    {/* logo coi suoi colori veri (niente filtri) e ben visibile */}
                    <div className="shrink-0 w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] relative drop-shadow-[0_0_10px_rgba(17,184,213,0.35)]">
                        <Image src="/unnamed.png" alt="Francis Mollica" fill className="object-contain" priority />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-heading font-extrabold text-base text-u-lime tracking-tight group-hover:text-u-sun transition-colors drop-shadow-[0_0_8px_rgba(189,210,65,0.35)]">
                            Francesco Mollica
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-u-lime shadow-[0_0_8px_rgba(189,210,65,0.9)] animate-pulse' : 'bg-gray-600'}`} />
                            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-u-lime/80">
                                {isOnline ? t.header.status.awake : t.header.status.asleep}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT: TOOLS (Desktop & Mobile) */}
                <div className="flex items-center justify-end gap-3 lg:gap-4 lg:w-[400px] shrink-0">

                    {/* Telemetry (Desktop Only) */}
                    <div className="hidden xl:flex flex-col items-end text-[10px] font-mono text-u-lime/70 leading-tight tracking-widest mr-4">
                        <span>LAT {coordinates.lat.toFixed(4)}</span>
                        <span>LON {coordinates.long.toFixed(4)}</span>
                    </div>

                    {/* Desktop Toolbar */}
                    <div className="hidden md:flex items-center gap-3 bg-u-surface/60 p-1.5 rounded-full border border-u-lilac/20 backdrop-blur-sm">
                        <button
                            onClick={() => setLanguage(language === "en" ? "it" : "en")}
                            className="clay-press h-9 px-4 rounded-full text-xs font-extrabold font-heading text-u-cream hover:bg-white/10 hover:text-u-sun transition-all border border-transparent hover:border-white/5"
                        >
                            {language.toUpperCase()}
                        </button>

                        <div className="w-px h-5 bg-white/10" />

                        {/* RESET */}
                        <button
                            onClick={resetDefaults}
                            className="clay-press flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-u-sun hover:border-u-sun/50 hover:bg-u-surface2/60 transition-all duration-300"
                            title="Reset"
                        >
                            <RotateCcw size={16} />
                        </button>

                        {/* BOOST BUTTON (Green Lightning) */}
                        <button
                            onClick={() => { activateBoost(); }}
                            disabled={boostCooldown > 0 || boostActive}
                            className={`
                                relative group p-2 rounded-full transition-all duration-300
                                ${boostActive ? 'bg-u-mint text-u-night shadow-[0_0_15px_rgba(159,232,199,0.8)] animate-pulse scale-110' :
                                    boostCooldown > 0 ? 'bg-u-surface text-u-lilac/40 cursor-not-allowed' :
                                        'bg-u-mint/15 text-u-mint hover:bg-u-mint/30 hover:scale-110 hover:shadow-[0_0_10px_rgba(159,232,199,0.4)]'}
                            `}
                            title={boostActive ? "HYPER BOOST ACTIVE" : boostCooldown > 0 ? `RECHARGING ${Math.ceil(boostCooldown)}s` : "ACTIVATE HYPER BOOST"}
                        >
                            <Zap size={20} className={boostActive ? "fill-current" : ""} />

                            {/* Cooldown Number Overlay */}
                            {boostCooldown > 0 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono text-white">
                                    {Math.ceil(boostCooldown)}
                                </span>
                            )}
                        </button>

                        {/* SOUND TOGGLE */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`
                                w-9 h-9 flex items-center justify-center rounded-full transition-all border
                                ${soundEnabled
                                    ? 'bg-u-sky/20 text-u-sky border-u-sky/30 shadow-[0_0_10px_rgba(154,209,245,0.3)]'
                                    : 'bg-white/5 text-u-lilac/50 border-white/10 hover:bg-white/10 hover:text-u-sky hover:border-u-sky/20'}
                            `}
                            title={soundEnabled ? "Sound ON" : "Sound OFF"}
                        >
                            {soundEnabled ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <line x1="23" y1="9" x2="17" y2="15"></line>
                                    <line x1="17" y1="9" x2="23" y2="15"></line>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* --- MOBILE ICONS (ALWAYS VISIBLE ON MOBILE) --- */}
                    <div className="flex md:hidden items-center gap-3">

                        {/* MOBILE BOOST (Left of Rocket) */}
                        <button
                            onClick={() => { activateBoost(); }}
                            disabled={boostCooldown > 0 || boostActive}
                            className={`
                                relative p-3 rounded-full transition-all duration-300
                                ${boostActive ? 'bg-u-mint text-u-night shadow-[0_0_15px_rgba(159,232,199,0.8)] animate-pulse' :
                                    boostCooldown > 0 ? 'bg-u-surface text-u-lilac/40' :
                                        'bg-u-mint/15 text-u-mint border-2 border-u-mint/30'}
                            `}
                        >
                            <Zap size={20} className={boostActive ? "fill-current" : ""} />
                            {boostCooldown > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-white border border-black">
                                    {Math.ceil(boostCooldown)}
                                </span>
                            )}
                        </button>

                        {/* Menu Mobile Trigger - Visibile */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="w-10 h-10 rounded-full bg-u-surface/60 border-2 border-u-sun/30 text-u-sun hover:bg-u-surface2/60 hover:text-u-sun hover:border-u-sun backdrop-blur-md">
                                    <MenuIcon className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>

                            {/* Mobile Sheet Content */}
                            <SheetContent side="right" className="w-[85%] border-l border-u-lilac/25 bg-u-deep/95 backdrop-blur-xl p-0 z-[60]">
                                <div className="flex flex-col h-full bg-[radial-gradient(circle_at_top_right,rgba(201,182,245,0.1),transparent_50%)]">
                                    <SheetHeader className="p-6 border-b border-white/10 bg-white/5">
                                        <SheetTitle className="flex items-center gap-3 text-u-lilac font-heading font-extrabold uppercase tracking-widest text-sm">
                                            <Settings2 className="w-4 h-4" />
                                            {t.header.controls.systemControls || "System Controls"}
                                        </SheetTitle>
                                    </SheetHeader>

                                    <div className="p-8 space-y-10 flex-1 overflow-y-auto">
                                        <div className="space-y-8">
                                            {/* Invert Y Toggle */}
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-heading uppercase tracking-widest text-u-lilac/80 font-extrabold">{t.header.controls.invertY || "Invert Look Y"}</span>
                                                <button
                                                    onClick={() => setInvertYAxis(!invertYAxis)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${invertYAxis ? "bg-u-lilac shadow-[0_0_10px_rgba(201,182,245,0.5)]" : "bg-white/10 border border-white/10"}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${invertYAxis ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* Sound Toggle */}
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-heading uppercase tracking-widest text-u-lilac/80 font-extrabold">{t.header.controls.sound || "Sound"}</span>
                                                <button
                                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${soundEnabled ? "bg-u-lilac shadow-[0_0_10px_rgba(201,182,245,0.5)]" : "bg-white/10 border border-white/10"}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {/* Invert X Axis Toggle (Mobile Arrows) */}
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-[10px] font-heading uppercase tracking-widest text-u-lilac/80 font-extrabold">{t.header.controls.invertX || "Invert Look X"}</span>
                                                <button
                                                    onClick={() => setInvertXAxis(!invertXAxis)}
                                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${invertXAxis ? "bg-u-lilac shadow-[0_0_10px_rgba(201,182,245,0.5)]" : "bg-white/10 border border-white/10"}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${invertXAxis ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 pt-4">
                                            <Button variant="outline" onClick={resetDefaults} className="h-12 rounded-xl border-u-lilac/30 text-u-lilac/80 hover:text-u-lilac hover:border-u-lilac hover:bg-white/5 uppercase text-xs tracking-widest font-heading font-bold">
                                                <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-white/10 bg-white/5">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => { setLanguage("en"); setIsOpen(false); }} className={`py-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all ${language === "en" ? "bg-u-surface2/70 border-u-sun text-u-sun shadow-[0_0_10px_rgba(255,217,138,0.3)]" : "bg-u-surface/50 border-white/10 text-white/40"}`}>
                                                ENGLISH
                                            </button>
                                            <button onClick={() => { setLanguage("it"); setIsOpen(false); }} className={`py-3 rounded-xl border-2 text-xs font-heading font-extrabold transition-all ${language === "it" ? "bg-u-surface2/70 border-u-sun text-u-sun shadow-[0_0_10px_rgba(255,217,138,0.3)]" : "bg-u-surface/50 border-white/10 text-white/40"}`}>
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
