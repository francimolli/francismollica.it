"use client";

import { motion } from "framer-motion";

/**
 * Glider Hacker Emblem (Conway's Game of Life)
 * 
 * Simple SVG representation of the universal hacker emblem.
 * Signifies an association with hacker goals, values, and creative problem-solving.
 */
export function HackerGlider({ className = "w-6 h-6", color = "currentColor" }: { className?: string, color?: string }) {
    return (
        <svg
            viewBox="0 0 300 300"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Grid Lines (Optional style) */}
            <path d="M100 0V300M200 0V300M0 100H300M0 200H300" stroke={color} strokeWidth="2" strokeOpacity="0.1" />

            {/* Conway's Glider Pattern */}
            <rect x="110" y="10" width="80" height="80" fill={color} />
            <rect x="210" y="110" width="80" height="80" fill={color} />
            <rect x="10" y="210" width="80" height="80" fill={color} />
            <rect x="110" y="210" width="80" height="80" fill={color} />
            <rect x="210" y="210" width="80" height="80" fill={color} />
        </svg>
    );
}

export function HackerGliderAnimated({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            title="Hacker Emblem (Glider)"
            className={`${className} cursor-help transition-colors group relative`}
        >
            <HackerGlider className="w-full h-full text-cyan-500/40 group-hover:text-cyan-400" />

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}
