import type { NextApiResponse } from "next";
import { apiCache } from "@/lib/cache";

const ALPHA_BASE_URL = "https://www.alphavantage.co/query";

class AlphaVantageError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AlphaVantageError";
  }
}

const RATE_LIMIT_STATUS = 429;

function getApiKey() {
  const key = process.env.ALPHA_VANTAGE_KEY;
  if (!key) {
    throw new AlphaVantageError("Missing Alpha Vantage API key", 500);
  }
  return key;
}

type FetchAlphaOptions = {
  ttlMs?: number;
};

async function fetchAlpha<T extends Record<string, unknown>>(
  pathParams: Record<string, string>,
  options: FetchAlphaOptions = {}
) {
  const apiKey = getApiKey();
  const query = new URLSearchParams({ ...pathParams, apikey: apiKey });
  const cacheKey = `alpha:${query.toString()}`;

  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${ALPHA_BASE_URL}?${query.toString()}`);
  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new AlphaVantageError("Alpha Vantage request failed", response.status);
  }

  if ("Note" in data || "Information" in data) {
    throw new AlphaVantageError("Alpha Vantage rate limit exceeded", RATE_LIMIT_STATUS);
  }

  apiCache.set(cacheKey, data as T, options.ttlMs);
  return data as T;
}

export type QuoteSnapshot = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay?: string;
  previousClose?: number;
  open?: number;
  high?: number;
  low?: number;
};

export async function fetchQuote(symbol: string): Promise<QuoteSnapshot> {
  type GlobalQuoteResponse = {
    "Global Quote"?: Record<string, string>;
  };

  const payload = await fetchAlpha<GlobalQuoteResponse>({ function: "GLOBAL_QUOTE", symbol });
  const quote = payload["Global Quote"] ?? {};

  if (!quote || Object.keys(quote).length === 0) {
    throw new AlphaVantageError("Quote not found", 404);
  }

  const normalized: QuoteSnapshot = {
    symbol: quote["01. symbol"] ?? symbol,
    price: Number(quote["05. price"] ?? 0),
    change: Number(quote["09. change"] ?? 0),
    changePercent: parseFloat((quote["10. change percent"] ?? "0").replace("%", "")),
    volume: Number(quote["06. volume"] ?? 0),
    latestTradingDay: quote["07. latest trading day"],
    previousClose: Number(quote["08. previous close"] ?? 0),
    open: Number(quote["02. open"] ?? 0),
    high: Number(quote["03. high"] ?? 0),
    low: Number(quote["04. low"] ?? 0)
  };

  return normalized;
}

export async function searchSymbols(keywords: string) {
  type SymbolSearchResponse = {
    bestMatches?: Array<Record<string, string>>;
  };

  const payload = await fetchAlpha<SymbolSearchResponse>({ function: "SYMBOL_SEARCH", keywords });
  const matches = payload.bestMatches ?? [];

  return matches.map((match) => ({
    symbol: match["1. symbol"],
    name: match["2. name"],
    region: match["4. region"],
    currency: match["8. currency"],
    matchScore: Number(match["9. matchScore"] ?? 0)
  }));
}

export type CompanyOverview = {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCapitalization: number;
  peRatio: number;
  dividendYield: number;
};

export async function fetchOverview(symbol: string): Promise<CompanyOverview> {
  const payload = await fetchAlpha<Record<string, string>>({ function: "OVERVIEW", symbol });
  if (!payload?.Symbol) {
    throw new AlphaVantageError("Overview not found", 404);
  }

  return {
    symbol: payload.Symbol,
    name: payload.Name,
    description: payload.Description,
    sector: payload.Sector,
    industry: payload.Industry,
    marketCapitalization: Number(payload.MarketCapitalization ?? 0),
    peRatio: Number(payload.PERatio ?? 0),
    dividendYield: Number(payload.DividendYield ?? 0)
  };
}

export type DailyAdjustedBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
};

export async function fetchDailyAdjustedSeries(symbol: string): Promise<DailyAdjustedBar[]> {
  type DailyAdjustedResponse = {
    "Time Series (Daily)"?: Record<string, Record<string, string>>;
  };

  const payload = await fetchAlpha<DailyAdjustedResponse>(
    { function: "TIME_SERIES_DAILY_ADJUSTED", symbol, outputsize: "compact" },
    { ttlMs: 5 * 60 * 1000 }
  );

  const series = payload["Time Series (Daily)"];
  if (!series) {
    throw new AlphaVantageError("Daily series not found", 404);
  }

  return Object.entries(series)
    .map(([date, values]) => ({
      date,
      open: Number(values["1. open"] ?? 0),
      high: Number(values["2. high"] ?? 0),
      low: Number(values["3. low"] ?? 0),
      close: Number(values["4. close"] ?? 0),
      adjustedClose: Number(values["5. adjusted close"] ?? values["4. close"] ?? 0),
      volume: Number(values["6. volume"] ?? 0)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function handleAlphaError(res: NextApiResponse, error: unknown) {
  if (error instanceof AlphaVantageError) {
    if (error.statusCode === RATE_LIMIT_STATUS) {
      return res.status(429).json({ error: "Rate limit exceeded. Please retry in a moment." });
    }

    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error("Unexpected Alpha Vantage error", error);
  return res.status(500).json({ error: "Unexpected server error" });
}
