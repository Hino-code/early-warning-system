# Test Data Requirements - Implementation Summary

## Overview
This document outlines the realistic dummy data implementation for the evaluation/testing phase, aligned with the three testing tasks.

## Testing Tasks & Data Alignment

### Task A: Monitoring - Average Pest Count (Last 7 Days)
**User Task:** "Find the Average Pest Count for the last 7 days"
**Testing:** Can users find the Overview page and read the KPI card?

**Implementation:**
- ✅ Last 7 days populated with **3 observations per day** (21 total observations)
- ✅ Pest counts range: **28-50 bugs** (realistic for Black Rice Bug)
- ✅ Average Pest Count: **~35-38 bugs** (clearly visible in "Avg Pest Count" KPI card)
- ✅ Values are distributed across all 7 days with slight upward trend
- ✅ Located in: **Overview Page → "Avg Pest Count" KPI Card** (top row, 2nd card)

**Data Source:**
- `src/mocks/pests.mock.ts` - Lines 232-280
- Last 7 days generation with trend: base 32, slope 1.5 → ending ~42 average

---

### Task B: Forecasting - Critical Alert for Next Week
**User Task:** "Check the Forecast page. Is there a Critical Alert predicted for next week?"
**Testing:** Can users read the chart and understand the "High Risk" warning?

**Implementation:**
- ✅ Forecast generates **30 days** of predictions starting from tomorrow
- ✅ **Days 3-5 (next week)** are guaranteed to exceed Economic Threshold (50)
  - Day 3: 60 bugs
  - Day 4: 62 bugs  
  - Day 5: 64 bugs
- ✅ **Day 6** exceeds Economic Injury Level (75) → **83 bugs** → **CRITICAL ALERT**
- ✅ Critical alerts displayed in red banner at top of Forecast page
- ✅ Chart shows predicted values with confidence intervals
- ✅ Reference lines show Economic Threshold (50) and EIL (75)

**Data Source:**
- `src/mocks/forecasting.mock.ts` - Lines 33-80
- `src/features/forecasting/pages/forecast-page.tsx` - Lines 441-495 (critical alerts logic)

**Location:**
- **Forecast Page → Critical Forecast Alerts** section (red banner at top)
- Shows dates and predicted counts that exceed thresholds

---

### Task C: Action - Suggested Control Measures
**User Task:** "If you see a Critical Alert, find the suggested Control Measure (e.g., Chemical Spray)"
**Testing:** Can users find the "Suggestion" banner or control measures section?

**Implementation:**
- ✅ Each Critical Alert includes **detailed control measures**
- ✅ Control measures are research-based and pest-specific
- ✅ Format: Clear list with emoji indicators (🔴 Critical, 🟡 Moderate, ✅ Low)
- ✅ Examples shown:
  - **Chemical Control:** Fipronil 5% SC at 50-100 ml/ha
  - **Biological Control:** Parasitoids release, Beauveria bassiana
  - **Cultural Control:** Synchronized planting, water management
  - **Mechanical Control:** Light traps installation

**Data Source:**
- `src/features/forecasting/pages/forecast-page.tsx` - Lines 413-439 (getControlMeasures function)
- Lines 1145-1180 (UI display with control measures)

**Location:**
- **Forecast Page → Critical Forecast Alerts** → Expand each alert to see "Suggested Control Measures"
- Also shown in **Recommended Actions** section (bottom card) with abbreviated measures

---

## Research-Based Data Parameters

### Black Rice Bug (Scotinophara coarctata)

**Economic Thresholds:**
- Economic Threshold (ET): **50 bugs per sampling unit** (10 hills)
- Economic Injury Level (EIL): **75 bugs per sampling unit**

**Realistic Pest Count Range:**
- Normal: 0-45 bugs
- Warning Zone: 40-50 bugs
- Action Required: 50-75 bugs
- Critical/Urgent: 75-100 bugs

**Control Measures (Research-Based):**

1. **Chemical Control (High Risk):**
   - Fipronil 5% SC: 50-100 ml/ha
   - Chlorpyrifos 50% EC: 1.0-1.5 L/ha
   - Apply during early morning (6-8 AM)

