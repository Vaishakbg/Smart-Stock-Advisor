# Smart Stock Advisor

Smart Stock Advisor is a personal research hub for tracking equities, testing strategies, and surfacing actionable insights. It combines a Next.js front end with flexible data providers so you can explore price trends, fundamentals, and custom signals without leaving your browser.

## Features

- Responsive dashboard powered by Next.js and Tailwind CSS
- Portfolio watchlists with local caching and offline-friendly storage
- On-demand analytics via Next.js API routes with optional FastAPI boosters
- Integrations with Alpha Vantage (primary) and Yahoo Finance (fallback) APIs
- Alerting hooks and goal tracking tuned for individual investors

## Tech Stack

- **UI:** Next.js 14, React Server Components, Tailwind CSS, Headless UI
- **Runtime:** Node.js 18+, Vercel Edge / Serverless Functions
- **Backend:** Next.js API routes (default) with optional FastAPI microservices for heavy workloads
- **Data Providers:** Alpha Vantage (primary), Yahoo Finance (secondary)
- **Storage:** Browser localStorage, optional Redis or Supabase caching layers
- **Build & Tooling:** TypeScript, ESLint, Prettier

## Getting Started

### 1. Prerequisites

- Install [Node.js](https://nodejs.org/) v18 or newer (ships with `npm` 9+).
- (Optional) Install [Python 3.11+](https://www.python.org/) if you plan to run the FastAPI services.

### 2. Install Dependencies

```powershell
# install JavaScript/TypeScript packages
npm install

# optional: set up FastAPI backend
pip install -r services/fastapi/requirements.txt
```

### 3. Configure Environment Variables

Create a `.env.local` file at the project root with the following keys:

```dotenv
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
YAHOO_FINANCE_API_KEY=optional-yahoo-key
NEXT_PUBLIC_DEFAULT_SYMBOL=AAPL
FASTAPI_BASE_URL=http://localhost:8000 # leave blank if not using FastAPI
```

> Tip: Alpha Vantage free tier allows 5 requests per minute and 500 per day. Use the FastAPI layer or caching strategies to stay below the threshold.

### 4. Run the App Locally

```powershell
# start Next.js dev server
npm run dev

# optional: start FastAPI service
define FASTAPI_APP=services.fastapi.main
uvicorn %FASTAPI_APP%:app --reload --port 8000
```

Visit `http://localhost:3000` in your browser.

### 5. Lint & Test

```powershell
npm run lint
npm run test
```

## Deployment

- **Primary:** Deploy directly to Vercel. Set environment variables in the Vercel dashboard (`ALPHA_VANTAGE_API_KEY`, etc.).
- **APIs:** Vercel Serverless Functions handle light workloads. For heavier analytics, deploy the FastAPI service to a managed platform (Railway, Fly.io, or Azure Container Apps) and wire it via `FASTAPI_BASE_URL`.
- **Static Assets:** Tailwind builds are optimized via Next.js Image and font pipelines. Use Vercel's Edge Cache for static responses.

## Cost-Minimizing Tips

- **Client-side storage:** Cache watchlists and user preferences in `localStorage` to avoid repeated API calls.
- **Response caching:** Implement stale-while-revalidate caching in Next.js API routes and reuse responses via in-memory or Redis caches.
- **Alpha Vantage limits:** Batch requests, enable throttling, and pre-fetch at off-peak times to stay within the free tier.
- **Fallback data:** Use Yahoo Finance's unofficial endpoints sparingly as backups when Alpha Vantage rate limits hit.
- **FastAPI only when needed:** Keep the optional backend dormant unless running complex analytics, reducing hosting costs.

## Project Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create an optimized production build |
| `npm start` | Run the production server |
| `npm run lint` | Lint the codebase |
| `npm run test` | Execute unit/integration tests |

## Roadmap

- Expand charting with streaming data
- Add sentiment analysis connectors
- Integrate personal budgeting and target tracking modules

## License

Licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
