"use client";

import { Sun, Moon, Shuffle, type LucideIcon } from "lucide-react";
import { useUniverseColor, type ColorMode } from "./UniverseColorContext";

const MODES: { id: ColorMode; label: string; Icon: LucideIcon; active: string; idle: string }[] = [
    {
        id: "normal",
        label: "Natural",
        Icon: Sun,
        active: "bg-emerald-700/70 text-emerald-100 border-emerald-400/50",
        idle: "text-emerald-400/50 border-transparent hover:text-emerald-300 hover:bg-emerald-500/10",
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
        label: "Random",
        Icon: Shuffle,
        active: "bg-amber-700/70 text-amber-100 border-amber-400/50",
        idle: "text-amber-400/50 border-transparent hover:text-amber-300 hover:bg-amber-500/10",
    },
];

export function VisualModeSwitch() {
    const { mode, setMode } = useUniverseColor();

    return (
        <div
            className="fixed md:bottom-8 md:right-6 md:top-auto top-[180px] right-8 z-[90] pointer-events-auto"
            role="group"
            aria-label="Visual mode selector"
        >
            <div className="flex flex-row md:flex-col gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <span className="text-[8px] font-mono text-white/25 uppercase tracking-[0.2em] text-center px-1 pb-0.5 md:block hidden">
                    VISUALE
                </span>
                {MODES.map(({ id, label, Icon, active, idle }) => (
                    <button
                        key={id}
                        onClick={() => setMode(id)}
                        aria-pressed={mode === id}
                        aria-label={`${label} visual mode`}
                        className={`flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-2 rounded-xl text-[11px] font-mono font-semibold tracking-wide border transition-all duration-200 ${mode === id ? active : idle}`}
                    >
                        <Icon size={12} aria-hidden="true" />
                        <span className="md:inline hidden">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
