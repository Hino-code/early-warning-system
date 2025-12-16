import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useDashboardStore } from '@/state/store';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Area, AreaChart, ComposedChart, ReferenceLine, Bar, BarChart, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Target, Brain, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { chartAxisStyle, chartGridStyle, chartTooltipStyle } from '@/shared/components/charting/chart-styles';
import { useChartColors } from "@/shared/hooks/use-chart-colors";

export function ForecastEarlyWarning() {
  const [selectedPest, setSelectedPest] = useState<'Black Rice Bug'>('Black Rice Bug');
  const [forecastDays, setForecastDays] = useState(7);
  const chartColors = useChartColors();

  const { forecasts, observations, initialize } = useDashboardStore();
  
  // Ensure data is loaded
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter forecasts by selected pest and days
  const filteredForecasts = useMemo(() => {
    return forecasts
      .filter(f => f.pestType === selectedPest)
      .slice(0, forecastDays);
  }, [forecasts, selectedPest, forecastDays]);

  // Historical data for comparison (last 30 days)
  const historicalData = useMemo(() => {
    const grouped: Record<string, { date: string; count: number; observations: number }> = {};
    
    const recentObs = observations
      .filter(o => o.pestType === selectedPest)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 500); // Last observations
    
    recentObs.forEach(obs => {
      if (!grouped[obs.date]) {
        grouped[obs.date] = { date: obs.date, count: 0, observations: 0 };
      }
      grouped[obs.date].count += obs.count;
      grouped[obs.date].observations += 1;
    });

    return Object.values(grouped)
      .map(g => ({
        date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: g.date,
        actual: Math.round(g.count / g.observations),
        type: 'historical'
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30);
  }, [observations, selectedPest]);

  // Combined historical + forecast data
  const combinedData = useMemo(() => {
    const historical = historicalData.map(h => ({
      date: h.date,
      actual: h.actual,
      predicted: null,
      bandBase: 0,
      bandSize: 0,
    }));

    const forecast = filteredForecasts.map(f => {
      const lower = Math.max(0, f.lowerBound);
      const upper = Math.max(lower, f.upperBound);
      return {
        date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: null,
        predicted: f.predicted,
        bandBase: lower,
        bandSize: upper - lower,
      };
    });

    return [...historical, ...forecast];
  }, [historicalData, filteredForecasts]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const threshold = selectedPest === 'Black Rice Bug' ? 50 : 40;
    const aboveThreshold = filteredForecasts.filter(f => f.predicted > threshold);
    const highRiskDays = filteredForecasts.filter(f => f.predicted > threshold * 1.5);
    const avgPredicted = filteredForecasts.reduce((sum, f) => sum + f.predicted, 0) / filteredForecasts.length;
    const peakDay = filteredForecasts.reduce((max, f) => f.predicted > max.predicted ? f : max, filteredForecasts[0]);
    
    let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    if (highRiskDays.length >= 3) riskLevel = 'High';
    else if (aboveThreshold.length >= 2) riskLevel = 'Moderate';

    return {
      daysAboveThreshold: aboveThreshold.length,
      highRiskDays: highRiskDays.length,
      avgPredicted: Math.round(avgPredicted),
      peakDay: peakDay ? {
        date: new Date(peakDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: peakDay.predicted
      } : null,
      riskLevel,
      threshold
    };
  }, [filteredForecasts, selectedPest]);

  // Seasonal prediction based on historical data
  const seasonalPrediction = useMemo(() => {
    const seasonalCounts: Record<string, { count: number; observations: number }> = {
      'Dry': { count: 0, observations: 0 },
      'Wet': { count: 0, observations: 0 }
    };

    observations
      .filter(o => o.pestType === selectedPest)
      .forEach(obs => {
        seasonalCounts[obs.season].count += obs.count;
        seasonalCounts[obs.season].observations += 1;
      });

    const dryAvg = seasonalCounts['Dry'].observations > 0 
      ? Math.round(seasonalCounts['Dry'].count / seasonalCounts['Dry'].observations) 
      : 0;
    const wetAvg = seasonalCounts['Wet'].observations > 0 
      ? Math.round(seasonalCounts['Wet'].count / seasonalCounts['Wet'].observations) 
      : 0;

    return {
      peakSeason: wetAvg > dryAvg ? 'Wet Season' : 'Dry Season',
      dryAvg,
      wetAvg
    };
  }, [observations, selectedPest]);

  // Recommended actions
  const recommendations = useMemo(() => {
    const actions: Array<{ priority: 'High' | 'Medium' | 'Low'; action: string; reason: string }> = [];

    if (riskMetrics.daysAboveThreshold > 0) {
      actions.push({
        priority: 'High',
        action: 'Prepare intervention resources',
        reason: `${riskMetrics.daysAboveThreshold} day(s) forecasted above threshold`
      });
    }

    if (riskMetrics.highRiskDays > 0) {
      actions.push({
        priority: 'High',
        action: 'Schedule immediate field inspection',
        reason: `${riskMetrics.highRiskDays} day(s) with critically high pest count predicted`
      });
    }

    if (riskMetrics.riskLevel === 'High') {
      actions.push({
        priority: 'High',
        action: 'Activate emergency response protocol',
        reason: 'Overall risk level is HIGH based on forecast'
      });
    }

    if (riskMetrics.peakDay && riskMetrics.peakDay.count > riskMetrics.threshold) {
      actions.push({
        priority: 'Medium',
        action: `Target intervention on ${riskMetrics.peakDay.date}`,
        reason: `Peak pest activity predicted (${riskMetrics.peakDay.count} count)`
      });
    }

    if (riskMetrics.avgPredicted > riskMetrics.threshold * 0.8) {
      actions.push({
        priority: 'Medium',
        action: 'Increase monitoring frequency',
        reason: 'Average predicted count approaching threshold'
      });
    }

    if (actions.length === 0) {
      actions.push({
        priority: 'Low',
        action: 'Maintain regular monitoring',
        reason: 'Forecast indicates normal pest levels'
      });
    }

    return actions;
  }, [riskMetrics]);

  // Confidence levels by day
  const confidenceData = useMemo(() => {
    return filteredForecasts.map(f => ({
      date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      confidence: f.confidence
    }));
  }, [filteredForecasts]);

  const forecastLineColor =
    riskMetrics.riskLevel === 'High'
      ? chartColors.destructive
      : riskMetrics.riskLevel === 'Moderate'
        ? chartColors.warning
        : chartColors.chart2;

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-muted-foreground">Pest Type</label>
            <Select value={selectedPest} onValueChange={(val: string) => setSelectedPest(val as 'Black Rice Bug')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Black Rice Bug">Black Rice Bug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm text-muted-foreground">Forecast Period</label>
            <Select value={forecastDays.toString()} onValueChange={(val: string) => setForecastDays(parseInt(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Risk Alert */}
      {riskMetrics.riskLevel === 'High' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Risk Alert</AlertTitle>
          <AlertDescription>
            Forecast indicates {riskMetrics.daysAboveThreshold} day(s) above threshold in the next {forecastDays} days. 
            Immediate action recommended.
          </AlertDescription>
        </Alert>
      )}

      {riskMetrics.riskLevel === 'Moderate' && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Moderate Risk Alert</AlertTitle>
          <AlertDescription className="text-warning-foreground">
            Forecast shows elevated pest levels. Monitor closely and prepare intervention resources.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Metrics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <Badge 
                variant={
                  riskMetrics.riskLevel === 'High' ? 'destructive' : 
                  riskMetrics.riskLevel === 'Moderate' ? 'default' : 
                  'outline'
                }
                className={riskMetrics.riskLevel === 'Moderate' ? 'bg-warning text-warning-foreground' : ''}
              >
                {riskMetrics.riskLevel}
              </Badge>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Days Above Threshold</p>
              <p className="text-2xl font-semibold">{riskMetrics.daysAboveThreshold}</p>
              <p className="text-xs text-muted-foreground">Next {forecastDays} days</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">High Risk Days</p>
              <p className="text-2xl font-semibold">{riskMetrics.highRiskDays}</p>
              <p className="text-xs text-muted-foreground">&gt;150% threshold</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-chart-3" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg Predicted</p>
              <p className="text-2xl font-semibold">{riskMetrics.avgPredicted}</p>
              <p className="text-xs text-muted-foreground">Pest count</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Peak Day</p>
              <p className="text-lg font-semibold truncate">{riskMetrics.peakDay?.date || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Count: {riskMetrics.peakDay?.count || 0}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-chart-4/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-chart-4" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Threshold</p>
              <p className="text-2xl font-semibold">{riskMetrics.threshold}</p>
              <p className="text-xs text-muted-foreground">Economic limit</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Forecast Visualization with Confidence Bands */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-medium">SARIMA Forecast with Confidence Interval</h3>
          <p className="text-sm text-muted-foreground">
            Historical data (last 30 days) + {forecastDays}-day prediction with upper/lower bounds
          </p>
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={combinedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid {...chartGridStyle} />
            <XAxis 
              dataKey="date" 
              {...chartAxisStyle}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -5,
                style: { fontSize: 12, fill: chartColors.muted },
              }}
            />
            <YAxis 
              {...chartAxisStyle}
              label={{
                value: "Pest Count",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: chartColors.muted },
              }}
            />
            <Tooltip {...chartTooltipStyle} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="line"
            />
            <ReferenceLine 
              y={riskMetrics.threshold} 
              stroke={chartColors.destructive} 
              strokeDasharray="5 5" 
              label={{ value: "Threshold", fill: chartColors.destructive, fontSize: 11 }}
            />
            
            {/* Historical actual data */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke={chartColors.primary} 
              strokeWidth={3}
              dot={{ r: 3, fill: chartColors.primary }}
              name="Historical"
              connectNulls={false}
            />
            
            {/* Forecast prediction */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke={forecastLineColor} 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: forecastLineColor }}
              name="Forecast"
              connectNulls={false}
            />
            
            {/* Confidence interval band */}
            <Area
              dataKey="bandBase"
              stackId="band"
              stroke="transparent"
              fill="transparent"
              isAnimationActive={false}
            />
            <Area
              dataKey="bandSize"
              stackId="band"
              stroke="transparent"
              fill={forecastLineColor}
              fillOpacity={0.16}
              isAnimationActive={false}
              name="Confidence Band"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Forecast Confidence & Seasonal Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Levels */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Forecast Confidence by Day</h3>
            <p className="text-sm text-muted-foreground">Model prediction confidence (decreases with time)</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceData}>
              <CartesianGrid {...chartGridStyle} />
              <XAxis dataKey="date" {...chartAxisStyle} />
              <YAxis domain={[0, 100]} {...chartAxisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="confidence" fill={chartColors.primary} radius={[6, 6, 0, 0]}>
                {confidenceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.confidence >= 90 ? chartColors.success : entry.confidence >= 85 ? chartColors.warning : chartColors.destructive}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Seasonal Prediction */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Seasonal Pattern Insight</h3>
            <p className="text-sm text-muted-foreground">Historical seasonal pest activity for {selectedPest}</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Expected Peak Season</span>
                <Badge>{seasonalPrediction.peakSeason}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on historical data analysis
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Dry Season Avg</p>
                <p className="text-2xl font-semibold">{seasonalPrediction.dryAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">pest count</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Wet Season Avg</p>
                <p className="text-2xl font-semibold">{seasonalPrediction.wetAvg}</p>
                <p className="text-xs text-muted-foreground mt-1">pest count</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10">
              <p className="text-sm font-medium mb-1">Predicted Risk Level</p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    riskMetrics.riskLevel === 'High' ? 'destructive' : 
                    riskMetrics.riskLevel === 'Moderate' ? 'default' : 
                    'outline'
                  }
                  className={riskMetrics.riskLevel === 'Moderate' ? 'bg-warning text-warning-foreground' : ''}
                >
                  {riskMetrics.riskLevel}
                </Badge>
                <span className="text-xs text-muted-foreground">for next {forecastDays} days</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommended Actions & Alerts
          </h3>
          <p className="text-sm text-muted-foreground">Proactive intervention recommendations based on forecast</p>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'High' 
                  ? 'border-l-destructive bg-destructive/5' 
                  : rec.priority === 'Medium'
                  ? 'border-l-warning bg-warning/5'
                  : 'border-l-muted bg-muted/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={rec.priority === 'High' ? 'destructive' : 'outline'}
                      className={rec.priority === 'Medium' ? 'bg-warning text-warning-foreground' : ''}
                    >
                      {rec.priority} Priority
                    </Badge>
                    <h4 className="font-medium">{rec.action}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}