"use client";

import { useLanguage } from "@/lib/language-context";
import { ExternalLink, Music as MusicIcon, Disc, Mic2, Radio } from "lucide-react";
import Image from "next/image";

export function Music() {
    const { t } = useLanguage();

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
                    Audio_Input_Stream
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

            {/* Footer Status */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-600/50 border-t border-cyan-900/30 pt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>AUDIO_DRIVER: ONLINE // BITRATE: 320KBPS</span>
            </div>
        </div>
    );
}
