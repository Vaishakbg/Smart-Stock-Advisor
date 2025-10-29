import type { QuoteSnapshot } from "@/lib/alphaVantage";
import type { StockScoreReason } from "@/utils/scoreStock";

const WORD_LIMIT = 150;

export type DraftExplanationInput = {
  symbol: string;
  quote: QuoteSnapshot;
  scoreDetails: StockScoreReason[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const volumeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

function formatPrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "n/a";
  return `$${numberFormatter.format(value)}`;
}

function formatChange(change?: number, changePercent?: number) {
  if (typeof change !== "number" || Number.isNaN(change)) return "flat on the session";
  const sign = change >= 0 ? "+" : "";
  const pctString =
    typeof changePercent === "number" && !Number.isNaN(changePercent)
      ? ` (${sign}${percentFormatter.format(changePercent)}%)`
      : "";
  return `${sign}${numberFormatter.format(change)}${pctString}`;
}

function summarizeReasons(scoreDetails: StockScoreReason[]) {
  const sorted = [...scoreDetails].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  const positives = sorted.filter((item) => item.impact > 0).slice(0, 3);
  const negatives = sorted.filter((item) => item.impact < 0).slice(0, 2);

  const formatItem = (item: StockScoreReason) => {
    const prefix = item.impact > 0 ? "+" : "";
    return `${item.reason} (${prefix}${item.impact})`;
  };

  return {
    positives: positives.map(formatItem),
    negatives: negatives.map(formatItem)
  };
}

export function enforceWordLimit(text: string, limit = WORD_LIMIT) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text.trim();
  return `${words.slice(0, limit).join(" ")}`;
}

export function generateDraftExplanation({ symbol, quote, scoreDetails }: DraftExplanationInput) {
  const totalScore = clamp(
    scoreDetails.reduce((acc, item) => acc + item.impact, 0),
    0,
    100
  );

  const drivers = summarizeReasons(scoreDetails);

  const summaryParts = [
    `${symbol} trades at ${formatPrice(quote.price)}, moving ${formatChange(quote.change, quote.changePercent)} since the previous close.`
  ];

  if (scoreDetails.length > 0) {
    summaryParts.push(
      `It registers roughly ${totalScore}/100 in your scoring model, balancing the strongest and weakest factors below.`
    );
  }

  if (drivers.positives.length > 0) {
    summaryParts.push(`Key strengths: ${drivers.positives.join(", ")}.`);
  }

  if (drivers.negatives.length > 0) {
    summaryParts.push(`Items to monitor: ${drivers.negatives.join(", ")}.`);
  }

  if (quote.volume) {
    summaryParts.push(`Latest reported volume came in near ${volumeFormatter.format(quote.volume)} shares.`);
  }

  const draft = summaryParts.join(" ");
  return enforceWordLimit(draft, WORD_LIMIT);
}

export function buildPolishPrompt({ symbol, quote, scoreDetails, draft }: DraftExplanationInput & {
  draft: string;
}) {
  const payload = {
    symbol,
    quote,
    scoreDetails,
    draft
  };

  return `You are a financial analyst writing clear, neutral summaries under 150 words.
Keep the provided facts accurate, avoid investment advice, and note both positives and risks.
Rewrite the following draft into one concise paragraph:
${JSON.stringify(payload, null, 2)}`;
}
