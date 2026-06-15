"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, Zap, Globe, Briefcase, Send } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface OnboardingTerminalProps {
    onComplete: (mode: "immersive" | "classic" | "technical" | "uplink" | "projects") => void;
}

export function OnboardingTerminal({ onComplete }: OnboardingTerminalProps) {
    const { t, setLanguage, language } = useLanguage();
    const [step, setStep] = useState(0);
    const [text, setText] = useState("");

    const AVAILABLE_LANGUAGES = [
        { code: "it", name: "ITA" },
        { code: "en", name: "ENG" }
    ];

    const fullText = t.onboarding.loadingText;

    useEffect(() => {
        setText("");
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) {
                clearInterval(interval);
                setStep(1);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [fullText]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as "it" | "en";
        setLanguage(newLang);
        setStep(0);
    };

    const buttonBaseStyle = "relative p-8 md:p-10 min-h-[320px] border transition-all duration-400 rounded-2xl text-left shadow-xl overflow-hidden h-full flex flex-col";

    return (
        <div className="fixed inset-0 z-[100] bg-[#020410] flex flex-col items-center justify-between text-white p-4 font-sans h-[100dvh] w-full overflow-y-auto">

            {/* LANGUAGE SELECTOR */}
            <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                        onChange={handleLanguageChange}
                        value={language}
                        className="bg-gray-800 appearance-none text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors cursor-pointer"
                    >
                        {AVAILABLE_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl space-y-8 md:space-y-16 py-12 md:py-8">
                {/* STATUS TEXT */}
                <div className="min-h-[100px] flex flex-col items-center justify-center relative w-full">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full opacity-20 animate-pulse" />
                    <div className="relative z-10 text-xl md:text-3xl text-center font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                        {text}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="ml-2 text-cyan-400 inline-block"
                        >
                            ✦
                        </motion.span>
                    </div>

                    {/* IDENTITY SUBTITLE */}
                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10 mt-4 text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-500/60 text-center max-w-[80%]"
                        >
                            {(t as any).onboarding.creator}
                        </motion.div>
                    )}
                </div>

                {/* MODES GRID */}
                <AnimatePresence>
                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full"
                        >
                            {/* 1. PROJECTS */}
                            <button
                                onClick={() => onComplete("projects")}
                                className={`${buttonBaseStyle} group border-blue-500/20 hover:border-blue-400 bg-[#040816]/80 backdrop-blur-md shadow-blue-900/5 hover:shadow-blue-500/10`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    {/* Minimalist Tech/Circuit SVG instead of PNG */}
                                    <svg className="absolute inset-0 w-full h-full text-blue-500/10 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M 0 60 H 160 L 210 110 H 400" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                                        <path d="M 120 0 V 130 L 160 170 H 280 L 310 200 V 300" stroke="currentColor" strokeWidth="1" />
                                        <path d="M 0 240 H 120 L 170 190 V 90 L 200 60 H 400" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="160" cy="60" r="3" className="fill-blue-400 animate-pulse" />
                                        <circle cx="210" cy="110" r="3" className="fill-blue-400" />
                                        <circle cx="160" cy="170" r="3" className="fill-blue-400 animate-ping [animation-duration:3s]" />
                                        <circle cx="280" cy="170" r="3" className="fill-blue-400" />
                                        <circle cx="170" cy="190" r="3" className="fill-blue-400" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-900/50 text-blue-400 group-hover:border-blue-400 transition-colors">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-blue-300 bg-blue-950/50 px-3 py-1 rounded-full border border-blue-800/30 group-hover:border-blue-500/50 transition-colors">
                                            {(t as any).onboarding.projects.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">{(t as any).onboarding.projects.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.projects.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 2. TECHNICAL */}
                            <button
                                onClick={() => onComplete("technical")}
                                className={`${buttonBaseStyle} group border-violet-500/20 hover:border-violet-400 bg-[#040816]/80 backdrop-blur-md shadow-violet-900/5 hover:shadow-violet-500/10`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    {/* Minimalist Isometric Blueprint Grid SVG instead of PNG */}
                                    <svg className="absolute inset-0 w-full h-full text-violet-500/10 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="grid-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                                                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M-50 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <path d="M50 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <path d="M150 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <path d="M250 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <path d="M350 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <path d="M450 300 L200 80" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <line x1="0" y1="280" x2="400" y2="280" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <line x1="0" y1="245" x2="400" y2="245" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <line x1="0" y1="200" x2="400" y2="200" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <line x1="0" y1="150" x2="400" y2="150" stroke="url(#grid-fade)" strokeWidth="1" />
                                        <line x1="0" y1="95" x2="400" y2="95" stroke="url(#grid-fade)" strokeWidth="1" />
                                        {/* Code lines representation */}
                                        <rect x="250" y="20" width="80" height="4" rx="2" fill="currentColor" opacity="0.3" className="animate-pulse" />
                                        <rect x="250" y="30" width="50" height="4" rx="2" fill="currentColor" opacity="0.2" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-violet-950/40 rounded-lg border border-violet-900/50 text-violet-400 group-hover:border-violet-400 transition-colors">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-violet-300 bg-violet-950/50 px-3 py-1 rounded-full border border-violet-800/30 group-hover:border-violet-500/50 transition-colors">
                                            {(t as any).onboarding.technical.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">{(t as any).onboarding.technical.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.technical.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 3. IMMERSIVE */}
                            <button
                                onClick={() => onComplete("immersive")}
                                className={`${buttonBaseStyle} group border-cyan-500/20 hover:border-cyan-400 bg-[#040816]/80 backdrop-blur-md shadow-cyan-900/5 hover:shadow-cyan-500/10`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    {/* Minimalist Astral Orbits / Radar SVG instead of PNG */}
                                    <svg className="absolute inset-0 w-full h-full text-cyan-500/10 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="200" cy="150" r="110" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" className="animate-[spin_60s_linear_infinite]" />
                                        <circle cx="200" cy="150" r="85" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="200" cy="150" r="55" stroke="currentColor" strokeWidth="0.75" strokeDasharray="10 5" className="animate-[spin_30s_linear_infinite_reverse]" />
                                        <circle cx="200" cy="150" r="25" stroke="currentColor" strokeWidth="1" />
                                        <line x1="200" y1="10" x2="200" y2="290" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                                        <line x1="10" y1="150" x2="390" y2="150" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                                        <circle cx="115" cy="150" r="4" className="fill-cyan-400 animate-ping [animation-duration:4s]" />
                                        <circle cx="115" cy="150" r="2.5" className="fill-cyan-400" />
                                        <circle cx="255" cy="150" r="2" className="fill-violet-400" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="flex gap-2">
                                            <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-900/50 text-cyan-400 group-hover:text-cyan-300 group-hover:border-cyan-400 transition-colors">
                                                <Telescope className="w-6 h-6" />
                                            </div>
                                            <div className="p-3 bg-violet-950/40 rounded-lg border border-violet-900/50 text-violet-400 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-violet-300">START</span>
                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-800/30 group-hover:border-cyan-500/50 group-hover:text-cyan-200 transition-colors">
                                            {t.onboarding.immersive.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">{t.onboarding.immersive.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{t.onboarding.immersive.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 4. UPLINK */}
                            <button
                                onClick={() => onComplete("uplink")}
                                className={`${buttonBaseStyle} group border-green-500/20 hover:border-green-400 bg-[#040816]/80 backdrop-blur-md shadow-green-900/5 hover:shadow-green-500/10`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    {/* Minimalist Transmitter / Waves SVG instead of PNG */}
                                    <svg className="absolute inset-0 w-full h-full text-green-500/10 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M 50 250 Q 100 130, 150 250 T 250 250 T 350 250" stroke="currentColor" strokeWidth="1" />
                                        <path d="M 50 250 Q 100 80, 150 250 T 250 250 T 350 250" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.5" />
                                        <path d="M 170 210 A 30 30 0 0 1 230 210" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
                                        <path d="M 150 190 A 60 60 0 0 1 250 190" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M 130 170 A 90 90 0 0 1 270 170" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                                        <path d="M 110 150 A 120 120 0 0 1 290 150" stroke="currentColor" strokeWidth="0.5" />
                                        <circle cx="200" cy="220" r="3.5" className="fill-green-400 animate-pulse" />
                                        <circle cx="200" cy="130" r="1.5" className="fill-green-400/70" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-[#020410]/40 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-green-950/40 rounded-lg border border-green-900/50 text-green-400 group-hover:border-green-400 transition-colors">
                                            <Send className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-green-300 bg-green-950/50 px-3 py-1 rounded-full border border-green-800/30 group-hover:border-green-500/50 transition-colors">
                                            {(t as any).onboarding.uplink.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-200 transition-colors">{(t as any).onboarding.uplink.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.uplink.description}</p>
                                    </div>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FOOTER */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="flex flex-col items-center justify-center mt-auto"
                >
                    <a
                        href="https://github.com/francimolli/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center space-y-3 transition-opacity duration-300 hover:opacity-80"
                    >
                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 opacity-60">{(t as any).onboarding.footer}</span>
                            <span className="text-[9px] font-mono text-gray-500 tracking-widest">GITHUB.COM/FRANCIMOLLI/</span>
                        </div>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}