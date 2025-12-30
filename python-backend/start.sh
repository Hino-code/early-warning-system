#!/bin/bash

# Start script for FastAPI Recommendation Server

echo "🚀 Starting Pest-i Recommendation API Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update GEMINI_API_KEY in .env"
    else
        echo "❌ Error: .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "venv/lib" ] || [ ! -f "venv/bin/pip" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if GEMINI_API_KEY is set
if grep -q "your_api_key_here" .env 2>/dev/null; then
    echo "⚠️  Warning: GEMINI_API_KEY is not set in .env"
    echo "   Please update .env with your Gemini API key from:"
    echo "   https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting server on http://localhost:8001"
echo "📚 API docs will be available at http://localhost:8001/docs"
echo ""
python main.py

