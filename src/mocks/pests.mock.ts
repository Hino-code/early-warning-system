import type { PestObservation } from "@/shared/lib/data-service";

export const generateObservations = (): PestObservation[] => {
  const observations: PestObservation[] = [];
  const locations = ['Bual Norte', 'Poblacion', 'Bual Sur', 'Upper Glad', 'San Isidro', 'Lower Glad', 'Kiwanan'];
  const pestTypes: Array<'Black Rice Bug'> = ['Black Rice Bug'];

  let id = 1;
  const today = new Date();

  // Generate data for the last 12 months up to today + some future days for forecasts context if needed, 
  // but predominantly we need history for trends.
  // Let's go back 365 days.
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 365);

  const totalDays = 365 + 7; // Go a week into future just in case

  for (let i = 0; i < totalDays; i += 3) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Stop if we go too far into the future (keep it realistic to "now")
    if (date > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) break;

    const month = date.getMonth(); // 0-11

    // Season logic: Dry (Nov-Apr), Wet (May-Oct) roughly
    // month 0=Jan, 1=Feb, 2=Mar, 3=Apr (Dry)
    // 4=May... 9=Oct (Wet)
    // 10=Nov, 11=Dec (Dry)
    const season = (month >= 10 || month <= 3) ? 'Dry' : 'Wet';

    // Field Stage logic: simplified cycle based on month
    // Let's keep the modulo logic but based on the month of the generated date
    let fieldStage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Ripening';
    const monthMod = month % 4;
    if (monthMod === 0) fieldStage = 'Seedling';
    else if (monthMod === 1) fieldStage = 'Vegetative';
    else if (monthMod === 2) fieldStage = 'Reproductive';
    else fieldStage = 'Ripening';

    for (const location of locations) {
      for (const pestType of pestTypes) {
        // Randomly skip some observations to vary the "Total Observations" count week-over-week
        // This ensures the trend isn't always 0%
        if (Math.random() > 0.9) continue;

        let baseCount = Math.floor(Math.random() * 60) + 10;
        if (season === 'Wet') baseCount *= 1.5;
        if (fieldStage === 'Reproductive') baseCount *= 1.4;
        else if (fieldStage === 'Vegetative') baseCount *= 1.2;
        baseCount *= 1.3;

        // Add some "trend" randomness
        // e.g. if it's recent (last 30 days), maybe spike it up or down to show interesting KPIs
        const daysFromToday = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (daysFromToday < 14 && daysFromToday > 0) {
          // Create a "Good Trend" scenario for demo purposes
          // "This week" (0-7 days) should be LOWER than "Last week" (7-14 days) to show improvement
          if (daysFromToday < 7) {
            baseCount *= 0.7; // 30% reduction in pests vs last week
          } else {
            baseCount *= 1.1; // Last week was higher
          }
        }

        const count = Math.floor(baseCount);
        const threshold = 50;
        const aboveThreshold = count > threshold;

        // Increase action rate for this week to show "Positive Action Trend"
        const isThisWeek = daysFromToday < 7 && daysFromToday > 0;
        const actionChance = aboveThreshold ? (isThisWeek ? 0.8 : 0.4) : 0.1;
        const actionTaken = Math.random() < actionChance;

        observations.push({
          id: `OBS-${id.toString().padStart(4, '0')}`,
          date: date.toISOString().split('T')[0],
          pestType,
          count,
          threshold,
          aboveThreshold,
          season,
          fieldStage,
          location,
          actionTaken,
          actionType: actionTaken ? ['Chemical Spray', 'Biological Control', 'Manual Removal'][Math.floor(Math.random() * 3)] : undefined,
          actionDate: actionTaken ? new Date(date.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
        });

        id++;
      }
    }
  }

  return observations;
};

