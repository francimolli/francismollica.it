"use client";

import { useEffect, useState } from "react";

export type Signals = {
  rsi: number;
  smaFast: number;
  smaSlow: number;
  trend: "up" | "down";
  lastClose: number;
};

export type Backtest = {
  interval: string;
  bars: number;
  strategyReturnPct: number;
  buyHoldReturnPct: number;
  trades: number;
  winRatePct: number;
  beatBuyHold: boolean;
  verdict: string;
};

export type AustrianSignal = {
  verdict: "BOND" | "WATCH" | "DIVERGENCE" | "SIGNAL";
  verdictLabel: string;
  confidence: number;
  rsiMulti: { r7: number; r14: number; r21: number; consensus: "oversold" | "neutral" | "overbought" };
  vwapDeviation: number;
  volatilityPercentile: number;
  volumeTrend: "confirming" | "diverging" | "neutral";
  crossPair: { bullish: number; bearish: number; total: number };
  herdingDetected: boolean;
  annualizedReturn: number;
  bondBaseline: number;
  excessReturn: number;
  requiredExcess: number;
  compoundProjection: { months3: number; months6: number; months12: number };
  // Raw price data for thesis entry/exit computation
  lastClose: number;
  atrCurrent: number;
};

export type Sector = "Store of Value" | "Smart Contract" | "Payment" | "DeFi/Oracle" | "Interop" | "L2/Scaling";
export type CapTier = "mega" | "large" | "mid";
export type Horizon = "short" | "medium" | "long";

export type PairScore = {
  symbol: string;
  label: string;
  sector: Sector;
  tier: CapTier;
  score: number;
  verdict: AustrianSignal["verdict"];
  annualizedReturn: number;
  excessReturn: number;
  requiredExcess: number;
  volatilityPercentile: number;
  rsi14: number;
  volumeTrend: "confirming" | "diverging" | "neutral";
  lastClose: number;
  atrCurrent: number;
  // Strategic horizon recommendation
  horizon: Horizon;
  // Bond-equivalent "duration" label
  durationLabel: string;
};

const SCAN_PAIRS: { id: string; label: string; sector: Sector; tier: CapTier }[] = [
  { id: "btcusdt",  label: "BTC",  sector: "Store of Value",  tier: "mega" },
  { id: "ethusdt",  label: "ETH",  sector: "Smart Contract",  tier: "mega" },
  { id: "solusdt",  label: "SOL",  sector: "Smart Contract",  tier: "large" },
  { id: "bnbusdt",  label: "BNB",  sector: "Smart Contract",  tier: "large" },
  { id: "xrpusdt",  label: "XRP",  sector: "Payment",         tier: "large" },
  { id: "adausdt",  label: "ADA",  sector: "Smart Contract",  tier: "large" },
  { id: "avaxusdt", label: "AVAX", sector: "Smart Contract",  tier: "large" },
  { id: "dotusdt",  label: "DOT",  sector: "Interop",         tier: "mid" },
  { id: "linkusdt", label: "LINK", sector: "DeFi/Oracle",     tier: "mid" },
  { id: "atomusdt", label: "ATOM", sector: "Interop",         tier: "mid" },
  { id: "nearusdt", label: "NEAR", sector: "Smart Contract",  tier: "mid" },
  { id: "ltcusdt",  label: "LTC",  sector: "Payment",         tier: "mid" },
  { id: "maticusdt",label: "MATIC",sector: "L2/Scaling",      tier: "mid" },
  { id: "trxusdt",  label: "TRX",  sector: "Payment",         tier: "mid" },
  { id: "dogeusdt", label: "DOGE", sector: "Payment",         tier: "large" },
];

const SMA_FAST = 10;
const SMA_SLOW = 30;
const RSI_LEN = 14;
const FEE = 0.001;
const BOND_BASELINE = 4.5;

const REST_HOSTS = [
  "https://data-api.binance.vision",
  "https://api.binance.com",
  "https://api-gcp.binance.com",
  "https://api1.binance.com",
];

