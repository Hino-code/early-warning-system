import type { ReactNode } from "react";
import {
  Bell,
  FileText,
  LayoutDashboard,
  LineChart,
  Shield,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Overview } from "@/features/dashboard/pages/overview-page";
import { Reports } from "@/features/dashboard/pages/reports-page";
import { ForecastEarlyWarning } from "@/features/forecasting/pages/forecast-page";
import { Notifications } from "@/features/notifications/pages/notifications-page";
import { PestAnalysis } from "@/features/pest-monitoring/pages/pest-analysis-page";
import { ThresholdActions } from "@/features/pest-monitoring/pages/threshold-actions-page";
import { ProfileSettings } from "@/features/system/pages/profile-settings-page";
import { AdminApprovalsPage } from "@/features/system/pages/admin-approvals-page";
import type { AppUser, UserRole } from "@/shared/types/user";

export type NavigationGroup = "dashboard" | "analysis" | "forecast" | "system";
export type AppSection =
  | "overview"
  | "pest-analysis"
  | "threshold-actions"
  | "forecast"
  | "notifications"
  | "reports"
  | "profile"
  | "admin-approvals";

export interface NavigationItem {
  title: string;
  icon: LucideIcon;
  id: AppSection;
  description: string;
  group: NavigationGroup;
  roles: UserRole[];
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    id: "overview",
    description: "High-level snapshot of pest situation",
    group: "dashboard",
    roles: ["Administrator", "Researcher", "Field Manager", "Demo User"],
  },
  {
    title: "Pest Analysis",
    icon: LineChart,
    id: "pest-analysis",
    description: "Behavior & pattern visualization",
    group: "analysis",
    roles: ["Administrator", "Researcher", "Field Manager", "Demo User"],
  },
  {
    title: "Threshold & Actions",
    icon: Target,
    id: "threshold-actions",
    description: "Operational insight & intervention efficiency",
    group: "analysis",
    roles: ["Administrator", "Researcher", "Field Manager", "Demo User"],
  },
  {
    title: "Forecast",
    icon: TrendingUp,
    id: "forecast",
    description: "SARIMA-based predictive intelligence",
    group: "forecast",
    roles: ["Administrator", "Researcher", "Demo User"],
  },
  {
    title: "Notifications",
    icon: Bell,
    id: "notifications",
    description: "Alerts, warnings, and system updates",
    group: "system",
    roles: ["Administrator", "Researcher", "Field Manager", "Demo User"],
  },
  {
    title: "Reports",
    icon: FileText,
    id: "reports",
    description: "Historical data and analytics",
    group: "system",
    roles: ["Administrator", "Researcher", "Demo User"],
  },
  {
    title: "Profile Settings",
    icon: User,
    id: "profile",
    description: "Manage your profile and account settings",
    group: "system",
    roles: ["Administrator", "Researcher", "Field Manager", "Demo User"],
  },
  {
    title: "Admin Approvals",
    icon: Shield,
    id: "admin-approvals",
    description: "Review and approve pending registrations",
    group: "system",
    roles: ["Administrator"],
  },
];

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationConfig.filter((item) => item.roles.includes(role) && item.id !== "profile");
}

export function getSectionTitle(section: AppSection): string {
  return navigationConfig.find((item) => item.id === section)?.title ?? "Overview";
}

interface RenderSectionProps {
  user: AppUser;
  onUpdateUser: (user: AppUser) => void;
}

export function renderSection(section: AppSection, { user, onUpdateUser }: RenderSectionProps): ReactNode {
  switch (section) {
    case "overview":
      return <Overview />;
    case "pest-analysis":
      return <PestAnalysis />;
    case "threshold-actions":
      return <ThresholdActions />;
    case "forecast":
      return <ForecastEarlyWarning />;
    case "reports":
      return <Reports />;
    case "notifications":
      return <Notifications />;
    case "profile":
      return <ProfileSettings user={user} onUpdateUser={onUpdateUser} />;
    case "admin-approvals":
      return <AdminApprovalsPage />;
    default:
      return <Overview />;
  }
}
