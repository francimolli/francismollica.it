// Interruttore universo: "cartoon" (nuovo) o "legacy" (FuturisticOrbit).
// Si cambia senza toccare il codice: NEXT_PUBLIC_UNIVERSE=legacy pnpm build
export const UNIVERSE_MODE =
    (process.env.NEXT_PUBLIC_UNIVERSE === "legacy" ? "legacy" : "cartoon") as
    | "cartoon"
    | "legacy";

// --- MONDO ---------------------------------------------------------------
// I pianetini riprendono le direzioni dei vecchi beacon (stessa mappa mentale).

export interface PlanetConfig {
    id: string;
    section: string | null; // SectionCard aperta all'atterraggio
    position: [number, number, number];
    radius: number;
    secret?: boolean; // visibile solo dopo aver trovato tutti i segreti
}

export const PLANETS: PlanetConfig[] = [
    { id: "casa", section: "about", position: [0, 0, -125], radius: 10 },
    { id: "officina", section: "timeline", position: [130, 10, 8], radius: 9 },
    { id: "galleria", section: "portfolio", position: [-150, 18, -95], radius: 9 },
    { id: "faro", section: "contact", position: [-125, -6, 35], radius: 8 },
    { id: "giardino", section: "music", position: [12, -12, 130], radius: 9 },
    { id: "osservatorio", section: "market", position: [155, 20, 100], radius: 9 },
    { id: "cantiere", section: "roadmap", position: [-145, -14, 105], radius: 8 },
    { id: "segreto", section: null, position: [30, 75, -200], radius: 6, secret: true },
];

export const OVERVIEW = {
    position: [0, 85, 255] as [number, number, number],
    lookAt: [0, 0, -10] as [number, number, number],
};

// Sezione del portfolio → pianeta (per LOGBOOK e trigger di prossimità).
export const SECTION_PLANET: Record<string, string> = {
    about: "casa",
    timeline: "officina",
    projects: "officina",
    portfolio: "galleria",
    contact: "faro",
    music: "giardino",
    market: "osservatorio",
    roadmap: "cantiere",
};

// Artefatti segreti: riusano il sistema unlockSecret/LOGBOOK esistente.
export interface SecretArtifact {
    id: "satellite" | "monolith" | "void_ship";
    planet: string;
    offset: [number, number, number]; // rispetto al pianeta
}

export const SECRET_ARTIFACTS: SecretArtifact[] = [
    { id: "satellite", planet: "officina", offset: [24, 10, -9] },
    { id: "monolith", planet: "cantiere", offset: [-18, 8, 17] },
    { id: "void_ship", planet: "giardino", offset: [17, -7, 22] },
];

// --- TOUR ------------------------------------------------------------------
// La visita guidata del cosmo: rotta narrativa fissa (il Faro è il gran
// finale con la CTA contatti; il Segreto si infila prima, se sbloccato).

export type TourShot = "threeQuarter" | "lowOrbit" | "highPan";

export const TOUR_ROUTE: { id: string; shot: TourShot }[] = [
    { id: "casa", shot: "threeQuarter" },
    { id: "officina", shot: "lowOrbit" },
    { id: "galleria", shot: "highPan" },
    { id: "giardino", shot: "lowOrbit" },
    { id: "osservatorio", shot: "threeQuarter" },
    { id: "cantiere", shot: "lowOrbit" },
    { id: "faro", shot: "highPan" },
];

export const TOUR_SECRET_STOP: { id: string; shot: TourShot } = { id: "segreto", shot: "highPan" };

export const TOUR = {
    dwellMs: 10000, // sosta su ogni pianeta
    pauseMs: 20000, // pausa dopo un input (tour manuale), poi riprende
    idleMs: 120000, // inattività prima dello screensaver
    finaleMs: 8000, // card di fine viaggio
    fov: 38, // più stretto = più cinema
    flightSlowdown: 1.3, // i voli del tour prendono il loro tempo
};

// --- VOLO ----------------------------------------------------------------
export const FLIGHT = {
    speed: 55, // unità al secondo (sensazione simile al vecchio universo)
    boostMultiplier: 5,
    lookSpeed: 0.9, // rad/s per le frecce-sguardo
    landDistanceFactor: 2.8, // distanza d'atterraggio = raggio × fattore
    proximityOpen: 7, // apre la sezione entro raggio + questo margine
    proximityCooldownMs: 45000,
    secretRange: 25, // distanza di sblocco artefatti
};
