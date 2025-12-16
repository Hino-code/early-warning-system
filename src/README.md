# Pest.i - Early Warning System & Pest Monitoring Dashboard

A comprehensive analytical pest monitoring and forecasting dashboard built for rice cultivation pest management. This capstone project focuses on monitoring two key rice pests: **Black Rice Bug** and **White Stem Borer**, using advanced SARIMA (Seasonal Autoregressive Integrated Moving Average) forecasting models.

![Pest.i Dashboard](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## 🎯 Project Overview

Pest.i provides agricultural professionals with a **comprehensive analytical dashboard** featuring:

### 🔍 **4 Core Analytical Modules:**

1. **Overview** - High-level snapshot with 6 KPIs and mini visualizations
2. **Pest Analysis** - Deep behavioral & pattern analysis with time-series, seasonal, and heatmap visualizations
3. **Threshold & Actions** - Operational efficiency tracking with intervention analysis
4. **Forecast & Early Warning** - SARIMA-based predictive intelligence with confidence intervals

### ✨ **Key Capabilities:**
- **Real-time pest monitoring** with comprehensive filtering
- **SARIMA-based forecasting** with 7/14-day predictions and confidence bands
- **Advanced pattern detection** across time, season, and field stages
- **Action efficiency analysis** with critical gap identification
- **Interactive visualizations** using Recharts (line, bar, area, pie, heatmap)
- **Risk assessment** with automated alerts and recommendations
- **Role-based access control** for multiple user types

## 🆕 Latest Updates (December 2024)

The dashboard has been **completely revamped** to align with modern analytical dashboard best practices:

### ✅ **What's New:**
- 🎯 New unified filter system (primary + advanced filters)
- 📊 Season × Field Stage heatmap visualization
- 🎨 Enhanced Material 3 design with proper KPI cards
- 📈 7-day moving average trend analysis
- ⚡ SARIMA forecast with confidence intervals
- 🚨 Automated risk assessment and recommendations
- 📋 High-risk events tracking table
- 🔄 Action efficiency metrics and operational gaps

### 🗑️ **Removed Components:**
- Old dashboard-overview.tsx (replaced by overview.tsx)
- Old pest-monitoring.tsx (replaced by pest-analysis.tsx)
- Old forecasting.tsx (replaced by forecast-early-warning.tsx)
- alerts-warnings.tsx (integrated into forecast & actions)

See **[REVAMP_SUMMARY.md](./REVAMP_SUMMARY.md)** for complete details.

## 🏗️ Tech Stack

### Core Framework
- **[React 18+](https://react.dev/)** - Modern React with Hooks and functional components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development with full IDE support
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server

### Styling & Design
- **[Tailwind CSS v4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **Material 3 Design Principles** - Modern, accessible design language
- **CSS Variables** - Dynamic theming system (light/dark mode)
- **Custom Design Tokens** - Consistent spacing, colors, and typography

### UI Component Library
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible component collection
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives

### Icons & Graphics
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon set (1000+ icons)

### Data Visualization
- **[Recharts](https://recharts.org/)** - Composable charting library built on React
  - Line charts for trend analysis
  - Area charts for forecasting with confidence intervals
  - Bar charts for comparative analysis
  - Composed charts for multi-metric visualization
  - Pie charts for proportional data
  - Custom heatmaps for pattern detection

### Form Management
- **[React Hook Form v7.55.0](https://react-hook-form.com/)** - Performant form validation

### Utilities & Helpers
- **[date-fns](https://date-fns.org/)** - Modern JavaScript date utility library
- **[clsx](https://github.com/lukeed/clsx)** - Utility for className strings
- **[class-variance-authority](https://cva.style/)** - Type-safe component variants

### Notifications
- **[Sonner v2.0.3](https://sonner.emilkowal.ski/)** - Toast notification system

## 🎨 Design System

### Color Palette (Material 3)
- **Primary**: Green (#006e26 light, #4cda81 dark) - Success and primary actions
- **Destructive**: Red (#ba1a1a light, #ffb4ab dark) - Critical alerts and high risk
- **Warning**: Amber (#f9ab00 light, #fdd663 dark) - Moderate risk and warnings
- **Chart Colors**: 5-color palette for data visualization

### Theme System
- Light/Dark mode toggle (fully supported)
- Persistent theme preference
- CSS variable-based theming
- Automatic chart color adaptation
- Proper contrast ratios

## 🧩 Component Architecture

### Main Dashboard Components

1. **Overview** (`/components/overview.tsx`)
   - 6 KPI Cards (observations, avg count, threshold %, actions, rate, most affected stage)
   - 3 Mini Charts (trend line, threshold donut, action bar)
   - Summary statistics with risk assessment

2. **Pest Analysis** (`/components/pest-analysis.tsx`)
   - Time-series with threshold markers and moving averages
   - Seasonal comparison (Dry vs Wet)
   - Field stage analysis
   - Season × Stage heatmap
   - Distribution histograms
   - Threshold crossing trends

3. **Threshold & Actions** (`/components/threshold-actions.tsx`)
   - 5 Action efficiency KPIs
   - Actions by season and stage
   - Action type distribution
   - Threshold vs action correlation
   - High-risk events without action (table)
   - Monthly action trends

4. **Forecast & Early Warning** (`/components/forecast-early-warning.tsx`)
   - SARIMA forecast with confidence bands
   - 6 Risk metric KPIs
   - Historical + forecast overlay
   - Forecast confidence by day
   - Seasonal pattern insights
   - Automated recommendations with priority

### Supporting Components

- **SharedFilters** (`/components/shared-filters.tsx`) - Unified filter system
- **DataService** (`/lib/data-service.ts`) - Centralized data management
- **ThemeToggle** - Dark/light mode switcher
- **Login** - Authentication system
- **ProfileSettings** - User profile management
- **Reports** - Historical data and analytics
- **SystemStatus** - System health monitoring
- **Settings** - User preferences

### UI Components (shadcn/ui)
50+ reusable components including forms, layouts, overlays, navigation, feedback, and data display elements.

## 🔐 Authentication & Authorization

### User Roles
1. **Administrator** - Full system access
2. **Researcher** - Analysis and forecast access
3. **Field Manager** - Monitoring and basic analysis
4. **Demo User** - Read-only access

### Features
- Role-based component rendering
- Protected routes
- Persistent login state (8-hour session)
- Activity tracking
- User profile management

## 📊 Data Features

### Mock Data Service (`/lib/data-service.ts`)

**Data Coverage:**
- **Time Range:** Full 2024 + Q1 2025
- **Frequency:** Every 3 days
- **Locations:** 7 barangays in Davao del Sur
- **Pests:** Black Rice Bug, White Stem Borer
- **Total Observations:** ~16,000+ data points

**Realistic Patterns:**
- Seasonal variation (Wet season 1.5x higher activity)
- Growth stage impact (Reproductive stage 1.4x)
- Pest-specific thresholds (RBB: 50, WSB: 40)
- Action response rate (70% for above-threshold)

### SARIMA Forecasting
- 7 or 14-day predictions
- Confidence intervals (upper/lower bounds)
- Confidence decay (95% → decreases 0.5%/day)
- Realistic trend patterns
- Risk level assessment
- Automated recommendations

### Advanced Filtering
**Primary Filters (Always Visible):**
- Year (2024, 2025)
- Season (Dry, Wet, All)
- Field Stage (Seedling, Vegetative, Reproductive, Ripening, All)
- Pest Type (Black Rice Bug, White Stem Borer, All)
- Date Range (Calendar picker)

**Advanced Filters (Collapsible):**
- Threshold Status (Below, Above, All)
- Action Status (Taken, Not Taken, All)

All filters are synchronized across all dashboard views.

## 🎯 Analytical Capabilities

### What You Can Analyze:

1. **Temporal Patterns:**
   - Daily trends with moving averages
   - Monthly aggregations
   - Seasonal comparisons (Dry vs Wet)
   - Year-over-year changes

2. **Spatial & Stage Patterns:**
   - Field stage vulnerability
   - Season × Stage interaction (heatmap)
   - Location-based hotspots

3. **Operational Efficiency:**
   - Action response rates
   - Intervention coverage
   - Critical gap identification
   - Resource allocation analysis

4. **Predictive Intelligence:**
   - 7/14-day SARIMA forecasts
   - Risk probability assessment
   - Optimal intervention timing
   - Seasonal outbreak predictions
   - Automated recommendations

## 🚀 Performance Optimizations

- **Memoization** - useMemo for expensive calculations
- **Component Optimization** - Proper React.memo usage
- **Data Caching** - Cached observations and forecasts
- **Lazy Loading** - Dynamic imports for components
- **Responsive Charts** - Efficient rendering with Recharts

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized interactions
- Adaptive layouts (1-6 column grids)
- Collapsible filters on mobile

## 📄 Project Structure

```
pest-i/
├── App.tsx                              # Main app with routing
├── lib/
│   └── data-service.ts                  # Centralized data service
├── components/
│   ├── overview.tsx                     # Dashboard Overview
│   ├── pest-analysis.tsx                # Pest Analysis
│   ├── threshold-actions.tsx            # Threshold & Actions
│   ├── forecast-early-warning.tsx       # Forecast & Early Warning
│   ├── shared-filters.tsx               # Unified filter component
│   ├── theme-toggle.tsx                 # Theme switcher
│   ├── login.tsx                        # Authentication
│   ├── profile-settings.tsx             # User profile
│   ├── reports.tsx                      # Reports module
│   ├── system-status.tsx                # System monitoring
│   ├── settings.tsx                     # User settings
│   ├── settings-context.tsx             # Global settings
│   └── ui/                              # shadcn/ui components (50+)
├── styles/
│   └── globals.css                      # Material 3 design system
├── REVAMP_SUMMARY.md                    # Detailed revamp documentation
├── REBUILD_GUIDE.md                     # Rebuild instructions
└── README.md                            # This file
```

## 🎓 Documentation

- **[REVAMP_SUMMARY.md](./REVAMP_SUMMARY.md)** - Complete revamp details, features, and architecture
- **[REBUILD_GUIDE.md](./REBUILD_GUIDE.md)** - Step-by-step rebuild instructions
- **[README.md](./README.md)** - This overview document

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Material 3 Design](https://m3.material.io/)

## 💡 Usage Guide

### Quick Start:
1. Login with any demo credentials (see login screen)
2. **Overview** - Get immediate snapshot of pest situation
3. Use filters to narrow down analysis
4. Navigate to specific modules for detailed insights

### Analyzing Pest Trends:
1. Go to **Pest Analysis**
2. Apply filters (Year, Season, Field Stage, Pest Type)
3. Review time-series, seasonal patterns, and heatmap
4. Check distribution and threshold crossings

### Evaluating Actions:
1. Go to **Threshold & Actions**
2. Review Action Rate and Critical Gap KPIs
3. Check High-Risk Events table
4. Analyze action distribution by season/stage

### Planning Interventions:
1. Go to **Forecast**
2. Select pest type and forecast period
3. Review risk metrics and predictions
4. Check recommended actions
5. Plan based on peak days and risk level

## 🔮 Future Enhancements

### Backend Integration:
- Replace mock data with real API
- Integrate actual SARIMA model
- Database persistence (Supabase/PostgreSQL)
- Real-time data sync

### Advanced Features:
- Export to PDF/Excel
- Email alerts for threshold violations
- Mobile app companion
- Weather API integration
- Automated action logging

### Machine Learning:
- Train SARIMA on actual field data
- Add LSTM/Prophet models
- Anomaly detection
- Pest image recognition

## 🤝 Contributing

This is a capstone project for rice pest management research. For inquiries or contributions, please contact the development team.

## 📝 License

This project is developed for academic and research purposes focused on sustainable agriculture and rice pest management.

---

**Built with ❤️ for sustainable agriculture and rice pest management**

*Capstone Project 2025 - Early Warning System for Pest Monitoring and Forecasting*

**Built with:** React 18, TypeScript 5, Tailwind CSS 4.0, Recharts, shadcn/ui, Material 3 Design
