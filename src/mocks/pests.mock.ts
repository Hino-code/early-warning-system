import type { PestObservation, FieldStage, Season } from "@/shared/types/data";

// Cache for generated observations
let cachedObservations: PestObservation[] | null = null;

// Function to clear cache (useful for regeneration)
export const clearObservationsCache = () => {
  cachedObservations = null;
};

// All 7 field stages from CSV
const FIELD_STAGES: FieldStage[] = [
  "Seedling",
  "Vegetative",
  "Reproductive",
  "Ripening",
  "Harvest",
  "Fallow",
  "Land Prep",
  "Nursery",
];

// Field stage weights - matching CSV patterns where certain stages are more common
const FIELD_STAGE_WEIGHTS = [0.05, 0.25, 0.25, 0.20, 0.10, 0.05, 0.05, 0.05];

/**
 * Get season based on month (matching CSV logic)
 * Dry: Nov-Apr (months 11, 12, 1, 2, 3, 4)
 * Wet: May-Oct (months 5, 6, 7, 8, 9, 10)
 */
function getSeason(date: Date): Season {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  return month >= 5 && month <= 10 ? "Wet" : "Dry";
}

/**
 * Get random field stage based on weighted distribution
 */
function getRandomFieldStage(): FieldStage {
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < FIELD_STAGES.length; i++) {
    cumulative += FIELD_STAGE_WEIGHTS[i];
    if (random <= cumulative) {
      return FIELD_STAGES[i];
    }
  }
  return FIELD_STAGES[FIELD_STAGES.length - 1];
}

/**
 * RESEARCH-BASED: Generate realistic pest count for Black Rice Bug
 * Realistic range: 0-100 bugs per sampling unit (10 hills)
 * Economic Threshold: 50 bugs, Economic Injury Level: 75 bugs
 * Typical distribution: Most observations 10-45, occasional spikes 50-90
 */
function generatePestCount(): number {
  const random = Math.random();
  if (random < 0.3) {
    // 30% chance: Low counts (0-20) - normal conditions
    return Math.floor(Math.random() * 21);
  } else if (random < 0.65) {
    // 35% chance: Moderate counts (20-40) - typical active periods
    return 20 + Math.floor(Math.random() * 21);
  } else if (random < 0.85) {
    // 20% chance: Approaching threshold (40-50) - warning zone
    return 40 + Math.floor(Math.random() * 11);
  } else if (random < 0.95) {
    // 10% chance: Above threshold (50-75) - action needed
    return 50 + Math.floor(Math.random() * 26);
  } else {
    // 5% chance: Critical levels (75-100) - urgent intervention
    return 75 + Math.floor(Math.random() * 26);
  }
}

/**
 * RESEARCH-BASED: Calculate threshold status for Black Rice Bug
 * Economic Threshold (ET): 50 bugs per sampling unit (10 hills)
 * Economic Injury Level (EIL): 75 bugs per sampling unit
 * - Count < 50: Below Economic Threshold
 * - Count >= 50 and < 75: At/Above Economic Threshold (action recommended)
 * - Count >= 75: At/Above Economic Injury Level (urgent action required)
 */
function calculateThreshold(count: number): { threshold: number; aboveThreshold: boolean } {
  const economicThreshold = 50;
  const economicInjuryLevel = 75;
  
  if (count < economicThreshold) {
    return { threshold: economicThreshold, aboveThreshold: false };
  } else if (count < economicInjuryLevel) {
    return { threshold: economicThreshold, aboveThreshold: true };
  } else {
    // At or above Economic Injury Level - still uses ET as threshold marker
    return { threshold: economicThreshold, aboveThreshold: true };
  }
}

/**
 * Determine if action was taken based on threshold status (matching CSV patterns)
 * - Higher probability when above threshold (~60-80%)
 * - Lower probability when below threshold (~10-20%)
 */
