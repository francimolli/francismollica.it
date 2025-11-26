"use client";

import { useLanguage } from "@/lib/language-context";
import { useFloatingSection } from "@/components/FloatingSectionContext";
import { ExternalLink, Music as MusicIcon, Disc, Mic2, Radio } from "lucide-react";

export function Music() {
    const { t } = useLanguage();
    const { setExpandedSection } = useFloatingSection();

    const artists = [
        {
            name: "Caparezza",
            genre: "Alternative Hip Hop / Rock",
            description: "A visionary Italian rapper known for his intellectual lyrics, social commentary, and eclectic musical style. His concept albums are masterpieces of storytelling.",
            icon: Mic2,
            color: "text-yellow-400",
            borderColor: "border-yellow-400/50",
            bgHover: "hover:bg-yellow-400/10",
            link: "https://www.caparezza.com/"
        },
        {
            name: "Bassi Maestro",
            genre: "Hip Hop / Lo-Fi",
            description: "A legend of Italian Hip Hop. Rapper, DJ, and producer who has shaped the sound of the underground scene for decades. Now also exploring Lo-Fi beats as North of Loreto.",
            icon: Disc,
            color: "text-red-500",
            borderColor: "border-red-500/50",
            bgHover: "hover:bg-red-500/10",
            link: "https://downwithbassi.com/"
        },
        {
            name: "System of a Down",
            genre: "Alternative Metal",
            description: "The Armenian-American band that redefined metal. Known for their chaotic energy, political lyrics, and unique blend of heavy riffs with traditional melodies.",
            icon: Radio,
            color: "text-purple-500",
            borderColor: "border-purple-500/50",
            bgHover: "hover:bg-purple-500/10",
            link: "https://systemofadown.com/"
        }
    ];

    return (
        <div className="space-y-12 pb-12 pt-20">
            {/* Header Section */}
            <div className="relative border-l-2 border-cyan-500 pl-6 py-2">
                <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">
                    QUALCHE ARTISTA CHE ASCOLTO
                </h3>
            </div>

            {/* Artists Grid */}
            <div className="grid gap-8 md:grid-cols-1">
                {artists.map((artist, index) => (
                    <a
                        key={index}
                        href={artist.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative overflow-hidden rounded-lg bg-black/40 border ${artist.borderColor} p-6 transition-all duration-300 ${artist.bgHover} hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
                    >
                        {/* Background Scanline Effect */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.2)_2px,rgba(0,0,0,0.2)_4px)] pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Icon/Avatar Container */}
                            <div className={`p-4 rounded-full bg-black/60 border border-white/10 ${artist.color} shadow-[0_0_15px_currentColor]`}>
                                <artist.icon className="w-8 h-8" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-xl font-bold ${artist.color} uppercase tracking-wider`}>
                                        {artist.name}
                                    </h4>
                                    <ExternalLink className={`w-4 h-4 ${artist.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                </div>

                                <div className="inline-block px-2 py-1 text-[10px] font-mono bg-white/5 rounded border border-white/10 text-gray-400 uppercase">
                                    {artist.genre}
                                </div>

                                <p className="text-gray-300 text-sm leading-relaxed font-light">
                                    {artist.description}
                                </p>
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-${artist.color.split('-')[1]}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </a>
                ))}
            </div>



            {/* CTA - Link to Contact */}
            <div className="mt-8 flex justify-center opacity-0 animate-[fadeIn_0.5s_ease-in_1s_forwards]">
                <button
                    onClick={() => setExpandedSection('contact')}
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
