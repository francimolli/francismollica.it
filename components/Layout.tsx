"use client";

import { ReactNode } from "react";
import { FuturisticOrbit } from "./FuturisticOrbit";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        // MAIN CONTAINER: Occupa tutto lo schermo, sfondo nero per evitare flash bianchi
        <main className="relative h-screen w-full overflow-hidden bg-black">

            {/* ------------------------------------------------------ */}
            {/* LIVELLO 0: CITTÀ 3D (Interattiva)                      */}
            {/* ------------------------------------------------------ */}
            <div className="absolute inset-0 z-0">
                <FuturisticOrbit />
            </div>

            {/* ------------------------------------------------------ */}
            {/* LIVELLO 1: OVERLAY VISIVO (Passante)                   */}
            {/* ------------------------------------------------------ */}
            {/* Serve per scurire la città e far leggere meglio il testo. 
                'pointer-events-none' è CRUCIALE: i click passano attraverso questo livello 
                e colpiscono la città sotto. */}
            <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />

            {/* CRT SCANLINE EFFECT */}
            <div className="scanlines" />

            {/* ------------------------------------------------------ */}
            {/* LIVELLO 2: CONTENUTO UI (Selettivo)                    */}
            {/* ------------------------------------------------------ */}
            {/* z-10 porta questo livello sopra tutto.
                'pointer-events-none' sul contenitore principale significa che se clicchi
                nel vuoto tra una card e l'altra, il click scende alla città. */}
            <div className="relative z-10 h-full w-full overflow-y-auto pointer-events-none">

                {/* NOTA: Poiché il genitore è 'none', tutti i figli ereditano 'none'.
                    Dobbiamo assicurarci che i componenti interattivi (Header, Card, Bottoni)
                    abbiano esplicitamente 'pointer-events-auto' nelle loro classi. 
                    
                    Tuttavia, per sicurezza, possiamo avvolgere children qui, MA
                    se children occupa tutto lo spazio (come una Hero section full screen),
                    bloccherà di nuovo la città.
                    
                    La strategia migliore è lasciare 'pointer-events-none' qui
                    e gestire l'auto nei singoli componenti.
                */}

                {children}
            </div>
        </main>
    );
}