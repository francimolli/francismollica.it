"use client";

import { useLanguage } from "@/lib/language-context";
import { Mail, Send, MapPin, Phone, Copy, Check, ExternalLink, MessageSquare } from "lucide-react";

const IconGithub = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "./Footer";

export function Contact() {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState(false);

    const contactData = useMemo(() => {
        const emailParts = { user: "francescomollicat", domain: "gmail", tld: "com" };
        const phoneParts = { country: "+39", prefix: "327", first: "185", second: "2718" };
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
        <section id="contact" className="relative w-full py-12 md:py-20 bg-transparent font-sans">

            <div className="container relative z-10 px-4 md:px-6 max-w-4xl mx-auto">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 space-y-3"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                        <span className="text-[10px] font-mono text-emerald-400/70 tracking-[0.25em] uppercase">
                            {t.contact.openForOpportunities}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                        {t.contact.lets}{" "}
                        <span className="text-violet-300">{t.contact.initialize}</span>
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed">
                        {t.contact.description}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                    {/* LEFT COLUMN */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="md:col-span-7 space-y-4"
                    >
                        {/* EMAIL CARD */}
                        <div className="group bg-white/[0.03] border border-white/8 rounded-2xl p-6 md:p-8 hover:border-violet-400/20 transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-violet-400/10 rounded-lg">
                                    <Mail className="w-4 h-4 text-violet-300" />
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase">
                                    {t.contact.primaryEmail}
                                </span>
                            </div>

                            <p className="text-lg md:text-xl font-mono text-white/90 mb-6 break-all">
                                {contactData.fullEmail}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleCopyEmail}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 text-sm text-gray-300 hover:text-white rounded-lg border border-white/8 transition-all duration-200 active:scale-95"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400">
                                                <Check className="w-3.5 h-3.5" />
                                                {t.logbook.copied}
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                <Copy className="w-3.5 h-3.5" />
                                                {language === "it" ? "Copia" : "Copy"}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>

                                <a
                                    href={`mailto:${contactData.fullEmail}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-sm text-violet-200 rounded-lg border border-violet-400/20 hover:border-violet-400/40 transition-all duration-200 active:scale-95"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {language === "it" ? "Scrivi" : "Write"}
                                </a>
                            </div>
                        </div>

                        {/* SECONDARY CHANNELS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Link
                                href="https://t.me/franklyn"
                                target="_blank"
                                className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl hover:border-sky-400/20 hover:bg-white/[0.04] transition-all duration-200"
                            >
                                <MessageSquare className="w-4 h-4 text-sky-400/70 group-hover:text-sky-300 transition-colors shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="block text-[10px] text-gray-600 uppercase tracking-widest font-mono">Telegram</span>
                                    <span className="block text-sm text-gray-300 font-mono">@franklyn</span>
                                </div>
                                <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
                            </Link>

                            <a
                                href={`tel:${contactData.dialPhone}`}
                                className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl hover:border-emerald-400/20 hover:bg-white/[0.04] transition-all duration-200"
                            >
                                <Phone className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-300 transition-colors shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="block text-[10px] text-gray-600 uppercase tracking-widest font-mono">{language === "it" ? "Telefono" : "Phone"}</span>
                                    <span className="block text-sm text-gray-300 font-mono">{contactData.fullPhone}</span>
                                </div>
                                <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
                            </a>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-5 space-y-4"
                    >
                        {/* SOCIAL LINKS */}
                        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 space-y-3">
                            <span className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase">
                                {t.contact.publicNodes}
                            </span>
                            <div className="space-y-2 pt-1">
                                {[
                                    { href: "https://github.com/francimolli", Icon: IconGithub, label: "GitHub", sub: "@francimolli" }
                                ].map(({ href, Icon, label, sub }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
                                    >
                                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-xs text-gray-400 group-hover:text-white transition-colors">{label}</span>
                                            <span className="block text-[10px] text-gray-600 truncate">{sub}</span>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* LOCATION */}
                        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
                            <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                            <div>
                                <span className="block text-[10px] text-gray-600 uppercase tracking-widest font-mono">Location</span>
                                <span className="block text-sm text-gray-300">{t.contact.location}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="mt-12 md:mt-20">
                <Footer />
            </div>
        </section>
    );
}