2. **Biological Control:**
   - Parasitoids: Anastatus japonicus at 10,000-20,000/ha
   - Fungal pathogens: Beauveria bassiana or Metarhizium anisopliae at 2-3 kg/ha

3. **Cultural Control:**
   - Synchronized planting across farms
   - Water management: Maintain 5-10 cm depth
   - Field sanitation: Remove alternative hosts

4. **Mechanical Control:**
   - Light traps: 1 per 0.5 ha during early evening (6-8 PM)
   - Manual collection during peak activity

---

## Data Generation Summary

### Observations Data
- **Total Observations:** ~3,000-3,500 entries
- **Time Range:** 3 years of historical data
- **Recent Data Density:**
  - Last 7 days: 3 observations/day (21 total)
  - Last 30 days: 4-6 observations/day
  - Last 90 days: 2-4 observations/day

### Forecast Data
- **Forecast Period:** 30 days starting tomorrow
- **Critical Alerts:** Guaranteed for days 3-6 (next week)
- **Values:** Realistic range 15-85 bugs
- **Confidence Intervals:** 96% (day 1) → 82% (day 30)

### Alerts Data
- **Total Alerts:** 44 alerts
- **Categories:** Threshold, Forecast, System, Action-Required
- **Read/Unread:** Mixed distribution
- **Timestamps:** 30 minutes to 5 days ago

### Pending Users
- **Total:** 20 pending user registrations
- **Roles:** Researchers and Field Managers
- **Agencies:** 15 different agricultural agencies

---

## Testing Checklist

### ✅ Task A Verification
- [ ] Overview page loads successfully
- [ ] "Avg Pest Count" KPI card is visible (2nd card, top row)
- [ ] Value shows numeric average (e.g., "35", "38", "42")
- [ ] Value is between 28-50 range (realistic)

### ✅ Task B Verification
- [ ] Forecast page loads successfully
- [ ] Critical Forecast Alerts section is visible (red banner at top)
- [ ] At least one alert shows "CRITICAL ALERT" for next week (days 3-7)
- [ ] Alert shows predicted count > 50 (Economic Threshold)
- [ ] Chart displays forecast data with threshold reference lines

### ✅ Task C Verification
- [ ] Critical alerts can be expanded/read
- [ ] Each alert shows "Suggested Control Measures" section
- [ ] Control measures include chemical options (e.g., "Fipronil", "Chlorpyrifos")
- [ ] Measures are clearly formatted and readable
- [ ] At least one measure mentions "Chemical" or "Spray"

---

## Files Modified

1. **`src/mocks/pests.mock.ts`**
   - Updated pest count generation (realistic 0-100 range)
   - Fixed threshold calculation (ET: 50, EIL: 75)
   - Enhanced last 7 days generation for Task A

2. **`src/mocks/forecasting.mock.ts`**
   - Guaranteed critical alerts for next week (days 3-6)
   - Realistic forecast values (15-85 range)
   - Proper threshold alignment

3. **`src/features/forecasting/pages/forecast-page.tsx`**
   - Added research-based control measures
   - Enhanced critical alerts display
   - Improved control measures visibility

4. **`src/shared/lib/data-service.ts`**
   - Expanded alerts to 44 entries
   - Enhanced alert diversity and realism

5. **`src/shared/lib/auth-service.ts`**
   - Increased pending users to 20
   - Added realistic agency and name diversity

---

## Notes for Testers

1. **Data is cached:** First load generates data, subsequent loads use cached data
2. **All data is mock:** No backend connection required in evaluation mode
3. **Values are deterministic for testing:** Critical alerts always appear for days 3-6
4. **Average calculations:** Overview page calculates 7-day average from filtered observations
5. **Forecast dates:** Next week = days 3-7 from today (starting tomorrow)

---

## Support

If testers encounter issues:
1. Clear browser cache and reload
2. Check console for any errors
3. Verify they're on the correct branch (`evaluation`)
4. Ensure evaluation mode is enabled (bypasses login)

