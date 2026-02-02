"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Book, X, Home, User, Briefcase, Mail, Headphones, Copy, Send, Map, Radio } from "lucide-react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

const sections = [
    { id: "home", title: "nav.home", icon: Home, target: null }, // Home resets view
    { id: "about", title: "nav.about", icon: User, target: { x: 0, z: -200 } },
    { id: "timeline", title: "nav.timeline", icon: Briefcase, target: { x: 200, z: 0 } },
    { id: "portfolio", title: "nav.portfolio", icon: Book, target: { x: -250, z: -150 } },
    { id: "contact", title: "nav.contact", icon: Mail, target: { x: -200, z: 0 } },
    { id: "music", title: "nav.music", icon: Headphones, target: { x: 0, z: 200 } },
    { id: "roadmap", title: "nav.roadmap", icon: Map, target: null },
];

export function LogbookMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'navigation' | 'achievements' | 'help'>('navigation');
    const { setExpandedSection } = useFloatingSection();
    const { flyTo, resetView, coordinates, unlockedSecrets } = useCityControls();
    const { language } = useLanguage();
    const t = translations[language];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const secretsList = [
        { id: 'satellite', title: 'Kepler Telescope', description: 'Prototype Blueprint Found', icon: '🛰️' },
        { id: 'monolith', title: 'Gliese 436 b', description: 'Discount Code: MONO-10', icon: '🗿' },
        { id: 'void_ship', title: "'Oumuamua", description: 'Secret Project Access', icon: '🚀' },
    ];

    const handleSectionClick = (id: string, target: { x: number, z: number } | null) => {
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
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`relative group flex items-center gap-3 px-6 py-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-violet-400/30 backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden ${isOpen ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-black/60 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400/80"
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Radar Ping Effect */}
                    {!isOpen && (
                        <>
                            <span className="absolute inset-0 rounded-full border border-violet-400/50 animate-ping opacity-20" />
                            <span className="absolute inset-0 rounded-full border border-violet-400/30 animate-[ping_3s_linear_infinite] opacity-10 delay-75" />
                        </>
                    )}

                    {isOpen ? <X size={24} /> : (
                        <>
                            <Book size={24} className={!isOpen ? "animate-pulse" : ""} />
                            <span className="text-sm font-bold tracking-[0.2em] font-mono">LOGBOOK</span>
                        </>
                    )}
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
                                <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-violet-500/50 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.3)] flex flex-col h-[80vh] md:h-auto md:max-h-[85vh] pointer-events-auto overflow-hidden">
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(139,92,246,0.03)_50%)] bg-[length:100%_4px] pointer-events-none animate-pulse" />

                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-violet-400/70 rounded-tl-2xl" />
                                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-violet-400/70 rounded-tr-2xl" />
                                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-violet-400/70 rounded-bl-2xl" />
                                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-violet-400/70 rounded-br-2xl" />

                                    {/* Header */}
                                    <div className="relative border-b border-violet-500/30 bg-black/50 px-6 py-4 shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
                                                <h2 className="text-xl md:text-2xl font-bold text-violet-400 font-mono tracking-wider">
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
                                                    onClick={() => setActiveTab('navigation')}
                                                    className={`px-4 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'navigation' ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                                >
                                                    {t.logbook.tab1}
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('achievements')}
                                                    className={`px-4 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'achievements' ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                                >
                                                    {t.logbook.tab2} [{unlockedSecrets.length}/{secretsList.length}]
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('help')}
                                                    className={`px-4 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'help' ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                                                >
                                                    {t.logbook.tab3}
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
                                                                { border: 'border-sky-400/50', bg: 'bg-sky-400/10', text: 'text-sky-300', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.4)]', line: 'bg-sky-400' },
                                                                { border: 'border-rose-400/50', bg: 'bg-rose-400/10', text: 'text-rose-300', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]', line: 'bg-rose-400' },
                                                                { border: 'border-emerald-400/50', bg: 'bg-emerald-400/10', text: 'text-emerald-300', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', line: 'bg-emerald-400' },
                                                                { border: 'border-amber-400/50', bg: 'bg-amber-400/10', text: 'text-amber-300', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]', line: 'bg-amber-400' },
                                                                { border: 'border-violet-400/50', bg: 'bg-violet-400/10', text: 'text-violet-300', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]', line: 'bg-violet-400' },
                                                                { border: 'border-lime-400/50', bg: 'bg-lime-400/10', text: 'text-lime-300', glow: 'shadow-[0_0_20px_rgba(132,204,22,0.4)]', line: 'bg-lime-400' },
                                                                { border: 'border-indigo-400/50', bg: 'bg-indigo-400/10', text: 'text-indigo-300', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]', line: 'bg-indigo-400' },
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
                                                ) : activeTab === 'achievements' ? (
                                                    <motion.div
                                                        key="achievements"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="space-y-4"
                                                    >
                                                        {/* ... existing achievements code ... */}
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
                                                                        ? 'border-violet-500/50 bg-violet-500/10'
                                                                        : 'border-gray-800 bg-gray-900/50 opacity-50 grayscale'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-6">
                                                                        <div className={`text-4xl ${isUnlocked ? 'animate-bounce' : ''}`}>
                                                                            {isUnlocked ? secret.icon : '🔒'}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h3 className={`text-lg font-bold font-mono uppercase tracking-wider ${isUnlocked ? 'text-violet-400' : 'text-gray-500'}`}>
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
                                                                                    const contactSection = sections.find(s => s.id === 'contact');
                                                                                    handleSectionClick('contact', contactSection?.target || null);
                                                                                }}
                                                                                className="ml-auto px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                                                                            >
                                                                                <Send size={16} /> {t.logbook.copy}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="help"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="space-y-6 max-w-2xl mx-auto py-2"
                                                    >
                                                        {/* HEADER DECORATION */}
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                                            <span className="text-[10px] font-mono text-amber-500/80 tracking-[0.5em] uppercase">Tactical System Override</span>
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* 01. NAVIGATION */}
                                                            <div className="group relative p-5 rounded-2xl border border-sky-500/20 bg-sky-950/20 backdrop-blur-md hover:border-sky-400/50 transition-all duration-500 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                                                    <Map size={48} className="text-sky-400" />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/40">
                                                                            <Map size={18} />
                                                                        </div>
                                                                        <h3 className="font-bold font-mono text-sky-300 tracking-tighter text-base">{t.logbook.help.navTitle}</h3>
                                                                    </div>
                                                                    <p className="text-xs text-sky-100/60 leading-relaxed font-mono pl-10 border-l border-sky-500/30">
                                                                        {t.logbook.help.navDesc}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 02. PROBES */}
                                                            <div className="group relative p-5 rounded-2xl border border-violet-500/20 bg-violet-950/20 backdrop-blur-md hover:border-violet-400/50 transition-all duration-500 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                                                    <Radio size={48} className="text-violet-400" />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/40">
                                                                            <Radio size={18} />
                                                                        </div>
                                                                        <h3 className="font-bold font-mono text-violet-300 tracking-tighter text-base">{t.logbook.help.secretsTitle}</h3>
                                                                    </div>
                                                                    <p className="text-xs text-violet-100/60 leading-relaxed font-mono pl-10 border-l border-violet-500/30">
                                                                        {t.logbook.help.secretsDesc}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 03. REDEEM */}
                                                            <div className="group relative p-5 rounded-2xl border border-amber-500/20 bg-amber-950/20 backdrop-blur-md hover:border-amber-400/50 transition-all duration-500 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                                                    <Copy size={48} className="text-amber-400" />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/40">
                                                                            <Copy size={18} />
                                                                        </div>
                                                                        <h3 className="font-bold font-mono text-amber-300 tracking-tighter text-base">{t.logbook.help.redeemTitle}</h3>
                                                                    </div>
                                                                    <p className="text-xs text-amber-100/60 leading-relaxed font-mono pl-10 border-l border-amber-500/30">
                                                                        {t.logbook.help.redeemDesc}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 04. CONTROLS */}
                                                            <div className="group relative p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-500 overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                                                    <Headphones size={48} className="text-emerald-400" />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
                                                                            <Headphones size={18} />
                                                                        </div>
                                                                        <h3 className="font-bold font-mono text-emerald-300 tracking-tighter text-base">{t.logbook.help.controlsTitle}</h3>
                                                                    </div>
                                                                    <div className="text-xs font-mono text-emerald-100/80 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 leading-loose">
                                                                        {t.logbook.help.controlsDesc.split(' - ').map((part, i) => (
                                                                            <div key={i} className="flex justify-between items-center border-b border-emerald-500/10 last:border-0 py-0.5">
                                                                                <span>{part.split(' ')[0]}</span>
                                                                                <span className="text-emerald-400/70 text-[10px] uppercase font-bold tracking-widest">{part.split(' ').slice(1).join(' ')}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 rounded-xl bg-black/60 border border-gray-800/50 text-center relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-pulse" />
                                                            <span className="relative z-10 text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase">
                                                                {t.logbook.help.footer}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Footer Status */}
                                    <div className="border-t border-violet-500/30 bg-black/50 px-6 py-3 shrink-0">
                                        <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                                            <span>GIT v3.1</span>
                                            <span className="text-violet-400">francismollica.it</span>
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
