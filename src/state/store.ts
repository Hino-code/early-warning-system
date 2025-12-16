import { create } from "zustand";
import type {
  AlertRecord,
  ForecastData,
  KPIMetrics,
  PestObservation,
} from "@/shared/types/data";
import * as dataService from "@/shared/lib/data-service";
import { apiClient } from "@/shared/lib/api-client";
import type { FilterValues } from "@/shared/types/filters";
import { createDefaultFilters } from "@/shared/types/filters";

let mockModeOverride: boolean | null = null;

export const setDashboardMockMode = (value: boolean | null) => {
  mockModeOverride = value;
};

const shouldUseMocks = () => {
  if (mockModeOverride !== null) {
    return mockModeOverride;
  }

  if (typeof window === "undefined") {
    return true;
  }
  const env = import.meta?.env ?? {};
  const nodeEnv = typeof process !== "undefined" ? process.env : {};
  const flag = env.VITE_USE_MOCKS ?? nodeEnv?.VITE_USE_MOCKS ?? "true";
  return String(flag).toLowerCase() !== "false";
};

export const DEFAULT_KPIS: KPIMetrics = {
  totalObservations: 0,
  averagePestCount: 0,
  percentAboveThreshold: 0,
  totalActionsTaken: 0,
  actionRate: 0,
  currentFieldStage: "N/A",
  mostAffectedStage: "N/A",
};

interface DashboardState {
  filters: FilterValues;
  forecastHorizon: 7 | 14 | 30;
  observations: PestObservation[];
  filteredObservations: PestObservation[];
  forecasts: ForecastData[];
  alerts: AlertRecord[];
  alertUnreadCount: number;
  kpis: KPIMetrics;
  loading: boolean;
  error?: string;
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  setFilters: (filters: FilterValues) => void;
  setForecastHorizon: (horizon: 7 | 14 | 30) => void;
}

type DataProvider = {
  getObservations: () => PestObservation[];
  getForecastData: () => ForecastData[];
  getAlerts: () => AlertRecord[];
};

let dataProvider: DataProvider = {
  getObservations: () => dataService.getObservations(),
  getForecastData: () => dataService.getForecastData(),
  getAlerts: () => dataService.getAlerts(),
};

export const setDashboardDataProvider = (provider: DataProvider) => {
  dataProvider = provider;
};

const applyFilters = (
  observations: PestObservation[],
  filters: FilterValues,
) => {
  const filtered = dataService.filterObservations(observations, filters);
  const kpis = dataService.calculateKPIs(filtered);
  return { filtered, kpis };
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  filters: createDefaultFilters(),
  forecastHorizon: 14,
  observations: [],
  filteredObservations: [],
  forecasts: [],
  alerts: [],
  alertUnreadCount: 0,
  kpis: DEFAULT_KPIS,
  loading: false,
  error: undefined,
  initialize: async () => {
    // #region agent log
    // #endregion
    if (get().observations.length === 0) {
      await get().refreshData();
    }
    if (get().alerts.length === 0) {
      await get().loadAlerts();
    }
  },
  refreshData: async () => {
    set({ loading: true, error: undefined });
    try {
      let observations: PestObservation[] = [];
      let forecasts: ForecastData[] = [];

      if (shouldUseMocks()) {
        observations = dataProvider.getObservations();
        forecasts = dataProvider.getForecastData();
      } else {
        observations = await apiClient.get<PestObservation[]>("/observations", {
          mockResponse: () => [],
        });
        forecasts = await apiClient.get<ForecastData[]>("/forecasts", {
          mockResponse: () => [],
        });
      }

      const { filtered, kpis } = applyFilters(observations, get().filters);

      // #region agent log
      // #endregion

      set({
        observations,
        filteredObservations: filtered,
        forecasts,
        kpis,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load data",
        loading: false,
      });
    }
  },
  loadAlerts: async () => {
    const storedReads =
      typeof localStorage !== "undefined"
        ? JSON.parse(localStorage.getItem("mock_alert_reads") || "[]")
        : [];
    const alerts = dataProvider.getAlerts().map((alert) => ({
      ...alert,
      read: storedReads.includes(alert.id) ? true : alert.read,
    }));
    const unread = alerts.filter((a) => !a.read).length;
    set({ alerts, alertUnreadCount: unread });
  },
  markAlertRead: (id: string) => {
    const { alerts } = get();
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, read: true } : a,
    );
    const unread = updated.filter((a) => !a.read).length;
    if (typeof localStorage !== "undefined") {
      const readIds = updated.filter((a) => a.read).map((a) => a.id);
      localStorage.setItem("mock_alert_reads", JSON.stringify(readIds));
    }
    set({ alerts: updated, alertUnreadCount: unread });
  },
  markAllAlertsRead: () => {
    const { alerts } = get();
    const updated = alerts.map((a) => ({ ...a, read: true }));
    if (typeof localStorage !== "undefined") {
      const readIds = updated.map((a) => a.id);
      localStorage.setItem("mock_alert_reads", JSON.stringify(readIds));
    }
    set({ alerts: updated, alertUnreadCount: 0 });
  },
  setFilters: (nextFilters: FilterValues) => {
    const { observations } = get();
    const { filtered, kpis } = applyFilters(observations, nextFilters);

    // #region agent log
    // #endregion

    set({
      filters: nextFilters,
      filteredObservations: filtered,
      kpis,
    });

    // #region agent log
    // #endregion
  },
  setForecastHorizon: (horizon: 7 | 14 | 30) => {
    set({ forecastHorizon: horizon });
  },
}));

