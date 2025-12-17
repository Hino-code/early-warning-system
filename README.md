# Early Warning System for Pest Monitoring and Forecasting

This is a full-stack capstone project designed to help monitor pest activity in rice fields and forecast future outbreaks using data-driven models. Developed in partnership with PhilRice-MES, the system provides real-time visualization, pest monitoring, forecasting, and alert generation to support agricultural decision-making.

---

## Running the Code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

---

## System Overview

### Frontend

- Built with: **React / TypeScript / Vite / Tailwind CSS**
- Provides: User interface for visualizing pest data, forecast charts, and system alerts
- Features: Real-time dashboards, interactive charts, responsive design, accessibility support

### Backend

- Built with: **Express.js / Node.js / MongoDB**
- Role: API for data access, database integration, user authentication, and alert logic
- Features: JWT authentication, rate limiting, secure admin endpoints

### Forecasting & Analytics

- Tools: **Python**, **pandas**, **statsmodels**, **scikit-learn**
- Models: **SARIMA**, **K-Nearest Neighbors (KNN)**, and other time series/predictive models
- Data: Focused on **Rice Black Bug** and **White Stem Borer**

---

## Folder Structure

```bash
/
├── src/                    # React frontend source code
│   ├── app/               # App layout and routing
│   ├── features/          # Feature modules (auth, dashboard, etc.)
│   ├── shared/            # Shared components and utilities
│   └── state/             # State management (Zustand)
├── server/                # Express.js backend
│   └── src/               # Server source code
├── dist/                  # Production build output (Vercel)
├── build/                 # Legacy build output
├── vercel.json            # Vercel deployment configuration
└── README.md
```

---

## Key Features

- **Real-time Pest Monitoring**: Track pest activity with interactive dashboards
- **Forecasting**: SARIMA-based predictive models for pest outbreaks
- **Alert System**: Automated notifications for threshold breaches
- **User Management**: Role-based access control (Admin, Researcher, Field Manager)
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels and keyboard navigation support

---

## Development

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Installation

```bash
npm install
cd server && npm install
```

### Running

```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server

# Both (recommended)
npm run dev:all
```

---

## Deployment (Vercel)

This project is configured for deployment on Vercel.

### Quick Deploy

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will auto-detect the Vite configuration
4. Add environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL` - Your backend API URL (e.g., `https://api.example.com`)
   - `VITE_USE_MOCKS` - Set to `false` for production

### Environment Variables

Create a `.env` file (or set in Vercel dashboard) with:

```bash
VITE_API_BASE_URL=https://your-api-url.com
VITE_USE_MOCKS=false
```

### Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

The `vercel.json` file is already configured for SPA routing, so all routes will correctly serve the React app.

---

## Documentation

- `FINAL_STATUS.md` - Implementation status and progress
- `CODE_REVIEW.md` - Backend and security review
- `FRONTEND_REVIEW.md` - Frontend UI/UX review
- `PANEL_ISSUES.md` - Panel components analysis
- `INSTALLATION_NOTES.md` - Installation instructions

---

## Version

**EWS v3** - Complete codebase improvements with enhanced security, accessibility, and performance.
