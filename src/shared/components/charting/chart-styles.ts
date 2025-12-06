import { ReactNode } from 'react';

// Common chart styling configuration
export const chartAxisStyle = {
  tick: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
  stroke: 'hsl(var(--border))',
};

export const chartGridStyle = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
  opacity: 0.3,
};

export const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--popover-foreground))',
};

export const chartColors = {
  primary: 'hsl(var(--primary))',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
  chart6: 'hsl(var(--chart-6))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
};
