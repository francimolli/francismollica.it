// Design token dell'universo cartoon: notte blu/viola profonda, accenti pastello.
// Ogni pianetino ha la sua palette, costruita sugli stessi pastelli per coerenza.

export const NIGHT = {
    bg: "#0a0a23", // blu notte profondo
    fog: "#15142f",
    star: "#fff6e0", // bianco caldo
};

export const PASTEL = {
    mint: "#9fe8c7",
    peach: "#ffb59a",
    lilac: "#c9b6f5",
    warmYellow: "#ffd98a",
    sky: "#9ad1f5",
    rose: "#f5a8c0",
    deepLilac: "#6d5aa8",
    deepBlue: "#2e4a7a",
};

// Contorno toon: viola quasi nero, morbido (mai nero puro).
export const OUTLINE = "#1c1433";

export const PLANET_CASA = {
    ground: "#e8a86c",
    groundDark: "#c97d4e",
    grass: "#8fd4a0",
    foliage: "#7ccb90",
    foliageLight: "#a5e0b4",
    trunk: "#8a5a3a",
    roofColor: "#e06a5a",
    wall: "#f7e6c8",
    window: "#ffe9b0",
    glow: "#ffd98a",
    moon: "#cfd3e8",
};

// Colori delle creaturine (variazioni pastello coordinate).
export const CREATURE_COLORS = [
    PASTEL.mint,
    PASTEL.peach,
    PASTEL.lilac,
    PASTEL.sky,
    PASTEL.rose,
];

// Palette per pianetino: stessa famiglia pastello, identità diverse.
export interface PlanetPalette {
    ground: string;
    patchA: string;
    patchB: string;
    accent: string;
    creatures: string[];
}

export const PLANET_PALETTES: Record<string, PlanetPalette> = {
    casa: {
        ground: PLANET_CASA.ground, patchA: PLANET_CASA.grass, patchB: PLANET_CASA.groundDark,
        accent: PLANET_CASA.glow, creatures: CREATURE_COLORS,
    },
    officina: {
        ground: "#9aa3b8", patchA: "#7c87a3", patchB: "#b8c0d4",
        accent: PASTEL.warmYellow, creatures: [PASTEL.peach, PASTEL.warmYellow, PASTEL.sky],
    },
    galleria: {
        ground: "#d9b8f0", patchA: "#b893e0", patchB: "#ecd6fa",
        accent: PASTEL.rose, creatures: [PASTEL.lilac, PASTEL.rose, PASTEL.mint],
    },
    faro: {
        ground: "#8fd0d8", patchA: "#f0d9a8", patchB: "#6fb8c4",
        accent: PASTEL.warmYellow, creatures: [PASTEL.sky, PASTEL.mint, PASTEL.warmYellow],
    },
    giardino: {
        ground: "#7ccb90", patchA: "#5fae7a", patchB: "#a5e0b4",
        accent: PASTEL.mint, creatures: [PASTEL.mint, PASTEL.lilac, PASTEL.peach],
    },
    osservatorio: {
        ground: "#4a5a8f", patchA: "#39477a", patchB: "#6d7cb0",
        accent: PASTEL.sky, creatures: [PASTEL.sky, PASTEL.warmYellow, PASTEL.rose],
    },
    cantiere: {
        ground: "#e8c06c", patchA: "#c99a4e", patchB: "#f2d694",
        accent: "#ffaa66", creatures: [PASTEL.peach, PASTEL.warmYellow, PASTEL.sky],
    },
    segreto: {
        ground: "#3a2d62", patchA: "#55448f", patchB: "#2a1f4a",
        accent: PASTEL.lilac, creatures: CREATURE_COLORS,
    },
};

// La navicella del viaggiatore.
export const SHIP = {
    hull: "#f7e6c8",
    trim: "#e06a5a",
    seat: "#6d5aa8",
    pilot: PASTEL.mint,
    helmet: "#cfe6ff",
    flame: "#ffd98a",
    flameCore: "#fff6e0",
};
