import { useMemo, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { SharedFilters } from "@/shared/components/filters/shared-filters";
import { useDashboardStore } from "@/state/store";
import type { FilterValues } from "@/shared/types/filters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from "recharts";
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
  const initialize = useDashboardStore((state) => state.initialize);
  const filteredData = useDashboardStore(
    (state) => state.filteredObservations,
  );
  const kpis = useDashboardStore((state) => state.kpis);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const forecasts = useDashboardStore((state) => state.forecasts);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleFilterChange = (nextFilters: FilterValues) => {
    setFilters(nextFilters);
  };

  // Calculate week-over-week changes
  const weeklyChanges = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const twoWeeksAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000,
    );

    const thisWeek = filteredData.filter(
      (obs) => new Date(obs.date) >= oneWeekAgo,
    );
    const lastWeek = filteredData.filter((obs) => {
      const date = new Date(obs.date);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const calculateChange = (
      current: number,
      previous: number,
    ) => {
      if (previous === 0) return 0;
      return Math.round(
        ((current - previous) / previous) * 100,
      );
    };

    const aboveThresholdThis = thisWeek.filter(
      (o) => o.aboveThreshold,
    ).length;
    const aboveThresholdLast = lastWeek.filter(
      (o) => o.aboveThreshold,
    ).length;
    const aboveThresholdPct =
      thisWeek.length > 0
        ? Math.round(
            (aboveThresholdThis / thisWeek.length) * 100,
          )
        : 0;
    const aboveThresholdPctLast =
      lastWeek.length > 0
        ? Math.round(
            (aboveThresholdLast / lastWeek.length) * 100,
          )
        : 0;

    const actionsTakenThis = thisWeek.filter(
      (o) => o.actionTaken,
    ).length;
    const actionsTakenLast = lastWeek.filter(
      (o) => o.actionTaken,
    ).length;

    const avgCountThis =
      thisWeek.length > 0
        ? Math.round(
            thisWeek.reduce((sum, o) => sum + o.count, 0) /
              thisWeek.length,
          )
        : 0;
    const avgCountLast =
      lastWeek.length > 0
        ? Math.round(
            lastWeek.reduce((sum, o) => sum + o.count, 0) /
              lastWeek.length,
          )
        : 0;

    return {
      observations: calculateChange(
        thisWeek.length,
        lastWeek.length,
      ),
      avgCount: calculateChange(avgCountThis, avgCountLast),
      aboveThreshold: aboveThresholdPct - aboveThresholdPctLast,
      actionsTaken: calculateChange(
        actionsTakenThis,
        actionsTakenLast,
      ),
      actionRate:
        kpis.actionRate -
        (lastWeek.length > 0
          ? Math.round(
              (actionsTakenLast / lastWeek.length) * 100,
            )
          : 0),
    };
  }, [filteredData, kpis]);

  // Prepare chart data
  const trendData = useMemo(() => {
    const grouped: Record<
      string,
      { date: string; count: number; observations: number }
    > = {};

    filteredData.forEach((obs) => {
      if (!grouped[obs.date]) {
        grouped[obs.date] = {
          date: obs.date,
          count: 0,
          observations: 0,
        };
      }
      grouped[obs.date].count += obs.count;
      grouped[obs.date].observations += 1;
    });

    return Object.values(grouped)
      .map((g) => ({
        date: new Date(g.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        avgCount: Math.round(g.count / g.observations),
      }))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime(),
      )
      .slice(-30); // Last 30 data points
  }, [filteredData]);

  const thresholdStatusData = useMemo(() => {
    const above = filteredData.filter(
      (obs) => obs.aboveThreshold,
    ).length;
    const below = filteredData.length - above;

    return [
      {
        name: "Above Threshold",
        value: above,
        color: "hsl(var(--destructive))",
      },
      {
        name: "Below Threshold",
        value: below,
        color: "hsl(var(--success))",
      },
    ];
  }, [filteredData]);

  const actionStatusData = useMemo(() => {
    const taken = filteredData.filter(
      (obs) => obs.actionTaken,
    ).length;
    const notTaken = filteredData.length - taken;

    return [
      { name: "Action Taken", value: taken },
      { name: "No Action", value: notTaken },
    ];
  }, [filteredData]);

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
      (f) => filters.pestType === "All" || f.pestType === filters.pestType,
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
      },
    );

    return [...historicalPoints, ...forecastPoints].sort(
      (a, b) => a.dateValue - b.dateValue,
    );
  }, [filteredData, forecasts, filters.pestType]);

  const renderForecastTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const datum = payload[0]?.payload as ForecastPoint | undefined;
    if (!datum) return null;

    return (
      <div className="rounded-md border bg-card px-3 py-2 shadow-sm">
        <p className="text-sm font-semibold">{label}</p>
        {datum.actual !== null && (
          <p className="text-xs text-muted-foreground">
            Observed: {datum.actual}
          </p>
        )}
        {datum.predicted !== null && (
          <>
            <p className="text-xs text-muted-foreground">
              Forecast: {datum.predicted}
            </p>
            {datum.lowerBound !== null &&
              datum.upperBound !== null &&
              datum.confidence !== null && (
                <p className="text-xs text-muted-foreground">
                  Range: {datum.lowerBound} - {datum.upperBound} (
                  {datum.confidence}% CI)
                </p>
              )}
          </>
        )}
      </div>
    );
  };

  const contentReady = !loading && filteredData.length > 0;

  return (
    <div className="p-6 space-y-6">
      <SharedFilters filters={filters} onFilterChange={handleFilterChange} compact />
      {error && (
        <Card className="p-4 border-destructive/50 bg-destructive/5 text-destructive">
          <p>{error}</p>
        </Card>
      )}
      {loading && !contentReady ? (
        <DashboardSkeleton />
      ) : (
        <>

      <KpiCards kpis={kpis} activeCount={filteredData.length} trends={weeklyChanges} />

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">14-day Forecast</h3>
            <p className="text-sm text-muted-foreground">
              Observed counts vs. projected trend (mock data)
            </p>
          </div>
          <Badge variant="outline">Mock data</Badge>
        </div>
        {forecastSeries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No forecast data available for the current filters.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={forecastSeries}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="dateLabel"
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
                stroke="hsl(var(--border))"
                interval="preserveStartEnd"
                minTickGap={10}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
                stroke="hsl(var(--border))"
              />
              <Tooltip content={renderForecastTooltip} />
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
                fill="hsl(var(--chart-4))"
                fillOpacity={0.12}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Observed"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Forecast"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pest Count Trend */}
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="font-medium">Pest Count Trend</h3>
            <p className="text-sm text-muted-foreground">
              Average daily pest count
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                stroke="hsl(var(--border))"
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgCount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Threshold Status */}
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="font-medium">Threshold Status</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of observations
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={thresholdStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {thresholdStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Action Status */}
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="font-medium">Action Status</h3>
            <p className="text-sm text-muted-foreground">
              Response tracking
            </p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={actionStatusData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}