"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Github, Terminal, Folder, Database, Cpu } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useFloatingSection } from "@/components/FloatingSectionContext";

// --- Utility: Typewriter (Riutilizzato per coerenza) ---
function TypewriterText({ text, delay = 0, speed = 30 }: { text: string; delay?: number; speed?: number }) {
    const [displayedText, setDisplayedText] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
        if (!started || displayedText.length >= text.length) return;
        const timer = setTimeout(() => {
            setDisplayedText(text.slice(0, displayedText.length + 1));
        }, speed);
        return () => clearTimeout(timer);
    }, [displayedText, text, started, speed]);

    return <span>{displayedText}{started && displayedText.length < text.length ? <span className="animate-pulse">_</span> : null}</span>;
}

export function Projects() {
    const { t } = useLanguage();
    const { setExpandedSection } = useFloatingSection();

    // Dati dei progetti
    // Dati dei progetti dinamici dalle traduzioni
    const projects = t.projects.items.map((item, index) => ({
        id: `PRJ_0${index + 1}`,
        title: item.title,
        description: item.description,
        tags: item.tags || [],
        // Assegna icone in base all'indice o a qualche logica (qui ciclico per semplicità)
        icon: [Database, Terminal, Folder, Cpu, Github, ExternalLink][index % 6],
        // Placeholder URLs - in un caso reale potrebbero venire dal file di traduzione o da un config separato
        demoUrl: item.url,
        repoUrl: "https://github.com/francimolli",
        company: item.company, // Aggiunto campo company
        period: item.period    // Aggiunto campo period
    }));

    return (
        <section id="timeline" className="relative w-full min-h-screen py-20 bg-black overflow-hidden font-mono text-cyan-500">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-15">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.1)_2px,rgba(6,182,212,0.1)_4px)]" />
            </div>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,rgba(0,0,0,1)_100%)]" />

            <div className="container relative z-10 px-6 md:px-8 max-w-7xl mx-auto">

                {/* --- HEADER TERMINALE --- */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-cyan-900/50 pb-4 gap-4">
                    <div className="space-y-2">
                        {/* <div className="flex items-center gap-2 text-xs text-cyan-600">
                            <span>root@portfolio:~/projects</span>
                            <span className="text-cyan-400">$</span>
                            <span className="text-cyan-100 animate-pulse">ls -la --color=auto</span>
                        </div> */}
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            <TypewriterText text={t.projects.sectionTitle} speed={50} delay={200} />
                        </h2>
                    </div>
                    <div className="text-xs text-right text-cyan-700 uppercase tracking-widest hidden md:block">
                        <p>{t.projects.totalObjects}: {projects.length}</p>
                    </div>
                </div>

                {/* --- TIMELINE CONTAINER --- */}
                <div className="relative flex flex-col gap-12 md:gap-24">
                    {/* Central Neon Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 md:-translate-x-1/2" />

                    {projects.map((project, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div
                                key={index}
                                className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${0.2 + (index * 0.1)}s backwards`
                                }}
                            >
                                {/* Timeline Node */}
                                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-black border border-cyan-400 rounded-full z-20 md:-translate-x-1/2 shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                                    <div className="absolute inset-0 bg-cyan-400 animate-ping opacity-75 rounded-full" />
                                </div>

                                {/* Spacer for Desktop Alignment */}
                                <div className="hidden md:block flex-1" />

                                {/* Project Card */}
                                <div className="w-full md:w-[calc(50%-2rem)] pl-12 md:pl-0">
                                    <div className="group relative bg-black/60 border border-cyan-900/60 hover:border-cyan-400/80 transition-all duration-500 rounded-sm overflow-hidden hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1">

                                        {/* Holographic Scan Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none z-0" />

                                        {/* Background Grid */}
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                                        {/* Card Header */}
                                        <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-cyan-950/20 border-b border-cyan-900/50 group-hover:bg-cyan-900/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded bg-cyan-900/30 border border-cyan-800 text-cyan-400 group-hover:text-white group-hover:border-cyan-400 transition-colors`}>
                                                    <project.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-mono text-cyan-500/70 tracking-widest">{project.id}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-cyan-500 animate-pulse' : 'bg-cyan-900'}`} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="relative z-10 p-6 md:p-8">
                                            <div className="flex flex-col gap-1 mb-4">
                                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-cyan-600">
                                                    <span>{project.company}</span>
                                                    <span className="px-2 py-0.5 bg-cyan-950/30 rounded border border-cyan-900/50 text-cyan-500">{project.period}</span>
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                                                    {project.title}
                                                </h3>
                                            </div>

                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 border-l-2 border-cyan-900/50 pl-4 group-hover:border-cyan-500/50 transition-colors">
                                                {project.description}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {project.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-400 border border-cyan-900/50 bg-cyan-950/10 rounded hover:bg-cyan-900/30 hover:border-cyan-500/50 transition-colors"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex justify-end">
                                                <Link
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    className={`group/btn relative inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest text-cyan-400 border border-cyan-800 hover:text-black hover:bg-cyan-400 hover:border-cyan-400 transition-all overflow-hidden ${project.demoUrl === "#" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        {t.projects.code} <ExternalLink className="w-3 h-3" />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Decorative Corners */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA - Link to Contact */}
                <div className="mt-16 flex justify-center animate-[fadeInUp_0.5s_ease-out_2s_both]">
                    <button
                        onClick={() => setExpandedSection('contact')}
                        className="group relative px-12 py-4 bg-black/60 border border-cyan-500/30 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                        {/* Hover Fill Effect */}
                        <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                        {/* Glitch Lines */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 -translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear]" />
                        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cyan-400/50 translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear_reverse]" />

                        <div className="relative z-10 flex items-center gap-3">
                            <span className="font-mono font-bold text-cyan-400 tracking-widest group-hover:text-cyan-200 transition-colors">
                                {t.contact.labelCTA}
                            </span>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glitch-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </section >
    );
}