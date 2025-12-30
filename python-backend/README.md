# Pest-i Recommendation API (FastAPI + Gemini)

AI-powered pest management recommendation service using Google's Gemini API.

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in this directory:

```env
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
PORT=8001
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### 3. Run the Server

**Option 1: Using the start script (Recommended)**
```bash
./start.sh
```

**Option 2: Manual start**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows

# Run the server
python main.py

# Or using uvicorn directly:
uvicorn main:app --reload --port 8001
```

The API will be available at `http://localhost:8001`

**Verify the server is running:**
```bash
curl http://localhost:8001/health
# Should return: {"status":"ok"}
```

## Troubleshooting

### "Route not found" Error

If you see "Route not found" in the frontend, it means the FastAPI server is not running:

1. **Check if server is running:**
   ```bash
   curl http://localhost:8001/health
   ```

2. **Start the server:**
   ```bash
   cd python-backend
   ./start.sh
   # OR
   source venv/bin/activate
   python main.py
   ```

3. **Check the port:**
   - Make sure port 8001 is not in use by another application
   - Verify `PORT=8001` in your `.env` file

4. **Check API key:**
   - Make sure `GEMINI_API_KEY` is set in `.env`
   - Get your key from: https://makersuite.google.com/app/apikey

### Server won't start

- **Missing dependencies:** Run `pip install -r requirements.txt`
- **Python version:** Requires Python 3.8+
- **Port already in use:** Change `PORT` in `.env` or stop the other service

## API Endpoints

### Health Check
```
GET /health
```

### Generate Recommendations
```
POST /api/recommendations/generate
```

Request body:
```json
{
  "pestType": "Brown Planthopper",
  "forecastData": { ... },
  "riskMetrics": { ... },
  "historicalData": { ... }
}
```

## Project Structure

```
python-backend/
├── app/
│   ├── models/
│   │   └── recommendation.py    # Pydantic models
│   ├── services/
│   │   └── recommendation_service.py  # Gemini API service
│   └── routers/
│       └── recommendations.py   # FastAPI routes
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Features

- ✅ AI-powered recommendations using Gemini Pro
- ✅ Fallback to rule-based recommendations if API fails
- ✅ CORS configured for frontend integration
- ✅ Error handling and validation
- ✅ Type-safe with Pydantic models

