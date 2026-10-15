"use client";

import { Orbit, Clapperboard, type LucideIcon } from "lucide-react";
import { useUniverseColor, type ColorMode } from "./UniverseColorContext";

// Nell'universo cartoon VISUALE è la regia della camera:
// Libera = orbiti e voli tu · Tour = la camera visita i pianetini da sola.
const MODES: { id: ColorMode; label: string; Icon: LucideIcon; active: string; idle: string }[] = [
    {
        id: "normal",
        label: "Libera",
        Icon: Orbit,
        active: "bg-u-mint/25 text-u-mint border-u-mint/50",
        idle: "text-u-mint/50 border-transparent hover:text-u-mint hover:bg-u-mint/10",
    },
    // {
    //     id: "inverted",
    //     label: "Inverted",
    //     Icon: Moon,
    //     active: "bg-indigo-700/70 text-indigo-100 border-indigo-400/50",
    //     idle: "text-indigo-400/50 border-transparent hover:text-indigo-300 hover:bg-indigo-500/10",
    // },
    {
        id: "random",
        label: "Tour",
        Icon: Clapperboard,
        active: "bg-u-sun/25 text-u-sun border-u-sun/50",
        idle: "text-u-sun/50 border-transparent hover:text-u-sun hover:bg-u-sun/10",
    },
];

export function VisualModeSwitch() {
    const { mode, setMode } = useUniverseColor();

    return (
        <div
            data-hud
            className="fixed md:bottom-8 md:right-6 md:top-auto top-[180px] right-8 z-[90] pointer-events-auto"
            role="group"
            aria-label="Visual mode selector"
        >
            <div className="flex flex-row md:flex-col gap-1 bg-u-surface/80 backdrop-blur-md border-2 border-u-lilac/20 rounded-2xl p-2 shadow-[0_4px_24px_rgba(10,10,35,0.4)]">
                <span className="text-[8px] font-heading font-bold text-u-lime/60 uppercase tracking-[0.2em] text-center px-1 pb-0.5 md:block hidden">
                    VISUALE
                </span>
                {MODES.map(({ id, label, Icon, active, idle }) => (
                    <button
                        key={id}
                        onClick={() => setMode(id)}
                        aria-pressed={mode === id}
                        aria-label={`${label} visual mode`}
                        className={`clay-press flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-2 rounded-xl text-[11px] font-heading font-bold tracking-wide border-2 transition-all duration-200 ${mode === id ? active : idle}`}
                    >
                        <Icon size={12} aria-hidden="true" />
                        <span className="md:inline hidden">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
