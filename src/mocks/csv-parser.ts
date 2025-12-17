import type { PestObservation } from "@/shared/types/data";

interface CSVRow {
  Date: string;
  Year: string;
  Season: "Dry" | "Wet";
  "Field Stage": string;
  Pest: string;
  "Pest Count/Damage": string;
  "Threshold Status": string;
  Action: string;
  Threshold: string;
  "Stage Type": string;
}

/**
 * Parse CSV content and convert to PestObservation array
 * Maps backend CSV data structure to frontend data format
 */
export function parseCSVToObservations(csvContent: string): PestObservation[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    console.warn("CSV file is empty or has no data rows");
    return [];
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim());
  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });

  // Parse data rows
  const observations: PestObservation[] = [];
  let idCounter = 1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV row (handling quoted fields)
    const row = parseCSVLine(line);
    if (row.length < headers.length) {
      console.warn(`Row ${i + 1} has insufficient columns, skipping`);
      continue;
    }

    try {
      const date = row[headerMap["Date"]]?.trim();
      const season = row[headerMap["Season"]]?.trim() as "Dry" | "Wet";
      const fieldStage = row[headerMap["Field Stage"]]?.trim();
      const pest = row[headerMap["Pest"]]?.trim();
      const pestCount = parseFloat(row[headerMap["Pest Count/Damage"]]?.trim() || "0");
      const thresholdStatus = row[headerMap["Threshold Status"]]?.trim();
      const action = row[headerMap["Action"]]?.trim();
      const threshold = row[headerMap["Threshold"]]?.trim();

      // Validate required fields
      if (!date || !season || !fieldStage || !pest || isNaN(pestCount)) {
        console.warn(`Row ${i + 1} has invalid data, skipping`);
        continue;
      }

      // Map pest type: RBB -> Black Rice Bug
      if (pest !== "RBB") {
        console.warn(`Row ${i + 1}: Unknown pest type "${pest}", skipping`);
        continue;
      }

      // Map threshold status to aboveThreshold and threshold value
      let aboveThreshold = false;
      let thresholdValue = 5; // Default Economic Threshold

      if (thresholdStatus === "Economic Threshold") {
        aboveThreshold = true;
        thresholdValue = 5;
      } else if (thresholdStatus === "Economic Damage") {
        aboveThreshold = true;
        thresholdValue = 10;
      } else if (thresholdStatus === "Below Threshold") {
        aboveThreshold = false;
        thresholdValue = 5; // Still use 5 as reference threshold
      }

      // Map action: 0 -> false, 1 -> true
      const actionTaken = action === "1";
      const actionDate = actionTaken ? date : undefined;

      // Validate field stage is one of the supported types
      const validFieldStages: string[] = [
        "Seedling",
        "Vegetative",
        "Reproductive",
        "Ripening",
        "Harvest",
        "Fallow",
        "Land Prep",
        "Nursery",
      ];

      if (!validFieldStages.includes(fieldStage)) {
        console.warn(`Row ${i + 1}: Unknown field stage "${fieldStage}", skipping`);
        continue;
      }

      // Create observation object
      const observation: PestObservation = {
        id: `OBS-${idCounter.toString().padStart(4, "0")}`,
        date: date, // Already in YYYY-MM-DD format
        pestType: "Black Rice Bug",
        count: Math.round(pestCount), // Round to integer
        threshold: thresholdValue,
        aboveThreshold,
        season,
        fieldStage: fieldStage as PestObservation["fieldStage"],
        location: undefined, // CSV has no location data
        actionTaken,
        actionType: undefined, // CSV only has 0/1, no specific action type
        actionDate,
      };

      observations.push(observation);
      idCounter++;
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      continue;
    }
  }

  return observations;
}

/**
 * Parse a CSV line, handling quoted fields that may contain commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}
