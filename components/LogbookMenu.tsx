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
    { id: "music", title: "Music", icon: Headphones, target: { x: 0, z: 200 } },
];

export function LogbookMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { setExpandedSection } = useFloatingSection();
    const { flyTo, resetView } = useCityControls();
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
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
                <motion.button
                    drag
                    dragMomentum={false}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`p-5 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.5)] border-2 border-yellow-400/50 backdrop-blur-xl transition-colors duration-300 cursor-grab active:cursor-grabbing ${isOpen ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-black/80 text-yellow-400 hover:bg-yellow-950/80"
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

            {/* Bubble Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40 flex items-end justify-end p-8 pointer-events-none">
                        {/* Backdrop to close on click outside */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Items Container */}
                        <motion.div
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-4 items-center pointer-events-auto"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={{
                                open: {
                                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                                },
                                closed: {
                                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                                }
                            }}
                        >
                            {sections.map((section) => {
                                const Icon = section.icon;
                                // Resolve title from translations if possible, else use literal
                                const title = section.title.startsWith('nav.')
                                    ? (t.nav as any)[section.title.split('.')[1]]
                                    : section.title;

                                return (
                                    <motion.button
                                        key={section.id}
                                        onClick={() => handleSectionClick(section.id, section.target)}
                                        className="group relative flex items-center justify-between w-64 px-6 py-4 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-100 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-cyan-950/60 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] backdrop-blur-md transition-all overflow-hidden"
                                        variants={{
                                            open: { opacity: 1, y: 0, scale: 1 },
                                            closed: { opacity: 0, y: 20, scale: 0.9 }
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Hover Gradient Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                                        <span className="text-sm font-mono tracking-widest uppercase font-bold z-10">
                                            {title}
                                        </span>
                                        <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors z-10">
                                            <Icon size={20} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
