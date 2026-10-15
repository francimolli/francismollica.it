"use client";

import { useRef, useState } from "react";
import { Orbit, Clapperboard, type LucideIcon } from "lucide-react";
import { useUniverseColor, type ColorMode } from "./UniverseColorContext";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";

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
    const { language } = useLanguage();
    const t = translations[language] as (typeof translations)["it"];
    // Su mobile lo switch è solo icone: al passaggio in Tour un toast
    // dice a voce alta cosa è appena successo.
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMode = (id: ColorMode) => {
        setMode(id);
        if (id === "random" && window.matchMedia("(pointer: coarse)").matches) {
            setToast(t.universe?.tourToast ?? "Tour ✦");
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), 2600);
        }
    };

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
                        onClick={() => handleMode(id)}
                        aria-pressed={mode === id}
                        aria-label={`${label} visual mode`}
                        className={`clay-press flex items-center gap-2 px-2.5 py-2.5 md:px-3 md:py-2 rounded-xl text-[11px] font-heading font-bold tracking-wide border-2 transition-all duration-200 ${mode === id ? active : idle}`}
                    >
                        <Icon size={12} aria-hidden="true" />
                        <span className="md:inline hidden">{label}</span>
                    </button>
                ))}
            </div>

            {/* toast di conferma (mobile): sei in modalità Tour */}
            {toast && (
                <div
                    role="status"
                    className="fixed left-1/2 top-1/2 z-[120] -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300 rounded-2xl border-2 border-u-sun/50 bg-u-surface/95 px-6 py-3 font-heading text-sm font-extrabold uppercase tracking-[0.15em] text-u-sun shadow-[0_0_30px_rgba(255,217,138,0.3)] backdrop-blur-md whitespace-nowrap"
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
