import type { NextApiRequest, NextApiResponse } from "next";
import { fetchDailyAdjustedSeries, handleAlphaError } from "@/lib/alphaVantage";

export type TimeSeriesResponse = {
  symbol: string;
  lastClose: number;
  percentChange1D: number;
  percentChange90D: number;
  dataPoints: number;
};

function calculatePercentChange(current: number, previous: number): number {
  if (!previous || !Number.isFinite(previous)) return 0;
  return ((current - previous) / previous) * 100;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TimeSeriesResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { symbol } = req.query;
  if (typeof symbol !== "string" || !symbol.trim()) {
    return res.status(400).json({ error: "Query parameter 'symbol' is required" });
  }

  try {
    const series = await fetchDailyAdjustedSeries(symbol.trim().toUpperCase());
    if (series.length === 0) {
      return res.status(404).json({ error: "No time series data available" });
    }

    const lastBar = series[0];
    const previousBar = series[1];
    const ninetyDayBar = series.find((_, index) => index === 89);

    const lastClose = lastBar.adjustedClose;
    const percentChange1D = previousBar ? calculatePercentChange(lastClose, previousBar.adjustedClose) : 0;
    const percentChange90D = ninetyDayBar
      ? calculatePercentChange(lastClose, ninetyDayBar.adjustedClose)
      : 0;

    const payload: TimeSeriesResponse = {
      symbol: symbol.trim().toUpperCase(),
      lastClose,
      percentChange1D,
      percentChange90D,
      dataPoints: series.length
    };

    return res.status(200).json(payload);
  } catch (error) {
    return handleAlphaError(res, error);
  }
}
