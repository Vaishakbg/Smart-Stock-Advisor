import { render, screen } from "@testing-library/react";
import { StockCard } from "@/components/StockCard";

describe("StockCard", () => {
  it("renders symbol and formatted price", () => {
    render(
      <StockCard
        symbol="NVDA"
        name="NVIDIA Corp."
        price={300}
        changePercent={1.23}
        sparkline={[290, 292, 295, 297, 298, 300, 301, 303, 305, 307]}
      />
    );

    expect(screen.getByText("NVDA")).toBeTruthy();
    expect(screen.getByText(/\$300\.00/)).toBeTruthy();
  });
});
