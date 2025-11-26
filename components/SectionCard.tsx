"use client";

import { ReactNode } from "react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { Home, User, Briefcase, Mail, LucideIcon, Headphones } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    "Home": Home,
    "Who am I?": User,
    "Projects": Briefcase,
    "Contact": Mail,
    "Music": Headphones,
};

const colorMap: Record<string, string> = {
    "Home": "#00ffff",      // Cyan (Default/Active)
    "Who am I?": "#ff00ff", // Magenta (North Artifact)
    "Projects": "#ffaa00",  // Orange (East Artifact)
    "Contact": "#00aaff",   // Light Blue (West Artifact)
    "Music": "#00ffff",     // Cyan (South Artifact)
};

const sectionCoords: Record<string, { x: number, z: number }> = {
    "about": { x: 0, z: -200 },
    "projects": { x: 200, z: 0 },
    "contact": { x: -200, z: 0 },
    "music": { x: 0, z: 200 },
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

    const Icon = CustomIcon || (title && iconMap[title]) || Home;

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
                    className={`flex flex-col w-full max-w-5xl max-h-[90vh] rounded-xl border border-cyan-500/50 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-in zoom-in-95 duration-300 pointer-events-auto overflow-hidden ${className || ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Fixed at top of flex container */}
                    <div className="flex-none z-10 flex items-center justify-between border-b border-white/10 p-6 bg-black/95 backdrop-blur-xl">
                        {title && (
                            <h2 className="text-3xl font-bold drop-shadow-[0_0_10px_rgba(0,255,255,0.6)] flex items-center gap-3" style={{ color: colorMap[title] || "#00ffff" }}>
                                <Icon className="w-8 h-8" />
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={handleClick}
                            className="ml-auto hover:text-white transition-colors p-4 -mr-2 rounded-lg hover:bg-white/10"
                            style={{ color: (title && colorMap[title]) || "#00ffff" }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 text-white" style={{ color: (title && colorMap[title]) ? `${colorMap[title]}dd` : 'rgba(255,255,255,0.9)' }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // If not expanded, render nothing (controlled by LogbookMenu)
    return null;
}