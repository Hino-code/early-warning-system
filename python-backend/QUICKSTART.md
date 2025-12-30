# Quick Start Guide - Running the Backend

## Step-by-Step Instructions

### 1. Navigate to the backend directory
```bash
cd python-backend
```

### 2. Create and activate virtual environment (first time only)

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 3. Install dependencies (first time only)
```bash
pip install -r requirements.txt
```

### 4. Create `.env` file

Create a file named `.env` in the `python-backend` directory with:

```env
GEMINI_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
PORT=8001
```

**Get your Gemini API key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env` file

### 5. Run the server

```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

### 6. Verify it's working

Open another terminal and test:
```bash
curl http://localhost:8001/health
```

Should return: `{"status":"ok"}`

Or visit in browser: http://localhost:8001/docs (FastAPI auto-generated docs)

---

## Alternative: Using the start script

```bash
cd python-backend
./start.sh
```

This script automates steps 2-5.

---

## Troubleshooting

### "Module not found" error
- Make sure virtual environment is activated: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### "GEMINI_API_KEY not found"
- Create `.env` file in `python-backend` directory
- Add `GEMINI_API_KEY=your_key_here`

### Port 8001 already in use
- Change `PORT=8002` in `.env` file
- Update `vite.config.ts` proxy to use port 8002

### Server won't start
- Check Python version: `python3 --version` (needs 3.8+)
- Make sure you're in `python-backend` directory
- Check for syntax errors in Python files

---

## Running in Development Mode (with auto-reload)

```bash
uvicorn main:app --reload --port 8001
```

This will automatically restart the server when you make code changes.

---

## Stopping the Server

Press `CTRL+C` in the terminal where the server is running.

