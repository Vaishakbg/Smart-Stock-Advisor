import type { NextApiRequest, NextApiResponse } from "next";
import { handleAlphaError, searchSymbols } from "@/lib/alphaVantage";

export type SearchApiItem = {
  symbol: string;
  name: string;
  region: string;
  currency: string;
  matchScore: number;
};

export type SearchApiResponse = {
  query: string;
  results: SearchApiItem[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  if (typeof q !== "string" || !q.trim()) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  try {
    const results = await searchSymbols(q.trim());
    const payload: SearchApiResponse = {
      query: q.trim(),
      results
    };

    return res.status(200).json(payload);
  } catch (error) {
    return handleAlphaError(res, error);
  }
}
