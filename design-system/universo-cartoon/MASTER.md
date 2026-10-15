# Universo Cartoon — Design System (MASTER)

> Fonte di verità per l'universo cartoon di francismollica.it.
> Sintesi da ui-ux-pro-max (pattern: Immersive/Interactive · stile: Claymorphism · typo: Claymorphism Mobile),
> adattata al tema "notte accogliente" del progetto. La palette scura è una fusione
> dichiarata: il DB non ha una palette pastello-notturna, i token sotto vengono da
> `components/universe/palette.ts` (già in produzione) + pastelli Claymorphism.

## Pattern (verificato: Immersive/Interactive Experience)
- Esperienza full-screen interattiva; contenuti reali raggiungibili DENTRO l'esperienza (pianetini → sezioni).
- Obbligatori: percorso skip (onboarding → modalità classic), fallback non-3D (classic mode), `prefers-reduced-motion` (dissolvenze, stato finale preservato), pausa quando offscreen/tab nascosta.
- CTA/contatto raggiungibile sia dall'esperienza (pianeta Faro) sia dal fallback.

## Stile (verificato: Claymorphism, adattato a dark)
- Soft 3D, chunky, giocattoloso: raggi 16–24px, bordi spessi 2–3px, doppie ombre morbide (interna+esterna), niente linee dure.
- Nel 3D: toon shading 4 step + outline viola scuro `#1c1433` (mai nero puro), squash & stretch.
- Nell'HUD (step 6): pillole e card tonde e "paffute", bordi pastello semitrasparenti, ombre soffici colorate (`shadow-[0_0_18px_rgba(255,217,138,0.35)]`-style), MAI angoli vivi o estetica militare/scanline.
- Icone: SOLO SVG (lucide-react, già in uso). Niente emoji come icone (sostituire 🚧 nella card Roadmap).

## Colori (token — fusione dichiarata, non match DB)
Base notte (sfondo scena e superfici HUD):
- `--u-bg: #0a0a23` (notte) · `--u-fog: #15142f` · `--u-surface: #1c1433` (pillole/card HUD, ~70-90% alpha + blur)
- `--u-surface-2: #2a2150` (hover/active)
Pastelli (accenti, creature, pianeti — da palette.ts):
- mint `#9fe8c7` · peach `#ffb59a` · lilac `#c9b6f5` · warmYellow `#ffd98a` · sky `#9ad1f5` · rose `#f5a8c0`
Ruoli:
- Testo primario su surface: `#f7e6c8` (crema) o bianco `#fff6e0`
- Testo secondario/etichette: lilac `#c9b6f5` (su #1c1433 ≈ 7:1 ✓)
- Accento interattivo/hover: warmYellow `#ffd98a`
- Successo/sblocco: mint · Avviso: peach/arancio `#ffaa66` · Errore: rose scurita `#e06a5a`
- Contrasto minimo 4.5:1 per ogni testo su surface; i pastelli NON si usano come sfondo di testo chiaro.

## Tipografia (verificato: Claymorphism Mobile)
- Titoli/etichette HUD: **Nunito** 800/900 (terminali tondi obbligatori).
- Corpo: **DM Sans** 400/500.
- Telemetria pura (coordinate, AU, countdown): **Roboto Mono** — unico residuo mono, per leggibilità dei numeri.
- Scala: Hero 48/52 · Titolo sezione 32/38 · Titolo card 22/28 · Body 16/24 · Micro-label 11-12 uppercase tracking 0.15em.
- Import: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Nunito:wght@700;800;900&family=Roboto+Mono:wght@400;500&display=swap`

## Motion (verificato: Stagger List standard + soft bounce clay)
- Entrate liste/griglie: 300–450ms, `back.out(1.4)` (framer-motion: `type:"spring", bounce~0.3`), stagger 60ms.
- Press/tap: soft bounce `cubic-bezier(0.34, 1.56, 0.64, 1)` 200ms ease-out.
- Uscite più rapide delle entrate. Tutto dietro `prefers-reduced-motion` (già centralizzato nello store).
- 3D: idle animation ovunque (nessun elemento immobile), durate legate a "Flusso del Tempo".

## Microcopy
- Tono: diario di bordo di un esploratore curioso. Caldo, prima persona, niente gergo militare (vietati: SYSTEM, OVERRIDE, TACTICAL). IT/EN in `lib/translations.ts` → chiave `universe`.

## Anti-pattern da evitare
- Estetica generica o "HUD sci-fi freddo" (cyan/neon/scanline) — è la direzione VECCHIA.
- Mix casuale flat/skeumorfico; emoji come icone; testo < 12px; grigio su grigio.
- Hover come unico affordance (tutto deve funzionare touch, target ≥ 44×44px).

## Checklist pre-consegna (per ogni step UI)
- [ ] Niente emoji-icone (SVG lucide) · [ ] cursor-pointer sui clickabili (drei useCursor nel 3D)
- [ ] Contrasto testo ≥ 4.5:1 · [ ] Focus visibile da tastiera · [ ] reduced-motion rispettato
- [ ] Target touch ≥ 44px, spaziatura ≥ 8px · [ ] Responsive 375/768/1024/1440 · [ ] Niente scroll orizzontale
