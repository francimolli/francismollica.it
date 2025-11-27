# Piano d'Azione: Interactive Cosmos & Gamified Navigation

Questo piano descrive l'evoluzione del portfolio in un'esperienza esplorativa interattiva ("Space-Time Portfolio").

## Obiettivi Principali
1.  **Navigazione 3D Diegetica**: Sostituire il menu classico con oggetti 3D (Pianeti/Artefatti) cliccabili nello spazio.
2.  **Onboarding Utente (The Filter)**: Una Landing Page iniziale che profila l'utente e permette di scegliere tra "Esperienza Immersiva" e "Navigazione Rapida".
3.  **Gamification (Proof of Work)**: Meccaniche di prossimità per sbloccare contenuti segreti o bonus basati sull'esplorazione.

---

## Fase 1: Il "Filtro" (Landing & Profilazione)
Prima di caricare il pesante universo 3D, accogliamo l'utente.

### Componente: `OnboardingTerminal.tsx`
- **Design**: Stile terminale/hacker o olografico minimale.
- **Funzionalità**:
    - Domanda iniziale: "Qual è il tuo obiettivo?" (es. "Esplorare", "Assumere", "Curiosare").
    - **Scelta Modalità**:
        1.  *Hyper-Drive (Immersive)*: Carica la scena 3D completa, abilita i controlli di volo.
        2.  *Data-Stream (Classic)*: Layout a griglia/lista, alta leggibilità, niente 3D pesante.

---

## Fase 2: I Nodi di Navigazione (Pianeti/Artefatti)
Trasformiamo le sezioni (Home, About, Projects, Contact) in entità fisiche nell'universo 3D.

### Componente: `NavigationNode.tsx`
- **Props**: `position`, `type` (Planet, Station, Monolith), `targetSection` (id della sezione da aprire).
- **Visuals**:
    - Non semplici sfere, ma oggetti stilizzati (es. "About" è un archivio dati fluttuante, "Projects" è una fabbrica orbitale).
    - **Label Olografica**: Usare `<Html>` di `@react-three/drei` per mostrare il nome della sezione sopra l'oggetto che scala con la distanza.
- **Interazione**:
    - `onClick`: Teletrasporta la camera vicino all'oggetto e apre la scheda UI laterale.
    - `onPointerOver`: L'oggetto brilla o ruota più velocemente.

### Integrazione Scena
- Posizionare i nodi a distanze ragionevoli (non troppo lontani per non perdere l'utente, non troppo vicini per dare senso di viaggio).
- Collegarli visivamente con linee sottili (costellazioni) per suggerire il percorso.

---

## Fase 3: Gamification & Proximity System
Premiare l'esplorazione.

### Logica: `ProximityTrigger.tsx`
- Monitora la distanza tra `Camera` e `SecretCoordinates`.
- Se `distance < threshold`:
    - Sblocca un achievement nel "Diario di Bordo".
    - Mostra un Toast/Notifica: "Segnale Rilevato".
    - Esempio pratico: Trovare un satellite distrutto sblocca un coupon "Sconto Prototipazione" o l'accesso a un progetto segreto non listato.
    -mostra un popup con un codice segreto (indicazioni di fare screenshot o copiare il codice)

---

## Fase 4: Il Diario di Bordo (HUD Evoluto)
L'icona in basso a destra diventa il navigatore centrale.

- **Mappa Stellare**: Una minimappa 2D che mostra dove si trova l'utente rispetto ai nodi.
- **Inventario**: Dove vengono salvati i "bonus" trovati.
- **Warp Drive**: Lista rapida per saltare da un pianeta all'altro senza volare manualmente (Fast Travel).

---

## Roadmap Tecnica Immediata

1.  **Creare `NavigationNode.tsx`**: Implementare un prototipo di pianeta cliccabile con label.
2.  **Posizionamento**: Inserire 4 nodi nella scena attuale (Home, About, Work, Contact).
3.  **Collegamento**: Fare in modo che il click sul nodo apra le attuali `SectionCard`.
4.  **Landing**: Creare l'overlay iniziale per la scelta della modalità.
