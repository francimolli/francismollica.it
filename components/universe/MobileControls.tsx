"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { bridge, bumpInteraction, flightInput } from "./store";

// Controlli touch identici al vecchio universo: joystick di movimento a
// sinistra, frecce-sguardo a destra. Stile pastello da diario di bordo.

function Joystick({ onMove, label }: { onMove: (x: number, y: number) => void; label?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [touchId, setTouchId] = useState<number | null>(null);

    const updatePos = (touch: React.Touch) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const maxDist = rect.width / 2;
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }
        setPos({ x: dx, y: dy });
        onMove(dx / maxDist, dy / maxDist);
    };

    return (
        <div
            ref={ref}
            className="relative h-24 w-24 touch-none rounded-full border border-[#c9b6f5]/30 bg-[#1c1433]/50 backdrop-blur-sm"
            onTouchStart={(e) => {
                e.preventDefault();
                if (touchId !== null) return;
                const touch = e.changedTouches[0];
                setTouchId(touch.identifier);
                updatePos(touch);
            }}
            onTouchMove={(e) => {
                e.preventDefault();
                if (touchId === null) return;
                const touch = Array.from(e.changedTouches).find((t) => t.identifier === touchId);
                if (touch) updatePos(touch);
            }}
            onTouchEnd={(e) => {
                e.preventDefault();
                if (touchId === null) return;
                const touch = Array.from(e.changedTouches).find((t) => t.identifier === touchId);
                if (touch) {
                    setTouchId(null);
                    setPos({ x: 0, y: 0 });
                    onMove(0, 0);
                }
            }}
        >
            <div
                className="absolute h-10 w-10 rounded-full border border-[#ffd98a]/40 bg-[#c9b6f5]/50 shadow-[0_0_15px_rgba(201,182,245,0.5)]"
                style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                }}
            />
            <div className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-[#c9b6f5]/20" />
            {label && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-[#c9b6f5]/70">
                    {label}
                </div>
            )}
        </div>
    );
}

function LookButton({
    children,
    className,
    yaw = 0,
    pitch = 0,
}: {
    children: React.ReactNode;
    className?: string;
    yaw?: number;
    pitch?: number;
}) {
    return (
        <button
            className={`flex h-12 w-12 items-center justify-center border border-[#c9b6f5]/30 bg-[#1c1433]/50 backdrop-blur-sm active:bg-[#c9b6f5]/20 ${className ?? ""}`}
            onTouchStart={(e) => {
                e.preventDefault();
                flightInput.yaw = yaw * (yaw !== 0 && bridge.invertX ? -1 : 1);
                flightInput.pitch = pitch;
                bumpInteraction();
            }}
            onTouchEnd={(e) => {
                e.preventDefault();
                flightInput.yaw = 0;
                flightInput.pitch = 0;
            }}
        >
            {children}
        </button>
    );
}

export function MobileControls({ moveLabel }: { moveLabel?: string }) {
    return (
        <>
            {/* SINISTRA: joystick di movimento */}
            <div className="pointer-events-auto absolute bottom-8 left-8 z-50 md:hidden">
                <Joystick
                    label={moveLabel}
                    onMove={(x, y) => {
                        flightInput.x = x;
                        flightInput.z = -y; // lo schermo ha la y verso il basso
                        bumpInteraction();
                    }}
                />
            </div>

            {/* DESTRA: frecce-sguardo */}
            <div className="pointer-events-auto absolute bottom-8 right-8 z-50 flex flex-col items-center gap-1 md:hidden">
                <LookButton className="rounded-t-lg" pitch={1}>
                    <ChevronUp className="text-[#c9b6f5]" />
                </LookButton>
                <div className="flex gap-1">
                    <LookButton className="rounded-l-lg" yaw={1}>
                        <ChevronLeft className="text-[#c9b6f5]" />
                    </LookButton>
                    <LookButton className="rounded-r-lg" yaw={-1}>
                        <ChevronRight className="text-[#c9b6f5]" />
                    </LookButton>
                </div>
                <LookButton className="rounded-b-lg" pitch={-1}>
                    <ChevronDown className="text-[#c9b6f5]" />
                </LookButton>
            </div>
        </>
    );
}
