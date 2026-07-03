"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface FloatingSectionContextType {
    expandedSection: string | null;
    setExpandedSection: (id: string | null) => void;
    visitedConnections: string[];
    addConnection: (from: string, to: string) => void;
}

const FloatingSectionContext = createContext<FloatingSectionContextType | undefined>(undefined);

export function FloatingSectionProvider({ children }: { children: ReactNode }) {
    const [expandedSection, setExpandedSectionRaw] = useState<string | null>(null);
    const [previousSection, setPreviousSection] = useState<string | null>(null);
    const [visitedConnections, setVisitedConnections] = useState<string[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('orbit_connections');
            if (stored) setVisitedConnections(JSON.parse(stored));
        } catch {}
    }, []);

    const addConnection = useCallback((from: string, to: string) => {
        const key = [from, to].sort().join('↔');
        setVisitedConnections(prev => {
            if (prev.includes(key)) return prev;
            const next = [...prev, key];
            localStorage.setItem('orbit_connections', JSON.stringify(next));
            return next;
        });
    }, []);

    const setExpandedSection = useCallback((id: string | null) => {
        if (id !== null && previousSection !== null && previousSection !== id) {
            addConnection(previousSection, id);
        }
        if (id !== null) setPreviousSection(id);
        setExpandedSectionRaw(id);
    }, [previousSection, addConnection]);

    return (
        <FloatingSectionContext.Provider value={{ expandedSection, setExpandedSection, visitedConnections, addConnection }}>
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
