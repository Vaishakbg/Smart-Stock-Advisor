import { scoreStock } from "@/utils/scoreStock";
import type { StockSnapshot, UserProfile } from "@/utils/scoreStock";

describe("scoreStock", () => {
  const userProfile: UserProfile = {
    risk: "moderate",
    investmentHorizon: "mid",
    preferredSectors: ["Technology"],
    notificationsOptIn: true
  };

  it("returns a score clamped between 0 and 100", () => {
    const stock: StockSnapshot = {
      symbol: "TEST",
      peRatio: 18,
      earningsGrowth: 0.12,
      dividendYield: 0.015,
      momentum3M: 0.08
    };

    const result = scoreStock(stock, userProfile);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("handles missing fundamentals gracefully", () => {
    const stock: StockSnapshot = {
      symbol: "TEST",
      peRatio: null,
      earningsGrowth: undefined,
      dividendYield: undefined,
      momentum3M: -0.2
    };

    const result = scoreStock(stock, userProfile);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
