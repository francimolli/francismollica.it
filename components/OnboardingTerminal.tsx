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
                            className="relative z-10 mt-4 text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-500/60 uppercase text-center max-w-[80%]"
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
                            {/* 1. IMMERSIVE */}
                            <button
                                onClick={() => onComplete("immersive")}
                                className={`${buttonBaseStyle} group border-cyan-700/50 hover:border-cyan-400 bg-black shadow-cyan-900/10 hover:shadow-cyan-400/20`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img src="/images/banner.png" alt="" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-cyan-900/40 rounded-lg border border-cyan-800 text-cyan-400">
                                            <Telescope className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-700/50">
                                            {t.onboarding.immersive.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3">{t.onboarding.immersive.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{t.onboarding.immersive.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 2. TECHNICAL */}
                            <button
                                onClick={() => onComplete("technical")}
                                className={`${buttonBaseStyle} group border-purple-700/50 hover:border-purple-400 bg-black shadow-purple-900/10 hover:shadow-purple-400/20`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img src="/images/onboarding/technical.png" alt="" className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-purple-900/40 rounded-lg border border-purple-800 text-purple-400">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-purple-300 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-700/50">
                                            {(t as any).onboarding.technical.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3">{(t as any).onboarding.technical.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.technical.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 3. UPLINK */}
                            <button
                                onClick={() => onComplete("uplink")}
                                className={`${buttonBaseStyle} group border-green-700/50 hover:border-green-400 bg-black shadow-green-900/10 hover:shadow-green-400/20`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img src="/images/onboarding/uplink.png" alt="" className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-green-900/40 rounded-lg border border-green-800 text-green-400">
                                            <Send className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-green-300 bg-green-950/50 px-3 py-1 rounded-full border border-green-700/50">
                                            {(t as any).onboarding.uplink.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3">{(t as any).onboarding.uplink.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.uplink.description}</p>
                                    </div>
                                </div>
                            </button>

                            {/* 4. PROJECTS */}
                            <button
                                onClick={() => onComplete("projects")}
                                className={`${buttonBaseStyle} group border-blue-700/50 hover:border-blue-400 bg-black shadow-blue-900/10 hover:shadow-blue-400/20`}
                            >
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img src="/images/onboarding/projects.png" alt="" className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="p-3 bg-blue-900/40 rounded-lg border border-blue-800 text-blue-400">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-blue-300 bg-blue-950/50 px-3 py-1 rounded-full border border-blue-700/50">
                                            {(t as any).onboarding.projects.tag}
                                        </span>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold text-white mb-3">{(t as any).onboarding.projects.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">{(t as any).onboarding.projects.description}</p>
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