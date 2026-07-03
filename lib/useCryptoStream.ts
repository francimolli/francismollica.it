"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live market state derived from Binance's public trade stream.
 *
 * IMPORTANT: these are descriptive metrics of the *current* state of the order
 * flow — NOT a prediction of where the price is going. The whole point of the
 * piece is to let the market paint itself honestly, in real time.
 */
export type MarketStats = {
  /** Latest traded price. */
  price: number;
  /** Signed % change over the rolling window (-1..1-ish), used as "mood". */
  momentum: number;
  /** Std-dev of recent log-returns, normalised ~0..1. Drives turbulence. */
  volatility: number;
  /** Trades per second, normalised ~0..1. Drives energy. */
  intensity: number;
  /** Fraction of aggressive buys in the window (0..1). 0.5 = balanced. */
  buyPressure: number;
  /** True once at least one real trade has been received. */
  live: boolean;
};

const EMPTY: MarketStats = {
  price: 0,
  momentum: 0,
  volatility: 0,
  intensity: 0,
  buyPressure: 0.5,
  live: false,
};

type Trade = { price: number; qty: number; time: number; buyerTaker: boolean };

// Rolling window of trades we keep to compute the stats from.
const WINDOW_MS = 30_000;
const MAX_TRADES = 600;

/**
 * Public Binance stream hosts, tried in rotation. `data-stream.binance.vision`
 * is the read-only data domain that is NOT geo-blocked (stream.binance.com is
 * blocked/DNS-poisoned in several regions), so it goes first; the rest are
 * fallbacks rotated through on each reconnect.
 */
const WS_HOSTS = [
  "wss://data-stream.binance.vision/ws",
  "wss://stream.binance.com:9443/ws",
  "wss://stream.binance.com:443/ws",
];

/**
 * Subscribes to a single Binance symbol's trade stream and exposes the derived
 * market state two ways:
 *  - `statsRef`: a mutable ref, updated on every tick, for use inside useFrame
 *    (no React re-renders — smooth 60fps animation).
 *  - `display`: a throttled snapshot (~5/s) for the HUD overlay.
 */
export function useCryptoStream(symbol: string = "btcusdt") {
  const statsRef = useRef<MarketStats>({ ...EMPTY });
  const [display, setDisplay] = useState<MarketStats>({ ...EMPTY });
  const [status, setStatus] = useState<"connecting" | "live" | "error">(
    "connecting"
  );

  useEffect(() => {
    const trades: Trade[] = [];
    let ws: WebSocket | null = null;
    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let hostIdx = 0; // advances through WS_HOSTS on each reconnect

    const recompute = (now: number) => {
      // Drop trades outside the rolling window.
      const cutoff = now - WINDOW_MS;
      while (trades.length && trades[0].time < cutoff) trades.shift();
      if (trades.length > MAX_TRADES) trades.splice(0, trades.length - MAX_TRADES);

      const n = trades.length;
      if (n === 0) return;

      const first = trades[0].price;
      const last = trades[n - 1].price;

      // Momentum: % change across the window, softly clamped to a usable range.
      const rawMomentum = first > 0 ? (last - first) / first : 0;
      const momentum = Math.max(-1, Math.min(1, rawMomentum * 40));

      // Volatility: std-dev of log returns between consecutive trades.
      let mean = 0;
      const returns: number[] = [];
      for (let i = 1; i < n; i++) {
        const r = Math.log(trades[i].price / trades[i - 1].price);
        returns.push(r);
        mean += r;
      }
      if (returns.length) mean /= returns.length;
      let variance = 0;
      for (const r of returns) variance += (r - mean) ** 2;
      const std = returns.length ? Math.sqrt(variance / returns.length) : 0;
      const volatility = Math.min(1, std * 4000);

      // Intensity: trades-per-second over the window, normalised.
      const spanSec = Math.max(1, (last ? now - trades[0].time : 0) / 1000);
      const tps = n / spanSec;
      const intensity = Math.min(1, tps / 12);

      // Buy pressure: share of aggressive (taker) buys.
      let buys = 0;
      for (const t of trades) if (t.buyerTaker) buys++;
      const buyPressure = buys / n;

      statsRef.current = {
        price: last,
        momentum,
        volatility,
        intensity,
        buyPressure,
        live: true,
      };
    };

    const connect = () => {
      const host = WS_HOSTS[hostIdx % WS_HOSTS.length];
      hostIdx++;
      ws = new WebSocket(`${host}/${symbol}@trade`);

      ws.onopen = () => setStatus("live");

      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          // Binance trade payload: p=price, q=qty, T=time, m=isBuyerMaker.
          const price = parseFloat(d.p);
          if (!Number.isFinite(price)) return;
          trades.push({
            price,
            qty: parseFloat(d.q) || 0,
            time: typeof d.T === "number" ? d.T : Date.now(),
            buyerTaker: d.m === false, // buyer is the taker => aggressive buy
          });
          recompute(d.T || Date.now());
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => setStatus("error");

      ws.onclose = () => {
        if (closedByUs) return;
        setStatus("connecting");
        reconnectTimer = setTimeout(connect, 2500);
      };
    };

    connect();

    // Throttled HUD updates so we don't re-render on every single trade.
    const hud = setInterval(() => {
      setDisplay({ ...statsRef.current });
    }, 200);

    return () => {
      closedByUs = true;
      clearInterval(hud);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [symbol]);

  return { statsRef, display, status };
}
