"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Github, Terminal, Folder, Database, Cpu } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

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
        <section id="projects" className="relative w-full min-h-screen py-20 bg-black overflow-hidden font-mono text-cyan-500">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-15">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.1)_2px,rgba(6,182,212,0.1)_4px)]" />
            </div>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,rgba(0,0,0,1)_100%)]" />

            <div className="container relative z-10 px-6 md:px-8 max-w-7xl mx-auto">

                {/* --- HEADER TERMINALE --- */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-cyan-900/50 pb-4 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-cyan-600">
                            <span>root@portfolio:~/projects</span>
                            <span className="text-cyan-400">$</span>
                            <span className="text-cyan-100 animate-pulse">ls -la --color=auto</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            <TypewriterText text={t.projects.sectionTitle} speed={50} delay={200} />
                        </h2>
                    </div>
                    <div className="text-xs text-right text-cyan-700 uppercase tracking-widest hidden md:block">
                        <p>Total Objects: {projects.length}</p>
                        <p>Memory Usage: 42MB</p>
                    </div>
                </div>

                {/* --- GRID PROGETTI --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="group relative flex flex-col h-full bg-black/40 border border-cyan-900/60 hover:border-cyan-400/80 transition-all duration-300 rounded-sm overflow-hidden"
                            style={{
                                animation: `fadeInUp 0.5s ease-out ${0.5 + (index * 0.2)}s backwards`
                            }}
                        >
                            {/* Overlay Hover Glitch */}
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />

                            {/* Card Header: Fake Window Bar */}
                            <div className="relative z-10 flex items-center justify-between px-4 py-2 bg-cyan-950/20 border-b border-cyan-900/50 group-hover:bg-cyan-900/30 transition-colors">
                                <div className="flex items-center gap-2 text-xs text-cyan-400">
                                    <project.icon className="w-4 h-4" />
                                    <span className="tracking-widest opacity-70">{project.id}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-cyan-900 group-hover:bg-cyan-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-cyan-900 group-hover:bg-cyan-500/50" />
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="relative z-10 p-6 flex flex-col flex-grow">
                                <h3 className="text-2xl text-cyan-100 font-bold mb-1 group-hover:text-cyan-300 transition-colors group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                                    {project.title}
                                </h3>
                                <div className="flex justify-between items-center text-xs text-cyan-600 mb-3 font-bold uppercase tracking-wider">
                                    <span>{project.company}</span>
                                    <span>{project.period}</span>
                                </div>

                                <p className="text-cyan-400/70 text-sm leading-relaxed mb-6 flex-grow">
                                    {project.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-[10px] uppercase tracking-wider text-cyan-300 border border-cyan-800/50 bg-cyan-950/10 rounded-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Action Buttons (Terminal Style) */}
                                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-cyan-900/30">
                                    <Link
                                        href={project.repoUrl}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 py-2 text-xs border border-dashed border-cyan-800 text-cyan-600 hover:text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/20 transition-all"
                                    >
                                        <Github className="w-3 h-3" />
                                        <span>./source_code</span>
                                    </Link>
                                    <Link
                                        href={project.demoUrl}
                                        target="_blank"
                                        className={`flex items-center justify-center gap-2 py-2 text-xs border border-cyan-700 bg-cyan-950/20 text-cyan-400 hover:text-white hover:bg-cyan-600/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all ${project.demoUrl === "#" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>./run_demo.exe</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-cyan-600 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}