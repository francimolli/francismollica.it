"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import {
    SiJavascript,
    SiTypescript,
    SiReact,
    SiNextdotjs,
    SiPython,
    SiGoogletagmanager,
    SiAdobe,
    SiTensorflow,
    SiKeras,
} from "react-icons/si";
import Link from "next/link";

// --- 1. Componente Typewriter (Identico a quello della Hero) ---
function TypewriterText({
    text,
    delay = 0,
    speed = 30,
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
                <span className="animate-pulse text-cyan-400">_</span>
            )}
        </span>
    );
}

// --- 2. Componente About Standalone ---
export function About() {
    const { t } = useLanguage();

    // Lista Skills
    const skills = [
        { name: "JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", icon: SiJavascript },
        { name: "TypeScript", url: "https://www.typescriptlang.org/", icon: SiTypescript },
        { name: "React", url: "https://react.dev/", icon: SiReact },
        { name: "Next.js", url: "https://nextjs.org/", icon: SiNextdotjs },
        { name: "Python", url: "https://www.python.org/", icon: SiPython },
        { name: "GTM", url: "https://marketingplatform.google.com/about/tag-manager/", icon: SiGoogletagmanager },
        { name: "Adobe Analytics", url: "https://business.adobe.com/products/analytics/adobe-analytics.html", icon: SiAdobe },
        { name: "TensorFlow", url: "https://www.tensorflow.org/", icon: SiTensorflow },
        { name: "Keras", url: "https://keras.io/", icon: SiKeras },
    ];

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black text-white py-20">

            {/* --- EFFETTI CRT / SFONDO (Presi dalla Hero) --- */}
            {/* Scanlines layer */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.1)_2px,rgba(6,182,212,0.1)_4px)]" />
            </div>
            {/* Vignette & Glow */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,rgba(0,0,0,1)_100%)]" />


            {/* --- CONTENUTO PRINCIPALE --- */}
            <div className="container relative z-20 px-6 md:px-8 max-w-6xl">

                {/* Header della "Finestra" Terminale */}
                <div className="w-full border-b border-cyan-900/50 mb-12 pb-2 flex items-center justify-between text-xs font-mono text-cyan-600/60 uppercase tracking-widest">
                    <div className="flex gap-4">
                        <span>SYS.BIO.V2</span>
                        <span>// FRANCESCO MOLLICA</span>
                    </div>
                    <div className="animate-pulse">● ONLINE</div>
                </div>
                <div className="flex items-center gap-3 text-sm md:text-base text-cyan-500/80 mb-6">
                    <span>francesco@portfolio:~/about</span>
                    <span className="text-cyan-300">$</span>
                    <span className="text-white">cat profile_summary.md</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* --- COLONNA SX: VISUAL / AVATAR DIGITALE --- */}
                    <div className="relative order-2 lg:order-1 group">
                        {/* Cornice decorativa */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />

                        <div className="relative aspect-square w-full max-w-md mx-auto border border-cyan-500/30 bg-black/80 backdrop-blur-sm p-1">
                            {/* Linee di mira agli angoli */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500" />

                            {/* Contenuto Visuale (Placeholder Scanner) */}
                            <div className="h-full w-full bg-cyan-950/20 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.2)_50%,transparent_100%)] h-[200%] w-full animate-[scanVertical_3s_linear_infinite]" />

                                <div className="text-cyan-400 font-mono text-6xl mb-4 opacity-50">
                                    <SiReact />
                                </div>
                                <div className="font-mono text-xs text-cyan-500/70 text-center space-y-1">
                                    <p>IDENTITY CONFIRMED</p>
                                    <p>ACCESS LEVEL: ADMIN</p>
                                    <p className="animate-pulse mt-2 text-cyan-300">PROCESSING DATA...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- COLONNA DX: TESTO & SKILLS --- */}
                    <div className="order-1 lg:order-2 font-mono space-y-8">

                        {/* Prompt iniziale */}


                        {/* Titolo Principale */}
                        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                            <TypewriterText
                                text={t.about.headline}
                                speed={40}
                                delay={500}
                            />
                        </h2>

                        {/* Sottotitolo / Commento */}
                        <div className="text-lg text-cyan-600/80 italic border-l-2 border-cyan-800 pl-4">
                            <TypewriterText
                                text={`// ${t.about.headlineSuffix}`}
                                speed={30}
                                delay={2000}
                            />
                        </div>

                        {/* Paragrafi Bio */}
                        <div className="space-y-6 text-cyan-100/70 leading-relaxed text-sm md:text-base">
                            <p>
                                <TypewriterText text={t.about.bio1} speed={10} delay={3000} />
                            </p>
                            <p>
                                <TypewriterText text={t.about.bio2} speed={10} delay={5000} />
                            </p>
                        </div>

                        {/* Sezione Skills */}
                        <div className="pt-8 opacity-0 animate-[fadeIn_1s_ease-out_7s_forwards]">
                            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-cyan-500 uppercase tracking-widest">
                                <span>{">"} MOUNTING MODULES...</span>
                                <span className="w-full h-[1px] bg-cyan-900/50 block" />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill) => (
                                    <Link
                                        key={skill.name}
                                        href={skill.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative inline-flex items-center gap-2 px-4 py-2 bg-black border border-cyan-800 hover:border-cyan-400 text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-950/30 transition-all duration-300"
                                    >
                                        <skill.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        <span className="text-xs tracking-wider uppercase">{skill.name}</span>
                                        {/* Angoli tech decorativi sui bottoni */}
                                        <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 w-1 h-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Custom Animation Styles (inline for portability) */}
            <style jsx>{`
                @keyframes scanVertical {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(50%); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}