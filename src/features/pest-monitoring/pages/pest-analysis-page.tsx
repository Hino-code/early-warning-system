import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { SharedFilters } from '@/shared/components/filters/shared-filters';
import type { FilterValues } from '@/shared/types/filters';
import { getObservations, filterObservations } from '@/shared/lib/data-service';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, ComposedChart, ReferenceLine, Cell, Scatter, ScatterChart,
  ZAxis
} from 'recharts';
import { TrendingUp, Calendar, Layers, AlertCircle } from 'lucide-react';
import { chartAxisStyle, chartGridStyle, chartTooltipStyle, chartColors } from '@/shared/components/charting/chart-styles';
import React from 'react';

export function PestAnalysis() {
  const [filters, setFilters] = useState<FilterValues>({
    year: new Date().getFullYear(),
    season: 'All',
    fieldStage: 'All',
    pestType: 'All',
    dateRange: { start: new Date(new Date().getFullYear(), 0, 1), end: new Date() },
    thresholdStatus: 'All',
    actionStatus: 'All'
  });

  const allObservations = useMemo(() => getObservations(), []);
  const filteredData = useMemo(() => filterObservations(allObservations, filters), [allObservations, filters]);

  // Time-Series Data with Moving Average
  const timeSeriesData = useMemo(() => {
    const grouped: Record<string, { date: string; rbb: number; wsb: number; count: number }> = {};
    
    filteredData.forEach(obs => {
      if (!grouped[obs.date]) {
        grouped[obs.date] = { date: obs.date, rbb: 0, wsb: 0, count: 0 };
      }
      if (obs.pestType === 'Black Rice Bug') {
        grouped[obs.date].rbb += obs.count;
      } else {
        grouped[obs.date].wsb += obs.count;
      }
      grouped[obs.date].count += 1;
    });

    const sorted = Object.values(grouped)
      .map(g => ({
        date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: g.date,
        rbb: Math.round(g.rbb / g.count),
        wsb: Math.round(g.wsb / g.count),
        threshold: 50
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    // Calculate 7-day moving average
    const withMA = sorted.map((item, index) => {
      const start = Math.max(0, index - 6);
      const slice = sorted.slice(start, index + 1);
      const rbbMA = Math.round(slice.reduce((sum, s) => sum + s.rbb, 0) / slice.length);
      const wsbMA = Math.round(slice.reduce((sum, s) => sum + s.wsb, 0) / slice.length);
      
      return { ...item, rbbMA, wsbMA };
    });

    return withMA.slice(-60); // Last 60 days
  }, [filteredData]);

  // Seasonal Analysis
  const seasonalData = useMemo(() => {
    const seasonal: Record<string, { season: string; rbb: number; wsb: number; count: number }> = {
      'Dry': { season: 'Dry Season', rbb: 0, wsb: 0, count: 0 },
      'Wet': { season: 'Wet Season', rbb: 0, wsb: 0, count: 0 }
    };

    filteredData.forEach(obs => {
      seasonal[obs.season].count += 1;
      if (obs.pestType === 'Black Rice Bug') {
        seasonal[obs.season].rbb += obs.count;
      } else {
        seasonal[obs.season].wsb += obs.count;
      }
    });

    return Object.values(seasonal).map(s => ({
      season: s.season,
      'Black Rice Bug': s.count > 0 ? Math.round(s.rbb / s.count) : 0,
      'White Stem Borer': s.count > 0 ? Math.round(s.wsb / s.count) : 0
    }));
  }, [filteredData]);

  // Field Stage Analysis
  const stageData = useMemo(() => {
    const stages: Record<string, { stage: string; rbb: number; wsb: number; count: number }> = {
      'Seedling': { stage: 'Seedling', rbb: 0, wsb: 0, count: 0 },
      'Vegetative': { stage: 'Vegetative', rbb: 0, wsb: 0, count: 0 },
      'Reproductive': { stage: 'Reproductive', rbb: 0, wsb: 0, count: 0 },
      'Ripening': { stage: 'Ripening', rbb: 0, wsb: 0, count: 0 }
    };

    filteredData.forEach(obs => {
      stages[obs.fieldStage].count += 1;
      if (obs.pestType === 'Black Rice Bug') {
        stages[obs.fieldStage].rbb += obs.count;
      } else {
        stages[obs.fieldStage].wsb += obs.count;
      }
    });

    return Object.values(stages).map(s => ({
      stage: s.stage,
      'Black Rice Bug': s.count > 0 ? Math.round(s.rbb / s.count) : 0,
      'White Stem Borer': s.count > 0 ? Math.round(s.wsb / s.count) : 0,
      observations: s.count
    }));
  }, [filteredData]);

  // Heatmap Data: Season × Field Stage
  const heatmapData = useMemo(() => {
    const matrix: Record<string, Record<string, { count: number; sum: number }>> = {};
    const seasons = ['Dry', 'Wet'];
    const stages = ['Seedling', 'Vegetative', 'Reproductive', 'Ripening'];

    seasons.forEach(season => {
      matrix[season] = {};
      stages.forEach(stage => {
        matrix[season][stage] = { count: 0, sum: 0 };
      });
    });

    filteredData.forEach(obs => {
      matrix[obs.season][obs.fieldStage].count += 1;
      matrix[obs.season][obs.fieldStage].sum += obs.count;
    });

    const result: Array<{ season: string; stage: string; avgCount: number; intensity: number }> = [];
    
    seasons.forEach(season => {
      stages.forEach(stage => {
        const data = matrix[season][stage];
        const avgCount = data.count > 0 ? Math.round(data.sum / data.count) : 0;
        result.push({
          season,
          stage,
          avgCount,
          intensity: avgCount
        });
      });
    });

    return result;
  }, [filteredData]);

  // Distribution Data
  const distributionData = useMemo(() => {
    const bins: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
      '100+': 0
    };

    filteredData.forEach(obs => {
      if (obs.count <= 20) bins['0-20']++;
      else if (obs.count <= 40) bins['21-40']++;
      else if (obs.count <= 60) bins['41-60']++;
      else if (obs.count <= 80) bins['61-80']++;
      else if (obs.count <= 100) bins['81-100']++;
      else bins['100+']++;
    });

    return Object.entries(bins).map(([range, count]) => ({ range, count }));
  }, [filteredData]);

  // Threshold Crossings by Month
  const thresholdByMonth = useMemo(() => {
    const monthly: Record<string, number> = {};

    filteredData.forEach(obs => {
      if (obs.aboveThreshold) {
        const month = new Date(obs.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthly[month] = (monthly[month] || 0) + 1;
      }
    });

    return Object.entries(monthly)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredData]);

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 70) return '#ba1a1a';
    if (intensity >= 50) return '#f9ab00';
    if (intensity >= 30) return '#fdd663';
    return '#4cda81';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <SharedFilters filters={filters} onFilterChange={setFilters} compact />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Count</p>
              <p className="text-xl font-semibold">
                {Math.max(...filteredData.map(o => o.count), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-sm font-semibold">
                {filteredData.length > 0 ? new Date(Math.min(...filteredData.map(o => new Date(o.date).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                {' - '}
                {filteredData.length > 0 ? new Date(Math.max(...filteredData.map(o => new Date(o.date).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-chart-3/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Field Stages</p>
              <p className="text-xl font-semibold">
                {new Set(filteredData.map(o => o.fieldStage)).size}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Threshold Events</p>
              <p className="text-xl font-semibold">
                {filteredData.filter(o => o.aboveThreshold).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time-Series Analysis */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pest Count Over Time with Threshold
          </h3>
          <p className="text-sm text-muted-foreground">Daily average pest count with 7-day moving average</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={timeSeriesData}>
            <CartesianGrid {...chartGridStyle} />
            <XAxis 
              dataKey="date" 
              tick={chartAxisStyle}
              interval="preserveStartEnd"
            />
            <YAxis tick={chartAxisStyle} />
            <Tooltip {...chartTooltipStyle} />
            <Legend />
            <ReferenceLine y={50} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label="Threshold" />
            <Area 
              type="monotone" 
              dataKey="rbb" 
              fill="hsl(var(--chart-1))" 
              stroke="hsl(var(--chart-1))"
              fillOpacity={0.1}
              name="Black Rice Bug"
            />
            <Area 
              type="monotone" 
              dataKey="wsb" 
              fill="hsl(var(--chart-2))" 
              stroke="hsl(var(--chart-2))"
              fillOpacity={0.1}
              name="White Stem Borer"
            />
            <Line 
              type="monotone" 
              dataKey="rbbMA" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={false}
              name="RBB 7-Day MA"
            />
            <Line 
              type="monotone" 
              dataKey="wsbMA" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={false}
              name="WSB 7-Day MA"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Seasonal & Stage Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasonal Analysis */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Pest Count by Season</h3>
            <p className="text-sm text-muted-foreground">Average pest count comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalData}>
              <CartesianGrid {...chartGridStyle} />
              <XAxis dataKey="season" tick={chartAxisStyle} />
              <YAxis tick={chartAxisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="Black Rice Bug" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="White Stem Borer" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Stage Analysis */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Pest Count by Field Stage</h3>
            <p className="text-sm text-muted-foreground">Growth stage comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid {...chartGridStyle} />
              <XAxis dataKey="stage" tick={chartAxisStyle} />
              <YAxis tick={chartAxisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="Black Rice Bug" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="White Stem Borer" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Heatmap: Season × Stage */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-medium">Season × Field Stage Heatmap</h3>
          <p className="text-sm text-muted-foreground">Average pest count intensity matrix</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div></div>
          <div className="text-center text-sm font-medium">Seedling</div>
          <div className="text-center text-sm font-medium">Vegetative</div>
          <div className="text-center text-sm font-medium">Reproductive</div>
          <div className="text-center text-sm font-medium">Ripening</div>
          
          {['Dry', 'Wet'].map(season => (
            <React.Fragment key={season}>
              <div className="flex items-center text-sm font-medium">{season} Season</div>
              {['Seedling', 'Vegetative', 'Reproductive', 'Ripening'].map(stage => {
                const data = heatmapData.find(h => h.season === season && h.stage === stage);
                return (
                  <div 
                    key={`${season}-${stage}`}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-white"
                    style={{ backgroundColor: getHeatmapColor(data?.avgCount || 0) }}
                  >
                    <span className="text-lg font-semibold">{data?.avgCount || 0}</span>
                    <span className="text-xs opacity-90">avg</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            {[30, 50, 70].map(val => (
              <div 
                key={val}
                className="h-4 w-12 rounded"
                style={{ backgroundColor: getHeatmapColor(val) }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </Card>

      {/* Distribution & Threshold Crossings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Pest Count Distribution</h3>
            <p className="text-sm text-muted-foreground">Frequency distribution of observations</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distributionData}>
              <CartesianGrid {...chartGridStyle} />
              <XAxis dataKey="range" tick={chartAxisStyle} />
              <YAxis tick={chartAxisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Threshold Crossings */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-medium">Above-Threshold Events by Month</h3>
            <p className="text-sm text-muted-foreground">Frequency of threshold violations</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={thresholdByMonth}>
              <CartesianGrid {...chartGridStyle} />
              <XAxis dataKey="month" tick={chartAxisStyle} />
              <YAxis tick={chartAxisStyle} />
              <Tooltip {...chartTooltipStyle} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}