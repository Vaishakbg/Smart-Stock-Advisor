"use client";

import { FormEvent } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { InvestmentHorizon, RiskLevel } from "@/utils/scoreStock";

const HORIZON_OPTIONS: Array<{ value: InvestmentHorizon; label: string; helper: string }> = [
  { value: "short", label: "Short term", helper: "0-2 years" },
  { value: "mid", label: "Mid term", helper: "3-5 years" },
  { value: "long", label: "Long term", helper: "5+ years" }
];

const RISK_OPTIONS: Array<{ value: RiskLevel; label: string; helper: string }> = [
  { value: "conservative", label: "Conservative", helper: "Capital preservation first" },
  { value: "moderate", label: "Moderate", helper: "Balance growth with drawdowns" },
  { value: "aggressive", label: "Aggressive", helper: "Maximize upside, accept volatility" }
];

const SECTOR_OPTIONS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Energy",
  "Industrials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Utilities",
  "Communication Services",
  "Real Estate",
  "Materials"
];

export default function SettingsPage() {
  const { form, updateField, toggleSector, reset } = useUserProfile();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Settings</h1>
        <p className="text-slate-400">
          Tell Smart Stock Advisor how you invest so recommendations feel tailored to your plan. Preferences save locally in your browser.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Investment Horizon</h2>
          <p className="mt-1 text-sm text-slate-400">Helps tune position duration assumptions and rebalance cadence.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {HORIZON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition ${
                  form.investmentHorizon === option.value
                    ? "border-brand-500 bg-brand-500/10 text-white"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-brand-500/60"
                }`}
              >
                <span className="flex items-center justify-between text-sm font-medium">
                  {option.label}
                  <input
                    type="radio"
                    name="investmentHorizon"
                    value={option.value}
                    checked={form.investmentHorizon === option.value}
                    onChange={() => updateField("investmentHorizon", option.value)}
                    className="sr-only"
                  />
                </span>
                <span className="mt-1 text-xs text-slate-400">{option.helper}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Risk Profile</h2>
          <p className="mt-1 text-sm text-slate-400">Used when weighting growth versus drawdown resilience in scoring.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {RISK_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition ${
                  form.riskProfile === option.value
                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/60"
                }`}
              >
                <span className="flex items-center justify-between text-sm font-medium">
                  {option.label}
                  <input
                    type="radio"
                    name="riskProfile"
                    value={option.value}
                    checked={form.riskProfile === option.value}
                    onChange={() => updateField("riskProfile", option.value)}
                    className="sr-only"
                  />
                </span>
                <span className="mt-1 text-xs text-slate-400">{option.helper}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Preferred Sectors</h2>
          <p className="mt-1 text-sm text-slate-400">Pick industries you want highlighted in screeners and watchlists.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECTOR_OPTIONS.map((sector) => {
              const checked = form.preferredSectors.includes(sector);
              return (
                <label
                  key={sector}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    checked
                      ? "border-brand-500 bg-brand-500/10 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-brand-500/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={sector}
                    checked={checked}
                    onChange={() => toggleSector(sector)}
                    className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-brand-500 focus:ring-brand-400"
                  />
                  <span>{sector}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white">Alerts &amp; Updates</h2>
          <p className="mt-1 text-sm text-slate-400">Opt in to email or push notifications when available.</p>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-brand-500/60">
            <span>
              Notifications opt-in
              <span className="block text-xs text-slate-400">We will respect this when delivery channels launch.</span>
            </span>
            <input
              type="checkbox"
              checked={form.notificationsOptIn}
              onChange={(event) => updateField("notificationsOptIn", event.target.checked)}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-brand-500 focus:ring-brand-400"
            />
          </label>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Changes save instantly to localStorage.</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-500 hover:text-brand-200"
          >
            Reset to defaults
          </button>
        </footer>
      </form>
    </section>
  );
}
