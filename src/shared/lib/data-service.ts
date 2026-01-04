import { generateForecastData } from "@/mocks/forecasting.mock";
import { generateObservations } from "@/mocks/pests.mock";
import type {
  KPIMetrics,
  PestObservation,
  ForecastData,
  AlertRecord,
} from "@/shared/types/data";

// Cache the data
let cachedObservations: PestObservation[] | null = null;
let cachedForecasts: ForecastData[] | null = null;
let cachedAlerts: AlertRecord[] | null = null;

/**
 * Get observations from mock data generator
 * Mock data is generated on-demand and cached for performance
 */
export const getObservations = (): PestObservation[] => {
  if (cachedObservations && cachedObservations.length > 0) {
    return cachedObservations;
  }
  
  cachedObservations = generateObservations();
  return cachedObservations;
};

/**
 * Async version for backward compatibility
 * Since CSV is now bundled, this is effectively synchronous
 */
export const getObservationsAsync = async (): Promise<PestObservation[]> => {
  return Promise.resolve(getObservations());
};

export const getForecastData = (): ForecastData[] => {
  if (!cachedForecasts) {
    cachedForecasts = generateForecastData();
  }
  return cachedForecasts;
};

// Generate comprehensive alerts - expanded for evaluation
const generateAlerts = (): AlertRecord[] => {
  const alerts: AlertRecord[] = [];
  const now = Date.now();
  
  // Critical threshold alerts (recent)
  for (let i = 0; i < 8; i++) {
    alerts.push({
      id: `alert-threshold-${i + 1}`,
      title: i === 0 ? "Critical pest threshold exceeded" : `Threshold exceeded in Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 1).padStart(2, '0')}`,
      message: `Black Rice Bug count reached ${45 + Math.floor(Math.random() * 30)} in Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 1).padStart(2, '0')}. Economic threshold exceeded. Immediate action recommended.`,
      type: "alert" as const,
      timestamp: new Date(now - (i * 2 + 1) * 60 * 60 * 1000),
      read: i >= 3,
      priority: "high" as const,
      category: "threshold" as const,
      metadata: {
        pestType: "Black Rice Bug",
        location: `Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 1).padStart(2, '0')}`,
        count: 45 + Math.floor(Math.random() * 30),
        threshold: 50,
      },
    });
  }
  
  // Forecast alerts
  for (let i = 0; i < 6; i++) {
    alerts.push({
      id: `alert-forecast-${i + 1}`,
      title: i === 0 ? "Forecast: Elevated pest risk in next 7 days" : `Forecast alert: Risk period ${i + 1}`,
      message: `Forecast model predicts increasing Black Rice Bug counts (${15 + i * 2}-${22 + i * 2} expected). Prepare intervention strategies.`,
      type: "warning" as const,
      timestamp: new Date(now - (i * 3 + 2) * 60 * 60 * 1000),
      read: i >= 3,
      priority: i < 2 ? "high" as const : "medium" as const,
      category: "forecast" as const,
      metadata: {
        pestType: "Black Rice Bug",
        location: "Multiple fields",
      },
    });
  }
  
  // Action required alerts
  for (let i = 0; i < 5; i++) {
    alerts.push({
      id: `alert-action-${i + 1}`,
      title: i === 0 ? "Multiple threshold breaches detected" : `Action required: Field inspection ${i + 1}`,
      message: `${3 + i} fields exceeded economic threshold. Field inspection and coordinated action required.`,
      type: "warning" as const,
      timestamp: new Date(now - (i * 4 + 4) * 60 * 60 * 1000),
      read: i >= 2,
      priority: "medium" as const,
      category: "action-required" as const,
      metadata: {
        pestType: "Black Rice Bug",
        location: "Multiple fields",
      },
    });
  }
  
  // System/info alerts
  for (let i = 0; i < 10; i++) {
    const alertTypes = [
      { title: "Field stage transition detected", message: "Vegetative to Reproductive stage transition detected. Pest monitoring frequency increased." },
      { title: "Weekly report generated", message: "Weekly pest monitoring summary available. Average count: 12.3 (↓ 2.1 from last week)." },
      { title: "Action taken: Biological control applied", message: `Field Manager applied biological control measures in Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 1)} after threshold breach.` },
      { title: "Data sync complete", message: `Latest observations synchronized from ${10 + i} field monitoring devices. ${40 + i * 5} new records added.` },
      { title: "Threshold warning: Field approaching limit", message: `Black Rice Bug count at ${38 + i} in Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 15)} (threshold: 50). Monitor closely.` },
    ];
    
    const alertType = alertTypes[i % alertTypes.length];
    alerts.push({
      id: `alert-system-${i + 1}`,
      title: alertType.title,
      message: alertType.message,
      type: "info" as const,
      timestamp: new Date(now - (i * 6 + 6) * 60 * 60 * 1000),
      read: i >= 5,
      priority: i < 3 ? "medium" as const : "low" as const,
      category: i < 2 ? "system" as const : (i < 4 ? "threshold" as const : "system" as const),
      metadata: {
        pestType: "Black Rice Bug",
        location: `Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 1)}`,
      },
    });
  }
  
  // Additional historical alerts (older)
  for (let i = 0; i < 15; i++) {
    const daysAgo = 2 + Math.floor(i / 3);
    const alertVariations = [
      { title: "Economic damage threshold reached", message: `Black Rice Bug count reached ${65 + Math.floor(Math.random() * 20)}. Economic injury level exceeded.` },
      { title: "Pest activity spike detected", message: `Unusual increase in Black Rice Bug activity across multiple fields in sector ${String.fromCharCode(65 + (i % 4))}.` },
      { title: "Weather alert: Wet season conditions", message: "Heavy rainfall expected. Monitor for increased pest activity in low-lying fields." },
    ];
    
    const variation = alertVariations[i % alertVariations.length];
    alerts.push({
      id: `alert-historical-${i + 1}`,
      title: variation.title,
      message: variation.message,
      type: (i % 3 === 0 ? "alert" : i % 3 === 1 ? "warning" : "info") as const,
      timestamp: new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (i % 24) * 60 * 60 * 1000),
      read: i >= 8,
      priority: i < 5 ? "high" as const : (i < 10 ? "medium" as const : "low" as const),
      category: (i % 3 === 0 ? "threshold" : i % 3 === 1 ? "forecast" : "system") as const,
      metadata: {
        pestType: "Black Rice Bug",
        location: `Field ${String.fromCharCode(65 + (i % 8))}-${String(i + 20)}`,
      },
    });
  }
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const baseAlerts: AlertRecord[] = generateAlerts();

