export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Smart Stock Advisor. Built for personal investment
          research.
        </p>
        <p className="mt-2">
          Crafted with Next.js, Tailwind CSS, and data from Alpha Vantage & Yahoo Finance.
        </p>
      </div>
    </footer>
  );
}
