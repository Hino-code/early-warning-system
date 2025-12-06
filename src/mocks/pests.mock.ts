import type { PestObservation } from "@/shared/lib/data-service";

export const generateObservations = (): PestObservation[] => {
  const observations: PestObservation[] = [];
  const locations = ['Bual Norte', 'Poblacion', 'Bual Sur', 'Upper Glad', 'San Isidro', 'Lower Glad', 'Kiwanan'];
  const seasons: Array<'Dry' | 'Wet'> = ['Dry', 'Wet'];
  const stages: Array<'Seedling' | 'Vegetative' | 'Reproductive' | 'Ripening'> = ['Seedling', 'Vegetative', 'Reproductive', 'Ripening'];
  const pestTypes: Array<'Black Rice Bug' | 'White Stem Borer'> = ['Black Rice Bug', 'White Stem Borer'];

  let id = 1;

  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 28; day += 3) {
      for (const location of locations) {
        for (const pestType of pestTypes) {
          const date = new Date(2024, month, day);
          const season = month >= 11 || month <= 4 ? 'Dry' : 'Wet';

          let fieldStage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Ripening';
          const monthMod = month % 4;
          if (monthMod === 0) fieldStage = 'Seedling';
          else if (monthMod === 1) fieldStage = 'Vegetative';
          else if (monthMod === 2) fieldStage = 'Reproductive';
          else fieldStage = 'Ripening';

          let baseCount = Math.floor(Math.random() * 60) + 10;
          if (season === 'Wet') baseCount *= 1.5;
          if (fieldStage === 'Reproductive') baseCount *= 1.4;
          else if (fieldStage === 'Vegetative') baseCount *= 1.2;
          if (pestType === 'Black Rice Bug') baseCount *= 1.3;

          const count = Math.floor(baseCount);
          const threshold = pestType === 'Black Rice Bug' ? 50 : 40;
          const aboveThreshold = count > threshold;
          const actionTaken = aboveThreshold ? Math.random() > 0.3 : false;

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
  }

  for (let month = 0; month < 3; month++) {
    for (let day = 1; day <= 28; day += 3) {
      for (const location of locations) {
        for (const pestType of pestTypes) {
          const date = new Date(2025, month, day);
          const season = 'Dry';

          let fieldStage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Ripening';
          const monthMod = month % 4;
          if (monthMod === 0) fieldStage = 'Seedling';
          else if (monthMod === 1) fieldStage = 'Vegetative';
          else if (monthMod === 2) fieldStage = 'Reproductive';
          else fieldStage = 'Ripening';

          let baseCount = Math.floor(Math.random() * 50) + 10;
          if (fieldStage === 'Reproductive') baseCount *= 1.3;
          if (pestType === 'Black Rice Bug') baseCount *= 1.2;

          const count = Math.floor(baseCount);
          const threshold = pestType === 'Black Rice Bug' ? 50 : 40;
          const aboveThreshold = count > threshold;
          const actionTaken = aboveThreshold ? Math.random() > 0.3 : false;

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
  }

  return observations;
};
