# Early Warning System for Pest Monitoring and Forecasting

This is a full-stack capstone project designed to help monitor pest activity in rice fields and forecast future outbreaks using data-driven models. Developed in partnership with PhilRice-MES, the system provides real-time visualization, pest monitoring, forecasting, and alert generation to support agricultural decision-making.

---

## System Overview

### Frontend
- Built with: **React / HTML / CSS**
- Provides: User interface for visualizing pest data, forecast charts, and system alerts

### Backend
- Built with: FASTAPI
- Role: API for data access, database integration, user authentication, and alert logic

### Forecasting & Analytics
- Tools: **Python**, **pandas**, **statsmodels**, **scikit-learn**
- Models: **SARIMA**, **K-Nearest Neighbors (KNN)**, and other time series/predictive models
- Data: Focused on **Rice Black Bug** and **White Stem Borer**

---

## Folder Structure

```bash
/
├── frontend/              # React frontend (UI)
├── backend/               # API and server logic (Flask/Node)
├── models/                # Python scripts for SARIMA, KNN, etc.
├── data/                  # CSVs, cleaned datasets, and raw input
├── docs/                  # Research papers, flowcharts, presentations
└── README.md
