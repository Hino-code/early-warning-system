import type { ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bug,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";
import type { KPIMetrics } from "@/shared/types/data";

type Trend = {
  observations: number;
  avgCount: number;
  aboveThreshold: number;
  actionRate: number;
  actionsTaken?: number;
};

interface KpiCardsProps {
  kpis: KPIMetrics;
  activeCount: number;
  trends: Trend;
}

const trendColor = (value: number) => (value > 0 ? "#ba1a1a" : "#10b981");

export function KpiCards({ kpis, activeCount, trends }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        title="Total Observations"
        value={kpis.totalObservations.toLocaleString()}
        icon={<Bug className="w-[50px] h-[40px] text-primary stroke-[1.5]" />}
        helper={`${activeCount} active records`}
        trend={trends.observations}
        showTrend={false}
        valueClass="text-primary"
      />

      <KpiCard
        title="Avg Pest Count"
        value={kpis.averagePestCount}
        icon={
          <Activity className="w-[50px] h-[40px] text-chart-2 stroke-[1.5]" />
        }
        helper="per observation"
        trend={trends.avgCount}
        valueClass="text-chart-2"
        showTrend={false}
      />

      <KpiCard
        title="Above Threshold"
        value={`${kpis.percentAboveThreshold}%`}
        icon={
          <AlertTriangle className="w-[50px] h-[40px] text-destructive stroke-[1.5]" />
        }
        helper="critical observations"
        trend={trends.aboveThreshold}
        showTrend={true}
        valueClass="text-destructive"
      />

      <KpiCard
        title="Action Rate"
        value={`${kpis.actionRate}%`}
        icon={
          <Target className="w-[50px] h-[40px] text-success stroke-[1.5]" />
        }
        helper="response efficiency"
        trend={trends.actionRate}
        showTrend={true}
        valueClass="text-success"
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  helper,
  trend,
  showTrend = true,
  valueClass,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  helper: string;
  trend: number;
  showTrend?: boolean;
  valueClass?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col pl-[11px] pr-px pt-[10px] pb-px">
        <div className="flex items-center gap-1 mb-2">
          <p className="font-medium leading-[20px] text-muted-foreground text-[14px] tracking-[-0.1504px]">
            {title}
          </p>
        </div>
        <div className="flex items-start justify-between mb-1">
          <div className="h-[84px] flex items-center">
            <p
              className={`font-extrabold leading-[40px] text-[52px] tracking-[-0.5309px] ${
                valueClass ?? "text-primary"
              }`}
            >
              {value}
            </p>
          </div>
          <div className="size-[60px] flex items-center justify-center opacity-80">
            {icon}
          </div>
        </div>
        <p className="font-medium leading-[16px] text-muted-foreground text-[11px] mb-1">
          {helper}
        </p>
        <div className="flex gap-[4px] items-center h-[16px]">
          {showTrend && trend !== 0 && (
            <>
              <div className="shrink-0 size-[12px]">
                {trend > 0 ? (
                  <ArrowUpRight className="size-full text-destructive" />
                ) : (
                  <ArrowDownRight className="size-full text-success" />
                )}
              </div>
              <p
                className="font-bold leading-[16px] text-[12px]"
                style={{ color: trendColor(trend) }}
              >
                {trend > 0 ? "+" : ""}
                {trend}% vs last week
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
