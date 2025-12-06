import { useMemo, useEffect } from "react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { SharedFilters } from "@/shared/components/filters/shared-filters";
import { useDashboardStore } from "@/state/store";
import { chartColors } from "@/shared/lib/chart-colors";
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
  Legend,
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
  const forecastHorizon = useDashboardStore((state) => state.forecastHorizon);
  const setForecastHorizon = useDashboardStore((state) => state.setForecastHorizon);
  const initialize = useDashboardStore((state) => state.initialize);
  const filteredData = useDashboardStore(
    (state) => state.filteredObservations,
  );
  const kpis = useDashboardStore((state) => state.kpis);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const allForecasts = useDashboardStore((state) => state.forecasts);

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
        name: "Critical",
        value: above,
        color: chartColors.destructive,
      },
      {
        name: "Normal",
        value: below,
        color: chartColors.success,
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

  const peakForecast = useMemo(() => {
    const predicted = forecasts
      .filter((f) => filters.pestType === "All" || f.pestType === filters.pestType)
      .map((f) => f.predicted);
    if (predicted.length === 0) return null;
    const peak = Math.max(...predicted);
    const risk =
      peak >= 70 ? "Critical" : peak >= 50 ? "Elevated" : "Normal";
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
      ) : (
        <>

      <KpiCards kpis={kpis} activeCount={filteredData.length} trends={weeklyChanges} />

      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base">{forecastHorizon}-Day Forecast</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Observed counts vs. projected trend with confidence intervals
            </p>
          </div>
          <div className="flex gap-1 bg-muted/50 rounded-md p-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setForecastHorizon(days as 7 | 14 | 30)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  forecastHorizon === days
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        {peakForecast && (
          <div className="flex items-stretch gap-3 mb-4">
            <div className="flex-1 rounded-lg border border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Peak Expected
              </p>
              <p className="text-2xl font-bold text-foreground leading-none">{peakForecast.peak}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">in {forecastHorizon} days</p>
            </div>
            <div className={`flex-1 rounded-lg border border-l-4 p-3 ${
              peakForecast.risk === "Critical" 
                ? "border-l-destructive bg-gradient-to-br from-destructive/5 to-transparent" 
                : peakForecast.risk === "Elevated"
                ? "border-l-warning bg-gradient-to-br from-warning/5 to-transparent"
                : "border-l-success bg-gradient-to-br from-success/5 to-transparent"
            }`}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Risk Level
              </p>
              <Badge variant={
                peakForecast.risk === "Critical" ? "destructive" : 
                peakForecast.risk === "Elevated" ? "outline" : "outline"
              } className={
                peakForecast.risk === "Elevated" ? "bg-warning text-warning-foreground border-warning" : ""
              }>
                {peakForecast.risk}
              </Badge>
            </div>
            <div className="flex-[1.5] rounded-lg border border-l-4 border-l-chart-4 bg-gradient-to-br from-chart-4/5 to-transparent p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Recommended Action
              </p>
              <p className="text-xs font-medium text-foreground leading-snug">{peakForecast.action}</p>
            </div>
          </div>
        )}
        {forecastSeries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No forecast data available for the current filters.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={520}>
            <ComposedChart data={forecastSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.border}
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                tick={{
                  fontSize: 12,
                  fill: chartColors.foreground,
                }}
                stroke={chartColors.border}
                strokeWidth={1.5}
                interval="preserveStartEnd"
                minTickGap={20}
                label={{
                  value: "Date",
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 12, fill: chartColors.muted },
                }}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: chartColors.foreground,
                }}
                stroke={chartColors.border}
                strokeWidth={1.5}
                label={{
                  value: "Pest Count",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: chartColors.muted },
                }}
              />
              <Tooltip content={renderForecastTooltip} />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="line"
                wrapperStyle={{ fontSize: 13 }}
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
                fill={chartColors.chart4}
                fillOpacity={0.15}
                isAnimationActive={false}
                name="Confidence Band"
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Observed"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ r: 3, fill: chartColors.primary }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Forecast"
                stroke={chartColors.chart4}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: chartColors.chart4 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pest Count Trend */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Pest Count Trend</h3>
            <p className="text-sm text-muted-foreground">
              Last 30 days average
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.border}
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: chartColors.foreground }}
                stroke={chartColors.border}
                strokeWidth={1.5}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: chartColors.foreground }} 
                stroke={chartColors.border} 
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.card,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: "8px",
                  color: chartColors.foreground,
                  padding: "8px 12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgCount"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ r: 2, fill: chartColors.primary }}
                name="Avg Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Threshold Status */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Threshold Status</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of observations
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={thresholdStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
                outerRadius={85}
                innerRadius={50}
                fill={chartColors.primary}
                dataKey="value"
                paddingAngle={2}
              >
                {thresholdStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={chartColors.background}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.card,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: chartColors.foreground,
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Action Status */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Action Status</h3>
            <p className="text-sm text-muted-foreground">
              Response tracking
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={actionStatusData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.border}
                opacity={0.5}
                vertical={false}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: chartColors.foreground }} 
                stroke={chartColors.border} 
                strokeWidth={1.5}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: chartColors.foreground }} 
                stroke={chartColors.border} 
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.card,
                  border: `1px solid ${chartColors.border}`,
                  borderRadius: "8px",
                  color: chartColors.foreground,
                  padding: "8px 12px",
                }}
              />
              <Bar
                dataKey="value"
                fill={chartColors.primary}
                radius={[8, 8, 0, 0]}
              >
                {actionStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === "Action Taken" ? chartColors.success : chartColors.muted}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}