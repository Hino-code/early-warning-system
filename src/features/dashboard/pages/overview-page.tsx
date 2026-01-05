import { useMemo, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { SharedFilters } from "@/shared/components/filters/shared-filters";
import { useDashboardStore } from "@/state/store";
import { useChartColors } from "@/shared/hooks/use-chart-colors";
import type { FilterValues } from "@/shared/types/filters";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Droplet, Leaf, Trash, WarningTriangle, InfoCircle } from "iconoir-react";
import type { TooltipProps, DotProps } from "recharts";
import {
  chartAxisStyle,
  chartGridStyle,
  chartTooltipStyle,
} from "@/shared/components/charting/chart-styles";
import { KpiCards } from "../components/kpi-cards";
import { DashboardSkeleton } from "../components/loading-skeleton";

type ForecastPoint = {
  date: string;
  fullDate: string;
  dateLabel: string;
  dateValue: number;
  actual: number | null;
  predicted: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  confidenceBandHeight: number | null;
  bandBase: number;
  bandSize: number;
  confidence: number | null;
  exceedsThreshold: boolean;
  isHistorical: boolean;
  isForecast: boolean;
};

export function Overview() {
  const filters = useDashboardStore((state) => state.filters);
  const setFilters = useDashboardStore((state) => state.setFilters);
  const initialize = useDashboardStore((state) => state.initialize);
  // Forecast horizon is fixed at 7 days and not affected by filters
  const forecastHorizon = 7;
  const filteredData = useDashboardStore((state) => state.filteredObservations);
  const allObservations = useDashboardStore((state) => state.observations);
  const alerts = useDashboardStore((state) => state.alerts);
  const kpis = useDashboardStore((state) => state.kpis);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const allForecasts = useDashboardStore((state) => state.forecasts);
  const chartColors = useChartColors();

  // Custom dot component for threshold-aware highlighting
  const ThresholdAwareDot = useMemo(() => {
    return (props: DotProps & { payload?: any }) => {
      const { cx, cy, payload } = props;
      const exceedsThreshold = payload?.exceedsThreshold;

      if (cx === undefined || cy === undefined) return null;

      return (
        <circle
          cx={cx}
          cy={cy}
          r={exceedsThreshold ? 5 : 4}
          fill={exceedsThreshold ? chartColors.destructive : "#9333ea"}
          stroke={exceedsThreshold ? chartColors.destructive : "#9333ea"}
          strokeWidth={exceedsThreshold ? 2 : 1}
        />
      );
    };
  }, [chartColors]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleFilterChange = (nextFilters: FilterValues) => {
    setFilters(nextFilters);
  };

  // Filter forecasts to exactly 7 days starting from today (not affected by date filters)
  const forecasts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() + 7); // End of 7th day (exclusive)

    return allForecasts.filter((f) => {
      const forecastDate = new Date(f.date);
      forecastDate.setHours(0, 0, 0, 0);
      // Include forecasts for exactly 7 days starting from today
      return forecastDate >= today && forecastDate < cutoffDate;
    });
  }, [allForecasts]);

  // Calculate week-over-week changes and history for sparklines
  const kpiData = useMemo(() => {
    const now = new Date();
    // Use last 14 days for history/sparklines
    const historyDays = 14;
    const historyStart = new Date(
      now.getTime() - historyDays * 24 * 60 * 60 * 1000
    );

    // For trends (WoW)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = filteredData.filter(
      (obs) => new Date(obs.date) >= oneWeekAgo
    );
    const lastWeek = filteredData.filter((obs) => {
      const date = new Date(obs.date);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // --- Trend Values ---
    const aboveThresholdThis = thisWeek.filter((o) => o.aboveThreshold).length;
    const aboveThresholdLast = lastWeek.filter((o) => o.aboveThreshold).length;
    const aboveThresholdPct =
      thisWeek.length > 0
        ? Math.round((aboveThresholdThis / thisWeek.length) * 100)
        : 0;
    const aboveThresholdPctLast =
      lastWeek.length > 0
        ? Math.round((aboveThresholdLast / lastWeek.length) * 100)
        : 0;

    const actionsTakenThis = thisWeek.filter((o) => o.actionTaken).length;
    const actionsTakenLast = lastWeek.filter((o) => o.actionTaken).length;

    const avgCountThis =
      thisWeek.length > 0
        ? Math.round(
            thisWeek.reduce((sum, o) => sum + o.count, 0) / thisWeek.length
          )
        : 0;
    const avgCountLast =
      lastWeek.length > 0
        ? Math.round(
            lastWeek.reduce((sum, o) => sum + o.count, 0) / lastWeek.length
          )
        : 0;

    // --- History / Sparklines (Daily aggregation for last 14 days) ---
    const dailyHistory: Record<
      string,
      { count: number; totalPest: number; above: number; actions: number }
    > = {};

    // Initialize last 14 days with 0
    for (let i = 0; i < historyDays; i++) {
      const d = new Date(
        now.getTime() - (historyDays - 1 - i) * 24 * 60 * 60 * 1000
      );
      const key = d.toISOString().split("T")[0];
      dailyHistory[key] = { count: 0, totalPest: 0, above: 0, actions: 0 };
    }

    // Fill with data
    filteredData.forEach((obs) => {
      const key = obs.date.split("T")[0];
      if (dailyHistory[key]) {
        dailyHistory[key].count += 1;
        dailyHistory[key].totalPest += obs.count;
        if (obs.aboveThreshold) dailyHistory[key].above += 1;
        if (obs.actionTaken) dailyHistory[key].actions += 1;
      }
    });

    const sortedKeys = Object.keys(dailyHistory).sort();

    const obsHistory = sortedKeys.map((k) => dailyHistory[k].count);
    const avgHistory = sortedKeys.map((k) =>
      dailyHistory[k].count > 0
        ? Math.round(dailyHistory[k].totalPest / dailyHistory[k].count)
        : 0
    );
    const aboveHistory = sortedKeys.map((k) =>
      dailyHistory[k].count > 0
        ? Math.round((dailyHistory[k].above / dailyHistory[k].count) * 100)
        : 0
    );
    const actionHistory = sortedKeys.map((k) =>
      dailyHistory[k].count > 0
        ? Math.round((dailyHistory[k].actions / dailyHistory[k].count) * 100)
        : 0
    );

    // --- Insights Logic (2025 "Actionable" Principle) ---
    const getInsight = (
      trendVal: number,
      metricName: string,
      context: "moreIsBad" | "moreIsGood" | "neutral"
    ): {
      label: string;
      sentiment: "neutral" | "warning" | "good" | "critical";
    } => {
      const absTrend = Math.abs(trendVal);
      const isUp = trendVal > 0;

      // Small changes are neutral
      if (absTrend < 5)
        return { label: "Stable vs last week", sentiment: "neutral" };

      if (context === "moreIsBad") {
        if (isUp) {
          return absTrend > 15
            ? { label: "Significant spike detected", sentiment: "critical" }
            : { label: "Rising trend observed", sentiment: "warning" };
        } else {
          return { label: "Improved vs last week", sentiment: "good" };
        }
      } else if (context === "moreIsGood") {
        if (isUp) {
          return { label: "Performance improving", sentiment: "good" };
        } else {
          return absTrend > 15
            ? { label: "Sharp decline needs review", sentiment: "critical" }
            : { label: "Falling below average", sentiment: "warning" };
        }
      }

      // Neutral context (e.g. Total Observations - just activity volume)
      return {
        label: isUp ? "Increased field activity" : "Lower reporting volume",
        sentiment: "neutral",
      };
    };

    return {
      observations: {
        trend: {
          value: calculateChange(thisWeek.length, lastWeek.length),
          history: obsHistory,
        },
        ...getInsight(
          calculateChange(thisWeek.length, lastWeek.length),
          "Observations",
          "neutral"
        ),
      },
      avgCount: {
        trend: {
          value: calculateChange(avgCountThis, avgCountLast),
          history: avgHistory,
        },
        ...getInsight(
          calculateChange(avgCountThis, avgCountLast),
          "Avg Count",
          "moreIsBad"
        ),
      },
      aboveThreshold: {
        trend: {
          value: aboveThresholdPct - aboveThresholdPctLast,
          history: aboveHistory,
        },
        ...getInsight(
          aboveThresholdPct - aboveThresholdPctLast,
          "Critical %",
          "moreIsBad"
        ),
      },
      actionRate: {
        trend: {
          value: Math.round(
            kpis.actionRate -
              (lastWeek.length > 0
                ? Math.round((actionsTakenLast / lastWeek.length) * 100)
                : 0)
          ),
          history: actionHistory,
        },
        ...getInsight(
          kpis.actionRate -
            (lastWeek.length > 0
              ? Math.round((actionsTakenLast / lastWeek.length) * 100)
              : 0),
          "Action Rate",
          "moreIsGood"
        ),
      },
    };
  }, [filteredData, kpis]);

  // Prepare chart data
  const thresholdStackData = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let normal = 0;
    filteredData.forEach((obs) => {
      if (obs.count >= obs.threshold) {
        critical += 1;
      } else if (obs.count >= obs.threshold * 0.7) {
        warning += 1;
      } else {
        normal += 1;
      }
    });
    const data = [
      {
        name: "Critical",
        count: critical,
        fill: chartColors.destructive,
      },
      {
        name: "Warning",
        count: warning,
        fill: chartColors.chart4,
      },
      {
        name: "Normal",
        count: normal,
        fill: chartColors.success,
      },
    ];
    // Sort so largest rings are outer? Or specific order?
    // Usually Critical outer is good for visibility.
    // Recharts RadialBar renders in order.
    return { data, summary: { critical, warning, normal } };
  }, [filteredData, chartColors]);

  const actionTrackerData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData
      .filter((obs) => obs.actionTaken)
      .forEach((obs) => {
        const type = obs.actionType?.trim() || "Unspecified";
        counts[type] = (counts[type] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([type, value]) => ({ type, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const recentCriticalAlerts = useMemo(() => {
    return alerts
      .filter((a) => a.priority === "high")
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 3);
  }, [alerts]);

  // Economic Threshold and Injury Level constants
  const economicThreshold = 50; // ET for Black Rice Bug
  const economicInjuryLevel = 75; // EIL = 1.5x ET
  const operationalBaseline = 0;

  const forecastSeries = useMemo<ForecastPoint[]>(() => {
    // Get the most recent 7 days of observations (not affected by date filters)
    // This shows the last 7 days BEFORE today (7 days ago through yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Filter to last 7 days of observations, respecting pest type filter only
    const recentObservations = allObservations.filter((obs) => {
      const obsDate = new Date(obs.date);
      obsDate.setHours(0, 0, 0, 0);
      const matchesPestType =
        filters.pestType === "All" || obs.pestType === filters.pestType;
      // Include observations from 7 days ago up to and including yesterday
      return obsDate >= sevenDaysAgo && obsDate <= yesterday && matchesPestType;
    });

    // Group historical observations by day for averaging
    const historyByDate: Record<string, { total: number; count: number }> = {};
    recentObservations.forEach((obs) => {
      if (!historyByDate[obs.date]) {
        historyByDate[obs.date] = { total: 0, count: 0 };
      }
      historyByDate[obs.date].total += obs.count;
      historyByDate[obs.date].count += 1;
    });

    const historicalPoints = Object.entries(historyByDate)
      .map(([date, stats]) => {
        const dateValue = new Date(date).getTime();
        const actual = Math.round(stats.total / stats.count);
        return {
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: date,
          dateLabel: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dateValue,
          actual,
          predicted: null,
          lowerBound: null,
          upperBound: null,
          confidenceLower: null,
          confidenceUpper: null,
          confidenceBandHeight: null,
          bandBase: 0,
          bandSize: 0,
          confidence: null,
          exceedsThreshold: false,
          isHistorical: true,
          isForecast: false,
        } as ForecastPoint;
      })
      .sort((a, b) => a.dateValue - b.dateValue);

    // Get last historical point for bridge
    const lastHistoricalPoint =
      historicalPoints.length > 0
        ? historicalPoints[historicalPoints.length - 1]
        : null;
    const lastHistoricalValue = lastHistoricalPoint?.actual ?? 0;
    const lastHistoricalDate = lastHistoricalPoint?.fullDate ?? null;

    // Filter forecasts by pest type only (not date range)
    const filteredForecasts = forecasts.filter(
      (f) => filters.pestType === "All" || f.pestType === filters.pestType
    );

    // Create bridge point for smooth transition
    const firstForecast = filteredForecasts[0];
    const bridgePoint =
      lastHistoricalPoint && firstForecast
        ? ({
            date: lastHistoricalPoint.date,
            fullDate: lastHistoricalPoint.fullDate,
            dateLabel: lastHistoricalPoint.dateLabel,
            dateValue: lastHistoricalPoint.dateValue,
            actual: lastHistoricalValue,
            predicted: lastHistoricalValue, // Use historical value as bridge
            lowerBound: Math.max(
              0,
              lastHistoricalValue -
                (firstForecast.upperBound - firstForecast.lowerBound) / 2
            ),
            upperBound:
              lastHistoricalValue +
              (firstForecast.upperBound - firstForecast.lowerBound) / 2,
            confidenceLower: Math.max(
              0,
              lastHistoricalValue -
                (firstForecast.upperBound - firstForecast.lowerBound) / 2
            ),
            confidenceUpper:
              lastHistoricalValue +
              (firstForecast.upperBound - firstForecast.lowerBound) / 2,
            confidenceBandHeight:
              firstForecast.upperBound - firstForecast.lowerBound,
            bandBase: 0,
            bandSize: 0,
            confidence: null,
            exceedsThreshold: lastHistoricalValue > economicThreshold,
            isHistorical: false,
            isForecast: true, // Mark as forecast so it connects to forecast line
          } as ForecastPoint)
        : null;

    const forecastPoints = filteredForecasts.map((f) => {
      const lower = Math.max(0, f.lowerBound);
      const upper = Math.max(lower, f.upperBound);
      const bandHeight = upper - lower;
      const predicted = f.predicted;
      const exceedsThreshold = predicted > economicThreshold;

      return {
        date: new Date(f.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: f.date,
        dateLabel: new Date(f.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        dateValue: new Date(f.date).getTime(),
        actual: null,
        predicted: predicted,
        lowerBound: lower,
        upperBound: upper,
        confidenceLower: lower,
        confidenceUpper: upper,
        confidenceBandHeight: bandHeight,
        bandBase: 0,
        bandSize: 0,
        confidence: f.confidence,
        exceedsThreshold: exceedsThreshold,
        isHistorical: false,
        isForecast: true,
      } as ForecastPoint;
    });

    // Combine: historical + bridge + forecast
    return bridgePoint
      ? [...historicalPoints, bridgePoint, ...forecastPoints].sort(
          (a, b) => a.dateValue - b.dateValue
        )
      : [...historicalPoints, ...forecastPoints].sort(
          (a, b) => a.dateValue - b.dateValue
        );
  }, [allObservations, forecasts, filters.pestType, economicThreshold]);

  // Calculate Y-axis domain with padding, ensuring threshold is visible
  const yAxisDomain = useMemo(() => {
    const allValues: number[] = [];

    forecastSeries.forEach((d) => {
      if (d.actual !== null) allValues.push(d.actual);
      if (d.predicted !== null) allValues.push(d.predicted);
      if (d.lowerBound !== null) allValues.push(d.lowerBound);
      if (d.upperBound !== null) allValues.push(d.upperBound);
    });

    // Always include threshold values to ensure they're visible
    allValues.push(economicThreshold, economicInjuryLevel);

    if (allValues.length === 0) return [0, Math.max(100, economicInjuryLevel)];

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = range * 0.15; // 15% padding

    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [forecastSeries, economicThreshold, economicInjuryLevel]);

  // Find the index where forecast starts (for vertical divider)
  const forecastStartIndex = useMemo(() => {
    return forecastSeries.findIndex((d) => d.isForecast);
  }, [forecastSeries]);

  const benchmarkSeries = useMemo(() => {
    // Get the most recent 7 days of observations for benchmarks (not affected by date filters)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentObservationsForBenchmark = allObservations.filter((obs) => {
      const obsDate = new Date(obs.date);
      obsDate.setHours(0, 0, 0, 0);
      const matchesPestType =
        filters.pestType === "All" || obs.pestType === filters.pestType;
      return obsDate >= sevenDaysAgo && obsDate <= yesterday && matchesPestType;
    });

    // Build lookup by day-of-year for last year's averages
    const groupByDay = (
      observations: typeof allObservations,
      offsetYears: number
    ) => {
      const grouped: Record<number, { total: number; count: number }> = {};
      observations.forEach((obs) => {
        const d = new Date(obs.date);
        d.setFullYear(d.getFullYear() + offsetYears);
        const dayOfYear = Math.floor(
          (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
            Date.UTC(d.getFullYear(), 0, 0)) /
            24 /
            60 /
            60 /
            1000
        );
        if (!grouped[dayOfYear]) {
          grouped[dayOfYear] = { total: 0, count: 0 };
        }
        grouped[dayOfYear].total += obs.count;
        grouped[dayOfYear].count += 1;
      });
      return grouped;
    };

    const lastYearGrouped = groupByDay(recentObservationsForBenchmark, -1);
    const overallGrouped = groupByDay(recentObservationsForBenchmark, 0);

    const mergedDates = Array.from(
      new Set(
        forecastSeries
          .filter((f) => f.predicted !== null)
          .map((f) => f.dateValue)
      )
    ).sort((a, b) => a - b);

    const buildSeries = (
      grouped: Record<number, { total: number; count: number }>,
      label: string
    ) => {
      return mergedDates.map((dateValue) => {
        const d = new Date(dateValue);
        const dayOfYear = Math.floor(
          (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
            Date.UTC(d.getFullYear(), 0, 0)) /
            24 /
            60 /
            60 /
            1000
        );
        const bucket = grouped[dayOfYear];
        const value =
          bucket && bucket.count > 0
            ? Math.round(bucket.total / bucket.count)
            : null;
        return {
          dateValue,
          dateLabel: new Date(dateValue).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          benchmark: value,
          label,
        };
      });
    };

    const lastYearSeries = buildSeries(lastYearGrouped, "Last Year Avg");
    const overallSeries = buildSeries(overallGrouped, "Overall Avg");

    const mergedBenchmarks = forecastSeries.map((point, idx) => {
      const ly = lastYearSeries[idx]?.benchmark ?? null;
      const ov = overallSeries[idx]?.benchmark ?? null;
      return {
        ...point,
        lastYearBenchmark: ly,
        overallBenchmark: ov,
      };
    });

    return { mergedBenchmarks };
  }, [allObservations, forecastSeries, filters.pestType]);

  // Custom tooltip for forecast chart with enhanced context
  const renderForecastTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const isForecast = data?.isForecast;
    const exceedsThreshold = data?.exceedsThreshold;

    // Calculate confidence level for this point
    const getConfidenceLevel = () => {
      if (
        !isForecast ||
        data.confidenceUpper === null ||
        data.confidenceLower === null
      ) {
        return null;
      }
      const ciWidth = data.confidenceUpper - data.confidenceLower;
      if (ciWidth > economicThreshold * 0.3) return "Low";
      if (ciWidth > economicThreshold * 0.15) return "Medium";
      return "High";
    };

    const confidenceLevel = getConfidenceLevel();

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2 min-w-[180px]">
        <p className="font-medium text-sm border-b border-border pb-1">
          {label}
        </p>
        {isForecast ? (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Forecasted Pest Count
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color: data.exceedsThreshold
                    ? chartColors.destructive
                    : chartColors.chart2,
                }}
              >
                {data.predicted !== null && data.predicted !== undefined
                  ? data.predicted
                  : "N/A"}
                {data.exceedsThreshold && (
                  <span className="ml-1 text-xs">⚠️</span>
                )}
              </p>
              {exceedsThreshold && (
                <p className="text-xs text-destructive font-medium mt-1">
                  Exceeds Economic Threshold (ET: {economicThreshold})
                </p>
              )}
            </div>
            {data.confidenceLower !== null && data.confidenceUpper !== null && (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Confidence Range
                  </p>
                  <p className="text-xs font-mono">
                    {data.confidenceLower} - {data.confidenceUpper}
                  </p>
                </div>
                {confidenceLevel && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Confidence Level
                    </p>
                    <p className="text-xs font-medium">{confidenceLevel}</p>
                  </div>
                )}
              </>
            )}
            <p className="text-xs text-muted-foreground italic mt-2 pt-1 border-t border-border">
              Forecast (uncertain)
            </p>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Actual Pest Count</p>
              <p className="text-sm font-semibold" style={{ color: "#3b82f6" }}>
                {data.actual !== null && data.actual !== undefined
                  ? data.actual
                  : "N/A"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground italic mt-2 pt-1 border-t border-border">
              Historical (observed)
            </p>
          </>
        )}
      </div>
    );
  };

  const contentReady = !loading && filteredData.length > 0;
  const hasNoData = !loading && !error && filteredData.length === 0;

  const peakForecast = useMemo(() => {
    const predicted = forecasts
      .filter(
        (f) => filters.pestType === "All" || f.pestType === filters.pestType
      )
      .map((f) => f.predicted);
    if (predicted.length === 0) return null;
    const peak = Math.max(...predicted);
    const risk = peak >= 70 ? "Critical" : peak >= 50 ? "Elevated" : "Normal";
    const action =
      risk === "Critical"
        ? "Deploy chemical control within 48 hours"
        : risk === "Elevated"
        ? "Increase scouting and prep interventions"
        : "Maintain routine monitoring";
    return { peak, risk, action };
  }, [forecasts, filters.pestType]);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-full overflow-x-hidden">
      <SharedFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        compact
        primaryOnly
        showAdvanced
      />
      {error && (
        <Card className="p-4 border-destructive/50 bg-destructive/5 text-destructive">
          <p>{error}</p>
        </Card>
      )}
      {loading && !contentReady ? (
        <DashboardSkeleton />
      ) : hasNoData ? (
        <Card className="p-8 text-center border-border bg-background/50">
          <p className="text-muted-foreground mb-2">No data available</p>
          <p className="text-sm text-muted-foreground/70">
            {error
              ? "There was an error loading the data. Please check the console for details."
              : "No observations match the current filters. Try adjusting your filter criteria."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="mb-6">
            <KpiCards kpis={kpis} insights={kpiData} />
          </div>

          <Card className="p-4 sm:p-5 md:p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
            <div className="flex flex-col space-y-4 sm:space-y-5 md:space-y-6 pt-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    7-Day Forecast
                  </h3>
                  <p className="text-base text-muted-foreground mt-1 font-medium">
                    Projected pest trends & confidence intervals (next 7 days)
                  </p>
                </div>
              </div>

              {/* Risk and Peak Badges Row */}
              {peakForecast && (
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-foreground">
                  <Badge
                    variant={
                      peakForecast.risk === "Critical"
                        ? "destructive"
                        : "outline"
                    }
                    className={`text-xs px-3 py-1 font-bold ${
                      peakForecast.risk === "Elevated"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : peakForecast.risk === "Normal"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ""
                    }`}
                  >
                    {peakForecast.risk}
                  </Badge>
                  <span className="text-muted-foreground">
                    Peak:{" "}
                    <span className="text-foreground font-bold tracking-tight ml-1">
                      {peakForecast.peak}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {forecastSeries.length === 0 ? (
              <p className="text-base text-muted-foreground p-4">
                No forecast data available for the current filters.
              </p>
            ) : (
              <div className="relative mt-4 sm:mt-5 md:mt-6">
                <ResponsiveContainer width="100%" height={380}>
                  <ComposedChart
                    data={forecastSeries}
                    margin={{ top: 10, right: 30, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>

                    {/* Background zones - Subtler application */}
                    <ReferenceArea
                      y1={operationalBaseline}
                      y2={economicThreshold}
                      fill={chartColors.success}
                      fillOpacity={0.03}
                      stroke="none"
                    />
                    <ReferenceArea
                      y1={economicThreshold}
                      y2={economicInjuryLevel}
                      fill={chartColors.warning}
                      fillOpacity={0.03}
                      stroke="none"
                    />
                    <ReferenceArea
                      y1={economicInjuryLevel}
                      y2={yAxisDomain[1]}
                      fill={chartColors.destructive}
                      fillOpacity={0.03}
                      stroke="none"
                    />

                    <CartesianGrid 
                      vertical={false} 
                      strokeDasharray="3 3" 
                      stroke={chartColors.border} 
                      opacity={0.4} 
                    />
                    
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11 }}
                      dy={10}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11 }}
                      domain={yAxisDomain}
                      allowDecimals={false}
                      dx={-10}
                    />
                    
                    <Tooltip 
                      content={renderForecastTooltip}
                      cursor={{ stroke: chartColors.muted, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    
                    <Legend
                      verticalAlign="top"
                      height={40}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ 
                        paddingBottom: '20px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    />

                    {/* Threshold Lines - Clean & Minimal */}
                    <ReferenceLine
                      y={economicThreshold}
                      stroke={chartColors.destructive}
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      strokeWidth={1}
                      label={{
                        value: "Critical Threshold",
                        fill: chartColors.destructive,
                        fontSize: 10,
                        position: "insideTopRight",
                        fillOpacity: 0.8,
                        offset: 10
                      }}
                    />

                    <ReferenceLine
                    y={economicThreshold}
                    stroke={chartColors.warning}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Economic Threshold",
                      position: "insideTopRight",
                      fill: chartColors.warning,
                      fontSize: 10,
                      fontWeight: 600,
                      dy: -10
                    }}
                  />
                  <ReferenceLine
                    y={economicInjuryLevel}
                    stroke={chartColors.destructive}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Economic Injury Level",
                      position: "insideTopRight",
                      fill: chartColors.destructive,
                      fontSize: 10,
                      fontWeight: 600,
                      dy: -10
                    }}
                  />

                  {/* Forecast Divider */}
                  {forecastStartIndex !== -1 && (
                    <ReferenceLine
                      x={forecastSeries[forecastStartIndex]?.date}
                      stroke={chartColors.muted}
                      strokeDasharray="3 3"
                      label={{
                        value: "FORECAST START",
                        position: "insideTopLeft",
                        angle: -90,
                        fill: chartColors.muted,
                        fontSize: 10,
                        offset: 10,
                      }}
                    />
                  )}

                    {/* Confidence Band - Soft & Integrated */}
                    <Area
                      type="monotone"
                      dataKey="confidenceLower"
                      stackId="confidence"
                      stroke="none"
                      fill="transparent"
                      connectNulls={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceBandHeight"
                      stackId="confidence"
                      stroke="none"
                      fill="#9333ea"
                      fillOpacity={0.08}
                      name="Confidence Range"
                      connectNulls={false}
                    />

                    {/* Historical Data - Solid & Clear */}
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="url(#historicalGradient)"
                      activeDot={{ r: 4, strokeWidth: 2 }}
                      name="Historical Data"
                      connectNulls={false}
                    />

                    {/* Forecast Data - Dashed with Gradient Fill */}
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#9333ea"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="url(#forecastGradient)"
                      dot={<ThresholdAwareDot />}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      name="Forecast Prediction"
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Mini-Visuals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Threshold Status Breakdown */}
            <Card className="p-4 sm:p-5 md:p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Threshold Status
                </h3>
                <p className="text-base text-muted-foreground mt-1 font-medium">
                  Critical vs Warning Breakdown
                </p>
              </div>
              {thresholdStackData.summary.critical +
                thresholdStackData.summary.warning +
                thresholdStackData.summary.normal ===
              0 ? (
                <p className="text-base text-muted-foreground">
                  No status data available.
                </p>
              ) : (
                <div className="relative">
                  {/* Center Text Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {thresholdStackData.summary.critical + 
                       thresholdStackData.summary.warning + 
                       thresholdStackData.summary.normal}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Total
                    </span>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart
                      innerRadius="65%"
                      outerRadius="100%"
                      barSize={16}
                      data={thresholdStackData.data}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background={{ fill: chartColors.muted, opacity: 0.1 }}
                        dataKey="count"
                        cornerRadius={10}
                      />
                      <Legend
                        iconSize={8}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: 11, fontWeight: 500, paddingTop: '20px' }}
                      />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: chartColors.card,
                          border: `1px solid ${chartColors.border}`,
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Action Tracker */}
            <Card className="p-4 sm:p-5 md:p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Action Tracker
                </h3>
                <p className="text-base text-muted-foreground mt-1 font-medium">
                  Interventions taken by type
                </p>
              </div>
              {actionTrackerData.length === 0 ? (
                <p className="text-base text-muted-foreground">
                  No actions recorded in this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={actionTrackerData}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                    barSize={20}
                  >
                    <defs>
                      <linearGradient id="actionGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.border}
                      opacity={0.3}
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{
                        fontSize: 11,
                        fill: chartColors.muted,
                        fontWeight: 600,
                      }}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: chartColors.muted, opacity: 0.05 }}
                      contentStyle={{
                        backgroundColor: chartColors.card,
                        border: `1px solid ${chartColors.border}`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "8px 12px",
                      }}
                      itemStyle={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: chartColors.foreground,
                      }}
                      labelStyle={{ display: "none" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#actionGradient)"
                      radius={[0, 6, 6, 0]}
                      background={{
                        fill: chartColors.muted,
                        opacity: 0.05,
                        radius: [0, 6, 6, 0],
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Recent Alerts - Now Premium Styled */}
            <Card className="p-4 sm:p-5 md:p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Alerts
                </h3>
                <p className="text-base text-muted-foreground mt-1 font-medium">
                  Latest critical notifications
                </p>
              </div>
              {recentCriticalAlerts.length === 0 ? (
                <p className="text-base text-muted-foreground">
                  No critical alerts right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentCriticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/40 hover:bg-background/80 transition-colors"
                    >
                      {alert.priority === "high" ? (
                        <div className="mt-0.5 p-1.5 rounded-full bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                          <WarningTriangle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="mt-0.5 p-1.5 rounded-full bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                          <InfoCircle className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-base font-semibold text-foreground leading-none mb-1">
                          {alert.title}
                        </p>
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1.5 font-medium uppercase tracking-wider">
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
