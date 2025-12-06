// Chart colors for light and dark modes
// These are used directly in chart stroke/fill props

export const chartColors = {
  // Primary colors
  primary: "#3b82f6",
  foreground: "#0f172a",
  muted: "#94a3b8",
  
  // Chart palette
  chart1: "#3b82f6",
  chart2: "#8b5cf6",
  chart3: "#ef4444",
  chart4: "#f59e0b",
  chart5: "#10b981",
  chart6: "#06b6d4",
  
  // Semantic colors
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#ef4444",
  info: "#3b82f6",
  
  // UI elements
  border: "#e2e8f0",
  background: "#f8fafc",
  card: "#ffffff",
};

export const darkChartColors = {
  primary: "#60a5fa",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  
  chart1: "#60a5fa",
  chart2: "#a78bfa",
  chart3: "#f87171",
  chart4: "#fbbf24",
  chart5: "#34d399",
  chart6: "#22d3ee",
  
  success: "#34d399",
  warning: "#fbbf24",
  destructive: "#f87171",
  info: "#60a5fa",
  
  border: "#334155",
  background: "#0f172a",
  card: "#1e293b",
};

// Get current theme colors
export const getCurrentChartColors = () => {
  if (typeof window === "undefined") return chartColors;
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? darkChartColors : chartColors;
};

