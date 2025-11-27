"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Book, X, Home, User, Briefcase, Mail, Headphones, Copy, Send, Map, Radio } from "lucide-react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import posthog from 'posthog-js';

const sections = [
    { id: "home", title: "nav.home", icon: Home, target: null }, // Home resets view
    { id: "about", title: "nav.about", icon: User, target: { x: 0, z: -200 } },
    { id: "projects", title: "nav.projects", icon: Briefcase, target: { x: 200, z: 0 } },
    { id: "contact", title: "nav.contact", icon: Mail, target: { x: -200, z: 0 } },
    { id: "music", title: "nav.music", icon: Headphones, target: { x: 0, z: 200 } },
    { id: "roadmap", title: "nav.roadmap", icon: Map, target: null },
];

export function LogbookMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'navigation' | 'achievements'>('navigation');
    const { setExpandedSection } = useFloatingSection();
    const { flyTo, resetView, coordinates, unlockedSecrets } = useCityControls();
    const { language } = useLanguage();
    const t = translations[language];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const secretsList = [
        { id: 'satellite', title: 'Ancient Satellite', description: 'Prototype Blueprint Found', icon: '🛰️' },
        { id: 'monolith', title: 'Black Monolith', description: 'Discount Code: MONO-10', icon: '🗿' },
        { id: 'void_ship', title: 'Derelict Ship', description: 'Secret Project Access', icon: '🚀' },
    ];

    const handleSectionClick = (id: string, target: { x: number, z: number } | null) => {
        posthog.capture('logbook_navigated', { section_id: id });
        setIsOpen(false);

        // 1. Trigger Navigation
        let delay = 2000;
        if (id === 'home') {
            resetView();
        } else if (target) {
            flyTo(target.x, target.z);
        } else {
            delay = 500; // Shorter delay for items without flight
        }

        // 2. Delay opening the card
        setTimeout(() => {
            setExpandedSection(id);
        }, delay);
    };

    return (
        <>
            {/* Main Toggle Button */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
                <motion.button
                    drag
                    dragMomentum={false}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`relative group p-4 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.3)] border border-yellow-400/30 backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden ${isOpen ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-black/60 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400/80"
                        }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Radar Ping Effect */}
                    {!isOpen && (
                        <>
                            <span className="absolute inset-0 rounded-full border border-yellow-400/50 animate-ping opacity-20" />
                            <span className="absolute inset-0 rounded-full border border-yellow-400/30 animate-[ping_3s_linear_infinite] opacity-10 delay-75" />
                        </>
                    )}

                    {isOpen ? <X size={24} /> : <Radio size={24} className={!isOpen ? "animate-pulse" : ""} />}
                </motion.button>
            </div>


            {/* Spaceship Control Panel Overlay */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 pointer-events-none">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto touch-none"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Main Control Panel */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                                transition={{ type: "spring", damping: 20 }}
                                className="relative w-full max-w-4xl pointer-events-auto"
                                style={{ perspective: "1000px" }}
                            >
                                {/* Panel Container */}
                                <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_60px_rgba(250,204,21,0.3)] flex flex-col h-[80vh] md:h-auto md:max-h-[85vh] pointer-events-auto overflow-hidden">
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(250,204,21,0.03)_50%)] bg-[length:100%_4px] pointer-events-none animate-pulse" />

                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-400/70 rounded-tl-2xl" />
                                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-400/70 rounded-tr-2xl" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-400/70 rounded-bl-2xl" />
                                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-400/70 rounded-br-2xl" />

                                    {/* Header */}
                                    <div className="relative border-b border-yellow-500/30 bg-black/50 px-6 py-4 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,1)]" />
                                                <h2 className="text-xl md:text-2xl font-bold text-yellow-400 font-mono tracking-wider">
                                                    {t.logbook.title}
                                                </h2>
                                            </div>
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Status Bar & Tabs */}
                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex gap-4 text-xs font-mono">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-green-400">FRANCESCO MOLLICA</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                                    <span className="text-cyan-400">{coordinates.lat.toFixed(2)}°N {coordinates.long.toFixed(2)}°E</span>
                                                </div>
                                            </div>

                                            {/* TABS */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('navigation');
                                                        posthog.capture('logbook_tab_viewed', { tab_name: 'navigation' });
                                                    }}
                                                    className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'navigation' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                                >
                                                    {t.logbook.tab1}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('achievements');
                                                        posthog.capture('logbook_tab_viewed', { tab_name: 'achievements' });
                                                    }}
                                                    className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                                >
                                                    {t.logbook.tab2} [{unlockedSecrets.length}/{secretsList.length}]
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area - SCROLLABLE (MODIFICATO: Aggiunto min-h-0) */}
                                    <div className="relative p-4 md:p-8 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                                        <div className="w-full min-h-full">
                                            <AnimatePresence mode="wait">
                                                {activeTab === 'navigation' ? (
                                                    <motion.div
                                                        key="nav"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                                    >
                                                        {sections.map((section, index) => {
                                                            const Icon = section.icon;
                                                            const title = section.title.startsWith('nav.')
                                                                ? (t.nav as any)[section.title.split('.')[1]]
                                                                : section.title;

                                                            const colors = [
                                                                { border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]', line: 'bg-cyan-500' },
                                                                { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', line: 'bg-purple-500' },
                                                                { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]', line: 'bg-yellow-500' },
                                                                { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]', line: 'bg-green-500' },
                                                                { border: 'border-pink-500/50', bg: 'bg-pink-500/10', text: 'text-pink-400', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', line: 'bg-pink-500' },
                                                            ];
                                                            const color = colors[index % colors.length];

                                                            return (
                                                                <motion.button
                                                                    key={section.id}
                                                                    onClick={() => handleSectionClick(section.id, section.target)}
                                                                    className={`group relative p-2 md:p-6 rounded-xl md:border-2 ${color.border} ${color.bg} backdrop-blur-sm hover:${color.glow} transition-all duration-300 overflow-hidden`}
                                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <div className="absolute inset-0 opacity-5">
                                                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                                                            <pattern id={`hex-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                                <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="currentColor" />
                                                                            </pattern>
                                                                            <rect width="100" height="100" fill={`url(#hex-${index})`} />
                                                                        </svg>
                                                                    </div>
                                                                    <div className={`absolute inset-0 ${color.border} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />
                                                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                                                        <div className={`p-3 md:p-4 rounded-lg ${color.bg} border ${color.border}`}>
                                                                            <Icon className={`w-8 h-8 ${color.text}`} />
                                                                        </div>
                                                                        <span className={`text-[10px] md:text-sm font-mono font-bold tracking-wider uppercase ${color.text} mt-1 md:mt-0 block text-center`}>
                                                                            {title}
                                                                        </span>
                                                                        <div className="flex items-center gap-1 text-xs font-mono text-gray-500 hidden md:flex">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${color.line} animate-pulse`} />
                                                                            <span>online</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${color.line} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="achievements"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="space-y-4"
                                                    >
                                                        {secretsList.map((secret) => {
                                                            const isUnlocked = unlockedSecrets.includes(secret.id);
                                                            const secretData = (t as any).secrets?.[secret.id];
                                                            const title = isUnlocked && secretData ? secretData.title : 'Unknown Signal';
                                                            const description = isUnlocked && secretData ? secretData.description : 'Encrypted Data. Explore to unlock.';
                                                            const copyText = isUnlocked && secretData ? secretData.copyText : '';

                                                            return (
                                                                <div
                                                                    key={secret.id}
                                                                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${isUnlocked
                                                                        ? 'border-yellow-500/50 bg-yellow-500/10'
                                                                        : 'border-gray-800 bg-gray-900/50 opacity-50 grayscale'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-6">
                                                                        <div className={`text-4xl ${isUnlocked ? 'animate-bounce' : ''}`}>
                                                                            {isUnlocked ? secret.icon : '🔒'}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h3 className={`text-lg font-bold font-mono uppercase tracking-wider ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                                                {title}
                                                                            </h3>
                                                                            <p className="text-sm text-gray-400 font-mono mt-1">
                                                                                {description}
                                                                            </p>
                                                                        </div>
                                                                        {isUnlocked && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    navigator.clipboard.writeText(copyText);
                                                                                    posthog.capture('achievement_code_copied', { secret_id: secret.id });
                                                                                    // Optional: Show a small tooltip or change icon temporarily
                                                                                    const btn = e.currentTarget;
                                                                                    const originalContent = btn.innerHTML;
                                                                                    btn.innerHTML = `<span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ${t.logbook.copied}</span>`;
                                                                                    setTimeout(() => {
                                                                                        btn.innerHTML = originalContent;
                                                                                    }, 2000);
                                                                                }}
                                                                                className="ml-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                                                                            >
                                                                                <Send size={16} /> {t.logbook.copy}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Footer Status */}
                                    <div className="border-t border-yellow-500/30 bg-black/50 px-6 py-3 shrink-0">
                                        <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                                            <span>GIT v2.3.1</span>
                                            <span className="text-yellow-400">francismollica.it</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
