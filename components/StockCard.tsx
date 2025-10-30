"use client";

import { useMemo } from "react";
import { WatchToggle } from "@/components/WatchToggle";

export type StockCardProps = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sparkline: number[]; // last 10 closes
  onWatchToggle?: (symbol: string, isWatched: boolean) => void;
};

const SPARKLINE_WIDTH = 120;
const SPARKLINE_HEIGHT = 40;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function buildSparklinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function StockCard({ symbol, name, price, changePercent, sparkline, onWatchToggle }: StockCardProps) {
  const isPositive = changePercent >= 0;
  const formattedChange = `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`;

  const chart = useMemo(() => {
    const trimmed = sparkline.slice(-10);
    return {
      points: trimmed,
      path: buildSparklinePath(trimmed, SPARKLINE_WIDTH, SPARKLINE_HEIGHT)
    };
  }, [sparkline]);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-brand-500/60 hover:shadow-brand-500/10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-300/80">{symbol}</p>
          <h2 className="text-xl font-semibold text-white">{name}</h2>
        </div>
        <WatchToggle
          symbol={symbol}
          onToggle={(sym, state) => {
            onWatchToggle?.(sym, state);
          }}
        />
      </header>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">{currencyFormatter.format(price)}</span>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            isPositive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {formattedChange}
        </span>
      </div>

      <div className="flex w-full items-center gap-3">
        <svg viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`} className="h-12 w-full max-w-[160px]">
          <defs>
            <linearGradient id={`spark-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d82ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0d82ff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={chart.path} fill="none" stroke="#0d82ff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {chart.points.length > 1 && (
            <path
              d={`${chart.path} L${SPARKLINE_WIDTH},${SPARKLINE_HEIGHT} L0,${SPARKLINE_HEIGHT} Z`}
              fill={`url(#spark-${symbol})`}
              opacity={0.4}
            />
          )}
        </svg>
        <p className="text-xs text-slate-400">Last {chart.points.length} closes</p>
      </div>
    </article>
  );
}
