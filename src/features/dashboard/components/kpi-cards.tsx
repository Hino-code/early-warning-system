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

const trendColor = (value: number) =>
  value > 0 ? "#ba1a1a" : "hsl(var(--success))";

export function KpiCards({ kpis, activeCount, trends }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        title="Total Observations"
        value={kpis.totalObservations.toLocaleString()}
        icon={<Bug className="w-[50px] h-[40px] text-primary stroke-[1.5]" />}
        helper={`${activeCount} active records`}
        trend={trends.observations}
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
      />

      <KpiCard
        title="Above Threshold"
        value={`${kpis.percentAboveThreshold}%`}
        icon={
          <AlertTriangle className="w-[50px] h-[40px] text-[#9f0712] stroke-[1.5]" />
        }
        helper={`${activeCount} critical observations`}
        trend={trends.aboveThreshold}
        valueClass="text-[#9f0712]"
      />

      <KpiCard
        title="Action Rate"
        value={`${kpis.actionRate}%`}
        icon={
          <Target className="w-[50px] h-[40px] text-chart-4 stroke-[1.5]" />
        }
        helper="response efficiency"
        trend={trends.actionRate}
        valueClass="text-chart-4"
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
  valueClass,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  helper: string;
  trend: number;
  valueClass?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col pl-[11px] pr-px pt-[10px] pb-px">
        <p className="font-medium leading-[20px] text-[#685f5f] text-[14px] tracking-[-0.1504px] mb-2">
          {title}
        </p>
        <div className="flex items-start justify-between mb-1">
          <div className="h-[84px] flex items-center">
            <p
              className={`font-bold leading-[40px] text-[52px] tracking-[-0.5309px] ${
                valueClass ?? "text-primary"
              }`}
            >
              {value}
            </p>
          </div>
          <div className="size-[60px] flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="font-medium leading-[16px] text-black text-[8px] mb-1">
          {helper}
        </p>
        <div className="flex gap-[4px] items-center h-[16px]">
          {trend !== 0 && (
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
