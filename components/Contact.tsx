"use client";

import { useLanguage } from "@/lib/language-context";
import {
    Mail, Send, MapPin, Linkedin, Github,
    Terminal, Phone, Instagram, Copy,
    Check, ExternalLink, MessageSquare,
    Globe, ShieldCheck, Cpu
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Footer } from "./Footer";


export function Contact() {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState(false);

    // Obfuscation: Split email and phone to prevent simple crawler scraping
    const contactData = useMemo(() => {
        const emailParts = {
            user: "francescomollicat",
            domain: "gmail",
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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section
            id="contact"
            className="relative w-full py-12 md:py-24 bg-transparent font-mono"
        >
            {/* --- BACKGROUND DECORATION --- */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="container relative z-10 px-4 md:px-6 max-w-5xl mx-auto">

                {/* --- HEADER SECTION --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase mb-4 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        {t.contact.openForOpportunities || "SYSTEM ONLINE"}
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                        {t.contact.lets || "Let's"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">{t.contact.initialize || "Initialize"}</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {t.contact.description || "Pronto a collaborare su progetti innovativi. Scegli il canale che preferisci."}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                    {/* --- MAIN CONTACT MODULE (Left/Center) --- */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-8 space-y-6"
                    >
                        {/* EMAIL CARD */}
                        <div className="group relative bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 shadow-2xl">
                            {/* Decorative Grid Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                            <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] text-cyan-500 font-bold tracking-[0.3em] uppercase">{t.contact.primaryEmail || "PRIMARY UPLINK"}</h3>
                                            <p className="text-xl md:text-2xl font-bold text-white tracking-tight break-all font-mono">
                                                {contactData.fullEmail}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={handleCopyEmail}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95 group/btn"
                                        >
                                            <AnimatePresence mode="wait">
                                                {copied ? (
                                                    <motion.span
                                                        key="check"
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="flex items-center gap-2 text-green-400"
                                                    >
                                                        <Check className="w-4 h-4" /> {t.logbook.copied || "COPIED"}
                                                    </motion.span>
                                                ) : (
                                                    <motion.span
                                                        key="copy"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Copy className="w-4 h-4 group-hover/btn:text-cyan-400" /> {language === 'it' ? 'Copia Email' : 'Copy Email'}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </button>

                                        <a
                                            href={`mailto:${contactData.fullEmail}`}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                                        >
                                            <Send className="w-4 h-4" /> {language === 'it' ? 'Invia Messaggio' : 'Send Message'}
                                        </a>
                                    </div>
                                </div>

                                <div className="hidden lg:block w-32 h-32 md:w-40 md:h-40 shrink-0 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <div className="w-full h-full border-4 border-dashed border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                                        <Cpu className="w-12 h-12 text-cyan-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECONDARY CHANNELS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* TELEGRAM */}
                            <Link
                                href="https://t.me/franklyn"
                                target="_blank"
                                className="group p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl hover:border-[#0088cc]/50 transition-all flex items-center gap-4"
                            >
                                <div className="p-3 bg-[#0088cc]/10 rounded-xl text-[#0088cc] group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Telegram</span>
                                    <span className="block text-sm font-bold text-white tracking-widest uppercase">@franklyn</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                            </Link>

                            {/* PHONE */}
                            <a
                                href={`tel:${contactData.dialPhone}`}
                                className="group p-5 bg-[#0a0a0c] border border-white/5 rounded-2xl hover:border-green-500/50 transition-all flex items-center gap-4"
                            >
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">{language === 'it' ? 'Telefono' : 'Phone'}</span>
                                    <span className="block text-sm font-bold text-white tracking-widest font-mono italic">{contactData.fullPhone}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </motion.div>

                    {/* --- SIDE MODULE: SOCIALS & STATS (Right) --- */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-4 space-y-6"
                    >
                        {/* SOCIALS BOX */}
                        <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 space-y-6">
                            <h3 className="text-xs text-cyan-600 font-black tracking-[0.3em] uppercase flex items-center gap-2">
                                <Globe className="w-4 h-4" /> {t.contact.publicNodes || "EXTERNAL ARTEFACTS"}
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="https://github.com/francimolli"
                                    target="_blank"
                                    className="group flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-purple-500/50 transition-all"
                                >
                                    <Github className="w-6 h-6 mb-2 text-gray-400 group-hover:text-white" />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white tracking-widest">GITHUB</span>
                                </Link>
                                <Link
                                    href="https://linkedin.com/in/"
                                    target="_blank"
                                    className="group flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-blue-500/50 transition-all"
                                >
                                    <Linkedin className="w-6 h-6 mb-2 text-gray-400 group-hover:text-white" />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white tracking-widest">LINKEDIN</span>
                                </Link>
                                <Link
                                    href="https://instagram.com/franci_molli"
                                    target="_blank"
                                    className="group flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-pink-500/50 transition-all"
                                >
                                    <Instagram className="w-6 h-6 mb-2 text-gray-400 group-hover:text-white" />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white tracking-widest">INSTAGRAM</span>
                                </Link>
                                <div className="group flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl opacity-50 cursor-not-allowed">
                                    <ShieldCheck className="w-6 h-6 mb-2 text-gray-600" />
                                    <span className="text-[10px] font-bold text-gray-600 tracking-widest">ENCRYPTED</span>
                                </div>
                            </div>
                        </div>

                        {/* STATUS & LOCATION BOX */}
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-cyan-500/70 font-bold tracking-widest uppercase">System Status</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[8px] text-green-500 font-bold uppercase">{t.contact.systemStatus || "ONLINE"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-2.5 bg-cyan-950/40 rounded-lg border border-cyan-800 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="block text-[8px] text-gray-500 uppercase tracking-tighter">Location</span>
                                    <span className="block text-xs font-bold text-white">{t.contact.location || "Italy / Remote"}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-cyan-500/10 flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-cyan-500/50" />
                                <span className="text-[8px] text-cyan-500/40 font-mono tracking-tighter italic">
                                    Uplink established // Solis Sector // NO INTERFERENCE
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <style jsx>{`
                .animate-gradient-x {
                    background-size: 200% 100%;
                    animation: gradient-x 5s linear infinite;
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div className="mt-12 md:mt-24">
                <Footer />
            </div>
        </section>
    );
}

