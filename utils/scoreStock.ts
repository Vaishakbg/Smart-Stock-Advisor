export type RiskLevel = "conservative" | "moderate" | "aggressive";
export type InvestmentHorizon = "short" | "mid" | "long";

export type StockSnapshot = {
  symbol: string;
  peRatio?: number | null; // Forward or trailing P/E, expressed as a plain number (e.g. 18.5)
  earningsGrowth?: number | null; // Annual earnings growth as decimal (e.g. 0.12 = 12%)
  dividendYield?: number | null; // Dividend yield as decimal (e.g. 0.025 = 2.5%)
  momentum3M?: number | null; // Three-month price momentum as decimal (e.g. 0.08 = +8%)
};

export type UserProfile = {
  risk: RiskLevel;
  investmentHorizon?: InvestmentHorizon;
  preferredSectors?: string[];
  notificationsOptIn?: boolean;
};

/**
 * Clamp a numeric value within a range and normalize to 0-1.
 * @param value The raw value to normalize.
 * @param min The minimum expected boundary.
 * @param max The maximum expected boundary.
 * @returns A number between 0 and 1 representing the relative position within the range.
 */
export function normalize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  if (min === max) {
    return 0;
  }

  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const clamped = Math.min(Math.max(value, lower), upper);
  return (clamped - lower) / (upper - lower);
}

/**
 * Score a price-to-earnings ratio relative to the industry median.
 * Lower ratios (up to 50% below median) receive higher scores, with diminishing credit as P/E rises.
 * @param pe The stock's price-to-earnings ratio.
 * @param industryMedianPE The median P/E for the stock's industry.
 * @returns A score between 0 and 25.
 */
export function scoreNormalizedPE(pe: number | null | undefined, industryMedianPE: number | null | undefined): number {
  if (!industryMedianPE || industryMedianPE <= 0 || !pe || pe <= 0) {
    return 0;
  }

  const ratio = pe / industryMedianPE;
  // Ratios at or below 0.5 earn full credit; ratios above 1.5 drop to zero.
  const normalized = normalize(ratio, 0.5, 1.5);
  return Math.round((1 - normalized) * 25);
}

export type StockScoreReason = {
  reason: string;
  impact: number;
};

export type StockScore = {
  score: number;
  reasons: StockScoreReason[];
};

const WEIGHTS = {
  pe: 30,
  growth: 25,
  dividend: 20,
  momentum: 15,
  risk: 10
} as const;

const MAX_PE = 40; // Scores cap once P/E exceeds this level.
const MAX_GROWTH = 0.25; // 25%+ earns full growth weight.
const MAX_DIVIDEND = 0.06; // 6% yield caps the dividend bonus.
const MAX_MOMENTUM = 0.15; // 15% three-month gain caps momentum reward.

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function scoreStock(stock: StockSnapshot, userProfile: UserProfile): StockScore {
  let total = 0;
  const reasons: StockScoreReason[] = [];

  if (typeof stock.peRatio === "number" && stock.peRatio > 0) {
    // Linear score: lower P/E up to MAX_PE yields more of the weight.
    const normalizedPe = clamp(stock.peRatio, 0, MAX_PE);
    const peScore = ((MAX_PE - normalizedPe) / MAX_PE) * WEIGHTS.pe;
    total += peScore;
    reasons.push({ reason: "Low P/E relative to cap", impact: Math.round(peScore) });
  }

  if (typeof stock.earningsGrowth === "number") {
    // Growth uses a capped linear ramp where MAX_GROWTH is full credit.
    const normalizedGrowth = clamp(stock.earningsGrowth, -0.25, MAX_GROWTH);
    const growthScore = ((normalizedGrowth + 0.25) / (MAX_GROWTH + 0.25)) * WEIGHTS.growth;
    total += growthScore;
    if (growthScore !== 0) {
      const label = normalizedGrowth >= 0 ? "Solid earnings growth" : "Weak earnings trend";
      reasons.push({ reason: label, impact: Math.round(growthScore) });
    }
  }

  if (typeof stock.dividendYield === "number" && stock.dividendYield >= 0) {
    // Dividend yield rewards income up to 6% to avoid overweighting outliers.
    const normalizedDividend = clamp(stock.dividendYield, 0, MAX_DIVIDEND);
    const dividendScore = (normalizedDividend / MAX_DIVIDEND) * WEIGHTS.dividend;
    total += dividendScore;
    if (dividendScore > 0) {
      reasons.push({ reason: "Attractive dividend yield", impact: Math.round(dividendScore) });
    }
  }

  if (typeof stock.momentum3M === "number") {
    // Momentum uses a symmetric ramp: negative returns can subtract within the weight.
    const normalizedMomentum = clamp(stock.momentum3M, -MAX_MOMENTUM, MAX_MOMENTUM);
    const momentumScore = ((normalizedMomentum + MAX_MOMENTUM) / (2 * MAX_MOMENTUM)) * WEIGHTS.momentum;
    total += momentumScore;
    if (momentumScore !== 0) {
      const label = normalizedMomentum >= 0 ? "Positive 3M momentum" : "Negative 3M momentum";
      reasons.push({ reason: label, impact: Math.round(momentumScore) });
    }
  }

  // Risk adjustment shifts emphasis based on the investor profile.
  const riskAdjustment = computeRiskAdjustment(total, stock, userProfile.risk);
  total += riskAdjustment;
  if (riskAdjustment !== 0) {
    const prefix = riskAdjustment > 0 ? "Risk profile boost" : "Risk profile drag";
    reasons.push({ reason: prefix, impact: Math.round(riskAdjustment) });
  }

  const finalScore = clamp(Math.round(total), 0, 100);
  return { score: finalScore, reasons };
}

function computeRiskAdjustment(baseScore: number, stock: StockSnapshot, risk: RiskLevel): number {
  const scaledBase = baseScore / 100; // Use base score as a soft proxy for quality.

  switch (risk) {
    case "conservative": {
      // Conservative investors favor income and lower valuations.
      const incomeBoost = (stock.dividendYield ?? 0) * 100 * 0.15;
      const valuationBoost = stock.peRatio ? clamp((MAX_PE - stock.peRatio) / MAX_PE, 0, 1) * 5 : 0;
      const momentumPenalty = stock.momentum3M && stock.momentum3M < 0 ? stock.momentum3M * 50 : 0;
      return incomeBoost + valuationBoost + momentumPenalty;
    }
    case "aggressive": {
      // Aggressive profiles lean into growth and momentum, less weight on dividends.
      const growthBoost = (stock.earningsGrowth ?? 0) * 100 * 0.2;
      const momentumBoost = (stock.momentum3M ?? 0) * 100 * 0.25;
      const dividendPenalty = stock.dividendYield ? -stock.dividendYield * 100 * 0.05 : 0;
      return growthBoost + momentumBoost + dividendPenalty;
    }
    case "moderate":
    default: {
      // Moderates keep slight sensitivity to overall quality.
      return scaledBase * 5;
    }
  }
}
