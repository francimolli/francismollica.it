"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, Zap, Globe } from "lucide-react"; // Aggiunto Globe per il selettore lingua
import { useLanguage } from "@/lib/language-context";
import posthog from "posthog-js";

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
        posthog.capture('language_changed', { language: newLang, source: 'onboarding' });
    };

    // Stile comune per i pulsanti (minimalista e spaziale)
    const buttonBaseStyle = "relative p-6 md:p-10 border transition-all duration-400 rounded-xl text-left shadow-xl overflow-hidden";

    // Stile per l'elemento non cliccabile
    const disabledStyle = "opacity-50 cursor-not-allowed grayscale";
    const disabledButtonBaseStyle = "group relative p-6 md:p-10 border transition-all duration-400 rounded-xl text-left shadow-xl overflow-hidden";
    const classicModeActive = false; // Flag per disattivare la modalità Classic (Standard)

    return (
        <div className="fixed inset-0 z-[100] bg-[#020410] flex flex-col items-center justify-center text-white p-4 font-sans h-[100dvh] w-full overflow-y-auto">

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

            <div className="max-w-4xl w-full space-y-8 md:space-y-16 py-12 md:py-0">

                {/* TITOLO/TESTO DI CARICAMENTO */}
                <div className="min-h-[60px] flex flex-col items-center justify-center relative">
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
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-12"
                        >
                            {/* IMMERSIVE / CURIOUS MODE - ATTIVO */}
                            <button
                                onClick={() => {
                                    posthog.capture('onboarding_completed', { mode: 'immersive' });
                                    onComplete("immersive");
                                }}
                                className={`${buttonBaseStyle} border-cyan-700 hover:border-cyan-500 bg-cyan-950/20 hover:bg-cyan-900/30 shadow-cyan-500/10 hover:shadow-cyan-500/30`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        {/* Icona a tema Spaziale */}
                                        <motion.div
                                            initial={{ scale: 1 }}
                                            whileHover={{ scale: 1.1, rotate: 3 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-4 bg-cyan-900/50 rounded-full text-cyan-400 border border-cyan-800 shadow-lg"
                                        >
                                            <Telescope className="w-6 h-6 md:w-8 md:h-8" />
                                        </motion.div>
                                        <span className="text-[10px] font-bold tracking-widest text-cyan-300 bg-cyan-800/30 px-3 py-1 rounded-full border border-cyan-700/50">
                                            {t.onboarding.immersive.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
                                        {t.onboarding.immersive.title}
                                    </h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {t.onboarding.immersive.description}
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-[10px] text-cyan-600 font-mono uppercase tracking-widest">
                                        {t.onboarding.immersive.recommendation}
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
                                    <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-700 font-mono uppercase tracking-widest">
                                        {t.onboarding.classic.recommendation}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}