"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { useFloatingSection } from "./FloatingSectionContext";
import { Home, User, Briefcase, Mail, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    "Home": Home,
    "Who am I?": User,
    "Projects": Briefcase,
    "Contact": Mail,
};

export default function SectionCard({
    children,
    title,
    id,
    icon: CustomIcon,
    className,
}: {
    children: ReactNode;
    title?: string;
    id: string;
    icon?: LucideIcon;
    className?: string;
}) {
    const { expandedSection, setExpandedSection } = useFloatingSection();
    const isExpanded = expandedSection === id;

    // --- STATE ANIMAZIONE & POSIZIONE ---
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [velocity, setVelocity] = useState({ x: 0.1, y: 0.1 });

    // --- STATE DRAG & DROP ---
    const [isDragging, setIsDragging] = useState(false);
    // Usiamo un ref per tracciare se è stato un click o un trascinamento
    const isDragGesture = useRef(false);
    // Ref per memorizzare i dati iniziali del trascinamento
    const dragStart = useRef({ mouseX: 0, mouseY: 0, initialX: 0, initialY: 0 });

    const Icon = CustomIcon || (title && iconMap[title]) || Home;

    // Inizializzazione casuale
    useEffect(() => {
        setPosition({
            x: Math.random() * 60 + 20,
            y: Math.random() * 60 + 20,
        });
        setVelocity({
            x: (Math.random() - 0.5) * 0.15,
            y: (Math.random() - 0.5) * 0.15,
        });
    }, []);

    // --- LOOP ANIMAZIONE FLUTTUANTE ---
    useEffect(() => {
        // Se è espansa O se la stiamo trascinando, FERMA l'animazione automatica
        if (isExpanded || isDragging) return;

        const interval = setInterval(() => {
            setPosition(prev => {
                let newX = prev.x + velocity.x;
                let newY = prev.y + velocity.y;
                let newVelX = velocity.x;
                let newVelY = velocity.y;

                // Rimbalza sui bordi (5% - 95% circa)
                if (newX <= 5 || newX >= 90) {
                    newVelX = -velocity.x;
                    newX = newX <= 5 ? 5 : 90;
                }
                if (newY <= 10 || newY >= 85) {
                    newVelY = -velocity.y;
                    newY = newY <= 10 ? 10 : 85;
                }

                if (newVelX !== velocity.x || newVelY !== velocity.y) {
                    setVelocity({ x: newVelX, y: newVelY });
                }

                return { x: newX, y: newY };
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isExpanded, velocity, isDragging]); // Aggiunto isDragging alle dipendenze


    // --- GESTORI EVENTI DRAG ---

    const handlePointerDown = (e: React.PointerEvent) => {
        // 1. Ferma la propagazione per non muovere la città 3D sotto
        e.stopPropagation();

        // 2. Prepara il drag
        setIsDragging(true);
        isDragGesture.current = false; // Resetta flag gesto

        dragStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
    };

    // Aggiungiamo i listener globali quando inizia il trascinamento
    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            // Calcola spostamento in pixel
            const deltaX = e.clientX - dragStart.current.mouseX;
            const deltaY = e.clientY - dragStart.current.mouseY;

            // Se ci siamo mossi di più di 5 pixel, lo consideriamo un trascinamento, non un click
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isDragGesture.current = true;
            }

            // Converti pixel in percentuale schermo (per mantenere responsiveness)
            const percentX = (deltaX / window.innerWidth) * 100;
            const percentY = (deltaY / window.innerHeight) * 100;

            setPosition({
                x: dragStart.current.initialX + percentX,
                y: dragStart.current.initialY + percentY
            });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            // Non serve reimpostare la velocità, l'useEffect dell'animazione
            // ripartirà automaticamente usando l'ultima posizione come base.
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);


    const handleClick = () => {
        // Apri SOLO se non stavi trascinando (click pulito)
        if (!isDragGesture.current) {
            setExpandedSection(isExpanded ? null : id);
        }
    };

    // --- MODALE ESPANSO ---
    if (isExpanded) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none"
                onClick={handleClick}
            >
                <div
                    className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-cyan-500/50 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.4)] p-8 animate-in zoom-in-95 duration-300 pointer-events-auto ${className || ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        {title && (
                            <h2 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.6)] flex items-center gap-3">
                                <Icon className="w-8 h-8 text-cyan-400" />
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={handleClick}
                            className="ml-auto text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-white">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // --- ICONA FLUTTUANTE ---
    return (
        <div
            // Usiamo un div wrapper invece di button per gestire meglio drag vs click
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            className={`fixed group z-40 transition-transform pointer-events-auto select-none touch-none ${isDragging ? 'cursor-grabbing scale-110 z-50' : 'cursor-grab hover:scale-110 active:scale-95'}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                // Rimuoviamo la transizione su top/left durante il drag per renderlo istantaneo
                transition: isDragging ? 'none' : 'transform 0.2s',
            }}
            aria-label={`Open ${title || 'section'}`}
        >
            <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse ${isDragging ? 'bg-cyan-400/60 blur-2xl' : ''}`} />

                {/* Icon container */}
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 bg-black/80 backdrop-blur-md flex items-center justify-center transition-all duration-300
                    ${isDragging
                        ? 'border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.9)]'
                        : 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.5)] group-hover:border-cyan-400 group-hover:shadow-[0_0_40px_rgba(6,182,212,0.7)]'}
                `}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>

                {/* Label tooltip (Nascosto durante il drag) */}
                {title && !isDragging && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="px-3 py-1 bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg text-cyan-300 text-sm font-medium shadow-lg">
                            {title}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}