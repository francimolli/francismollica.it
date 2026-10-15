// Interruttore universo: "cartoon" (nuovo) o "legacy" (FuturisticOrbit).
// Si cambia senza toccare il codice: NEXT_PUBLIC_UNIVERSE=legacy pnpm build
export const UNIVERSE_MODE =
    (process.env.NEXT_PUBLIC_UNIVERSE === "legacy" ? "legacy" : "cartoon") as
    | "cartoon"
    | "legacy";

// Ancoraggi di volo della camera. Il mondo del prototipo è piccolo:
// il pianeta Casa sta all'origine, l'overview guarda tutto da fuori.
// `surface` rende l'ancora dinamica: si atterra sopra quel punto della
// superficie (che ruota col pianeta), così la casetta è sempre in scena.
export interface FlightAnchor {
    position: [number, number, number];
    lookAt: [number, number, number];
    surface?: {
        planet: string;
        lat: number; lon: number; distance: number; // posizione camera
        lookAt: { lat: number; lon: number; radius: number }; // punto osservato
    };
}

export const FLIGHT_ANCHORS: Record<string, FlightAnchor> = {
    overview: { position: [4, 20, 62], lookAt: [0, 0, 0] },
    casa: {
        position: [14, 10, 28],
        lookAt: [0, 0, 0],
        // ripresa in diagonale: casetta in primo piano, orizzonte e stelle dietro
        surface: {
            planet: "casa",
            lat: 0, lon: -18, distance: 26,
            lookAt: { lat: 22, lon: 15, radius: 11 },
        },
    },
};

// Pianetino → sezione del portfolio aperta all'atterraggio.
export const PLANET_SECTION: Record<string, string> = {
    casa: "about",
};
