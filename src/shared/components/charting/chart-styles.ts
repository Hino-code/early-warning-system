import { ReactNode } from 'react';
import { chartColors } from '@/shared/lib/chart-colors';

// Common chart styling configuration using direct color values
export const chartAxisStyle = {
  tick: { fontSize: 11, fill: chartColors.foreground },
  stroke: chartColors.border,
  strokeWidth: 1.5,
};

export const chartGridStyle = {
  strokeDasharray: '3 3',
  stroke: chartColors.border,
  opacity: 0.5,
  vertical: false,
};

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: chartColors.card,
    border: `1px solid ${chartColors.border}`,
    borderRadius: '8px',
    color: chartColors.foreground,
    padding: '8px 12px',
  },
};

// Export chart colors for direct use
export { chartColors };
