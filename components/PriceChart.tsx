"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts";

export type TimeframeOption = "1M" | "3M" | "6M" | "1Y";

export type HistoricalPoint = {
  date: string | number | Date;
  close: number;
};

export type PriceChartProps = {
  symbol: string;
  data: HistoricalPoint[];
  timeframe: TimeframeOption;
  height?: number;
  /** Force the TradingView widget instead of the Recharts view. */
  preferTradingView?: boolean;
  /** Enable candlestick fallback when there is not enough local data. Defaults to true. */
  enableTradingViewFallback?: boolean;
};

type EnrichedPoint = {
  date: Date;
  dateMs: number;
  close: number;
  label: string;
};

type TradingViewWidgetProps = {
  symbol: string;
  timeframe: TimeframeOption;
  height: number;
};

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    value?: number;
    payload?: EnrichedPoint;
  }>;
};

declare global {
  interface Window {
    TradingView?: {
      widget: (config: Record<string, unknown>) => void;
    };
  }
}

let tradingViewLoader: Promise<void> | null = null;

function loadTradingViewScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.TradingView) {
    return Promise.resolve();
  }
  if (!tradingViewLoader) {
    tradingViewLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (event) => reject(event);
      document.head.appendChild(script);
    });
  }
  return tradingViewLoader;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function getTickFormatter(timeframe: TimeframeOption) {
  switch (timeframe) {
    case "1M":
    case "3M":
      return (value: Date) => dateFormatter.format(value);
    case "6M":
    case "1Y":
    default:
      return (value: Date) => longDateFormatter.format(value);
  }
}

function normalizeData(data: HistoricalPoint[]): EnrichedPoint[] {
  return data
    .map((point) => {
      const date = point.date instanceof Date ? point.date : new Date(point.date);
      return {
        date,
        dateMs: date.getTime(),
        close: Number(point.close ?? 0),
        label: longDateFormatter.format(date)
      };
    })
    .filter((item) => !Number.isNaN(item.close) && item.date.toString() !== "Invalid Date")
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

const tooltipContent = (props: ChartTooltipProps) => {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  const point = item.payload as EnrichedPoint | undefined;
  const dateLabel = point?.label ?? longDateFormatter.format(new Date(point?.dateMs ?? Date.now()));

  const value = typeof item.value === "number" ? item.value : point?.close ?? 0;

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 shadow-lg">
      <p className="font-semibold">{dateLabel}</p>
      <p className="mt-1 text-brand-200">${priceFormatter.format(value)}</p>
    </div>
  );
};

function TradingViewWidget({ symbol, timeframe, height }: TradingViewWidgetProps) {
  const containerId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const containerElement = wrapperRef.current;

    loadTradingViewScript()
      .then(() => {
        if (cancelled || !wrapperRef.current || !window.TradingView) {
          return;
        }

        wrapperRef.current.innerHTML = "";
        const widgetContainer = document.createElement("div");
        widgetContainer.id = containerId;
        widgetContainer.style.height = "100%";
        widgetContainer.style.width = "100%";
        wrapperRef.current.appendChild(widgetContainer);

        window.TradingView?.widget({
          symbol,
          interval: "D",
          range: timeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          container_id: containerId,
          hide_top_toolbar: true,
          hide_legend: true,
          withdateranges: true,
          allow_symbol_change: false,
          autosize: true
        });
        setInitialized(true);
      })
      .catch((error) => {
        console.warn("Failed to load TradingView widget", error);
      });

    return () => {
      cancelled = true;
      if (containerElement) {
        containerElement.innerHTML = "";
      }
    };
  }, [symbol, timeframe, containerId]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div
        ref={wrapperRef}
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
      />
      {!initialized && (
        <p className="mt-3 text-center text-xs text-slate-400">Loading TradingView candlestick view…</p>
      )}
    </div>
  );
}

export function PriceChart({
  symbol,
  data,
  timeframe,
  height = 320,
  preferTradingView = false,
  enableTradingViewFallback = true
}: PriceChartProps) {
  const normalized = useMemo(() => normalizeData(data), [data]);
  const shouldFallback = preferTradingView || (enableTradingViewFallback && normalized.length < 2);

  if (shouldFallback) {
    return <TradingViewWidget symbol={symbol} timeframe={timeframe} height={height} />;
  }

  const tickFormatter = getTickFormatter(timeframe);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalized} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d82ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0d82ff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="dateMs"
            tickFormatter={(value) => tickFormatter(new Date(value))}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            dataKey="close"
            tickFormatter={(value) => `$${priceFormatter.format(value)}`}
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip content={tooltipContent} />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#0d82ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "#0d82ff", strokeWidth: 2 }}
            fill="url(#priceGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
