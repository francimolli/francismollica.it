"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { useCryptoStream, type MarketStats } from "@/lib/useCryptoStream";
import { useMarketAnalysis, useAustrianStrategy, useMultiPairScan, type AustrianSignal, type PairScore } from "@/lib/marketIndicators";
import { PARTICLE_VERT, PARTICLE_FRAG, FLOW_VERT, FLOW_FRAG } from "@/lib/shaders";

const SYMBOLS: { id: string; label: string }[] = [
  { id: "btcusdt", label: "BTC" },
  { id: "ethusdt", label: "ETH" },
  { id: "solusdt", label: "SOL" },
  { id: "bnbusdt", label: "BNB" },
  { id: "xrpusdt", label: "XRP" },
  { id: "adausdt", label: "ADA" },
  { id: "dogeusdt", label: "DOGE" },
  { id: "avaxusdt", label: "AVAX" },
  { id: "linkusdt", label: "LINK" },
  { id: "dotusdt", label: "DOT" },
  { id: "maticusdt", label: "MATIC" },
  { id: "ltcusdt", label: "LTC" },
  { id: "trxusdt", label: "TRX" },
  { id: "atomusdt", label: "ATOM" },
  { id: "nearusdt", label: "NEAR" },
];

const PARTICLES = 4000;
const COLOR_DOWN = new THREE.Color("#ff2d55");
const COLOR_FLAT = new THREE.Color("#5b6b86");
const COLOR_UP = new THREE.Color("#16f0a0");

function moodColor(momentum: number, target: THREE.Color) {
  if (momentum >= 0) target.copy(COLOR_FLAT).lerp(COLOR_UP, Math.min(1, momentum));
  else target.copy(COLOR_FLAT).lerp(COLOR_DOWN, Math.min(1, -momentum));
  return target;
}

// ── Info copy for toasts ──────────────────────────────────────────────────────

const INFO: Record<string, { title: string; body: string }> = {
  rsi: {
    title: "RSI — Relative Strength Index",
    body: "Misura velocità e intensità dei movimenti di prezzo (0–100). >70 ipercomprato, <30 ipervenduto. Descrive lo slancio recente, non anticipa il futuro. Il modello usa 3 periodi (7/14/21): consensus richiede accordo su tutti e tre.",
  },
  sma: {
    title: "SMA Cross — Media Mobile Semplice",
    body: "Confronta media 10 periodi (veloce) vs 30 (lenta). Veloce > lenta = shift di momentum. Per costruzione è ritardato: reagisce dopo il movimento. Utile per tendenze consolidate, non per timing preciso.",
  },
  backtest: {
    title: "Backtest — Simulazione Storica",
    body: "Simula la strategia SMA cross su 500 candele 4h con commissioni reali (0.1% per lato). Confrontata con buy-&-hold puro. Obiettivo: onestà. La maggior parte delle strategie semplici non batte il non fare nulla.",
  },
  vwap: {
    title: "VWAP Deviation — Prezzo vs Media Pesata per Volume",
    body: "VWAP = media del prezzo typical (H+L+C÷3) ponderata per il volume sulle ultime 50 barre. Deviazione positiva = prezzo sopra il 'giusto valore'. In logica austriaca: distanza crescente senza volume suggerisce malinvestment.",
  },
  volatility: {
    title: "Volatility Percentile — Posizione della Volatilità Attuale",
    body: "ATR (Average True Range) di ogni barra storica, espresso come percentile sulle ultime 500 barre. <20° = volatilità insolitamente bassa. >80° = esaurimento possibile. Aumenta la soglia austriaca: più rischio richiede più eccesso di rendimento.",
  },
  crossPair: {
    title: "Cross-Pair Sample — Consensus Direzionale",
    body: "3 chiamate REST leggere (5 candele daily) su 3 coppie companion. Se >66% va nella stessa direzione → herding. In logica austriaca contrarian: il consensus forte della massa è un avvertimento, non una conferma. Segnala liquidità creditizia, non domanda reale.",
  },
  volumeTrend: {
    title: "Volume Trend — Conferma o Divergenza",
    body: "Volume medio ultime 10 barre vs ultime 30. Prezzo in salita + volume in calo → divergenza: pattern di distribuzione (chi sa sta cedendo posizione alla folla). Prezzo e volume entrambi in crescita → movimento confermato.",
  },
  compound: {
    title: "Proiezione Compound — Capitalizzazione al Tasso Attuale",
    body: "Se il tasso annualizzato recente si mantenesse costante: moltiplicatore del capitale a 3, 6, 12 mesi. Puramente ipotetica — i mercati non crescono linearmente. Serve a contestualizzare il rendimento % in capitale reale vs bond baseline (4.5% ann.).",
  },
  verdict: {
    title: "Austrian Allocation — Segnale Composito",
    body: "Prior conservativo: il mercato non ti remunera (go-to-market-lose). Il segnale deve superare bond_baseline + volatility_premium per dire SIGNAL. Combina: eccesso rendimento, herding cross-pair, divergenza volume, RSI multi-periodo, percentile volatilità.",
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastState = { title: string; body: string } | null;

function Toast({ toast, onDismiss }: { toast: NonNullable<ToastState>; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss, toast.title]);

  return (
    <motion.div
      key={toast.title}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 right-6 z-[300] w-72 rounded-xl border border-white/12 bg-black/93 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold text-u-sky leading-snug">{toast.title}</span>
        <button onClick={onDismiss} className="shrink-0 text-white/25 hover:text-white/60 transition-colors text-xs mt-px">✕</button>
      </div>
      <p className="text-[10px] font-mono text-white/45 leading-relaxed">{toast.body}</p>
    </motion.div>
  );
}

function InfoBtn({ infoKey, onShow }: { infoKey: string; onShow: (k: string) => void }) {
  return (
    <button
      onClick={() => onShow(infoKey)}
      className="ml-1 text-[9px] text-white/20 hover:text-u-sky/70 transition-colors leading-none"
      title="Spiega questo indicatore"
    >
      ⓘ
    </button>
  );
}

// ── 3D scene ──────────────────────────────────────────────────────────────────

function ParticleField({ statsRef }: { statsRef: React.RefObject<MarketStats> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const colA = useMemo(() => new THREE.Color("#5b6b86"), []);
  const colB = useMemo(() => new THREE.Color("#16f0a0"), []);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3);
    const phase = new Float32Array(PARTICLES);
    for (let i = 0; i < PARTICLES; i++) {
      const t = i / PARTICLES;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      positions[i * 3 + 0] = Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = Math.cos(phi);
      phase[i] = t * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT, fragmentShader: PARTICLE_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uTurbulence: { value: 0.3 }, uSwirl: { value: 0.1 },
        uRadius: { value: 2 }, uIntensity: { value: 0 },
        uColorA: { value: colA }, uColorB: { value: colB }, uMix: { value: 0.5 },
      },
    });
    return { geometry, material };
  }, [colA, colB]);

  useFrame((state, delta) => {
    const s = statsRef.current;
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const k = Math.min(1, delta * 2.5);
    u.uTurbulence.value += (0.2 + s.volatility * 1.4 - u.uTurbulence.value) * k;
    u.uSwirl.value += (0.05 + s.intensity * 0.8 - u.uSwirl.value) * k;
    u.uRadius.value += (2 + s.intensity * 0.6 - u.uRadius.value) * k;
    u.uIntensity.value += (s.intensity - u.uIntensity.value) * k;
    u.uMix.value += ((s.momentum * 0.5 + 0.5) - u.uMix.value) * k;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0006 + s.intensity * 0.003;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.15;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function FlowBackground({ statsRef }: { statsRef: React.RefObject<MarketStats> }) {
  const colA = useMemo(() => new THREE.Color("#0a1428"), []);
  const colB = useMemo(() => new THREE.Color("#1a0f2e"), []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: FLOW_VERT, fragmentShader: FLOW_FRAG, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uMomentum: { value: 0 }, uIntensity: { value: 0 },
      uColorA: { value: colA }, uColorB: { value: colB },
    },
  }), [colA, colB]);

  useFrame((state, delta) => {
    const s = statsRef.current;
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const k = Math.min(1, delta * 2);
    u.uMomentum.value += (s.momentum - u.uMomentum.value) * k;
    u.uIntensity.value += (s.intensity - u.uIntensity.value) * k;
  });

  return <mesh position={[0, 0, -6]} material={material}><planeGeometry args={[42, 26]} /></mesh>;
}

