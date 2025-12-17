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
} from "recharts";
import { Droplets, Sprout, Trash2, AlertTriangle, Info } from "lucide-react";
import type { TooltipProps } from "recharts";
import { KpiCards } from "../components/kpi-cards";
import { DashboardSkeleton } from "../components/loading-skeleton";

type ForecastPoint = {
  dateLabel: string;
  dateValue: number;
  actual: number | null;
  predicted: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  bandBase: number;
  bandSize: number;
  confidence: number | null;
};

export function Overview() {
  const filters = useDashboardStore((state) => state.filters);
  const setFilters = useDashboardStore((state) => state.setFilters);
  const forecastHorizon = useDashboardStore((state) => state.forecastHorizon);
  const setForecastHorizon = useDashboardStore(
    (state) => state.setForecastHorizon
  );
  const initialize = useDashboardStore((state) => state.initialize);
  const filteredData = useDashboardStore((state) => state.filteredObservations);
  const alerts = useDashboardStore((state) => state.alerts);
  const kpis = useDashboardStore((state) => state.kpis);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const allForecasts = useDashboardStore((state) => state.forecasts);
  const chartColors = useChartColors();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleFilterChange = (nextFilters: FilterValues) => {
    setFilters(nextFilters);
  };

  // Filter forecasts based on selected horizon
  const forecasts = useMemo(() => {
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() + forecastHorizon);

    return allForecasts.filter((f) => {
      const forecastDate = new Date(f.date);
      return forecastDate <= cutoffDate;
    });
  }, [allForecasts, forecastHorizon]);

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

  const forecastSeries = useMemo<ForecastPoint[]>(() => {
    // Group historical observations by day for averaging
    const historyByDate: Record<string, { total: number; count: number }> = {};
    filteredData.forEach((obs) => {
      if (!historyByDate[obs.date]) {
        historyByDate[obs.date] = { total: 0, count: 0 };
      }
      historyByDate[obs.date].total += obs.count;
      historyByDate[obs.date].count += 1;
    });

    const historicalPoints = Object.entries(historyByDate)
      .map(([date, stats]) => {
        const dateValue = new Date(date).getTime();
        return {
          dateLabel: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dateValue,
          actual: Math.round(stats.total / stats.count),
          predicted: null,
          lowerBound: null,
          upperBound: null,
          bandBase: 0,
          bandSize: 0,
          confidence: null,
        } as ForecastPoint;
      })
      .sort((a, b) => a.dateValue - b.dateValue);

    const filteredForecasts = forecasts.filter(
      (f) => filters.pestType === "All" || f.pestType === filters.pestType
    );

    const groupedForecasts: Record<
      string,
      {
        predicted: number;
        lower: number;
        upper: number;
        confidence: number;
        count: number;
      }
    > = {};

    filteredForecasts.forEach((f) => {
      if (!groupedForecasts[f.date]) {
        groupedForecasts[f.date] = {
          predicted: 0,
          lower: 0,
          upper: 0,
          confidence: 0,
          count: 0,
        };
      }
      groupedForecasts[f.date].predicted += f.predicted;
      groupedForecasts[f.date].lower += f.lowerBound;
      groupedForecasts[f.date].upper += f.upperBound;
      groupedForecasts[f.date].confidence += f.confidence;
      groupedForecasts[f.date].count += 1;
    });

    const forecastPoints = Object.entries(groupedForecasts).map(
      ([date, stats]) => {
        const dateValue = new Date(date).getTime();
        const avgPredicted = Math.round(stats.predicted / stats.count);
        const avgLower = Math.round(stats.lower / stats.count);
        const avgUpper = Math.round(stats.upper / stats.count);
        const avgConfidence = Math.round(stats.confidence / stats.count);

        return {
          dateLabel: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dateValue,
          actual: null,
          predicted: avgPredicted,
          lowerBound: avgLower,
          upperBound: avgUpper,
          bandBase: Math.max(0, avgLower),
          bandSize: Math.max(0, avgUpper - avgLower),
          confidence: avgConfidence,
        } as ForecastPoint;
      }
    );

    return [...historicalPoints, ...forecastPoints].sort(
      (a, b) => a.dateValue - b.dateValue
    );
  }, [filteredData, forecasts, filters.pestType]);

  const benchmarkSeries = useMemo(() => {
    // Build lookup by day-of-year for last year's averages
    const groupByDay = (
      observations: typeof filteredData,
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

    const lastYearGrouped = groupByDay(filteredData, -1);
    const overallGrouped = groupByDay(filteredData, 0);

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
  }, [filteredData, forecastSeries]);

  const renderForecastTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0]?.payload as ForecastPoint | undefined;
    if (!datum) return null;

    return (
      <div className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {label}
        </p>
        {datum.actual !== null && (
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shadow-[0_0_8px] shadow-primary/50 bg-primary" />
              <span className="text-sm font-medium text-foreground">
                Observed
              </span>
            </div>
            <span className="font-bold font-mono text-primary">
              {datum.actual}
            </span>
          </div>
        )}
        {datum.predicted !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px] shadow-indigo-500/50" />
                <span className="text-sm font-medium text-foreground">
                  Forecast
                </span>
              </div>
              <span className="font-bold font-mono text-indigo-500">
                {datum.predicted}
              </span>
            </div>
            {datum.lowerBound !== null &&
              datum.upperBound !== null &&
              datum.confidence !== null && (
                <div className="mt-1.5 pt-1.5 border-t border-border/50 flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Confidence ({datum.confidence}%)
                  </span>
                  <span className="text-xs text-foreground font-mono">
                    {datum.lowerBound} - {datum.upperBound}
                  </span>
                </div>
              )}
          </div>
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
    <div className="p-6 space-y-6">
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

          <Card className="p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
            <div className="flex flex-col space-y-6 pt-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Forecast Horizon: {forecastHorizon} Days
                  </h3>
                  <p className="text-base text-muted-foreground mt-1 font-medium">
                    Projected pest trends & confidence intervals
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/10 p-1.5 rounded-lg border border-border/40">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setForecastHorizon(days as 7 | 14 | 30)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                        forecastHorizon === days
                          ? "bg-background text-foreground shadow-sm border border-border/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                      }`}
                      aria-label={`Set forecast horizon to ${days} days`}
                      aria-pressed={forecastHorizon === days}
                    >
                      {days}D
                    </button>
                  ))}
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
              <div className="relative mt-6">
                <ResponsiveContainer width="100%" height={450}>
                  <ComposedChart
                    data={benchmarkSeries.mergedBenchmarks}
                    margin={{ top: 20, right: 10, bottom: 0, left: -10 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradientConfidence"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={chartColors.chart4}
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={chartColors.chart4}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={chartColors.border}
                      opacity={0.1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{
                        fontSize: 12,
                        fill: chartColors.muted,
                        fontWeight: 500,
                      }}
                      stroke="transparent"
                      interval="preserveStartEnd"
                      minTickGap={40}
                      dy={10}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: chartColors.muted,
                        fontWeight: 500,
                      }}
                      stroke="transparent"
                      tickLine={false}
                      dx={-5}
                    />
                    <ReferenceLine
                      y={70}
                      stroke={chartColors.destructive}
                      strokeDasharray="3 3"
                      label={{
                        position: "insideTopRight",
                        value: "Critical (70)",
                        fill: chartColors.destructive,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip
                      content={renderForecastTooltip}
                      cursor={{
                        stroke: chartColors.primary,
                        strokeWidth: 1.5,
                        strokeDasharray: "4 4",
                        opacity: 0.5,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={50}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: chartColors.muted,
                        paddingBottom: "20px",
                      }}
                    />
                    <Area
                      dataKey="bandBase"
                      stackId="confidence"
                      stroke="transparent"
                      fill="transparent"
                      isAnimationActive={false}
                    />
                    <Area
                      dataKey="bandSize"
                      stackId="confidence"
                      stroke="transparent"
                      fill="url(#gradientConfidence)"
                      isAnimationActive={false}
                      name="Confidence Interval"
                    />
                    <Line
                      type="monotone"
                      dataKey="lastYearBenchmark"
                      name="Last Year"
                      stroke={chartColors.muted}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      activeDot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="overallBenchmark"
                      name="Average"
                      stroke={chartColors.border}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      strokeDasharray="4 4"
                      activeDot={false}
                    />
                    <Line
                      type="natural"
                      dataKey="actual"
                      name="Observed"
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{
                        r: 3,
                        fill: chartColors.background,
                        stroke: chartColors.primary,
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                        strokeWidth: 4,
                        stroke: chartColors.primary
                          .replace("hsl", "hsla")
                          .replace(")", ", 0.3)"),
                        fill: chartColors.primary,
                      }}
                      connectNulls={false}
                    />
                    <Line
                      type="natural"
                      dataKey="predicted"
                      name="Forecast"
                      stroke={chartColors.chart4}
                      strokeWidth={3}
                      strokeDasharray="6 6"
                      dot={{
                        r: 3,
                        fill: chartColors.background,
                        stroke: chartColors.chart4,
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                        strokeWidth: 4,
                        stroke: chartColors.chart4
                          .replace("hsl", "hsla")
                          .replace(")", ", 0.3)"),
                        fill: chartColors.chart4,
                      }}
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Mini-Visuals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threshold Status Breakdown */}
            <Card className="p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
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
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart
                    innerRadius="30%"
                    outerRadius="100%"
                    barSize={12}
                    data={thresholdStackData.data}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      background={{ fill: chartColors.muted, opacity: 0.1 }}
                      dataKey="count"
                      cornerRadius={6}
                      label={{
                        position: "insideStart",
                        fill: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Legend
                      iconSize={8}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
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
              )}
            </Card>

            {/* Action Tracker */}
            <Card className="p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
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
                    barSize={24}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke={chartColors.border}
                      opacity={0.1}
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{
                        fontSize: 12,
                        fill: chartColors.muted,
                        fontWeight: 600,
                      }}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: chartColors.muted, opacity: 0.1 }}
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
                      fill="rgba(119, 119, 223, 1)"
                      radius={[0, 4, 4, 0]}
                      background={{
                        fill: chartColors.muted,
                        opacity: 0.05,
                        radius: [0, 4, 4, 0],
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Recent Alerts - Now Premium Styled */}
            <Card className="p-6 relative overflow-hidden border border-border bg-white shadow-sm rounded-xl">
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
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="mt-0.5 p-1.5 rounded-full bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                          <Info className="h-4 w-4" />
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
