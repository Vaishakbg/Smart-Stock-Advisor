import type { NextApiRequest, NextApiResponse } from "next";
import { apiCache } from "@/lib/cache";
import { fetchQuote, handleAlphaError } from "@/lib/alphaVantage";
import type { QuoteSnapshot } from "@/lib/alphaVantage";
import { buildPolishPrompt, generateDraftExplanation, enforceWordLimit } from "@/lib/explain";
import type { StockScoreReason } from "@/utils/scoreStock";

const EXPLANATION_TTL_MS = 1000 * 60 * 60 * 6; // cache per symbol for 6 hours

export type ExplanationSource = "local" | "openai" | "local-fallback";

export type ExplainApiCacheRecord = {
  symbol: string;
  explanation: string;
  source: ExplanationSource;
  generatedAt: string;
  quote: QuoteSnapshot;
  scoreDetails: StockScoreReason[];
};

export type ExplainApiResponse = ExplainApiCacheRecord & {
  cached: boolean;
};

export type ExplainApiRequest = {
  symbol: string;
  scoreDetails: StockScoreReason[];
};

function isScoreDetail(value: unknown): value is StockScoreReason {
  return (
    typeof value === "object" &&
    value !== null &&
    "reason" in value &&
    "impact" in value &&
    typeof (value as StockScoreReason).reason === "string" &&
    typeof (value as StockScoreReason).impact === "number"
  );
}

function parseRequestBody(req: NextApiRequest): ExplainApiRequest | null {
  const rawBody = req.body;
  const payload = typeof rawBody === "string" ? safeJsonParse(rawBody) : rawBody;
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const { symbol, scoreDetails } = payload as Partial<ExplainApiRequest>;
  if (typeof symbol !== "string" || !symbol.trim()) {
    return null;
  }

  if (!Array.isArray(scoreDetails) || !scoreDetails.every(isScoreDetail)) {
    return null;
  }

  return {
    symbol: symbol.trim().toUpperCase(),
    scoreDetails
  };
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You refine short financial summaries. Keep them under 150 words, factual, and neutral."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 280
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI response failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned no content");
  }

  return enforceWordLimit(content);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ExplainApiResponse | { error: string }>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = parseRequestBody(req);
  if (!payload) {
    return res.status(400).json({ error: "Request must include symbol and scoreDetails" });
  }

  const cacheKey = `explain:${payload.symbol}`;
  const cached = apiCache.get<ExplainApiCacheRecord>(cacheKey);
  if (cached) {
    return res.status(200).json({ ...cached, cached: true });
  }

  try {
    const quote = await fetchQuote(payload.symbol);
    const draft = generateDraftExplanation({
      symbol: payload.symbol,
      quote,
      scoreDetails: payload.scoreDetails
    });

    const openaiKey = process.env.OPENAI_KEY;
    let explanation = draft;
    let source: ExplanationSource = "local";

    if (openaiKey) {
      try {
        const prompt = buildPolishPrompt({
          symbol: payload.symbol,
          quote,
          scoreDetails: payload.scoreDetails,
          draft
        });
        explanation = await callOpenAI(prompt, openaiKey);
        source = "openai";
      } catch (error) {
        console.warn("OpenAI polishing failed, falling back to draft", error);
        explanation = draft;
        source = "local-fallback";
      }
    }

    const record: ExplainApiCacheRecord = {
      symbol: payload.symbol,
      explanation,
      source,
      generatedAt: new Date().toISOString(),
      quote,
      scoreDetails: payload.scoreDetails
    };

    apiCache.set(cacheKey, record, EXPLANATION_TTL_MS);

    const responsePayload: ExplainApiResponse = {
      ...record,
      cached: false
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    return handleAlphaError(res, error);
  }
}
