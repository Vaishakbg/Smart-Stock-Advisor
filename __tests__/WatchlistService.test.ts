import { WatchlistService } from "@/services/WatchlistService";

describe("WatchlistService", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds symbols and persists to localStorage", async () => {
    const result = await WatchlistService.add("aapl");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ symbol: "AAPL" });

    const stored = window.localStorage.getItem("smart-stock-advisor.watchlist");
    expect(stored).not.toBeNull();
    expect(stored && stored.includes("AAPL")).toBe(true);
  });

  it("removes symbols from the watchlist", async () => {
    await WatchlistService.add("MSFT");
    const result = await WatchlistService.remove("msft");

    expect(result).toHaveLength(0);
    const stored = window.localStorage.getItem("smart-stock-advisor.watchlist");
    expect(stored).toBe("[]");
  });
});
