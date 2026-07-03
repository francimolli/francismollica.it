"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorMode = 'normal' | 'inverted' | 'random';

const RANDOM_FILTERS = [
  'hue-rotate(90deg) saturate(2.5)',
  'hue-rotate(180deg) saturate(2) brightness(1.2)',
  'hue-rotate(270deg) saturate(2)',
  'sepia(1) hue-rotate(60deg) saturate(3)',
  'hue-rotate(45deg) contrast(1.8) saturate(2)',
  'hue-rotate(320deg) saturate(3) brightness(0.9)',
  'hue-rotate(200deg) saturate(4) brightness(1.1)',
  'contrast(2) hue-rotate(150deg) saturate(1.5)',
];

interface UniverseColorContextType {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  canvasFilter: string;
}

const UniverseColorContext = createContext<UniverseColorContextType | undefined>(undefined);

export function UniverseColorProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>('normal');
  const [filterIdx, setFilterIdx] = useState(0);

  const setMode = (newMode: ColorMode) => {
    if (newMode === 'random') {
      setFilterIdx(prev => (prev + 1) % RANDOM_FILTERS.length);
    }
    setModeState(newMode);
  };

  // mode 'normal': body inverted (UI inverted), canvas counter-inverts to look normal
  // mode 'inverted': body normal, canvas inverted
  // mode 'random': body normal, canvas gets random filter
  const bodyFilter = mode === 'normal' ? 'invert(1)' : '';
  const canvasFilter = mode === 'random' ? RANDOM_FILTERS[filterIdx] : 'invert(1)';

  useEffect(() => {
    document.body.style.filter = bodyFilter;
    return () => { document.body.style.filter = ''; };
  }, [bodyFilter]);

  return (
    <UniverseColorContext.Provider value={{ mode, setMode, canvasFilter }}>
      {children}
    </UniverseColorContext.Provider>
  );
}

export function useUniverseColor() {
  const ctx = useContext(UniverseColorContext);
  if (!ctx) throw new Error('useUniverseColor must be used within UniverseColorProvider');
  return ctx;
}
