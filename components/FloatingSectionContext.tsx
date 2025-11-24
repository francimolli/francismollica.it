"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface FloatingSectionContextType {
    expandedSection: string | null;
    setExpandedSection: (id: string | null) => void;
}

const FloatingSectionContext = createContext<FloatingSectionContextType | undefined>(undefined);

export function FloatingSectionProvider({ children }: { children: ReactNode }) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    return (
        <FloatingSectionContext.Provider value={{ expandedSection, setExpandedSection }}>
            {children}
        </FloatingSectionContext.Provider>
    );
}

export function useFloatingSection() {
    const ctx = useContext(FloatingSectionContext);
    if (!ctx) {
        throw new Error('useFloatingSection must be used within a FloatingSectionProvider');
    }
    return ctx;
}
