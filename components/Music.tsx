"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { ExternalLink, Music as MusicIcon, Disc, Mic2, Radio } from "lucide-react";

export function Music() {
    const { t } = useLanguage();
    const { setExpandedSection } = useFloatingSection();

    // List of reusable colors for the palette
    const palette = [
        { text: "text-amber-400", border: "border-amber-400/50", glow: "shadow-[0_0_15px_rgba(251,191,36,0.4)]", bgHover: "hover:bg-amber-400/10", corner: "from-amber-500/20" },
        { text: "text-red-500", border: "border-red-500/50", glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]", bgHover: "hover:bg-red-500/10", corner: "from-red-500/20" },
        { text: "text-purple-500", border: "border-purple-500/50", glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]", bgHover: "hover:bg-purple-500/10", corner: "from-purple-500/20" },
        { text: "text-cyan-400", border: "border-cyan-400/50", glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]", bgHover: "hover:bg-cyan-400/10", corner: "from-cyan-500/20" },
        { text: "text-green-500", border: "border-green-500/50", glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]", bgHover: "hover:bg-green-500/10", corner: "from-green-500/20" },
        { text: "text-blue-500", border: "border-blue-500/50", glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]", bgHover: "hover:bg-blue-500/10", corner: "from-blue-500/20" },
        { text: "text-pink-500", border: "border-pink-500/50", glow: "shadow-[0_0_15px_rgba(236,72,153,0.4)]", bgHover: "hover:bg-pink-500/10", corner: "from-pink-500/20" },
    ];

    const icons = [Mic2, Disc, Radio, MusicIcon];

    interface DisplayArtist {
        name: string;
        genre: string;
        description: string;
        icon: typeof MusicIcon;
        color: string;
        borderColor: string;
        glow: string;
        bgHover: string;
        corner: string;
    }

    const [randomizedArtists, setRandomizedArtists] = useState<DisplayArtist[]>([]);

    useEffect(() => {
        const musicItems = (t as any).music?.items || [];

        // Shuffle and map with colors/icons
        const shuffled = [...musicItems]
            .sort(() => Math.random() - 0.5)
            .map((item: any, index: number) => {
                const style = palette[index % palette.length];
                return {
                    ...item,
                    icon: icons[index % icons.length],
                    color: style.text,
                    borderColor: style.border,
                    glow: style.glow,
                    bgHover: style.bgHover,
                    corner: style.corner
                };
            });

        setRandomizedArtists(shuffled);
    }, [t]);

    return (
        <div className="space-y-12 pb-12 pt-20">
            {/* Header Section */}
            <div className="relative border-l-2 border-cyan-500 pl-6 py-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">
                    {(t as any).music?.sectionTitle || "QUALCHE ARTISTA CHE ASCOLTO"}
                </h3>
            </div>

            {/* Artists Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {randomizedArtists.map((artist, index) => (
                    <div
                        key={index}
                        className={`group relative overflow-hidden rounded-lg bg-black/40 border ${artist.borderColor} p-6 transition-all duration-500 ${artist.bgHover} hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-default`}
                    >
                        {/* Background Scanline Effect */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />

                        <div className="relative z-10 flex flex-col gap-4">
                            {/* Icon & Title Row */}
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-black/60 border border-white/10 ${artist.color} ${artist.glow}`}>
                                    <artist.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold ${artist.color} uppercase tracking-wider`}>
                                        {artist.name}
                                    </h4>
                                    <div className="inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white/5 rounded border border-white/10 text-gray-400 uppercase tracking-tighter">
                                        {artist.genre}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-xs leading-relaxed font-light line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                {artist.description}
                            </p>
                        </div>

                        {/* Corner Accent Glow */}
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${artist.corner} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                ))}
            </div>



            {/* CTA - Link to Contact */}
            <div className="mt-8 flex justify-center opacity-0 animate-[fadeIn_0.5s_ease-in_1s_forwards]">
                <button
                    onClick={() => {
                        setExpandedSection('contact');
                    }}
                    className="group relative px-12 py-4 bg-black/60 border border-cyan-500/30 overflow-hidden transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                    {/* Hover Fill Effect */}
                    <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                    {/* Glitch Lines */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 -translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear]" />
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cyan-400/50 translate-x-full group-hover:animate-[glitch-slide_1s_infinite_linear_reverse]" />

                    <div className="relative z-10 flex items-center gap-3">
                        <span className="font-mono font-bold text-cyan-400 tracking-widest group-hover:text-cyan-200 transition-colors">
                            {t.contact.labelCTA}
                        </span>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes glitch-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
