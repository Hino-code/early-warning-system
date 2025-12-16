# How to Run the Development Servers

This project has two servers that need to run simultaneously:

1. **Frontend (Vite)** - React application on port 3000
2. **Backend (Express)** - API server on port 8000

## Quick Start (Two Terminal Windows)

### Terminal 1: Frontend (Vite)

```bash
# Install dependencies (if not already installed)
npm install

# Start the Vite dev server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### Terminal 2: Backend (Express Server)

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already installed)
npm install

# Start the Express server
npm run dev
```

The backend will be available at: **http://localhost:8000**

## Using a Single Terminal (Optional)

If you want to run both in one terminal, you can use a tool like `concurrently`:

```bash
# Install concurrently globally (one time)
npm install -g concurrently

# Then run both servers
concurrently "npm run dev" "cd server && npm run dev"
```

Or add it to your root package.json:

```json
"scripts": {
  "dev": "vite",
  "dev:server": "cd server && npm run dev",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\""
}
```

## Environment Variables

Make sure your `server/.env` file is configured:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=8000
```

## Troubleshooting

- **Port already in use**: Change the port in `vite.config.ts` (frontend) or `server/.env` (backend)
- **Dependencies missing**: Run `npm install` in both root and `server/` directories
- **CORS errors**: Make sure the backend CORS is configured to allow requests from `http://localhost:3000`
