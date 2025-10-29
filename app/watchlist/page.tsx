export default function WatchlistPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Watchlist</h1>
        <p className="text-slate-400">
          Monitor favorite tickers, sentiment, and alert thresholds in one streamlined view.
        </p>
      </header>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <p className="text-sm text-slate-300">
          Group positions by strategy, risk bucket, or portfolio sleeve. Sync to localStorage
          to keep preferred layouts without additional API calls.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-dashed border-slate-700 p-6">
          <h2 className="text-base font-semibold text-white">Insights Queue</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for upcoming catalysts, earnings dates, and valuation notes.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-700 p-6">
          <h2 className="text-base font-semibold text-white">Performance Heatmap</h2>
          <p className="mt-2 text-sm text-slate-400">
            Summaries of 1D/1W/1M changes, volatility, and volume anomalies by symbol.
          </p>
        </div>
      </div>
    </section>
  );
}
