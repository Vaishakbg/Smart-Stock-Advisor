import Link from "next/link";

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Dashboard</h1>
        <p className="text-slate-400">
          Review headline metrics, recent price movements, and your personalized action
          items.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-medium text-white">Portfolio Snapshot</h2>
          <p className="mt-3 text-sm text-slate-400">
            Insert charts for performance, allocation, and risk versus benchmarks.
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-medium text-white">Signal Feed</h2>
          <p className="mt-3 text-sm text-slate-400">
            Surface alpha ideas, earnings alerts, and macro catalysts queued for review.
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-lg font-medium text-white">Next Steps</h2>
          <p className="mt-3 text-sm text-slate-400">
            Track pending trades, research to-dos, and risk controls that need attention.
          </p>
        </article>
      </div>
      <footer className="flex flex-wrap gap-3 text-sm text-slate-400">
        <span>Jump to:</span>
        <Link href="/screener" className="underline decoration-brand-400/60">
          Equity Screener
        </Link>
        <Link href="/watchlist" className="underline decoration-brand-400/60">
          Watchlist
        </Link>
        <Link href="/settings" className="underline decoration-brand-400/60">
          Settings
        </Link>
      </footer>
    </section>
  );
}