export const getAlerts = (): AlertRecord[] => {
  if (!cachedAlerts) {
    cachedAlerts = baseAlerts;
  }
  return cachedAlerts;
};

// Filter observations based on criteria
export const filterObservations = (
  observations: PestObservation[],
  filters: {
    year?: number;
    season?: "Dry" | "Wet" | "All";
    fieldStage?: string;
    pestType?: "Black Rice Bug" | "All";
    dateRange?: { start: Date; end: Date };
    thresholdStatus?: "Below" | "Above" | "All";
    actionStatus?: "Taken" | "Not Taken" | "All";
  },
): PestObservation[] => {
  const initialCount = observations.length;
  const filtered = observations.filter(obs => {
    const obsDate = new Date(obs.date);

    if (filters.year && obsDate.getFullYear() !== filters.year) return false;
    if (filters.season && filters.season !== 'All' && obs.season !== filters.season) return false;
    if (filters.fieldStage && filters.fieldStage !== 'All' && obs.fieldStage !== filters.fieldStage) return false;
    if (filters.pestType && filters.pestType !== 'All' && obs.pestType !== filters.pestType) return false;

    if (filters.dateRange) {
      if (obsDate < filters.dateRange.start || obsDate > filters.dateRange.end) return false;
    }

    if (filters.thresholdStatus) {
      if (filters.thresholdStatus === 'Above' && !obs.aboveThreshold) return false;
      if (filters.thresholdStatus === 'Below' && obs.aboveThreshold) return false;
    }

    if (filters.actionStatus) {
      if (filters.actionStatus === 'Taken' && !obs.actionTaken) return false;
      if (filters.actionStatus === 'Not Taken' && obs.actionTaken) return false;
    }

    return true;
  });

  // #region agent log
  // #endregion

  return filtered;
};

// Calculate KPIs
export const calculateKPIs = (observations: PestObservation[]): KPIMetrics => {
  if (observations.length === 0) {
    return {
      totalObservations: 0,
      averagePestCount: 0,
      percentAboveThreshold: 0,
      totalActionsTaken: 0,
      actionRate: 0,
      currentFieldStage: 'N/A',
      mostAffectedStage: 'N/A'
    };
  }

  const totalObservations = observations.length;
  const totalPestCount = observations.reduce((sum, obs) => sum + obs.count, 0);
  const averagePestCount = totalPestCount / totalObservations;
  const aboveThresholdCount = observations.filter(obs => obs.aboveThreshold).length;
  const percentAboveThreshold = (aboveThresholdCount / totalObservations) * 100;
  const totalActionsTaken = observations.filter(obs => obs.actionTaken).length;
  const actionRate = (totalActionsTaken / totalObservations) * 100;

  // Get most recent stage as current
  const sortedObs = [...observations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentFieldStage = sortedObs[0]?.fieldStage || 'N/A';

  // Find most affected stage
  const stageCounts: Record<string, number> = {};
  observations.forEach(obs => {
    stageCounts[obs.fieldStage] = (stageCounts[obs.fieldStage] || 0) + obs.count;
  });
  const mostAffectedStage = Object.keys(stageCounts).reduce((a, b) =>
    stageCounts[a] > stageCounts[b] ? a : b, 'N/A'
  );

  // #region agent log
  // #endregion

  return {
    totalObservations,
    averagePestCount: Math.round(averagePestCount * 10) / 10,
    percentAboveThreshold: Math.round(percentAboveThreshold * 10) / 10,
    totalActionsTaken,
    actionRate: Math.round(actionRate * 10) / 10,
    currentFieldStage,
    mostAffectedStage
  };
};
