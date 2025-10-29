export default function SettingsPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Settings</h1>
        <p className="text-slate-400">
          Manage data providers, notification preferences, and personalization options.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-base font-semibold text-white">API Integrations</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for Alpha Vantage keys, Yahoo Finance toggles, and rate limit
            controls.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-base font-semibold text-white">Preferences</h2>
          <p className="mt-2 text-sm text-slate-400">
            Placeholder for default symbols, dashboards, and localStorage caching policy.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-700 p-6 md:col-span-2">
          <h2 className="text-base font-semibold text-white">FastAPI Bridge</h2>
          <p className="mt-2 text-sm text-slate-400">
            Configure the optional FastAPI analytics service URL, authentication, and
            workload scheduling.
          </p>
        </div>
      </div>
    </section>
  );
}
