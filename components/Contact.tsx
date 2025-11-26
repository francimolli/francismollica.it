"use client";

import { useLanguage } from "@/lib/language-context";
import { Mail, Send, MapPin, Linkedin, Github, Terminal, Wifi, Phone, Instagram, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Contact() {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const email = "francesco.mollica@outlook.com";

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section
            id="contact"
            className="relative w-full min-h-screen py-12 md:py-20 bg-black overflow-x-hidden font-mono flex flex-col justify-center"
        >
            {/* --- SFONDO & GRID --- */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black" />
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

            <div className="container relative z-10 px-4 md:px-6 max-w-4xl">

                {/* --- HEADER --- */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/50 text-cyan-400 text-xs mb-4 animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        {t.contact.openForOpportunities || "OPEN FOR OPPORTUNITIES"}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {t.contact.lets || "Let's"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">{t.contact.initialize || "Initialize"}</span>
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        {t.contact.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                    {/* --- LEFT COLUMN: DIRECT CONTACT (Primary) --- */}
                    <div className="flex flex-col gap-4">
                        <div className="text-xs text-cyan-600 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                            <Terminal className="w-4 h-4" />
                            {t.contact.directUplink}
                        </div>

                        {/* EMAIL - BIG CARD (Copy functionality) */}
                        <button
                            onClick={handleCopyEmail}
                            className="w-full group relative flex items-center justify-between p-6 bg-gradient-to-br from-gray-900 to-black border border-cyan-900/50 hover:border-cyan-500 transition-all duration-300 rounded-lg overflow-hidden text-left"
                        >
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-cyan-950/50 rounded-md border border-cyan-800 text-cyan-400 group-hover:text-white group-hover:bg-cyan-600 group-hover:border-cyan-400 transition-colors">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 group-hover:text-cyan-400 mb-1">{t.contact.primaryEmail}</span>
                                    <span className="block text-xs font-bold text-white tracking-wide break-all">
                                        francesco.mollica@outlook.com
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10 text-gray-500 group-hover:text-cyan-400 transition-colors">
                                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            </div>
                        </button>

                        {/* TELEGRAM - FAST ACTION */}
                        <Link
                            href="https://t.me/franklyn"
                            target="_blank"
                            className="w-full group flex items-center justify-between p-6 bg-gray-900/50 border border-gray-800 hover:border-[#0088cc] transition-all duration-300 rounded-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700 text-gray-400 group-hover:text-white group-hover:bg-[#0088cc] group-hover:border-[#0088cc] transition-colors">
                                    <Send className="w-6 h-6 -rotate-45 translate-x-0.5" />
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 group-hover:text-[#0088cc] mb-1">{t.contact.instantMessaging}</span>
                                    <span className="block text-lg font-bold text-white">Telegram</span>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </Link>

                        {/* PHONE */}
                        <a
                            href="tel:+393271852718"
                            className="w-full flex items-center gap-4 p-4 rounded-lg border border-transparent hover:bg-white/5 transition-colors group"
                        >
                            <Phone className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                            <span className="text-gray-400 group-hover:text-white font-mono text-sm">+39 327 185 2718</span>
                        </a>
                    </div>


                    {/* --- RIGHT COLUMN: SOCIAL GRID & LOCATION --- */}
                    <div className="flex flex-col h-full gap-4">
                        <div className="text-xs text-cyan-600 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                            <Wifi className="w-4 h-4" />
                            {t.contact.publicNodes}
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            {/* LINKEDIN */}
                            <Link
                                href="https://linkedin.com/in/francesco-mollica"
                                target="_blank"
                                className="group flex flex-col items-center justify-center p-6 bg-gray-900/30 border border-gray-800 hover:border-[#0a66c2] hover:bg-[#0a66c2]/10 rounded-lg transition-all"
                            >
                                <Linkedin className="w-8 h-8 text-gray-400 group-hover:text-[#0a66c2] mb-3 transition-colors" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">LinkedIn</span>
                            </Link>

                            {/* GITHUB */}
                            <Link
                                href="https://github.com/francimolli"
                                target="_blank"
                                className="group flex flex-col items-center justify-center p-6 bg-gray-900/30 border border-gray-800 hover:border-purple-500 hover:bg-purple-500/10 rounded-lg transition-all"
                            >
                                <Github className="w-8 h-8 text-gray-400 group-hover:text-purple-400 mb-3 transition-colors" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">GitHub</span>
                            </Link>

                            {/* INSTAGRAM */}
                            <Link
                                href="https://instagram.com/franci_molli"
                                target="_blank"
                                className="group col-span-2 flex items-center justify-between px-6 py-4 bg-gray-900/30 border border-gray-800 hover:border-pink-500 hover:bg-pink-500/10 rounded-lg transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">{t.contact.followUpdates}</span>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">@franci_molli</span>
                            </Link>
                        </div>

                        {/* LOCATION BADGE */}
                        <div className="mt-auto pt-6 flex items-center justify-center md:justify-end gap-2 text-xs text-gray-500 font-mono">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <MapPin className="w-3 h-3" />
                            {t.contact.location}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}