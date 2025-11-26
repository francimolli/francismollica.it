"use client";

import { useState } from "react";
import { Book, X, Home, User, Briefcase, Mail, Headphones } from "lucide-react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

const sections = [
    { id: "home", title: "nav.home", icon: Home, target: null }, // Home resets view
    { id: "about", title: "nav.about", icon: User, target: { x: 0, z: -200 } },
    { id: "projects", title: "nav.work", icon: Briefcase, target: { x: 200, z: 0 } },
    { id: "contact", title: "nav.contact", icon: Mail, target: { x: -200, z: 0 } },
    { id: "music", title: "nav.music", icon: Headphones, target: { x: 0, z: 200 } },
];

export function LogbookMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { setExpandedSection } = useFloatingSection();
    const { flyTo, resetView, coordinates } = useCityControls();
    const { language } = useLanguage();
    const t = translations[language];

    const handleSectionClick = (id: string, target: { x: number, z: number } | null) => {
        setIsOpen(false);

        // 1. Trigger Navigation
        if (id === 'home') {
            resetView();
        } else if (target) {
            flyTo(target.x, target.z);
        }

        // 2. Delay opening the card to allow for flight time
        // Only open if it's not home (Home usually just resets view, unless it has content)
        // Assuming Home has content based on page.tsx
        setTimeout(() => {
            setExpandedSection(id);
        }, 2000); // 2 seconds flight time
    };

    return (
        <>
            {/* Main Toggle Button */}
            {/* Main Toggle Button Container */}
            <div className="fixed bottom-8 right-8 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[100] pointer-events-auto">
                <motion.button
                    drag
                    dragMomentum={false}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`p-5 rounded-lg shadow-[0_0_30px_rgba(250,204,21,0.5)] border-2 border-yellow-400/50 backdrop-blur-xl transition-colors duration-300 cursor-grab active:cursor-grabbing ${isOpen ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-black/80 text-yellow-400 hover:bg-yellow-950/80"
                        }`}
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    whileDrag={{ scale: 1.2 }}
                >
                    {isOpen ? <X size={28} /> : <Book size={28} />}
                </motion.button>
            </div>


            {/* Spaceship Control Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
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
                            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_60px_rgba(250,204,21,0.3)] overflow-hidden">
                                {/* Scanline Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(250,204,21,0.03)_50%)] bg-[length:100%_4px] pointer-events-none animate-pulse" />

                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-400/70 rounded-tl-2xl" />
                                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-400/70 rounded-tr-2xl" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-400/70 rounded-bl-2xl" />
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-400/70 rounded-br-2xl" />

                                {/* Header */}
                                <div className="relative border-b border-yellow-500/30 bg-black/50 px-6 py-4">
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

                                    {/* Status Bar */}
                                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-green-400">FRANCESCO MOLLICA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                            <span className="text-cyan-400">{coordinates.lat.toFixed(2)}°N {coordinates.long.toFixed(2)}°E</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Grid */}
                                <div className="p-4 md:p-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sections.map((section, index) => {
                                            const Icon = section.icon;
                                            const title = section.title.startsWith('nav.')
                                                ? (t.nav as any)[section.title.split('.')[1]]
                                                : section.title;

                                            // Color scheme per section
                                            const colors = [
                                                { border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]' },
                                                { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
                                                { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]' },
                                                { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' },
                                                { border: 'border-pink-500/50', bg: 'bg-pink-500/10', text: 'text-pink-400', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]' },
                                            ];
                                            const color = colors[index % colors.length];

                                            return (
                                                <motion.button
                                                    key={section.id}
                                                    onClick={() => handleSectionClick(section.id, section.target)}
                                                    className={`group relative p-4 md:p-6 rounded-xl border-2 ${color.border} ${color.bg} backdrop-blur-sm hover:${color.glow} transition-all duration-300 overflow-hidden`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {/* Hexagonal Background Pattern */}
                                                    <div className="absolute inset-0 opacity-5">
                                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                                            <pattern id={`hex-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <polygon points="10,0 20,5 20,15 10,20 0,15 0,5" fill="currentColor" />
                                                            </pattern>
                                                            <rect width="100" height="100" fill={`url(#hex-${index})`} />
                                                        </svg>
                                                    </div>

                                                    {/* Animated Border Glow */}
                                                    <div className={`absolute inset-0 ${color.border} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />

                                                    {/* Content */}
                                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                                        <div className={`p-4 rounded-lg ${color.bg} border ${color.border}`}>
                                                            <Icon className={`w-8 h-8 ${color.text}`} />
                                                        </div>
                                                        <span className={`text-sm font-mono font-bold tracking-wider uppercase ${color.text}`}>
                                                            {title}
                                                        </span>

                                                        {/* Status Indicator */}
                                                        <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${color.bg.replace('/10', '')} animate-pulse`} />
                                                            <span>online</span>
                                                        </div>
                                                    </div>

                                                    {/* Hover Effect Line */}
                                                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${color.bg.replace('/10', '')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Footer Status */}
                                <div className="border-t border-yellow-500/30 bg-black/50 px-6 py-3">
                                    <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                                        <span>GIT v2.1</span>
                                        <span className="text-yellow-400">francismollica.it</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
