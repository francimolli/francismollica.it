"use client";

import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

export function Footer() {
    const { language } = useLanguage();

    return (
        <footer className="w-full py-8 px-4 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm self-center">
            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex flex-col items-center space-y-2">
                    <a
                        rel="license"
                        href="http://creativecommons.org/licenses/by-nc/4.0/"
                        target="_blank"
                        className="transition-opacity hover:opacity-80"
                    >
                        <img
                            alt="Licenza Creative Commons"
                            style={{ borderWidth: 0 }}
                            src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png"
                            className="rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                    </a>

                    <p className="text-[10px] md:text-xs font-mono text-gray-500 tracking-wider leading-relaxed max-w-2xl px-4">
                        {language === 'it' ? (
                            <>
                                Quest'opera è distribuita con Licenza{" "}
                                <a
                                    rel="license"
                                    href="http://creativecommons.org/licenses/by-nc/4.0/"
                                    target="_blank"
                                    className="text-cyan-500/70 hover:text-cyan-400 transition-colors underline underline-offset-4 decoration-cyan-500/20"
                                >
                                    Creative Commons Attribuzione - Non commerciale 4.0 Internazionale
                                </a>.
                            </>
                        ) : (
                            <>
                                This work is licensed under a{" "}
                                <a
                                    rel="license"
                                    href="http://creativecommons.org/licenses/by-nc/4.0/"
                                    target="_blank"
                                    className="text-cyan-500/70 hover:text-cyan-400 transition-colors underline underline-offset-4 decoration-cyan-500/20"
                                >
                                    Creative Commons Attribution-NonCommercial 4.0 International License
                                </a>.
                            </>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                    <span>&copy; {new Date().getFullYear()} Francesco Mollica</span>
                    <span className="w-1 h-1 bg-gray-800 rounded-full" />
                    <span>All Rights Reserved</span>
                </div>
            </div>
        </footer>
    );
}