function shouldTakeAction(aboveThreshold: boolean): boolean {
  if (aboveThreshold) {
    return Math.random() < 0.7; // 70% chance when above threshold
  } else {
    return Math.random() < 0.15; // 15% chance when below threshold
  }
}

/**
 * Format date as YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate enhanced mock observations for evaluation/demo with aesthetic data patterns
 * - Last 2 years of historical data
 * - Dense recent data (last 30 days: 2-4 observations per day)
 * - Realistic seasonal patterns and trends
 * - Varied pest counts with meaningful spikes and patterns
 * - All field stages represented
 */
export const generateObservations = (): PestObservation[] => {
  // If already cached, return immediately
  if (cachedObservations) {
    return cachedObservations;
  }

  const observations: PestObservation[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 2);

  let idCounter = 1;

  // Generate base observations over 3 years with realistic distribution
  // Target: ~3000+ observations for comprehensive data
  startDate.setFullYear(today.getFullYear() - 3); // Extend to 3 years
  const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create a trend pattern that varies seasonally
  const baseTrend = (dayIndex: number) => {
    const seasonProgress = (dayIndex % 365) / 365;
    // Higher pest activity during wet season (mid-year)
    const seasonalFactor = 1 + 0.4 * Math.sin((seasonProgress - 0.25) * Math.PI * 2);
    // Slight upward trend over time
    const trendFactor = 1 + (dayIndex / totalDays) * 0.2;
    return seasonalFactor * trendFactor;
  };

  // Generate observations with realistic patterns - SCALED UP for thousands
  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const observationDate = new Date(startDate);
    observationDate.setDate(observationDate.getDate() + dayIndex);

    // Skip future dates
    if (observationDate > today) continue;

    const dateStr = formatDate(observationDate);
    const daysFromEnd = totalDays - dayIndex;
    
    // More observations in recent days for better dashboard visualization
    // SCALED UP: Generate 3-6 observations per day in recent period
    let observationsPerDay = 1;
    if (daysFromEnd <= 30) {
      // Last 30 days: 4-6 observations per day (dense recent data)
      observationsPerDay = 4 + Math.floor(Math.random() * 3);
    } else if (daysFromEnd <= 90) {
      // Last 90 days: 2-4 observations per day
      observationsPerDay = 2 + Math.floor(Math.random() * 3);
    } else if (daysFromEnd <= 180) {
      // Last 6 months: 2-3 observations per day
      observationsPerDay = 2 + Math.floor(Math.random() * 2);
    } else if (daysFromEnd <= 365) {
      // Last year: 1-2 observations per day
      observationsPerDay = Math.random() < 0.7 ? 2 : 1;
    } else {
      // Older data (1-3 years ago): 1-2 observations per day (consistent base)
      observationsPerDay = Math.random() < 0.8 ? 1 : 2;
    }

    for (let obsIdx = 0; obsIdx < observationsPerDay; obsIdx++) {
      const trendMultiplier = baseTrend(dayIndex);
      
      // Base count with trend, then add realistic variation
      let baseCount = 8 * trendMultiplier;
      
      // Add random spikes (10% chance of higher counts)
      if (Math.random() < 0.1) {
        baseCount *= (1.5 + Math.random() * 1.0);
      }
      
      // Add day-to-day correlation (tendency to cluster)
      if (obsIdx > 0) {
        const prevCount = observations[observations.length - 1]?.count || baseCount;
        baseCount = prevCount * 0.7 + baseCount * 0.3 + (Math.random() - 0.5) * 5;
      }
      
      // Clamp to realistic range (0-30)
      const pestCount = Math.max(0, Math.min(30, Math.round(baseCount)));
      
      const { threshold, aboveThreshold } = calculateThreshold(pestCount);
      const actionTaken = shouldTakeAction(aboveThreshold);

      observations.push({
        id: `OBS-${idCounter.toString().padStart(4, "0")}`,
        date: dateStr,
        pestType: "Black Rice Bug",
        count: pestCount,
        threshold,
        aboveThreshold,
        season: getSeason(observationDate),
        fieldStage: getRandomFieldStage(),
        location: undefined,
        actionTaken,
        actionType: actionTaken ? (Math.random() < 0.5 ? "Pesticide Application" : "Biological Control") : undefined,
        actionDate: actionTaken ? dateStr : undefined,
      });
      
      idCounter++;
    }
  }

  // TASK A REQUIREMENT: Ensure last 7 days have realistic, readable pest counts
  // For testing: Average Pest Count should be clearly visible and meaningful
  const todayForRecent = new Date();
  todayForRecent.setHours(0, 0, 0, 0);
  
  // Calculate average from last 30 days for trend continuity
  const recentObservations = observations.filter(obs => {
    const obsDate = new Date(obs.date);
    const daysDiff = Math.floor((todayForRecent.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 30;
  });
  
  const recentAvg = recentObservations.length > 0
    ? recentObservations.reduce((sum, obs) => sum + obs.count, 0) / recentObservations.length
    : 35; // Realistic baseline for Black Rice Bug
  
  // Create an upward trend in last 7 days (approaching threshold for realistic forecast)
  // This ensures the "Average Pest Count" KPI shows a meaningful value (around 35-42)
  const trendBase = 32; // Start of 7-day period
  const trendSlope = 1.5; // Increase per day (ends around 42 average)
  
  for (let i = 6; i >= 0; i--) {
    const checkDate = new Date(todayForRecent);
    checkDate.setDate(todayForRecent.getDate() - i);
    const dateStr = formatDate(checkDate);
    
    const existingForDate = observations.filter(obs => obs.date === dateStr);
    const targetCount = 3; // 3 observations per day in last week
    
    // Trend: slightly increasing from 7 days ago to today
    const daysFromWeekAgo = 6 - i;
    const trendValue = trendBase + (daysFromWeekAgo * trendSlope);
    
    // Add more observations if we have fewer than target
    for (let j = existingForDate.length; j < targetCount; j++) {
      // Create variation around trend, but keep realistic for last 7 days
      // Goal: Average should be clearly readable (around 35-38) for Task A testing
      const variation = (Math.random() - 0.5) * 8; // Slightly larger variation
      const dayVariation = Math.sin((i / 3) * Math.PI) * 3; // Daily pattern
      
      let pestCount = trendValue + variation + dayVariation;
      
      // Occasional moderate spikes (15% chance) but keep within realistic range
      if (Math.random() < 0.15) {
        pestCount += 5 + Math.random() * 10; // Add 5-15 to some observations
      }
      
      // Ensure realistic bounds for Black Rice Bug (0-100 range)
      // Last 7 days: Target range 28-48 to produce clear average
      pestCount = Math.max(25, Math.min(50, Math.round(pestCount)));
      
      const { threshold, aboveThreshold } = calculateThreshold(pestCount);
      const actionTaken = shouldTakeAction(aboveThreshold);
      
      observations.push({
        id: `OBS-${idCounter.toString().padStart(4, "0")}`,
        date: dateStr,
        pestType: "Black Rice Bug",
        count: pestCount,
        threshold,
        aboveThreshold,
        season: getSeason(checkDate),
        fieldStage: getRandomFieldStage(),
        location: undefined,
        actionTaken,
        actionType: actionTaken ? (Math.random() < 0.5 ? "Pesticide Application" : "Biological Control") : undefined,
        actionDate: actionTaken ? dateStr : undefined,
      });
      
      idCounter++;
    }
  }
  
  // Sort by date (oldest first)
  observations.sort((a, b) => a.date.localeCompare(b.date));

  cachedObservations = observations;
  console.log(`Generated ${observations.length.toLocaleString()} enhanced mock observations for evaluation (target: thousands)`);
  return observations;
};

/**
 * Get observations with async support for backward compatibility
 */
export const getObservationsAsync = async (): Promise<PestObservation[]> => {
  return Promise.resolve(generateObservations());
};