async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number,
  signal: AbortSignal
): Promise<any[]> {
  let lastErr: unknown = null;
  for (const host of REST_HOSTS) {
    try {
      const url = `${host}/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
      const r = await fetch(url, { signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return (await r.json()) as any[];
    } catch (e) {
      if (signal.aborted) throw e;
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("all hosts failed");
}

function sma(values: number[], end: number, len: number): number {
  if (end + 1 < len) return NaN;
  let s = 0;
  for (let i = end - len + 1; i <= end; i++) s += values[i];
  return s / len;
}

function rsi(values: number[], end: number, len: number): number {
  if (end < len) return NaN;
  let gain = 0, loss = 0;
  for (let i = end - len + 1; i <= end; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  const avgGain = gain / len;
  const avgLoss = loss / len;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function backtest(closes: number[], interval: string): Backtest {
  const n = closes.length;
  let equity = 1;
  let inPosition = false;
  let trades = 0, wins = 0, entryPrice = 0;

  for (let i = SMA_SLOW; i < n; i++) {
    const fast = sma(closes, i, SMA_FAST);
    const slow = sma(closes, i, SMA_SLOW);
    const wantLong = fast > slow;
    if (wantLong && !inPosition) {
      inPosition = true; entryPrice = closes[i]; equity *= 1 - FEE;
    } else if (!wantLong && inPosition) {
      inPosition = false;
      const ret = closes[i] / entryPrice;
      equity *= ret * (1 - FEE); trades++;
      if (ret > 1) wins++;
    }
  }
  if (inPosition) {
    const ret = closes[n - 1] / entryPrice;
    equity *= ret * (1 - FEE); trades++;
    if (ret > 1) wins++;
  }

  const strategyReturnPct = (equity - 1) * 100;
  const buyHoldReturnPct = (closes[n - 1] / closes[SMA_SLOW] - 1) * 100;
  const beatBuyHold = strategyReturnPct > buyHoldReturnPct;
  const winRatePct = trades ? (wins / trades) * 100 : 0;
  const verdict = beatBuyHold
    ? `Sul finestra analizzata la strategia ha battuto il buy-&-hold di ${(strategyReturnPct - buyHoldReturnPct).toFixed(1)}pts — il passato non garantisce il futuro.`
    : `Il buy-&-hold ha vinto di ${(buyHoldReturnPct - strategyReturnPct).toFixed(1)}pts. La strategia ha sottoperformato il non fare nulla — come di consueto.`;

  return { interval, bars: n, strategyReturnPct, buyHoldReturnPct, trades, winRatePct, beatBuyHold, verdict };
}

function computeSignals(closes: number[]): Signals {
  const i = closes.length - 1;
  const smaFast = sma(closes, i, SMA_FAST);
  const smaSlow = sma(closes, i, SMA_SLOW);
  return { rsi: rsi(closes, i, RSI_LEN), smaFast, smaSlow, trend: smaFast >= smaSlow ? "up" : "down", lastClose: closes[i] };
}

// ── Austrian helpers ─────────────────────────────────────────────────────────

function computeMultiRSI(closes: number[]): AustrianSignal["rsiMulti"] {
  const i = closes.length - 1;
  const r7 = rsi(closes, i, 7);
  const r14 = rsi(closes, i, 14);
  const r21 = rsi(closes, i, 21);
  const overbought = r7 > 70 && r14 > 65 && r21 > 60;
  const oversold = r7 < 30 && r14 < 35 && r21 < 40;
  return { r7, r14, r21, consensus: overbought ? "overbought" : oversold ? "oversold" : "neutral" };
}

// rows: raw Binance kline arrays [openTime, open, high, low, close, volume, ...]
function computeVWAP(rows: any[][], period: number): number {
  const slice = rows.slice(-period);
  let pvSum = 0, volSum = 0;
  for (const row of slice) {
    const typical = (parseFloat(row[2]) + parseFloat(row[3]) + parseFloat(row[4])) / 3;
    const vol = parseFloat(row[5]);
    pvSum += typical * vol;
    volSum += vol;
  }
  if (volSum === 0) return 0;
  const vwap = pvSum / volSum;
  const lastClose = parseFloat(rows[rows.length - 1][4]);
  return (lastClose - vwap) / vwap; // positive = above VWAP
}

function computeVolatilityPercentile(rows: any[][]): number {
  const atrs: number[] = [];
  for (let i = 1; i < rows.length; i++) {
    const high = parseFloat(rows[i][2]);
    const low = parseFloat(rows[i][3]);
    const prevClose = parseFloat(rows[i - 1][4]);
    atrs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const current = atrs[atrs.length - 1];
  return atrs.filter(a => a <= current).length / atrs.length;
}

function computeVolumeTrend(rows: any[][]): "confirming" | "diverging" | "neutral" {
  const closes = rows.map(r => parseFloat(r[4]));
  const volumes = rows.map(r => parseFloat(r[5]));
  const n = closes.length;
  const short = 10, long = 30;
  const recentVol = volumes.slice(-short).reduce((a, b) => a + b, 0) / short;
  const historVol = volumes.slice(-long).reduce((a, b) => a + b, 0) / long;
  const priceUp = closes[n - 1] > closes[n - short - 1];
  const volUp = recentVol > historVol * 1.1;
  const volDown = recentVol < historVol * 0.9;
  if (priceUp && volUp) return "confirming";
  if (priceUp && volDown) return "diverging";
  return "neutral";
}

// 3 lightweight REST calls (5 daily candles each) to detect directional consensus
const COMPANIONS = ["btcusdt", "ethusdt", "solusdt", "bnbusdt", "avaxusdt"];

async function fetchCrossPairSample(
  currentSymbol: string,
  signal: AbortSignal
): Promise<{ bullish: number; bearish: number; total: number }> {
  const peers = COMPANIONS.filter(s => s !== currentSymbol).slice(0, 3);
  const results = await Promise.allSettled(
    peers.map(async sym => {
      const rows = await fetchKlines(sym, "1d", 5, signal);
      const closes = (rows as any[][]).map(r => parseFloat(r[4]));
      return closes[closes.length - 1] > closes[0] ? "up" : "down";
    })
  );
  let bullish = 0, bearish = 0;
  for (const r of results) {
    if (r.status === "fulfilled") {
      r.value === "up" ? bullish++ : bearish++;
    }
  }
  return { bullish, bearish, total: bullish + bearish };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useMarketAnalysis(symbol: string, interval = "4h", limit = 500) {
  const [signals, setSignals] = useState<Signals | null>(null);
  const [backtestResult, setBacktest] = useState<Backtest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    fetchKlines(symbol, interval, limit, controller.signal)
      .then(rows => {
        if (!Array.isArray(rows) || rows.length < SMA_SLOW + 5) throw new Error("not enough data");
        const closes = (rows as any[][]).map(row => parseFloat(row[4]));
        setSignals(computeSignals(closes));
        setBacktest(backtest(closes, interval));
        setLoading(false);
      })
      .catch(e => {
        if (controller.signal.aborted) return;
        setError(e?.message || "failed to load");
        setLoading(false);
      });
    return () => controller.abort();
  }, [symbol, interval, limit]);

  return { signals, backtest: backtestResult, loading, error };
}

export function useAustrianStrategy(symbol: string) {
  const [signal, setSignal] = useState<AustrianSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);

    (async () => {
      try {
        const rows = await fetchKlines(symbol, "4h", 500, controller.signal);
        if (controller.signal.aborted) return;
        if (!Array.isArray(rows) || rows.length < 50) throw new Error("not enough data");

        const closes = (rows as any[][]).map(r => parseFloat(r[4]));

        const rsiMulti = computeMultiRSI(closes);
        const vwapDeviation = computeVWAP(rows, 50);
        const volatilityPercentile = computeVolatilityPercentile(rows);
        const volumeTrend = computeVolumeTrend(rows);

        // Annualised return over last ~15 days (90 × 4h bars)
        const lookback = Math.min(90, closes.length - 2);
        const recentReturn = closes[closes.length - 1] / closes[closes.length - 1 - lookback] - 1;
        const barsPerYear = 365 * 6;
        const annualizedReturn = (Math.pow(1 + recentReturn, barsPerYear / lookback) - 1) * 100;
        const excessReturn = annualizedReturn - BOND_BASELINE;

        // Volatility premium scales the required hurdle: low vol = 5%, high vol = 20%
        const requiredExcess = 5 + volatilityPercentile * 15;

        // Compound projection
        const dailyRate = annualizedReturn / 100 / 365;
        const compoundProjection = {
          months3: Math.pow(1 + dailyRate, 90),
          months6: Math.pow(1 + dailyRate, 180),
          months12: Math.pow(1 + dailyRate, 365),
        };

        // Cross-pair sample — non-critical, defaults to neutral on failure
        let crossPair = { bullish: 0, bearish: 0, total: 0 };
        try {
          crossPair = await fetchCrossPairSample(symbol, controller.signal);
        } catch { /* non-critical */ }

        if (controller.signal.aborted) return;

        const herdingDetected =
          crossPair.total >= 2 &&
          (crossPair.bullish / crossPair.total > 0.66 ||
            crossPair.bearish / crossPair.total > 0.66);

        const rsiOverheated = rsiMulti.consensus === "overbought";
        const volDiverging = volumeTrend === "diverging";

        let verdict: AustrianSignal["verdict"];
        let verdictLabel: string;
        let confidence: number;

        if (excessReturn <= 0 || (herdingDetected && rsiOverheated)) {
          verdict = "BOND";
          verdictLabel =
            excessReturn <= 0
              ? "La baseline bond (4.5%) supera il rendimento annualizzato attuale. Restare in cash/bond è la scelta razionale."
              : "Herding rilevato con RSI surriscaldato su tre periodi. La massa è già dentro — segnale contrarian verso uscita.";
          confidence = Math.min(0.9, 0.5 + Math.abs(excessReturn) / 20);
        } else if (herdingDetected && volDiverging) {
          verdict = "DIVERGENCE";
          verdictLabel =
            "La massa entra ma il volume recente è in calo rispetto alla media storica. Pattern classico di distribuzione — il mercato sta cedendo la posizione alla folla.";
          confidence = 0.55 + (crossPair.total > 0 ? (crossPair.bullish / crossPair.total) * 0.2 : 0);
        } else if (excessReturn >= requiredExcess && !herdingDetected && volumeTrend === "confirming") {
          verdict = "SIGNAL";
          verdictLabel = `Eccesso reale di ${excessReturn.toFixed(1)}% sul bond baseline supera la soglia austriaca (${requiredExcess.toFixed(1)}%). Volume confermante, nessun herding. Il mercato sembra muoversi per domanda reale.`;
          confidence = Math.min(0.92, 0.55 + excessReturn / 50);
        } else {
          verdict = "WATCH";
          verdictLabel =
            "Segnali misti o eccesso insufficiente a giustificare il rischio rispetto al bond. Il mercato non si esprime con chiarezza — attendere convergenza.";
          confidence = 0.35 + (excessReturn > 0 ? Math.min(0.2, excessReturn / 30) : 0);
        }

        // Raw values for thesis entry/exit computation
        const lastClose = closes[closes.length - 1];
        const atrCurrent = (() => {
          const n = rows.length;
          const h = parseFloat(rows[n - 1][2]);
          const l = parseFloat(rows[n - 1][3]);
          const pc = parseFloat(rows[n - 2][4]);
          return Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        })();

        setSignal({
          verdict, verdictLabel, confidence,
          rsiMulti, vwapDeviation, volatilityPercentile,
          volumeTrend, crossPair, herdingDetected,
          annualizedReturn, bondBaseline: BOND_BASELINE, excessReturn, requiredExcess,
          compoundProjection,
          lastClose, atrCurrent,
        });
        setLoading(false);
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setError(e?.message || "failed");
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [symbol]);

  return { signal, loading, error };
}

// ── Multi-pair quick scan (60 × 4h candles per pair) ─────────────────────────

function deriveHorizon(volatilityPercentile: number, verdict: AustrianSignal["verdict"]): Horizon {
  if (verdict === "BOND") return "short";
  if (volatilityPercentile > 0.7) return "short";
  if (volatilityPercentile < 0.4) return "long";
  return "medium";
}

function deriveDurationLabel(horizon: Horizon, tier: CapTier): string {
  if (horizon === "short") return tier === "mega" ? "1-4 settimane (T-Bill equivalent)" : "1-2 settimane (spec. breve)";
  if (horizon === "medium") return tier === "mega" ? "1-3 mesi (nota a breve termine)" : "4-8 settimane (momentum)";
  return tier === "mega" ? "6-12 mesi (obbligazione strategica)" : "3-6 mesi (posizione strutturale)";
}

function scoreRows(rows: any[][], meta: { sector: Sector; tier: CapTier }): Omit<PairScore, "symbol" | "label"> {
  const closes = (rows as any[][]).map(r => parseFloat(r[4]));
  const n = closes.length;

  const lookback = Math.min(60, n - 2);
  const recentReturn = closes[n - 1] / closes[n - 1 - lookback] - 1;
  const annualizedReturn = (Math.pow(1 + recentReturn, (365 * 6) / lookback) - 1) * 100;
  const excessReturn = annualizedReturn - BOND_BASELINE;

  const rsi14 = rsi(closes, n - 1, RSI_LEN);

  const atrs: number[] = [];
  for (let i = 1; i < rows.length; i++) {
    const h = parseFloat(rows[i][2]);
    const l = parseFloat(rows[i][3]);
    const pc = parseFloat(rows[i - 1][4]);
    atrs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  const atrCurrent = atrs[atrs.length - 1];
  const volatilityPercentile = atrs.filter(a => a <= atrCurrent).length / atrs.length;
  const requiredExcess = 5 + volatilityPercentile * 15;

  const volumeTrend = computeVolumeTrend(rows);
  const lastClose = closes[n - 1];

  const rsiOverheated = rsi14 > 70;
  let verdict: AustrianSignal["verdict"];
  if (excessReturn <= 0 || rsiOverheated) verdict = "BOND";
  else if (volumeTrend === "diverging") verdict = "DIVERGENCE";
  else if (excessReturn >= requiredExcess && volumeTrend === "confirming") verdict = "SIGNAL";
  else verdict = "WATCH";

  // Composite score: excess return vs hurdle + volume quality + RSI headroom
  const excessScore = excessReturn > 0 ? Math.min(1, excessReturn / (requiredExcess * 2)) : -0.5;
  const volumeScore = volumeTrend === "confirming" ? 0.3 : volumeTrend === "diverging" ? -0.3 : 0;
  const rsiScore = rsi14 < 60 ? 0.2 : rsi14 > 70 ? -0.3 : 0;
  const score = excessScore + volumeScore + rsiScore;

  const horizon = deriveHorizon(volatilityPercentile, verdict);
  const durationLabel = deriveDurationLabel(horizon, meta.tier);

  return {
    score, verdict, annualizedReturn, excessReturn, requiredExcess,
    volatilityPercentile, rsi14, volumeTrend, lastClose, atrCurrent,
    sector: meta.sector, tier: meta.tier, horizon, durationLabel,
  };
}

export function useMultiPairScan() {
  const [pairs, setPairs] = useState<PairScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);

    (async () => {
      try {
        const results = await Promise.allSettled(
          SCAN_PAIRS.map(async p => {
            const rows = await fetchKlines(p.id, "4h", 80, controller.signal);
            if (!Array.isArray(rows) || rows.length < 35) throw new Error("insufficient data");
            return { ...scoreRows(rows, { sector: p.sector, tier: p.tier }), symbol: p.id, label: p.label } as PairScore;
          })
        );
        if (controller.signal.aborted) return;

        const scored: PairScore[] = results
          .filter((r): r is PromiseFulfilledResult<PairScore> => r.status === "fulfilled")
          .map(r => r.value)
          .sort((a, b) => b.score - a.score);

        setPairs(scored);
        setLoading(false);
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setError(e?.message || "scan failed");
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  return { pairs, loading, error };
}
