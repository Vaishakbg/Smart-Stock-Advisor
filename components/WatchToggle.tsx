"use client";

import { useEffect, useMemo, useState } from "react";

const WATCHLIST_KEY = "smart-stock-advisor.watchlist";

export type WatchToggleProps = {
  symbol: string;
  onToggle?: (symbol: string, isWatched: boolean) => void;
  className?: string;
};

export function WatchToggle({ symbol, onToggle, className = "" }: WatchToggleProps) {
  const [isWatched, setIsWatched] = useState(false);
  const storageAvailable = useMemo(
    () => typeof window !== "undefined" && typeof window.localStorage !== "undefined",
    []
  );

  useEffect(() => {
    if (!storageAvailable) return;
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      setIsWatched(parsed.includes(symbol));
    } catch (error) {
      console.warn("Failed to read watchlist", error);
    }
  }, [symbol, storageAvailable]);

  const updateStorage = (next: boolean) => {
    if (!storageAvailable) return;
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      const current = raw ? (JSON.parse(raw) as string[]) : [];
      const deduped = new Set(current);
      if (next) {
        deduped.add(symbol);
      } else {
        deduped.delete(symbol);
      }
      window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(deduped)));
    } catch (error) {
      console.warn("Failed to persist watchlist", error);
    }
  };

  const handleToggle = () => {
    const next = !isWatched;
    setIsWatched(next);
    updateStorage(next);
    onToggle?.(symbol, next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isWatched}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        isWatched
          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
          : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-brand-500/60 hover:text-brand-200"
      } ${className}`}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-current" />
      {isWatched ? "Watching" : "Watch"}
    </button>
  );
}
