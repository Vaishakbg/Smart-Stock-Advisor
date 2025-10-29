export default function ScreenerPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Equity Screener</h1>
        <p className="text-slate-400">
          Build custom filters across fundamentals, technical trends, and alternative data
          overlays.
        </p>
      </header>
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <p className="text-sm text-slate-300">
          Configure factor sets, valuation bands, momentum rules, and risk metrics. Results
          will appear here and can be saved directly to watchlists.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-slate-700 p-6">
          <h2 className="text-base font-semibold text-white">Preset Filters</h2>
          <p className="mt-2 text-sm text-slate-400">
            Load ready-made strategies like Quality at a Reasonable Price, Growth at a
            Discount, or High Conviction Dividends.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-700 p-6">
          <h2 className="text-base font-semibold text-white">Backtest Preview</h2>
          <p className="mt-2 text-sm text-slate-400">
            Preview rolling performance, drawdowns, and turnover before committing to a
            screen.
          </p>
        </div>
      </div>
    </section>
  );
}
