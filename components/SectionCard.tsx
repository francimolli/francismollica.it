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

const colorMap: Record<string, string> = {
    "Home": "cyan",
    "Who am I?": "emerald",
    "Projects": "violet",
    "Contact": "rose",
    "Music": "amber",
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
    const color = title ? colorMap[title] || "cyan" : "cyan";

    // Mappe colori Tailwind dinamici (per evitare problemi con JIT, idealmente dovrebbero essere safelistati o usati style inline per colori arbitrari, qui usiamo classi standard)
    // Nota: Tailwind non supporta interpolazione stringhe dinamiche completa tipo `bg-${color}-500` se non sono scansionabili.
    // Usiamo un oggetto di stile o classi condizionali. Per semplicità e sicurezza, usiamo style inline per i colori principali.

    const getColor = (shade: number, alpha = 1) => {
        const colors: Record<string, string> = {
            cyan: `rgba(6,182,212,${alpha})`,
            emerald: `rgba(16,185,129,${alpha})`,
            violet: `rgba(139,92,246,${alpha})`,
            rose: `rgba(244,63,94,${alpha})`,
            amber: `rgba(245,158,11,${alpha})`,
        };
        return colors[color] || colors.cyan;
    };

    const mainColor = getColor(500);
    const glowColor = getColor(400, 0.4);
    const ringColor = getColor(500, 0.3);

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
                <div className="absolute w-[200px] h-[1px] rotate-45 animate-pulse pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${getColor(500, 0.2)}, transparent)` }} />
                <div className="absolute w-[1px] h-[200px] rotate-45 animate-pulse pointer-events-none"
                    style={{ background: `linear-gradient(180deg, transparent, ${getColor(500, 0.2)}, transparent)` }} />

                {/* Rotating Outer Ring */}
                <div className="absolute inset-[-8px] rounded-full border border-dashed animate-[spin_10s_linear_infinite] pointer-events-none"
                    style={{ borderColor: ringColor }} />

                {/* Counter-Rotating Inner Ring */}
                <div className="absolute inset-[-4px] rounded-full border animate-[spin_7s_linear_infinite_reverse] pointer-events-none"
                    style={{ borderColor: getColor(400, 0.2) }} />

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${isDragging ? 'blur-2xl' : ''}`}
                    style={{ backgroundColor: isDragging ? getColor(400, 0.6) : getColor(400, 0.1) }} />

                {/* Icon container - Glassmorphism */}
                <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300`}
                    style={{
                        borderColor: isDragging ? mainColor : getColor(500, 0.3),
                        boxShadow: isDragging ? `0 0 50px ${getColor(500, 0.9)}` : `0 0 15px ${getColor(500, 0.3)}`
                    }}
                >
                    <Icon className="w-8 h-8 md:w-10 md:h-10 transition-colors" style={{ color: mainColor }} />
                </div>

                {/* Tech Decorators */}
                <div className="absolute -top-2 -right-2 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: mainColor }} />
                <div className="absolute -bottom-2 -left-2 w-1 h-1 rounded-full" style={{ backgroundColor: getColor(600) }} />

                {/* Label tooltip (Holographic style) */}
                {title && !isDragging && (
                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-[1px] h-4 mb-1" style={{ backgroundColor: getColor(500, 0.5) }}></div>
                            <div className="px-4 py-1 bg-black/80 backdrop-blur-md border rounded-none text-xs font-mono tracking-widest uppercase"
                                style={{
                                    borderColor: getColor(500, 0.5),
                                    color: getColor(300),
                                    boxShadow: `0 0 20px ${getColor(500, 0.2)}`
                                }}>
                                {title}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}