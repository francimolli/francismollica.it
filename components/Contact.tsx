"use client";

import { useLanguage } from "@/lib/language-context";
import { Mail, Send, MapPin, Linkedin, Github, Terminal, Wifi, Phone, Instagram, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

export function Contact() {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    // Obfuscation: Split email and phone to prevent simple crawler scraping
    const contactData = useMemo(() => {
        const emailParts = {
            user: "francesco.mollica",
            domain: "outlook",
            tld: "com"
        };
        const phoneParts = {
            country: "+39",
            prefix: "327",
            first: "185",
            second: "2718"
        };

        const fullEmail = `${emailParts.user}@${emailParts.domain}.${emailParts.tld}`;
        const fullPhone = `${phoneParts.country} ${phoneParts.prefix} ${phoneParts.first} ${phoneParts.second}`;
        const dialPhone = `${phoneParts.country}${phoneParts.prefix}${phoneParts.first}${phoneParts.second}`;

        return { fullEmail, fullPhone, dialPhone };
    }, []);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(contactData.fullEmail);
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

                <div className="max-w-3xl mx-auto bg-gray-900/20 border border-white/5 p-4 md:p-8 rounded-2xl backdrop-blur-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* --- LEFT COLUMN: DIRECT CONTACT --- */}
                        <div className="space-y-6">
                            <div className="text-xs text-cyan-600 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4" />
                                {t.contact.directUplink}
                            </div>

                            <div className="space-y-4">
                                {/* EMAIL */}
                                <button
                                    onClick={handleCopyEmail}
                                    className="w-full group relative flex items-center justify-between p-4 bg-black/40 border border-cyan-900/30 hover:border-cyan-500 transition-all duration-300 rounded-xl overflow-hidden text-left"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="p-2.5 bg-cyan-950/50 rounded-lg border border-cyan-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-500 uppercase tracking-tighter mb-0.5">{t.contact.primaryEmail}</span>
                                            <span className="block text-xs font-bold text-white tracking-wide">{contactData.fullEmail}</span>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-gray-600 group-hover:text-cyan-400 transition-colors">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </div>
                                </button>

                                {/* TELEGRAM */}
                                <Link
                                    href="https://t.me/franklyn"
                                    target="_blank"
                                    className="w-full group flex items-center justify-between p-4 bg-black/40 border border-white/5 hover:border-[#0088cc] transition-all duration-300 rounded-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 group-hover:bg-[#0088cc] group-hover:text-white transition-colors">
                                            <Send className="w-5 h-5 -rotate-45 translate-x-0.5" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-500 uppercase tracking-tighter mb-0.5">{t.contact.instantMessaging}</span>
                                            <span className="block text-sm font-bold text-white tracking-widest">TELEGRAM</span>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                                </Link>

                                {/* PHONE */}
                                <a
                                    href={`tel:${contactData.dialPhone}`}
                                    className="flex items-center gap-3 px-4 py-2 text-xs text-gray-500 hover:text-cyan-400 transition-colors group w-fit"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span className="font-mono">{contactData.fullPhone}</span>
                                </a>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: SOCIALS & SYSTEM --- */}
                        <div className="flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="text-xs text-cyan-600 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                    <Wifi className="w-4 h-4" />
                                    {t.contact.publicNodes}
                                </div>

                                {/* GITHUB CARD */}
                                <Link
                                    href="https://github.com/francimolli"
                                    target="_blank"
                                    className="group flex items-center gap-4 p-5 bg-black/60 border border-white/5 hover:border-purple-500 hover:bg-purple-500/5 rounded-xl transition-all"
                                >
                                    <div className="p-3 bg-gray-900 rounded-lg border border-white/5 group-hover:border-purple-500 transition-all text-gray-500 group-hover:text-purple-400">
                                        <Github className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-white tracking-widest group-hover:text-purple-300 font-mono">GITHUB</span>
                                        <span className="text-[10px] text-gray-500">github.com/francimolli</span>
                                    </div>
                                </Link>
                            </div>

                            {/* LOCATION INFO */}
                            <div className="mt-12 flex items-center justify-end gap-3 text-[10px] text-gray-500 font-mono uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full border border-white/5 w-fit ml-auto">
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span>{(t as any).contact.systemStatus}</span>
                                </div>
                                <span className="text-gray-700">|</span>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-cyan-500/50" />
                                    {t.contact.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
