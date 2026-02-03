"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { ExternalLink, Mail, Github } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Portfolio() {
    const { t } = useLanguage();
    const { setExpandedSection } = useFloatingSection();
    const portfolio = t.portfolio;
    const [shuffledItems, setShuffledItems] = useState<any[]>([]);

    useEffect(() => {
        // Shuffle projects only on client-side mount
        const items = [...portfolio.items];
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setShuffledItems(items);
    }, [portfolio.items]);

    // Use original items for hydration, then switch to shuffled
    const displayItems = shuffledItems.length > 0 ? shuffledItems : portfolio.items;

    return (
        <section id="portfolio" className="relative w-full min-h-screen py-10 md:py-24 bg-black overflow-hidden font-mono text-cyan-500">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1)_0%,rgba(0,0,0,1)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="container relative z-10 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-16 border-l-4 border-cyan-500 pl-6 space-y-2">
                    <span className="text-xs uppercase tracking-[0.5em] text-cyan-600 font-bold">{portfolio.sectionSubtitle}</span>
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        {portfolio.sectionTitle}
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {displayItems.map((project: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            {/* Card Container */}
                            <div className="relative overflow-hidden bg-gray-900/40 border border-white/10 rounded-xl backdrop-blur-sm transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col h-full">

                                {/* Image */}
                                <div className="relative h-64 w-full overflow-hidden bg-black/50">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.05)_2px,rgba(6,182,212,0.05)_4px)] z-20 pointer-events-none" />

                                    {/* Project Image */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                                        />
                                    </div>

                                    Tech Badge
                                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                                        <div className="px-3 py-1 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                                            ONLINE
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 md:p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
                                        {project.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {project.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 text-[10px] border border-white/5 bg-white/5 rounded text-gray-400 group-hover:border-cyan-500/20 group-hover:text-cyan-300 transition-colors"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="mt-auto flex items-center gap-4">
                                        <a
                                            href={project.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all"
                                        >
                                            {portfolio.viewProject} <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <button
                                            onClick={() => setExpandedSection('contact')}
                                            className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 text-white hover:border-cyan-500 hover:text-cyan-400 transition-all rounded-lg"
                                            title={t.nav.contact}
                                        >
                                            <Mail className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Ornamental Corners */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/5 group-hover:border-cyan-400 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/5 group-hover:border-cyan-400 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
