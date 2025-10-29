import type { NextApiRequest, NextApiResponse } from "next";
import { fetchOverview, fetchQuote, handleAlphaError } from "@/lib/alphaVantage";

export type QuoteApiResponse = {
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
  peRatio?: number | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol } = req.query;
  if (typeof symbol !== "string" || !symbol.trim()) {
    return res.status(400).json({ error: "Query parameter 'symbol' is required" });
  }

  try {
    const [quote, overview] = await Promise.all([
      fetchQuote(symbol.toUpperCase()),
      fetchOverview(symbol.toUpperCase()).catch(() => null)
    ]);

    const responseBody: QuoteApiResponse = {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      latestTradingDay: quote.latestTradingDay,
      previousClose: quote.previousClose,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      peRatio: overview?.peRatio ?? null
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    return handleAlphaError(res, error);
  }
}
