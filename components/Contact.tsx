"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Mail, Send, MapPin, Linkedin, Github, Terminal, Wifi } from "lucide-react";
import Link from "next/link";

export function Contact() {
    const { t } = useLanguage();
    const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');

    // Simulazione invio form per effetto visivo
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('sending');
        setTimeout(() => setFormState('sent'), 1500);
        setTimeout(() => setFormState('idle'), 4000);
    };

    return (
        <section id="contact" className="relative w-full min-h-screen py-20 bg-black overflow-hidden font-mono flex items-center justify-center">

            {/* --- SFONDO & EFFETTI AMBIENTALI --- */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(6,182,212,0.1)_2px,rgba(6,182,212,0.1)_4px)]" />
            </div>
            {/* Glow viola/ciano sul fondo */}
            <div className="absolute bottom-0 right-0 z-0 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-6 md:px-8 max-w-5xl">

                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 mb-12 border-b border-cyan-900/50 pb-4">
                    <Terminal className="w-6 h-6 text-cyan-500" />
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            {t.contact?.sectionTitle || "Establish_Uplink"}
                        </h2>
                        <span className="text-xs text-cyan-600 uppercase tracking-widest">
                            Secure Connection // Protocol v.4.0
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-20">

                    {/* --- COLONNA SX: INFO CONTATTI --- */}
                    <div className="space-y-8 order-2 md:order-1">

                        {/* Status Box */}
                        <div className="bg-cyan-950/10 border border-cyan-900/50 p-6 rounded-sm relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                <span className="text-[10px] text-cyan-400 animate-pulse">LIVE</span>
                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" />
                            </div>

                            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Wifi className="w-4 h-4" />
                                Channel Frequency
                            </h3>

                            <div className="space-y-6">
                                {/* Email Item */}
                                <div className="group/item">
                                    <label className="text-[10px] text-cyan-700 uppercase block mb-1">Direct Message Protocol</label>
                                    <a href="mailto:tuo@email.com" className="flex items-center gap-3 text-cyan-100 hover:text-cyan-300 transition-colors">
                                        <div className="p-2 bg-cyan-900/20 border border-cyan-800 rounded-sm group-hover/item:border-cyan-400 group-hover/item:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm md:text-base">francesco@mollica.dev</span>
                                    </a>
                                </div>

                                {/* Location Item */}
                                <div className="group/item">
                                    <label className="text-[10px] text-cyan-700 uppercase block mb-1">Physical Node</label>
                                    <div className="flex items-center gap-3 text-cyan-100/70">
                                        <div className="p-2 bg-cyan-900/20 border border-cyan-800 rounded-sm">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm">Italy, Remote Available</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Terminal */}
                        <div className="space-y-3">
                            <p className="text-xs text-cyan-600 font-mono mb-2">{">"} find_user_on_network:</p>
                            <div className="flex gap-4">
                                <Link
                                    href="https://linkedin.com/in/francesco-mollica"
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-black border border-cyan-800 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all rounded-sm text-xs uppercase tracking-wider"
                                >
                                    <Linkedin className="w-3 h-3" />
                                    <span>LinkedIn</span>
                                </Link>
                                <Link
                                    href="https://github.com/francimolli"
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-black border border-cyan-800 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all rounded-sm text-xs uppercase tracking-wider"
                                >
                                    <Github className="w-3 h-3" />
                                    <span>GitHub</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- COLONNA DX: FORM --- */}
                    <div className="order-1 md:order-2">
                        <div className="relative p-1 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-lg">
                            <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md border border-cyan-900/50 p-6 md:p-8 rounded-lg relative overflow-hidden">

                                {/* Form Header Decoration */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                                <div className="space-y-6">
                                    {/* Name Input */}
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest text-cyan-600 mb-2 block group-focus-within:text-cyan-400 transition-colors">
                                            {">"} Input_Identity
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            className="w-full bg-cyan-950/10 border-b border-cyan-800 text-cyan-100 p-3 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/20 transition-all font-mono text-sm"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest text-cyan-600 mb-2 block group-focus-within:text-cyan-400 transition-colors">
                                            {">"} Reply_Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="name@domain.com"
                                            required
                                            className="w-full bg-cyan-950/10 border-b border-cyan-800 text-cyan-100 p-3 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/20 transition-all font-mono text-sm"
                                        />
                                    </div>

                                    {/* Message Input */}
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest text-cyan-600 mb-2 block group-focus-within:text-cyan-400 transition-colors">
                                            {">"} Data_Payload
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="Write your message here..."
                                            required
                                            className="w-full bg-cyan-950/10 border-b border-cyan-800 text-cyan-100 p-3 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/20 transition-all font-mono text-sm resize-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={formState !== 'idle'}
                                        className="relative w-full group overflow-hidden mt-4"
                                    >
                                        <div className={`
                                            relative z-10 flex items-center justify-center gap-2 py-4 px-6 
                                            bg-cyan-900/20 border border-cyan-500/50 
                                            text-cyan-400 font-bold uppercase tracking-widest text-xs
                                            transition-all duration-300
                                            group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400
                                            ${formState !== 'idle' ? 'opacity-50 cursor-wait' : ''}
                                        `}>
                                            {formState === 'idle' && (
                                                <>
                                                    <span>Initialize_Transmission</span>
                                                    <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                            {formState === 'sending' && (
                                                <span className="animate-pulse">TRANSMITTING DATA...</span>
                                            )}
                                            {formState === 'sent' && (
                                                <span className="text-green-400">UPLOAD COMPLETE</span>
                                            )}
                                        </div>

                                        {/* Button Progress Bar Effect (optional) */}
                                        {formState === 'sending' && (
                                            <div className="absolute inset-0 bg-cyan-500/20 z-0 animate-[progress_1.5s_ease-in-out_forwards]" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </section>
    );
}