function Core({ statsRef }: { statsRef: React.RefObject<MarketStats> }) {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const color = useMemo(() => new THREE.Color("#5b6b86"), []);

  useFrame((state) => {
    const s = statsRef.current;
    if (matRef.current) {
      matRef.current.distort = 0.2 + s.volatility * 0.6;
      matRef.current.speed = 1 + s.intensity * 4;
      moodColor(s.momentum, color);
      matRef.current.color.lerp(color, 0.06);
    }
    if (meshRef.current) {
      const beat = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.03 * s.intensity;
      meshRef.current.scale.setScalar(beat * (0.8 + s.buyPressure * 0.35));
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.7}>
      <Sphere ref={meshRef} args={[1, 96, 96]} scale={1}>
        <MeshDistortMaterial ref={matRef} color="#5b6b86" distort={0.3} speed={2} roughness={0.15} metalness={0.85} emissive="#06060c" />
      </Sphere>
    </Float>
  );
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function Meter({ label, v, hot }: { label: string; v: number; hot?: boolean }) {
  const blocks = Math.round(Math.max(0, Math.min(1, v)) * 10);
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="w-10 text-left text-white/40">{label}</span>
      <span className={`tracking-[0.18em] ${hot ? "text-rose-300/80" : "text-u-sky/80"}`}>
        {"█".repeat(blocks)}<span className="text-white/15">{"·".repeat(10 - blocks)}</span>
      </span>
    </div>
  );
}

function fmtPrice(n: number) {
  if (!n) return "—";
  return n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : n.toPrecision(4);
}

function HUD({ display, status, symbol }: { display: MarketStats; status: string; symbol: string }) {
  const up = display.momentum >= 0;
  const pct = (display.momentum / 40) * 100;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs">
      <div className="flex items-start justify-between">
        <div className="text-white/50 tracking-widest">{symbol.replace("usdt", "").toUpperCase()}/USDT</div>
        <div className="flex items-center gap-2 text-white/60">
          <span className={`h-2 w-2 rounded-full ${status === "live" ? "animate-pulse bg-emerald-400" : status === "error" ? "bg-red-500" : "bg-yellow-400"}`} />
          {status === "live" ? "LIVE · Binance" : status.toUpperCase()}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl text-white tabular-nums tracking-tight">{display.live ? `$${fmtPrice(display.price)}` : "—"}</div>
          <div className={`tabular-nums ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {display.live ? `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(3)}% · 30s flow` : "connecting…"}
          </div>
        </div>
        <div className="space-y-0.5 text-right text-white/55">
          <Meter label="VOL" v={display.volatility} hot />
          <Meter label="FLOW" v={display.intensity} />
          <Meter label="BUY" v={display.buyPressure} />
        </div>
      </div>
    </div>
  );
}

// ── Shared row ────────────────────────────────────────────────────────────────

function Row({ k, v, tone, infoKey, onInfo }: {
  k: string; v: string; tone: "up" | "down" | "flat";
  infoKey?: string; onInfo?: (k: string) => void;
}) {
  const color = tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-white/70";
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-white/40 flex items-center">
        {k}
        {infoKey && onInfo && <InfoBtn infoKey={infoKey} onShow={onInfo} />}
      </span>
      <span className={`tabular-nums ${color}`}>{v}</span>
    </div>
  );
}

// ── Signals + backtest panel ──────────────────────────────────────────────────

function SignalsPanel({ symbol, onInfo }: { symbol: string; onInfo: (k: string) => void }) {
  const { signals, backtest, loading, error } = useMarketAnalysis(symbol, "4h", 500);

  const [didAutoShow, setDidAutoShow] = useState(false);
  useEffect(() => { setDidAutoShow(false); }, [symbol]);
  useEffect(() => {
    if (!loading && signals && !didAutoShow) {
      setDidAutoShow(true);
      onInfo("rsi");
    }
  }, [loading, signals, didAutoShow, onInfo]);

  if (error) return <div className="font-mono text-xs text-rose-400/80">signals unavailable ({error})</div>;
  if (loading || !signals || !backtest) return <div className="font-mono text-xs text-white/40 animate-pulse">crunching 500×4h candles…</div>;

  const rsiLabel = signals.rsi >= 70 ? "overbought" : signals.rsi <= 30 ? "oversold" : "neutral";

  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-3 font-mono text-xs md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="tracking-widest text-u-sky/80 flex items-center">
            SIGNALS <InfoBtn infoKey="rsi" onShow={onInfo} />
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">descriptive · not predictive</span>
        </div>
        <Row k="RSI (14)" v={`${signals.rsi.toFixed(1)} · ${rsiLabel}`} tone={signals.rsi >= 70 ? "down" : signals.rsi <= 30 ? "up" : "flat"} infoKey="rsi" onInfo={onInfo} />
        <Row k="SMA 10 / 30" v={signals.trend === "up" ? "fast > slow" : "fast < slow"} tone={signals.trend === "up" ? "up" : "down"} infoKey="sma" onInfo={onInfo} />
        <Row k="Last close" v={`$${fmtPrice(signals.lastClose)}`} tone="flat" />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="tracking-widest text-amber-300/80 flex items-center">
            BACKTEST <InfoBtn infoKey="backtest" onShow={onInfo} />
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">SMA cross · long/flat · 0.1% fee</span>
        </div>
        <Row k="Strategy" v={`${backtest.strategyReturnPct >= 0 ? "+" : ""}${backtest.strategyReturnPct.toFixed(1)}%`} tone={backtest.strategyReturnPct >= 0 ? "up" : "down"} infoKey="backtest" onInfo={onInfo} />
        <Row k="Buy & hold" v={`${backtest.buyHoldReturnPct >= 0 ? "+" : ""}${backtest.buyHoldReturnPct.toFixed(1)}%`} tone={backtest.buyHoldReturnPct >= 0 ? "up" : "down"} />
        <Row k="Trades · win%" v={`${backtest.trades} · ${backtest.winRatePct.toFixed(0)}%`} tone="flat" />
        <p className={`mt-2 border-t border-white/10 pt-2 text-[11px] leading-snug ${backtest.beatBuyHold ? "text-emerald-300/70" : "text-amber-200/70"}`}>
          {backtest.verdict}
        </p>
      </div>
    </div>
  );
}

// ── Austrian panel ────────────────────────────────────────────────────────────

const VERDICT_STYLE: Record<AustrianSignal["verdict"], { color: string; bg: string; border: string }> = {
  BOND:       { color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  WATCH:      { color: "text-white/55",    bg: "bg-white/5",        border: "border-white/15" },
  DIVERGENCE: { color: "text-rose-300",    bg: "bg-rose-500/10",    border: "border-rose-500/30" },
  SIGNAL:     { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
};

function signedPct(n: number, dec = 1) { return `${n >= 0 ? "+" : ""}${n.toFixed(dec)}%`; }
function multPct(n: number) { return `${n >= 1 ? "+" : ""}${((n - 1) * 100).toFixed(1)}%`; }

function AustrianPanel({ symbol, onInfo }: { symbol: string; onInfo: (k: string) => void }) {
  const { signal, loading, error } = useAustrianStrategy(symbol);

  const [didAutoShow, setDidAutoShow] = useState(false);
  useEffect(() => { setDidAutoShow(false); }, [symbol]);
  useEffect(() => {
    if (!loading && signal && !didAutoShow) {
      setDidAutoShow(true);
      onInfo("verdict");
    }
  }, [loading, signal, didAutoShow, onInfo]);

  if (error) return <div className="font-mono text-xs text-rose-400/80">austrian model unavailable ({error})</div>;
  if (loading || !signal) return (
    <div className="w-full max-w-3xl font-mono text-xs text-white/40 animate-pulse">
      campionando cross-pair e calibrando soglia austriaca…
    </div>
  );

  const vs = VERDICT_STYLE[signal.verdict];

  return (
    <div className="w-full max-w-3xl space-y-3 font-mono text-xs">
      {/* Verdict banner */}
      <div className={`rounded-xl border ${vs.border} ${vs.bg} p-4 flex items-start gap-3`}>
        <button onClick={() => onInfo("verdict")} className="shrink-0 mt-0.5 text-[10px] text-white/25 hover:text-u-sky/70 transition-colors">ⓘ</button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-bold tracking-widest ${vs.color}`}>{signal.verdict}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Austrian Allocation</span>
            <span className="ml-auto text-[10px] text-white/35">conf. {(signal.confidence * 100).toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed">{signal.verdictLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Rendimento vs bond */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tracking-widest text-violet-300/80 flex items-center">
              RENDIMENTO <InfoBtn infoKey="compound" onShow={onInfo} />
            </span>
            <span className="text-[10px] text-white/30">vs bond 4.5% ann.</span>
          </div>
          <Row k="Asset ann." v={signedPct(signal.annualizedReturn)} tone={signal.annualizedReturn > 0 ? "up" : "down"} />
          <Row k="Bond baseline" v={signedPct(signal.bondBaseline)} tone="flat" infoKey="compound" onInfo={onInfo} />
          <Row k="Eccesso" v={signedPct(signal.excessReturn)} tone={signal.excessReturn > 0 ? "up" : "down"} />
          <Row k="Soglia richiesta" v={signedPct(signal.requiredExcess)} tone="flat" infoKey="volatility" onInfo={onInfo} />
          <div className="mt-2 border-t border-white/10 pt-2 space-y-0.5">
            <div className="text-[10px] text-white/25 mb-1">Proiezione compound (ipotetica)</div>
            <Row k="3 mesi" v={multPct(signal.compoundProjection.months3)} tone={signal.compoundProjection.months3 >= 1 ? "up" : "down"} />
            <Row k="6 mesi" v={multPct(signal.compoundProjection.months6)} tone={signal.compoundProjection.months6 >= 1 ? "up" : "down"} />
            <Row k="12 mesi" v={multPct(signal.compoundProjection.months12)} tone={signal.compoundProjection.months12 >= 1 ? "up" : "down"} />
          </div>
        </div>

        {/* Statistical mix */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="tracking-widest text-u-sky/80 flex items-center">
              SEGNALI MIX <InfoBtn infoKey="rsi" onShow={onInfo} />
            </span>
          </div>
          <Row
            k="RSI 7/14/21"
            v={`${signal.rsiMulti.r7.toFixed(0)} · ${signal.rsiMulti.r14.toFixed(0)} · ${signal.rsiMulti.r21.toFixed(0)}`}
            tone={signal.rsiMulti.consensus === "overbought" ? "down" : signal.rsiMulti.consensus === "oversold" ? "up" : "flat"}
            infoKey="rsi" onInfo={onInfo}
          />
          <Row
            k="VWAP dev. (50b)"
            v={`${signal.vwapDeviation >= 0 ? "+" : ""}${(signal.vwapDeviation * 100).toFixed(2)}%`}
            tone={signal.vwapDeviation > 0.02 ? "down" : signal.vwapDeviation < -0.02 ? "up" : "flat"}
            infoKey="vwap" onInfo={onInfo}
          />
          <Row
            k="Volatilità %ile"
            v={`${(signal.volatilityPercentile * 100).toFixed(0)}°`}
            tone={signal.volatilityPercentile > 0.8 ? "down" : signal.volatilityPercentile < 0.2 ? "up" : "flat"}
            infoKey="volatility" onInfo={onInfo}
          />
          <Row
            k="Volume trend"
            v={signal.volumeTrend === "confirming" ? "conferma ✓" : signal.volumeTrend === "diverging" ? "diverge ⚠" : "neutro"}
            tone={signal.volumeTrend === "confirming" ? "up" : signal.volumeTrend === "diverging" ? "down" : "flat"}
            infoKey="volumeTrend" onInfo={onInfo}
          />
          <div className="mt-2 border-t border-white/10 pt-2">
            <Row
              k={`Cross-pair (${signal.crossPair.total} peer${signal.crossPair.total !== 1 ? "s" : ""})`}
              v={signal.crossPair.total === 0 ? "n/a" : `↑${signal.crossPair.bullish} ↓${signal.crossPair.bearish}`}
              tone={signal.herdingDetected ? "down" : "flat"}
              infoKey="crossPair" onInfo={onInfo}
            />
            {signal.herdingDetected && (
              <p className="mt-1.5 text-[10px] text-rose-300/65 leading-snug">⚠ Herding rilevato — segnale contrarian attivo</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Thesis generation (pure) ──────────────────────────────────────────────────

type Stance = "LONG" | "CONTRARIAN" | "ATTENDERE" | "CASH/BOND";
type Profilo = "prudente" | "bilanciato" | "dinamico";
type SignalQuality = "OTTIMO" | "BUONO" | "INCERTO" | "BASSO";

type Thesis = {
  stance: Stance;
  signalQuality: SignalQuality;
  allocazione: string;
  summary: string;
  perche: string;
  perCome: string;
  quando: string;
  volumeNote: string;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  stopLossPct: number;
  tp1: number;
  tp1Pct: number;
  tp2: number;
  tp2Pct: number;
  timeHorizon: string;
  riskNote: string;
};

const PLATFORMS = [
  { name: "Coinbase Advanced", url: "https://advanced.coinbase.com", note: "Regolamentata SEC/EU · ordini limit e stop nativi" },
  { name: "Kraken", url: "https://kraken.com", note: "Licenza MiCAR EU · spread ridotti · trading pro" },
  { name: "eToro", url: "https://etoro.com", note: "CySEC + FCA · posizioni frazionarie · copy-trading" },
  { name: "Bitstamp", url: "https://bitstamp.net", note: "CSSF Lussemburgo · storica e affidabile in Europa" },
];

const STANCE_STYLE: Record<Stance, { color: string; bg: string; border: string }> = {
  "LONG":       { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  "CONTRARIAN": { color: "text-rose-300",    bg: "bg-rose-500/10",    border: "border-rose-500/30" },
  "ATTENDERE":  { color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  "CASH/BOND":  { color: "text-white/50",    bg: "bg-white/5",        border: "border-white/15" },
};

const SECTOR_THESIS: Record<string, { narrative: string; catalysts: string }> = {
  "Store of Value": {
    narrative: "asset con proprietà di riserva di valore e offerta fissa — analogo digitale all'oro. Il ciclo di adozione istituzionale in corso lo posiziona come hedge macro strutturale.",
    catalysts: "halvings, adozione ETF spot, spostamenti di bilancio corporate, regolamentazione chiarificatrice.",
  },
  "Smart Contract": {
    narrative: "infrastruttura programmabile per DeFi, tokenizzazione di asset reali e contratti autoeseguibili. Il valore aumenta con la fee revenue e il TVL bloccato nel suo ecosistema.",
    catalysts: "crescita DeFi, lancio L2 nativi, adozione RWA (real-world asset), aggiornamenti di scalabilità.",
  },
  "Payment": {
    narrative: "protocollo di trasferimento di valore ottimizzato per velocità e costo. Il vantaggio competitivo dipende dall'adozione come mezzo di pagamento reale e dalla liquidità in ingresso istituzionale.",
    catalysts: "partnership bancarie, corridoi di rimessa internazionale, integrazioni CBDC, validazione regolamentare.",
  },
  "DeFi/Oracle": {
    narrative: "infrastruttura critica per la finanza decentralizzata — fornisce dati on-chain affidabili come \"oracolo\" trustless. Il valore è proporzionale alla quantità di protocolli DeFi che lo integrano.",
    catalysts: "crescita TVL DeFi, espansione reti di feed dati, tokenizzazione RWA, accordi enterprise.",
  },
  "Interop": {
    narrative: "protocollo di interoperabilità cross-chain — abilita la comunicazione tra blockchain eterogenee. Il valore aumenta con il numero di chain connesse e il volume di messaggi scambiati.",
    catalysts: "espansione parachain/slot, adozione IBC, partnership bridge enterprise, governance attiva.",
  },
  "L2/Scaling": {
    narrative: "soluzione di scaling che abbatte le fee e aumenta il throughput delle transazioni su L1. Il valore segue la migrazione di utenti e liquidità dall'L1 all'ecosistema L2.",
    catalysts: "migrazione liquidità L1→L2, adozione gaming/NFT, integrazioni DeFi, sviluppo zkEVM.",
  },
};

// ── Spotlight helpers ─────────────────────────────────────────────────────────

const QUALITY_STYLE: Record<SignalQuality, { color: string; bg: string; border: string }> = {
  OTTIMO:  { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  BUONO:   { color: "text-u-sky",    bg: "bg-u-sky/10",    border: "border-u-sky/30" },
  INCERTO: { color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  BASSO:   { color: "text-white/40",    bg: "bg-white/5",        border: "border-white/15" },
};

const TIER_LABEL: Record<string, string> = { mega: "MEGA CAP", large: "LARGE CAP", mid: "MID CAP" };

function describeSlancio(rsiMulti: AustrianSignal["rsiMulti"]): { label: string; note: string; tone: "up" | "down" | "flat" } {
  const avg = (rsiMulti.r7 + rsiMulti.r14 + rsiMulti.r21) / 3;
  if (avg > 70) return { label: "Surriscaldato", note: "Il prezzo ha corso troppo in poco tempo. Alta probabilità di pausa o correzione prima di riprendere.", tone: "down" };
  if (avg > 60) return { label: "Slancio avanzato", note: "Movimento positivo nella fase finale. Stop rispettato rigorosamente — il margine si restringe.", tone: "flat" };
  if (avg < 35) return { label: "Scarico", note: "Il prezzo ha ceduto molto. Possibile rimbalzo, ma servono conferme di volume prima di considerare l'ingresso.", tone: "up" };
  if (avg > 50) return { label: "In slancio", note: "Movimento positivo, non esaurito. Buone condizioni con spazio prima della zona di surriscaldamento.", tone: "up" };
  return { label: "Neutro", note: "Nessun segnale direzionale chiaro. Il prezzo è in equilibrio tra acquirenti e venditori.", tone: "flat" };
}

function describeVolumi(vol: PairScore["volumeTrend"]): { label: string; note: string; tone: "up" | "down" | "flat" } {
  if (vol === "confirming") return { label: "Confermano", note: "Chi compra lo fa con convinzione: i volumi crescono col prezzo. Il movimento ha sostanza reale.", tone: "up" };
  if (vol === "diverging") return { label: "Divergono ⚠", note: "Il prezzo sale ma i volumi calano. Chi conosce il mercato sta cedendo posizioni alla folla retail.", tone: "down" };
  return { label: "Neutri", note: "I volumi non danno una direzione chiara. Attendere un segnale più netto prima di decidere.", tone: "flat" };
}

function describeAgitazione(vp: number): { label: string; note: string; tone: "up" | "down" | "flat" } {
  if (vp > 0.80) return { label: "Molto agitato", note: "Il mercato oscilla molto più del solito. Posizioni più piccole, stop più ampi. Non è il momento ideale.", tone: "down" };
  if (vp > 0.55) return { label: "Agitato", note: "Volatilità sopra la media. Tenere la posizione ridotta e rispettare gli stop.", tone: "flat" };
  if (vp < 0.20) return { label: "Calmo", note: "Insolitamente tranquillo — può precedere movimenti improvvisi. Buona finestra per ordini limite.", tone: "up" };
  return { label: "Nella norma", note: "Volatilità nella media storica. Condizioni operative standard.", tone: "up" };
}

function qualityScore(signal: AustrianSignal, top: PairScore): SignalQuality {
  if (signal.verdict === "SIGNAL" && top.volumeTrend === "confirming" && signal.rsiMulti.consensus !== "overbought") return "OTTIMO";
  if (signal.verdict === "SIGNAL" || (signal.verdict === "WATCH" && signal.excessReturn > 0 && top.volumeTrend !== "diverging")) return "BUONO";
  if (signal.verdict === "WATCH" || signal.verdict === "DIVERGENCE") return "INCERTO";
  return "BASSO";
}

function profiloAlloc(profilo: Profilo, quality: SignalQuality, verdict: AustrianSignal["verdict"]): string {
  if (verdict === "BOND") return "0% — resta in liquidità";
  if (verdict === "DIVERGENCE") return "0% — non aprire posizioni";
  const map: Record<SignalQuality, Record<Profilo, number>> = {
    OTTIMO:  { prudente: 3, bilanciato: 5, dinamico: 8 },
    BUONO:   { prudente: 2, bilanciato: 3, dinamico: 5 },
    INCERTO: { prudente: 1, bilanciato: 1, dinamico: 2 },
    BASSO:   { prudente: 0, bilanciato: 0, dinamico: 1 },
  };
  const pct = map[quality][profilo] ?? 0;
  return pct === 0 ? "0% — attendere" : `${pct}% del portafoglio`;
}

// ── Pair Spotlight component ──────────────────────────────────────────────────

function MomentCard({ icon, label, note, tone }: { icon: string; label: string; note: string; tone: "up" | "down" | "flat" }) {
  const color = tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-white/40";
  return (
    <div className="flex-1 rounded-xl border border-white/8 bg-white/[0.015] p-3 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className={`text-[9px] font-bold tracking-wider uppercase font-mono ${color}`}>{label}</span>
      </div>
      <p className="text-[8px] font-mono text-white/32 leading-relaxed">{note}</p>
    </div>
  );
}

function PairSpotlight({ pair, signal, profilo }: { pair: PairScore; signal: AustrianSignal; profilo: Profilo }) {
  const slancio = describeSlancio(signal.rsiMulti);
  const volumi = describeVolumi(pair.volumeTrend);
  const agitazione = describeAgitazione(signal.volatilityPercentile);
  const quality = qualityScore(signal, pair);
  const alloc = profiloAlloc(profilo, quality, signal.verdict);
  const qs = QUALITY_STYLE[quality];
  const vs = VERDICT_STYLE[signal.verdict];
  const scorePct = Math.max(0, Math.min(100, ((pair.score + 1) / 2) * 100));
  const dailyRate = signal.annualizedReturn / 100 / 365;
  const proj12m = ((Math.pow(1 + dailyRate, 365) - 1) * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.02] overflow-hidden font-mono">
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-white/8">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold text-white tracking-tight">{pair.label}</span>
            <span className="text-sm text-white/30">/ USDT</span>
            <span className={`text-[8px] font-bold tracking-[0.2em] uppercase px-1.5 py-0.5 rounded border ${vs.bg} ${vs.color} ${vs.border}`}>{signal.verdict}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[9px] text-white/25 uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/8">{pair.sector}</span>
            <span className="text-[8px] text-white/20 uppercase tracking-wider">{TIER_LABEL[pair.tier]}</span>
            <span className="text-[8px] text-white/15">·</span>
            <span className="text-[8px] text-white/22 italic">{pair.durationLabel}</span>
          </div>
        </div>
        <div className={`flex flex-col items-center rounded-xl border px-3 py-2 shrink-0 ${qs.border} ${qs.bg}`}>
          <span className={`text-[9px] font-bold tracking-widest uppercase ${qs.color}`}>{quality}</span>
          <span className="text-[7px] text-white/20 mt-0.5">segnale</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-white/20 uppercase tracking-wider w-20 shrink-0">Punteggio</span>
          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${scorePct > 60 ? "bg-emerald-400/60" : scorePct > 35 ? "bg-amber-400/60" : "bg-rose-400/60"}`} style={{ width: `${scorePct}%` }} />
          </div>
          <span className={`text-[10px] font-bold tabular-nums shrink-0 ${scorePct > 60 ? "text-emerald-300" : scorePct > 35 ? "text-amber-300" : "text-rose-300"}`}>{scorePct.toFixed(0)}/100</span>
        </div>
      </div>

      <div className="px-4 py-4 flex gap-2 border-b border-white/5">
        <MomentCard icon="📈" label={slancio.label} note={slancio.note} tone={slancio.tone} />
        <MomentCard icon="💧" label={volumi.label} note={volumi.note} tone={volumi.tone} />
        <MomentCard icon="🌡️" label={agitazione.label} note={agitazione.note} tone={agitazione.tone} />
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center border-b border-white/5">
        <div>
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Rendimento ann.</div>
          <div className={`text-base font-bold tabular-nums ${signal.annualizedReturn > 0 ? "text-emerald-300" : "text-rose-300"}`}>{signal.annualizedReturn >= 0 ? "+" : ""}{signal.annualizedReturn.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Extra vs bond</div>
          <div className={`text-base font-bold tabular-nums ${signal.excessReturn > 0 ? "text-emerald-300" : "text-rose-300"}`}>{signal.excessReturn >= 0 ? "+" : ""}{signal.excessReturn.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Proiezione 12m</div>
          <div className={`text-base font-bold tabular-nums ${parseFloat(proj12m) > 4.5 ? "text-white/65" : "text-rose-300"}`}>{parseFloat(proj12m) >= 0 ? "+" : ""}{proj12m}%</div>
        </div>
      </div>

      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Allocazione consigliata</div>
          <div className="text-[13px] font-bold text-white/75">{alloc}</div>
        </div>
        <div className="text-right">
          <div className="text-[7px] text-white/20 uppercase tracking-wider mb-1">Prezzo attuale</div>
          <div className="text-[13px] font-bold text-white/60 tabular-nums">${fmtPrice(pair.lastClose)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Glossary accordion ────────────────────────────────────────────────────────

const GLOSSARY: { term: string; simple: string; detail: string }[] = [
  { term: "Rendimento annualizzato", simple: "quanto renderebbe in un anno al ritmo attuale", detail: "Calcolato sulle ultime ~350 ore (80 candele da 4h). Non è garantito: i mercati non crescono linearmente. Serve a capire l'ordine di grandezza rispetto ad alternative sicure." },
  { term: "Bond baseline (4.5%)", simple: "il guadagno 'sicuro' con cui confrontarsi", detail: "Le obbligazioni governative europee rendono circa 4-5% all'anno senza rischio. Ogni investimento rischioso deve superare questa soglia per avere senso." },
  { term: "Eccesso di rendimento", simple: "quanto guadagni in più rispetto al bond sicuro", detail: "Se l'asset rende +20% e il bond +4.5%, l'eccesso è +15.5%. Il modello approva l'ingresso solo quando questo eccesso supera una soglia minima." },
  { term: "Soglia di ingresso (hurdle)", simple: "il guadagno minimo richiesto per valere il rischio", detail: "Varia con l'agitazione del mercato: più il mercato oscilla, più deve rendere per compensare il rischio aggiuntivo. Va da 5% (calmo) a 20% (molto agitato)." },
  { term: "Slancio del prezzo (RSI)", simple: "quanto velocemente sta salendo o scendendo", detail: "Misurato su 3 periodi (7/14/21 candele). Sopra 70: surriscaldato, probabile pausa. Sotto 30: scarico, possibile rimbalzo. Il consensus richiede accordo su tutti e tre." },
  { term: "Volume confermante", simple: "i soldi che entrano nel mercato crescono col prezzo", detail: "Prezzo sale + volumi crescono = movimento genuino. Prezzo sale + volumi calano = distribuzione: chi sa sta uscendo, cedendo posizioni a chi vede solo il prezzo salire." },
  { term: "Effetto gregge", simple: "quando tutti comprano o vendono insieme", detail: "Il modello campiona 3 altre criptovalute. Se oltre il 66% va nella stessa direzione, scatta l'allarme. In logica contrarian, il consensus forte è spesso un campanello d'allarme — non una conferma." },
  { term: "Livello di agitazione (volatilità)", simple: "quanto oscilla il prezzo rispetto alla media storica", detail: "Espresso come percentile su 500 candele. 80°: molto più agitato del solito — posizioni più piccole. 20°: insolitamente calmo, può precedere movimenti bruschi." },
  { term: "Prezzo medio ponderato (VWAP)", simple: "il prezzo 'giusto' calcolato sui volumi recenti", detail: "Se il prezzo è molto sopra il VWAP, l'asset è caro rispetto a dove ha scambiato la maggior parte del volume. Sotto il VWAP: potenziale valore non espresso." },
  { term: "Stop loss", simple: "il prezzo a cui uscire per limitare la perdita", detail: "Posto a 2× ATR (oscillazione media delle ultime candele) sotto l'ingresso. Calibrato per sopravvivere al rumore normale senza scattare per un'oscillazione casuale." },
  { term: "Take profit", simple: "il prezzo a cui raccogliere il guadagno", detail: "TP1 a 2×ATR (chiudi il 50%), TP2 a 4×ATR (chiudi il resto con trailing stop). Uscire in due tranche cattura parte del guadagno anche se il prezzo poi torna indietro." },
  { term: "Allocazione consigliata", simple: "quanto del portafoglio investire su questa coppia", detail: "Varia in base al profilo (prudente/bilanciato/dinamico) e alla qualità del segnale. Regola d'oro: nessuna singola posizione dovrebbe rischiare più del 2-8% del capitale totale." },
];

function GlossaryAccordion() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden font-mono">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
        <div>
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30">Dizionario dei termini</span>
          <span className="ml-2 text-[9px] text-white/15 italic">capire cosa stai leggendo</span>
        </div>
        <span className={`text-white/20 text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="border-t border-white/8 divide-y divide-white/5">
          {GLOSSARY.map(g => (
            <div key={g.term}>
              <button onClick={() => setExpanded(expanded === g.term ? null : g.term)} className="w-full flex items-start justify-between px-4 py-2.5 text-left hover:bg-white/[0.015] transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-white/55">{g.term}</span>
                  <span className="ml-2 text-[8px] text-white/22 italic">{g.simple}</span>
                </div>
                <span className="text-white/20 text-[10px] ml-3 shrink-0">{expanded === g.term ? "−" : "+"}</span>
              </button>
              {expanded === g.term && (
                <div className="px-4 pb-3">
                  <p className="text-[9px] text-white/35 leading-relaxed border-l-2 border-white/8 pl-3">{g.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateThesis(top: PairScore, signal: AustrianSignal, profilo: Profilo): Thesis {
  const p = top.lastClose;
  const atr = top.atrCurrent;
  const slMult = profilo === "prudente" ? 1.5 : profilo === "dinamico" ? 2.5 : 2;
  const sl = p - slMult * atr;
  const tp1 = p + slMult * atr;
  const tp2 = p + slMult * 2 * atr;
  const slPct = (sl - p) / p * 100;
  const tp1Pct = (tp1 - p) / p * 100;
  const tp2Pct = (tp2 - p) / p * 100;

  const sectorMeta = SECTOR_THESIS[top.sector] ?? SECTOR_THESIS["Smart Contract"];
  const horizStr = top.durationLabel;
  const dailyRate = signal.annualizedReturn / 100 / 365;
  const proj3m = ((Math.pow(1 + dailyRate, 90) - 1) * 100).toFixed(1);
  const proj6m = ((Math.pow(1 + dailyRate, 180) - 1) * 100).toFixed(1);
  const proj12m = ((Math.pow(1 + dailyRate, 365) - 1) * 100).toFixed(1);

  const quality = qualityScore(signal, top);
  const alloc = profiloAlloc(profilo, quality, signal.verdict);

  const volumeNote =
    top.volumeTrend === "diverging"
      ? "I volumi calano mentre il prezzo sale: chi ha informazioni sta uscendo. Non ignorare questo segnale — può anticipare una correzione."
      : top.volumeTrend === "confirming"
      ? "I volumi confermano il movimento: il denaro si muove con convinzione nella stessa direzione del prezzo."
      : "I volumi non danno segnali chiari. Attendere una conferma direzionale prima di aumentare l'esposizione.";

  if (signal.verdict === "SIGNAL") return {
    stance: "LONG", signalQuality: quality, allocazione: alloc,
    summary: `${top.label}/USDT è la coppia con il miglior rapporto rischio/rendimento nel panel. Guadagno annualizzato superiore del ${signal.excessReturn.toFixed(1)}% rispetto al bond sicuro, volumi confermanti, nessun effetto gregge. Orizzonte: ${top.horizon === "long" ? "posizionamento strutturale di medio-lungo termine" : top.horizon === "medium" ? "momentum di qualche settimana" : "operatività di breve periodo"}.`,
    perche: `${top.label} è ${sectorMeta.narrative} Il modello approva l'ingresso solo quando il guadagno extra rispetto al bond (4.5% ann.) supera una soglia che dipende dall'agitazione del mercato — qui ${signal.requiredExcess.toFixed(1)}%. Il guadagno extra attuale è +${signal.excessReturn.toFixed(1)}%: la soglia è superata. Nessun effetto gregge tra le coppie campionate (${signal.crossPair.bullish}↑/${signal.crossPair.bearish}↓): il movimento appare genuino. Slancio del prezzo (${signal.rsiMulti.r7.toFixed(0)}/${signal.rsiMulti.r14.toFixed(0)}/${signal.rsiMulti.r21.toFixed(0)}): spazio sufficiente prima della zona di surriscaldamento. Elementi da monitorare: ${sectorMeta.catalysts}`,
    perCome: `Ingresso in due fasi: 50% a mercato ora ($${fmtPrice(p)}), 50% con ordine limite tra $${(p * 0.993).toFixed(2)} e $${(p * 0.998).toFixed(2)}. Protegge da falsi segnali. Stop rigido a $${sl.toFixed(2)} — non spostarlo mai al ribasso. Proiezione al ritmo attuale: +${proj3m}% a 3 mesi, +${proj6m}% a 6 mesi, +${proj12m}% a 12 mesi.`,
    quando: `${top.horizon === "long" ? "Accumulo progressivo nelle prossime 2–4 settimane." : top.horizon === "medium" ? "Ingresso nelle prossime 1–2 settimane su conferma di volume." : "Ingresso entro 3–7 giorni."} Evitare le 2 ore prima di dati macro importanti (CPI, decisioni Fed). Verificare il calendario su ForexFactory.com prima di entrare.`,
    volumeNote,
    entryLow: p * 0.993, entryHigh: p * 1.007,
    stopLoss: sl, stopLossPct: slPct, tp1, tp1Pct, tp2, tp2Pct,
    timeHorizon: horizStr,
    riskNote: `Stop a $${sl.toFixed(2)} = perdita massima del ${Math.abs(slPct).toFixed(1)}% dall'ingresso. Chiudere il 50% a TP1, il resto a TP2 o con trailing stop. Non aggiungere posizione se il prezzo scende sotto il livello di ingresso.`,
  };

  if (signal.verdict === "DIVERGENCE") return {
    stance: "CONTRARIAN", signalQuality: quality, allocazione: alloc,
    summary: `${top.label}/USDT mostra un segnale di allerta: il prezzo sale ma i volumi calano. Gli investitori informati stanno cedendo posizioni alla folla. Proteggere il capitale è la priorità assoluta in questo momento.`,
    perche: `Quando il prezzo sale ma i volumi diminuiscono, non è domanda reale a muovere il mercato: è la pressione di chi sta uscendo. Il campione cross-pair (${signal.crossPair.bullish}/${signal.crossPair.total} coppie in rialzo) conferma un consensus bullish diffuso — storicamente un segnale di attenzione, non di conferma. Lo slancio del prezzo (RSI ${signal.rsiMulti.r14.toFixed(0)}) è in zona avanzata. ${sectorMeta.narrative.charAt(0).toUpperCase() + sectorMeta.narrative.slice(1)}`,
    perCome: `Nessuna nuova posizione. Su posizioni già aperte: spostare lo stop a pareggio o chiudere il 50% raccogliendo il profitto. Non aprire posizioni al ribasso senza una conferma solida: attendere rottura di un supporto chiave con volumi in aumento e slancio in calo sotto 50.`,
    quando: `Attendere 2–3 sessioni di conferma. Segnali da cercare: volumi in aumento nelle fasi di calo del prezzo, incapacità di fare nuovi massimi, slancio del prezzo in discesa mentre il prezzo è fermo o in lieve salita.`,
    volumeNote,
    entryLow: 0, entryHigh: 0, stopLoss: p * 0.97, stopLossPct: -3,
    tp1: 0, tp1Pct: 0, tp2: 0, tp2Pct: 0,
    timeHorizon: "attendere conferma prima di agire",
    riskNote: `Segnale di distribuzione attivo. Nessuna nuova esposizione. Proteggere i guadagni esistenti.`,
  };

  if (signal.verdict === "WATCH") return {
    stance: "ATTENDERE", signalQuality: quality, allocazione: alloc,
    summary: `${top.label}/USDT ha segnali orientati positivamente ma il guadagno extra (${signal.excessReturn.toFixed(1)}%) non supera ancora la soglia minima richiesta (${signal.requiredExcess.toFixed(1)}%). Mancano ${(signal.requiredExcess - signal.excessReturn).toFixed(1)} punti. Orizzonte paziente: ${horizStr}.`,
    perche: `La logica è semplice: perché rischiare per guadagnare meno del necessario? Il modello richiede che il guadagno extra superi bond (4.5%) più un premio per il rischio legato all'agitazione del mercato — in totale ${signal.requiredExcess.toFixed(1)}%. Il gap attuale di ${(signal.requiredExcess - signal.excessReturn).toFixed(1)}% non è sufficiente. ${top.label} è ${sectorMeta.narrative} ma i segnali non sono ancora maturi.`,
    perCome: `Impostare un alert a $${(p * 0.975).toFixed(2)} (-2.5%): un calo al supporto con volumi in aumento e slancio sotto 55 potrebbe creare le condizioni corrette. Proiezione se il trend migliora: +${proj6m}% a 6 mesi, +${proj12m}% a 12 mesi vs bond 4.5% ann.`,
    quando: `Rivalutare entro 3–5 giorni. Due possibili trigger: 1) calo al supporto con volumi confermanti; 2) guadagno extra che supera organicamente ${signal.requiredExcess.toFixed(1)}% senza effetto gregge.`,
    volumeNote,
    entryLow: p * 0.97, entryHigh: p * 0.985,
    stopLoss: p * 0.94, stopLossPct: -6, tp1: p * 1.08, tp1Pct: 8, tp2: p * 1.16, tp2Pct: 16,
    timeHorizon: horizStr,
    riskNote: `Nessuna posizione aperta. Osservare senza esporsi. Rivalutare tra ${top.horizon === "long" ? "2–4 settimane" : "3–7 giorni"}.`,
  };

  return {
    stance: "CASH/BOND", signalQuality: quality, allocazione: alloc,
    summary: `${top.label}/USDT non offre un rendimento che giustifichi il rischio in questo momento. Con ${signal.annualizedReturn.toFixed(1)}% annualizzato sotto al bond sicuro (4.5%), allocare capitale sarebbe razionalmente svantaggioso. Preservare la liquidità è la scelta più intelligente.`,
    perche: `La logica è diretta: perché rischiare per guadagnare meno di un'obbligazione sicura? ${signal.herdingDetected ? "L'effetto gregge è attivo: troppi si muovono nella stessa direzione, aumentando il rischio di una correzione improvvisa. " : ""}${signal.rsiMulti.consensus === "overbought" ? "Lo slancio del prezzo è in zona surriscaldamento su tutti e tre i periodi misurati. " : ""}Il mercato non offre un'opportunità reale al momento.`,
    perCome: `Alternative concrete: stablecoin con rendimento su Coinbase Earn (USDC, ~4–5% ann. senza rischio di mercato), oppure ETF obbligazionari breve termine su piattaforme regolamentate. Rivalutare il panel tra 1–2 settimane. Proiezione bond a 12 mesi: +4.5% certo vs +${proj12m}% ipotetico su ${top.label}.`,
    quando: `Nessun ingresso finché le condizioni non cambiano. Segnali da aspettare: rendimento annualizzato sopra 4.5%, assenza di effetto gregge, eventi positivi per il settore ${top.sector}.`,
    volumeNote,
    entryLow: 0, entryHigh: 0, stopLoss: 0, stopLossPct: 0, tp1: 0, tp1Pct: 0, tp2: 0, tp2Pct: 0,
    timeHorizon: "indefinito — attendere il momento giusto",
    riskNote: `Preservare il capitale. Nessuna esposizione al rischio di mercato al momento.`,
  };
}

// ── Market Thesis component ───────────────────────────────────────────────────

function TRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-1 border-b border-white/5 last:border-0">
      <span className="text-white/35 text-[10px] font-mono">{label}</span>
      <div className="text-right">
        <span className="text-white/80 text-[11px] font-mono tabular-nums">{value}</span>
        {sub && <span className="block text-[9px] text-white/30 font-mono">{sub}</span>}
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
      <div className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${accent}`}>{title}</div>
      {children}
    </div>
  );
}

function MarketThesis() {
  const { pairs, loading, error } = useMultiPairScan();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [profilo, setProfilo] = useState<Profilo>("bilanciato");

  const top = pairs[selectedIdx] ?? null;
  const { signal, loading: sigLoading } = useAustrianStrategy(top?.symbol ?? "btcusdt");

  const thesis: Thesis | null = top && signal ? generateThesis(top, signal, profilo) : null;
  const ss = thesis ? STANCE_STYLE[thesis.stance] : STANCE_STYLE["ATTENDERE"];

  if (error) return (
    <div className="w-full max-w-3xl font-mono text-xs text-rose-400/80">scan non disponibile ({error})</div>
  );
  if (loading) return (
    <div className="w-full max-w-3xl space-y-2">
      <div className="font-mono text-xs text-white/40 animate-pulse">scansione 15 coppie in corso…</div>
      <div className="h-px w-full bg-white/5 animate-pulse" />
    </div>
  );

  return (
    <div className="w-full max-w-3xl space-y-4 font-mono text-xs">

      {/* Profilo rischio */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/25 uppercase tracking-widest">Profilo rischio</span>
        <div className="flex gap-1">
          {(["prudente", "bilanciato", "dinamico"] as Profilo[]).map(p => (
            <button
              key={p}
              onClick={() => setProfilo(p)}
              className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
                profilo === p
                  ? p === "prudente" ? "border-u-sky/50 bg-u-sky/10 text-u-sky"
                    : p === "dinamico" ? "border-rose-400/50 bg-rose-500/10 text-rose-300"
                    : "border-amber-400/50 bg-amber-500/10 text-amber-300"
                  : "border-white/8 text-white/25 hover:border-white/20 hover:text-white/40"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Compact pill ranking */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="text-[9px] text-white/25 uppercase tracking-widest mb-2">RANKING — {pairs.length} COPPIE</div>
        <div className="flex flex-wrap gap-1.5">
          {pairs.map((p, i) => {
            const vs = VERDICT_STYLE[p.verdict];
            return (
              <button
                key={p.symbol}
                onClick={() => setSelectedIdx(i)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all ${selectedIdx === i ? `${vs.border} ${vs.bg}` : "border-white/8 hover:border-white/20"}`}
              >
                <span className={`text-[9px] font-bold ${selectedIdx === i ? vs.color : "text-white/40"}`}>{p.label}</span>
                <span className="text-[7px] text-white/15">#{i + 1}</span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.verdict === "SIGNAL" ? "bg-emerald-400" : p.verdict === "DIVERGENCE" ? "bg-rose-400" : p.verdict === "WATCH" ? "bg-amber-400" : "bg-white/20"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Pair Spotlight */}
      {top && signal && !sigLoading && <PairSpotlight pair={top} signal={signal} profilo={profilo} />}
      {sigLoading && <div className="font-mono text-xs text-white/40 animate-pulse">analisi {top?.label} in corso…</div>}

      {thesis && (
        <>
          {/* Stance banner */}
          <div className={`rounded-xl border ${ss.border} ${ss.bg} p-4`}>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`text-sm font-bold tracking-widest ${ss.color}`}>{thesis.stance}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">{top!.label}/USDT — Tesi di Investimento</span>
              {thesis.signalQuality && (
                <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${QUALITY_STYLE[thesis.signalQuality].color} ${QUALITY_STYLE[thesis.signalQuality].bg} ${QUALITY_STYLE[thesis.signalQuality].border}`}>
                  {thesis.signalQuality}
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">{thesis.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Section title="PERCHÉ" accent="text-violet-300/80">
              <p className="text-[10px] text-white/50 leading-relaxed">{thesis.perche}</p>
            </Section>

            <Section title="COME" accent="text-u-sky/80">
              <p className="text-[10px] text-white/50 leading-relaxed">{thesis.perCome}</p>
              <div className="mt-1.5 pt-1.5 border-t border-white/8">
                <TRow label="Allocazione" value={thesis.allocazione} />
              </div>
            </Section>

            <Section title="QUANDO" accent="text-amber-300/80">
              <p className="text-[10px] text-white/50 leading-relaxed">{thesis.quando}</p>
              {thesis.volumeNote && (
                <p className="mt-1.5 pt-1.5 border-t border-white/8 text-[9px] text-white/30 italic leading-relaxed">💧 {thesis.volumeNote}</p>
              )}
              <div className="mt-1 pt-1 border-t border-white/8">
                <TRow label="Orizzonte" value={thesis.timeHorizon} />
              </div>
            </Section>

            <Section title="INGRESSO & USCITA" accent="text-emerald-300/80">
              {thesis.entryLow > 0 ? (
                <>
                  <TRow label="Zona ingresso" value={`$${thesis.entryLow.toFixed(2)} – $${thesis.entryHigh.toFixed(2)}`} sub="limit order range" />
                  <TRow label="Stop loss" value={`$${thesis.stopLoss.toFixed(2)}`} sub={`${thesis.stopLossPct.toFixed(1)}% dall'ingresso`} />
                  <TRow label="Take profit 1" value={`$${thesis.tp1.toFixed(2)}`} sub={`+${thesis.tp1Pct.toFixed(1)}% · chiudi 50%`} />
                  <TRow label="Take profit 2" value={`$${thesis.tp2.toFixed(2)}`} sub={`+${thesis.tp2Pct.toFixed(1)}% · trailing stop`} />
                </>
              ) : (
                <p className="text-[10px] text-white/40 leading-relaxed">{thesis.riskNote}</p>
              )}
            </Section>
          </div>

          {thesis.entryLow > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.015] p-3">
              <span className="text-[9px] text-white/25 uppercase tracking-widest font-bold block mb-1">Gestione del rischio</span>
              <p className="text-[10px] text-white/40 leading-relaxed">{thesis.riskNote}</p>
            </div>
          )}

          {/* Platforms */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/35 mb-3">PIATTAFORME REGOLAMENTATE</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PLATFORMS.map(pl => (
                <a
                  key={pl.name}
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 p-2.5 rounded-lg border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <div className="flex-1">
                    <div className="text-[11px] text-white/70 group-hover:text-white transition-colors font-semibold">{pl.name}</div>
                    <div className="text-[9px] text-white/30 leading-snug mt-0.5">{pl.note}</div>
                  </div>
                  <span className="text-white/20 group-hover:text-white/50 transition-colors text-xs mt-0.5">↗</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      <GlossaryAccordion />

      <p className="text-center font-mono text-[10px] leading-relaxed text-white/20">
        Simulazione educativa. Non costituisce consulenza finanziaria. Verifica sempre la regolamentazione applicabile nel tuo paese prima di operare su crypto.
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function MarketArt() {
  const [symbol, setSymbol] = useState<string>("btcusdt");
  const [tab, setTab] = useState<"pulse" | "tesi">("pulse");
  const [running, setRunning] = useState(false);
  const { statsRef, display, status } = useCryptoStream(symbol);

  const [toast, setToast] = useState<ToastState>(null);
  const showInfo = useCallback((key: string) => {
    const info = INFO[key];
    if (info) setToast(info);
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="flex flex-col items-center gap-4 p-2 md:p-4">

      {/* Header + tabs */}
      <div className="w-full max-w-3xl space-y-3">
        <div className="text-center">
          <h2 className="font-mono text-xl font-bold tracking-widest text-u-sky md:text-2xl">INTENT</h2>
          <p className="mx-auto mt-1 max-w-md font-mono text-xs text-gray-400">
            Intelligence crypto · Austrian Allocation · strategia di posizionamento annualizzata
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-1.5">
          {(["pulse", "tesi"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-mono text-[11px] font-bold tracking-[0.2em] uppercase border transition-all duration-200 ${
                tab === t
                  ? "bg-u-sky/15 border-u-sky/50 text-u-sky shadow-[0_0_12px_rgba(154,209,245,0.2)]"
                  : "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60"
              }`}
            >
              {t === "pulse" ? "📡 Pulse" : "📋 Tesi"}
            </button>
          ))}
        </div>
      </div>

      {/* ── PULSE TAB ────────────────────────────────────────────── */}
      {tab === "pulse" && (
        <>
          {/* Symbol picker */}
          <div className="flex max-w-3xl flex-wrap justify-center gap-1.5">
            {SYMBOLS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSymbol(s.id)}
                className={`rounded border px-2.5 py-1 font-mono text-[11px] tracking-wider transition ${
                  symbol === s.id
                    ? "border-u-sky bg-u-sky/10 text-u-sky"
                    : "border-white/15 text-white/45 hover:border-white/40 hover:text-white/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div className="relative mx-auto h-[55vh] min-h-[380px] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#04050a]">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]} frameloop={running ? "always" : "never"}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[3, 2, 4]} intensity={1.2} />
                <pointLight position={[-4, -2, -3]} intensity={0.6} color="#4060ff" />
                <FlowBackground statsRef={statsRef} />
                <Core statsRef={statsRef} />
                <ParticleField statsRef={statsRef} />
              </Suspense>
            </Canvas>

            {/* Play / pause overlay */}
            {!running ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
                <button
                  onClick={() => setRunning(true)}
                  className="group flex h-16 w-16 items-center justify-center rounded-full border border-u-sky/40 bg-u-sky/10 text-u-sky shadow-[0_0_24px_rgba(154,209,245,0.2)] transition-all hover:bg-u-sky/20 hover:border-u-sky/70 hover:shadow-[0_0_32px_rgba(154,209,245,0.4)] active:scale-95"
                  aria-label="Avvia animazione"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 translate-x-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">avvia visualizzazione</span>
              </div>
            ) : (
              <button
                onClick={() => setRunning(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/40 backdrop-blur-sm transition hover:bg-black/70 hover:text-white/70"
                aria-label="Pausa animazione"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
            )}

            <HUD display={display} status={status} symbol={symbol} />
            <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/20">
              live market
            </div>
          </div>

          <SignalsPanel symbol={symbol} onInfo={showInfo} />

          <div className="flex w-full max-w-3xl items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[9px] font-mono text-white/22 uppercase tracking-[0.25em] flex items-center gap-1">
              Austrian Allocation Model
              <InfoBtn infoKey="verdict" onShow={showInfo} />
            </span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <AustrianPanel symbol={symbol} onInfo={showInfo} />

          <p className="max-w-2xl text-center font-mono text-[11px] leading-relaxed text-white/30">
            Indicatori descrittivi. I mercati non sono prevedibili in modo affidabile. Nulla costituisce consulenza finanziaria.
          </p>
        </>
      )}

      {/* ── TESI TAB ─────────────────────────────────────────────── */}
      {tab === "tesi" && <MarketThesis />}

      <AnimatePresence>
        {toast && <Toast toast={toast} onDismiss={dismissToast} />}
      </AnimatePresence>
    </div>
  );
}
