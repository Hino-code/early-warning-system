// Chart configuration helper for consistent theming

export const getChartColors = () => {
  return {
    chart1: 'hsl(var(--chart-1))',
    chart2: 'hsl(var(--chart-2))',
    chart3: 'hsl(var(--chart-3))',
    chart4: 'hsl(var(--chart-4))',
    chart5: 'hsl(var(--chart-5))',
    chart6: 'hsl(var(--chart-6))',
    primary: 'hsl(var(--primary))',
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    muted: 'hsl(var(--muted-foreground))',
    foreground: 'hsl(var(--foreground))',
  };
};

export const chartConfig = {
  // Grid styling
  grid: {
    strokeDasharray: '3 3',
    stroke: 'hsl(var(--border))',
    opacity: 0.3,
  },
  
  // Axis styling
  axis: {
    tick: {
      fill: 'hsl(var(--muted-foreground))',
      fontSize: 12,
    },
    line: {
      stroke: 'hsl(var(--border))',
    },
  },
  
  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      color: 'hsl(var(--popover-foreground))',
    },
    itemStyle: {
      color: 'hsl(var(--popover-foreground))',
    },
    labelStyle: {
      color: 'hsl(var(--muted-foreground))',
    },
  },
  
  // Legend styling
  legend: {
    wrapperStyle: {
      color: 'hsl(var(--foreground))',
      fontSize: '12px',
    },
  },
};
