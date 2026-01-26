"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, Zap, Globe } from "lucide-react"; // Aggiunto Globe per il selettore lingua
import { useLanguage } from "@/lib/language-context";

interface OnboardingTerminalProps {
    onComplete: (mode: "immersive" | "classic") => void;
}

export function OnboardingTerminal({ onComplete }: OnboardingTerminalProps) {
    const { t, setLanguage, language } = useLanguage();
    const [step, setStep] = useState(0);
    const [text, setText] = useState("");

    const AVAILABLE_LANGUAGES = [
        { code: "it", name: "ITA" },
        { code: "en", name: "ENG" }
    ];

    // Usiamo la traduzione per il testo di caricamento
    const fullText = t.onboarding.loadingText;

    useEffect(() => {
        // Reset del testo quando la lingua cambia o all'avvio
        setText("");
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) {
                clearInterval(interval);
                setStep(1);
            }
        }, 30); // Velocità di digitazione
        return () => clearInterval(interval);
    }, [fullText]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as "it" | "en";
        setLanguage(newLang);
        setStep(0); // Riavvia il typing effect per la nuova lingua
    };

    // Stile comune per i pulsanti (minimalista e spaziale)
    const buttonBaseStyle = "relative p-6 md:p-10 border transition-all duration-400 rounded-xl text-left shadow-xl overflow-hidden";

    // Stile per l'elemento non cliccabile
    const disabledStyle = "opacity-50 cursor-not-allowed grayscale";
    const disabledButtonBaseStyle = "group relative p-6 md:p-10 border transition-all duration-400 rounded-xl text-left shadow-xl overflow-hidden";
    const classicModeActive = false; // Flag per disattivare la modalità Classic (Standard)

    return (
        <div className="fixed inset-0 z-[100] bg-[#020410] flex flex-col items-center justify-between text-white p-4 font-sans h-[100dvh] w-full overflow-y-auto">

            {/* SELETTORE LINGUA */}
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

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl space-y-8 md:space-y-16 py-12 md:py-0">
                {/* TITOLO/TESTO DI CARICAMENTO */}
                <div className="min-h-[60px] flex flex-col items-center justify-center relative w-full">
                    {/* Background Glow */}
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
                </div>

                {/* SCELTE */}
                <AnimatePresence>
                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-12 w-full"
                        >
                            {/* IMMERSIVE / CURIOUS MODE - ATTIVO */}
                            <button
                                onClick={() => {
                                    onComplete("immersive");
                                }}
                                className={`group ${buttonBaseStyle} border-cyan-700/50 hover:border-cyan-400 bg-black min-h-[320px] shadow-cyan-950/20 hover:shadow-cyan-400/20`}
                            >
                                {/* Background Image with Zoom on Hover */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img
                                        src="/images/banner.png"
                                        alt="Immersive Mode"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                                    />
                                    {/* Gradient Overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-auto">
                                        {/* Icona a tema Spaziale */}
                                        <div className="p-3 bg-cyan-900/40 rounded-lg text-cyan-400 border border-cyan-800 animate-pulse">
                                            <Telescope className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded-full border border-cyan-700/50 backdrop-blur-md">
                                            {t.onboarding.immersive.tag}
                                        </span>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors drop-shadow-lg">
                                            {t.onboarding.immersive.title}
                                        </h3>
                                        <p className="text-sm text-gray-300 leading-relaxed max-w-[90%]">
                                            {t.onboarding.immersive.description}
                                        </p>
                                        {/* <div className="mt-6 flex items-center gap-2 text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest bg-cyan-950/40 w-fit px-2 py-1 rounded border border-cyan-800/30">
                                            {t.onboarding.immersive.recommendation}
                                        </div> */}
                                    </div>
                                </div>
                            </button>

                            {/* CLASSIC / STANDARD MODE - DISABILITATO */}
                            <div
                                className={`${disabledButtonBaseStyle} ${disabledStyle} border-gray-800 bg-gray-900/30`}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="p-4 bg-gray-800/50 rounded-full text-gray-600 border border-gray-800 transition-all duration-300">
                                            <Zap className="w-6 h-6 md:w-8 md:h-8" />
                                        </div>
                                        {/* Tag Coming Soon */}
                                        <span className="text-[10px] font-bold tracking-widest text-red-400 bg-red-900/30 px-3 py-1 rounded-full border border-red-700">
                                            COMING SOON
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-500 mb-3">
                                        {t.onboarding.classic.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {t.onboarding.classic.description}
                                    </p>
                                    {/* <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-700 font-mono uppercase tracking-widest">
                                        {t.onboarding.classic.recommendation}
                                    </div> */}
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LOGO OPEN SOURCE & GITHUB LINK */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="flex flex-col items-center justify-center mt-auto pb-8 md:pb-0"
                >
                    <a
                        href="https://github.com/francimolli/portfolio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center space-y-3 transition-opacity duration-300 hover:opacity-80"
                    >
                        <div className="relative">
                            {/* Orbital Glow Effect */}
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />

                            <img
                                src="/images/oss-logo.png"
                                alt="Open Source Initiative"
                                className="w-12 h-12 md:w-16 md:h-16 relative z-10 brightness-90 contrast-125 transition-transform duration-500 group-hover:scale-105"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))' }}
                            />
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                OPEN SOURCE SYSTEM
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase">
                                github.com/francimolli/portfolio
                            </span>
                        </div>
                    </a>
                </motion.div>
            </div>
        </div>
    );
}