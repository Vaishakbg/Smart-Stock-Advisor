import type { NextApiRequest, NextApiResponse } from "next";
import { fetchOverview, handleAlphaError } from "@/lib/alphaVantage";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA"];

export type ScreenerFilters = {
  peMin?: number;
  peMax?: number;
  dividendYieldMin?: number;
  dividendYieldMax?: number;
  sector?: string;
  marketCapMin?: number;
  marketCapMax?: number;
};

export type ScreenerItem = {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCapitalization: number;
  peRatio: number;
  dividendYield: number;
};

export type ScreenerApiResponse = {
  filters: ScreenerFilters;
  results: ScreenerItem[];
  evaluated: number;
};

function parseNumberParam(raw: string | string[] | undefined) {
  if (typeof raw !== "string") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function parseSymbols(raw: string | string[] | undefined): string[] {
  if (typeof raw !== "string") return DEFAULT_SYMBOLS;
  const symbols = raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filters: ScreenerFilters = {
    peMin: parseNumberParam(req.query.peMin),
    peMax: parseNumberParam(req.query.peMax),
    dividendYieldMin: parseNumberParam(req.query.dividendYieldMin),
    dividendYieldMax: parseNumberParam(req.query.dividendYieldMax),
    marketCapMin: parseNumberParam(req.query.marketCapMin),
    marketCapMax: parseNumberParam(req.query.marketCapMax),
    sector: typeof req.query.sector === "string" && req.query.sector.trim() ? req.query.sector : undefined
  };

  const symbols = parseSymbols(req.query.symbols);

  try {
    const overviews = await Promise.allSettled(symbols.map((symbol) => fetchOverview(symbol)));

    const items = overviews
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchOverview>>> => result.status === "fulfilled")
      .map((result) => result.value);

    const filtered = items.filter((item) => {
      if (filters.sector && item.sector.toLowerCase() !== filters.sector.toLowerCase()) {
        return false;
      }
      if (filters.peMin !== undefined && item.peRatio < filters.peMin) {
        return false;
      }
      if (filters.peMax !== undefined && item.peRatio > filters.peMax) {
        return false;
      }
      if (filters.marketCapMin !== undefined && item.marketCapitalization / 1_000_000_000 < filters.marketCapMin) {
        return false;
      }
      if (filters.marketCapMax !== undefined && item.marketCapitalization / 1_000_000_000 > filters.marketCapMax) {
        return false;
      }
      if (filters.dividendYieldMin !== undefined && item.dividendYield * 100 < filters.dividendYieldMin) {
        return false;
      }
      if (filters.dividendYieldMax !== undefined && item.dividendYield * 100 > filters.dividendYieldMax) {
        return false;
      }
      return true;
    });

    const payload: ScreenerApiResponse = {
      filters,
      results: filtered.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        industry: item.industry,
        marketCapitalization: item.marketCapitalization,
        peRatio: item.peRatio,
        dividendYield: item.dividendYield
      })),
      evaluated: items.length
    };

    return res.status(200).json(payload);
  } catch (error) {
    return handleAlphaError(res, error);
  }
}
