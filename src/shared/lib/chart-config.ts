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
  // Grid styling - Minimalist
  grid: {
    strokeDasharray: '4 4', // Broader dash for cleaner look
    stroke: 'hsl(var(--border))',
    opacity: 0.15, // Much subtler grid
  },

  // Axis styling
  axis: {
    tick: {
      fill: 'hsl(var(--muted-foreground))',
      fontSize: 11,
      fontWeight: 500,
    },
    line: {
      stroke: 'transparent', // Hide axis lines by default for cleaner look
    },
  },

  // Tooltip styling - Glassmorphism Standard
  tooltip: {
    contentStyle: {
      backgroundColor: 'hsl(var(--background) / 0.8)', // Glass effect
      backdropFilter: 'blur(12px)',
      border: '1px solid hsl(var(--border) / 0.5)',
      borderRadius: '12px',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
      color: 'hsl(var(--popover-foreground))',
      padding: '12px',
    },
    itemStyle: {
      color: 'hsl(var(--foreground))',
      fontSize: '13px',
      fontWeight: 500,
      padding: '2px 0',
    },
    labelStyle: {
      color: 'hsl(var(--muted-foreground))',
      marginBottom: '4px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    } as React.CSSProperties, // Cast to any to satisfy ts if needed, but standard CSS props work
  },

  // Legend styling
  legend: {
    wrapperStyle: {
      color: 'hsl(var(--muted-foreground))',
      fontSize: '12px',
      fontWeight: 500,
      paddingTop: '16px',
    },
  },
};
