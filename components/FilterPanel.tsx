"use client";

import type { ChangeEvent } from "react";

export type FilterValues = {
  peMin?: number;
  peMax?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  dividendYieldMin?: number;
  dividendYieldMax?: number;
  sector?: string;
};

export type FilterPanelProps = {
  value: FilterValues;
  sectors: string[];
  onChange: (value: FilterValues) => void;
  onReset?: () => void;
};

function parseNumeric(value: string): number | undefined {
  if (value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function FilterPanel({ value, sectors, onChange, onReset }: FilterPanelProps) {
  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: raw } = event.target;
    const updated = { ...value, [name]: parseNumeric(raw) };
    onChange(updated);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value || undefined;
    onChange({ ...value, sector: nextValue });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <p className="text-sm text-slate-400">
            Tune valuation, size, income, and sector preferences to tailor the screener results.
          </p>
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-brand-500 hover:text-brand-200"
          >
            Reset
          </button>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-200">P/E Ratio</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Min
              <input
                type="number"
                name="peMin"
                value={value.peMin ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Max
              <input
                type="number"
                name="peMax"
                value={value.peMax ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-200">Market Cap ($B)</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Min
              <input
                type="number"
                name="marketCapMin"
                value={value.marketCapMin ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Max
              <input
                type="number"
                name="marketCapMax"
                value={value.marketCapMax ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-200">Dividend Yield (%)</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Min
              <input
                type="number"
                name="dividendYieldMin"
                value={value.dividendYieldMin ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Max
              <input
                type="number"
                name="dividendYieldMax"
                value={value.dividendYieldMax ?? ""}
                onChange={handleNumberChange}
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                min="0"
                step="0.1"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-200">Sector</legend>
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Select
            <select
              value={value.sector ?? ""}
              onChange={handleSelectChange}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="">All sectors</option>
              {sectors.map((sector) => (
                <option value={sector} key={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>
    </section>
  );
}
