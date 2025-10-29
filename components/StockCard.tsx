"use client";

import type { FC } from "react";
import { WatchToggle } from "@/components/WatchToggle";

export type StockCardProps = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector: string;
  shortSummary: string;
  onAddToWatchlist: (symbol: string) => void;
  showWatchToggle?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export const StockCard: FC<StockCardProps> = ({
  symbol,
  name,
  price,
  changePercent,
  sector,
  shortSummary,
  onAddToWatchlist,
  showWatchToggle = true
}) => {
  const isPositive = changePercent >= 0;
  const formattedChange = `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-brand-500/60 hover:shadow-brand-500/10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-300/80">{symbol}</p>
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <p className="text-sm text-slate-400">{sector}</p>
        </div>
        {showWatchToggle ? (
          <WatchToggle
            symbol={symbol}
            onToggle={(_, nextState) => {
              if (nextState) {
                onAddToWatchlist(symbol);
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => onAddToWatchlist(symbol)}
            className="rounded-md border border-brand-500/40 px-3 py-1 text-xs font-medium text-brand-200 transition hover:border-brand-400 hover:text-brand-100"
          >
            Add
          </button>
        )}
      </header>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-semibold text-white">
          {currencyFormatter.format(price)}
        </span>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            isPositive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
          }`}
        >
          {formattedChange}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{shortSummary}</p>
      <footer>
        <button
          type="button"
          onClick={() => onAddToWatchlist(symbol)}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Add to Watchlist
        </button>
      </footer>
    </article>
  );
};
