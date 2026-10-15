"use client";

import { ReactNode } from "react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { Home, User, Briefcase, Mail, LucideIcon, Headphones, Book, TrendingUp, Map } from "lucide-react";

const idIconMap: Record<string, LucideIcon> = {
    "home": Home,
    "about": User,
    "timeline": Briefcase,
    "projects": Briefcase,
    "portfolio": Book,
    "contact": Mail,
    "music": Headphones,
    "market": TrendingUp,
    "roadmap": Map,
};

// Pastelli del design system (design-system/universo-cartoon/MASTER.md),
// allineati alle palette dei pianetini.
const idColorMap: Record<string, string> = {
    "home": "#ffd98a",      // giallo caldo
    "about": "#ffb59a",     // pesca (Casa)
    "timeline": "#ffd98a",  // giallo caldo (Officina)
    "projects": "#ffd98a",
    "portfolio": "#c9b6f5", // lilla (Galleria)
    "contact": "#9ad1f5",   // cielo (Faro)
    "music": "#9fe8c7",     // menta (Giardino Sonoro)
    "market": "#9ad1f5",    // cielo (Osservatorio)
    "roadmap": "#ffaa66",   // arancio (Cantiere)
};

const sectionCoords: Record<string, { x: number, z: number }> = {
    "about": { x: 0, z: -200 },
    "timeline": { x: 200, z: 0 },
    "projects": { x: 200, z: 0 },
    "portfolio": { x: -250, z: -150 },
    "contact": { x: -200, z: 0 },
    "music": { x: 0, z: 200 },
    "market": { x: 250, z: 150 },
    "roadmap": { x: -250, z: 150 },
};

export default function SectionCard({
    children,
    title,
    id,
    icon: CustomIcon,
    className,
}: {
    children: ReactNode;
    title?: string;
    id: string;
    icon?: LucideIcon;
    className?: string;
}) {
    const { expandedSection, setExpandedSection } = useFloatingSection();
    const { flyTo } = useCityControls();
    const isExpanded = expandedSection === id;

    const Icon = CustomIcon || idIconMap[id] || Home;
    const themeColor = idColorMap[id] || "#00ffff";

    const handleClick = () => {
        setExpandedSection(null);
        // Catapult Effect: Up and Away (towards center) to avoid re-trigger loop
        const coords = sectionCoords[id];
        if (coords) {
            flyTo(coords.x * 0.6, coords.z * 0.6, 250);
        }
    };

    // --- MODALE ESPANSO ---
    if (isExpanded) {
        return (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto"
                onClick={handleClick}
            >
                <div
                    className={`flex flex-col w-full max-w-5xl max-h-[90vh] rounded-3xl border-2 bg-u-deep/95 backdrop-blur-md animate-in zoom-in-95 duration-300 pointer-events-auto overflow-hidden ${className || ""}`}
                    style={{ borderColor: `${themeColor}55`, boxShadow: `0 0 50px ${themeColor}2e, inset 0 1px 0 ${themeColor}22` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed at top of flex container */}
                    <div className="flex-none z-10 flex items-center justify-between border-b border-white/10 p-6 bg-u-surface/80 backdrop-blur-xl">
                        {title && (
                            <h2 className="text-3xl font-heading font-extrabold flex items-center gap-3" style={{ color: themeColor, textShadow: `0 0 14px ${themeColor}55` }}>
                                <Icon className="w-8 h-8" />
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={handleClick}
                            className="clay-press ml-auto hover:text-white transition-colors p-4 -mr-2 rounded-2xl hover:bg-white/10"
                            style={{ color: themeColor }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 text-white" style={{ color: `${themeColor}dd` }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // If not expanded, render nothing (controlled by LogbookMenu)
    return null;
}