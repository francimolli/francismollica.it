"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { Terminal, ChevronRight } from "lucide-react";

// Componente Typewriter con effetto terminale anni '80
function TypewriterText({
    text,
    delay = 0,
    speed = 50,
    className = ""
}: {
    text: string;
    delay?: number;
    speed?: number;
    className?: string;
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => {
            setStarted(true);
        }, delay);

        return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
        if (!started || currentIndex >= text.length) return;

        const timer = setTimeout(() => {
            setDisplayedText(prev => prev + text[currentIndex]);
            setCurrentIndex(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timer);
    }, [currentIndex, text, started, speed]);

    return (
        <span className={className}>
            {displayedText}
            {started && currentIndex < text.length && (
                <span className="animate-pulse text-cyan-400">▮</span>
            )}
        </span>
    );
}

export function Hero() {
    const { t } = useLanguage();
    const { setExpandedSection } = useFloatingSection();

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pointer-events-none">
            {/* Scanlines effect - retro CRT */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-10">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.1)_2px,rgba(6,182,212,0.1)_4px)]" />
            </div>

            {/* Content - Terminal Style */}
            <div className="container relative z-20 px-6 md:px-8 max-w-4xl pointer-events-auto">
                <div className="font-mono space-y-6">
                    {/* Terminal Prompt Header */}
                    <div className="flex items-center gap-2 text-cyan-500 text-sm md:text-base opacity-70">
                        <span>francesco@mollica.dev</span>
                        <span className="text-cyan-400">~</span>
                        <span className="text-cyan-300">$</span>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div className="text-cyan-400/80 text-xs md:text-sm tracking-widest uppercase">
                            <TypewriterText
                                text="> Francesco Mollica"
                                speed={40}
                                delay={100}
                            />
                        </div>

                        {/* Headline - Large */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-cyan-400 leading-tight tracking-tight">
                            <TypewriterText
                                text={t.hero.headline}
                                speed={50}
                                delay={800}
                            />
                        </h1>

                        {/* Role */}
                        <div className="text-xl md:text-3xl text-cyan-300/90">
                            <TypewriterText
                                text={`${t.hero.role} ${t.hero.roleSuffix}`}
                                speed={40}
                                delay={2000}
                            />
                        </div>

                        {/* Description */}
                        <div className="text-base md:text-lg text-cyan-200/70 max-w-2xl leading-relaxed pt-4">
                            <TypewriterText
                                text={t.hero.description}
                                speed={20}
                                delay={3500}
                            />
                        </div>

                        {/* CTA - appears after text */}
                        <div className="pt-8 opacity-0 animate-[fadeIn_0.5s_ease-in_5s_forwards]">
                            <button
                                onClick={() => setExpandedSection('contact')}
                                className="group relative px-8 py-4 bg-black/60 border border-cyan-500/30 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            >
                                {/* Hover Fill Effect */}
                                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                                {/* Glitch Lines */}
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 -translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear]" />
                                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cyan-400/50 translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear_reverse]" />

                                <div className="relative z-10 flex items-center gap-3">
                                    <Terminal className="w-5 h-5 text-cyan-500 group-hover:text-cyan-300 transition-colors" />
                                    <span className="font-mono font-bold text-cyan-400 tracking-widest group-hover:text-cyan-200 transition-colors">
                                        CONTACT_ME
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ambient glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glitch-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </section>
    );
}
