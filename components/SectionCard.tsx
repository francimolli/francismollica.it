"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { useFloatingSection } from "./FloatingSectionContext";
import { useCityControls } from "./CityControlsContext";
import { Home, User, Briefcase, Mail, LucideIcon, Headphones } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    "Home": Home,
    "Who am I?": User,
    "Projects": Briefcase,
    "Contact": Mail,
    "Music": Headphones,
};

const targetMap: Record<string, { x: number, z: number }> = {
    "Who am I?": { x: 0, z: -120 },   // North
    "Projects": { x: 120, z: 0 },     // East
    "Contact": { x: -120, z: 0 },     // West
    "Music": { x: 0, z: 120 },        // South
    // "Home" removed - handled by resetView
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
    const { flyTo, stopFlying, resetView } = useCityControls();
    const isExpanded = expandedSection === id;

    // --- STATE ANIMAZIONE & POSIZIONE ---
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [velocity, setVelocity] = useState({ x: 0.1, y: 0.1 });
    const [isFlying, setIsFlying] = useState(false);

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

            // SPECIAL CASE: HOME -> RESET VIEW (Only when opening)
            if (title === "Home" && !isExpanded) {
                resetView();
                // Wait for reset animation (2s) then open
                setTimeout(() => {
                    setExpandedSection(id);
                }, 2000);
                return;
            }

            if (!isExpanded) {
                // WARP NAVIGATION SEQUENCE
                const target = title ? targetMap[title] : { x: 0, z: 0 };
                if (target) {
                    flyTo(target.x, target.z);
                    setIsFlying(true);

                    // Wait for flight (1.5s) before opening
                    setTimeout(() => {
                        setExpandedSection(id);
                        setIsFlying(false);
                        stopFlying(); // Release camera control
                    }, 1500);
                } else {
                    setExpandedSection(id);
                }
            } else {
                setExpandedSection(null);
            }
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
                    className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-cyan-500/50 bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-in zoom-in-95 duration-300 pointer-events-auto ${className || ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between mb-2 border-b border-white/10 pb-2 pt-8 px-8 -mx-4 -mt-8 bg-black/90 backdrop-blur-md">
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
                    <div className="text-white px-8 pb-8">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // --- ICONA FLUTTUANTE (NODE STYLE) ---
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
                transition: isDragging ? 'none' : 'transform 0.2s',
            }}
            aria-label={`Open ${title || 'section'}`}
        >
            <div className="relative flex items-center justify-center">
                {/* Connecting Line (Fake) - Visual connector to "network" */}
                <div className="absolute w-[200px] h-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 rotate-45 animate-pulse pointer-events-none" />
                <div className="absolute w-[1px] h-[200px] bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 rotate-45 animate-pulse pointer-events-none" />

                {/* Rotating Outer Ring */}
                <div className="absolute inset-[-8px] rounded-full border border-cyan-500/30 border-dashed animate-[spin_10s_linear_infinite] pointer-events-none" />

                {/* Counter-Rotating Inner Ring */}
                <div className="absolute inset-[-4px] rounded-full border border-cyan-400/20 animate-[spin_7s_linear_infinite_reverse] pointer-events-none" />

                {/* Glow effect */}
                <div className={`absolute inset-0 bg-cyan-400/10 rounded-full blur-xl animate-pulse ${isDragging ? 'bg-cyan-400/40 blur-2xl' : ''}`} />

                {/* Icon container - Glassmorphism */}
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300
                    ${isDragging
                        ? 'border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.9)]'
                        : 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] group-hover:bg-black/60'}
                `}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-cyan-400/80 group-hover:text-cyan-300 transition-colors" />
                </div>

                {/* Tech Decorators */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-cyan-600 rounded-full" />

                {/* Label tooltip (Holographic style) */}
                {title && !isDragging && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-[1px] h-4 bg-cyan-500/50 mb-1"></div>
                            <div className="px-4 py-1 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-none text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.2)] uppercase">
                                {title}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}