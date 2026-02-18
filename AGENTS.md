# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TaniPintar is a smart agriculture web application (PWA) for precision farming. It provides:
- IoT sensor monitoring (temperature, humidity, soil pH, etc.)
- AI-powered plant disease detection and chlorophyll measurement via TFLite models
- Irrigation planning using FAO-56 Penman-Monteith methodology
- Scientific fertilizer recommendations based on nutrient balance

## Build & Run Commands

### Backend (Flask)

```bash
# Install dependencies
cd backend && pip install -r requirements.txt

# Run development server
python run.py

# Production (Gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Docker Deployment

```bash
# Full stack via docker-compose (frontend on :8080, backend internal :5000)
docker-compose up --build

# Build and push images to registry
./build_push.sh
```

## Architecture

### Backend (`backend/`)

Flask application using the factory pattern:

- `app/__init__.py` - App factory with `create_app()`, initializes SQLAlchemy, Flask-Login, CORS
- `app/routes.py` - All API endpoints under `/api/auth/*` blueprint
- `app/models.py` - SQLAlchemy models: `User`, `Sensor`, `SensorData`, `FertilizerPrice`
- `app/services/` - Core business logic:
  - `ai_service.py` - TFLite inference for disease detection and chlorophyll estimation. Models loaded from `app/models/*.tflite`
  - `agri_logic.py` - FAO-56 based irrigation (Penman-Monteith ETo, Kc interpolation) and fertilizer calculations
  - `processing_service.py` - OpenCV leaf segmentation before AI inference

Database: SQLite by default (`instance/tanipintar.db`), PostgreSQL via `DATABASE_URL` env var.

### Frontend (`frontend/`)

React 18 + Vite PWA:

- `src/App.jsx` - Route definitions with `ProtectedRoute` and `AdminRoute` guards
- `src/pages/` - Page components (Dashboard, IoTMonitoring, DiseaseDetection, IrrigationPlanner, FertilizerPlanner, etc.)
- `src/components/` - Reusable UI components
- `src/apiConfig.js` - API base URL configuration via `VITE_API_URL` env var

Auth state stored in `localStorage` under key `user`.

## Key API Patterns

### IoT Telemetry Ingestion

Sensors authenticate via `X-Sensor-Token` header (not user login):

```bash
curl -X POST http://localhost:5000/api/auth/v1/telemetry \
  -H "X-Sensor-Token: <device_token>" \
  -H "Content-Type: application/json" \
  -d '{"temperature": 28.5, "humidity": 75, "soil_ph": 6.5}'
```

### Disease Detection / Chlorophyll

POST multipart form with `image` file and optional `type` field (`disease` or `chlorophyll`):

```
POST /api/auth/disease-detection/analyze
```

The image is segmented by `processing_service.segment_leaf()` before being passed to the AI model.

### Agriculture Calculations

- `POST /api/auth/agriculture/calculate-water` - Daily irrigation need
- `POST /api/auth/agriculture/calculate-fertilizer` - Fertilizer recommendation (supports scientific nutrient balance if soil data provided)
- `POST /api/auth/agriculture/calculate-fertilizer-multi` - Multiple fertilizer combination options with scoring

## Environment Variables

Backend (`.env`):
- `SECRET_KEY` - Flask secret
- `DATABASE_URL` - PostgreSQL connection string (optional, defaults to SQLite)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins
- `FLASK_ENV` - `development` or `production`

Frontend (`frontend/.env`):
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:5000/api`)

## Testing

Root-level test files (`test_*.py`) test agricultural logic:

```bash
# Run a specific test
python test_agri_logic.py
python test_fertilizer_scientific.py
```

Backend tests:
```bash
cd backend
python test_dynamic_pricing.py
```

## AI Models

TFLite models are expected at:
- `backend/app/models/plant_disease_model.tflite` - Disease classification (PlantVillage 38-class)
- `backend/app/models/plant_chlorophyll_model.tflite` - SPAD value regression
- `backend/app/models/labels.txt` - Class labels for disease model

If models are missing, the service falls back to mock/heuristic responses.

## Important Conventions

- All agriculture calculations in `agri_logic.py` follow FAO-56 and IRRI guidelines
- Crop data (Kc values, growth stages, fertilizer defaults) are defined in `AgriLogic.CROP_DATA`
- Soil texture data follows FAO Lampiran B classifications in `AgriLogic.SOIL_DATA`
- Fertilizer prices can be dynamically updated via admin API; static fallbacks are in `FERTILIZER_COMPOSITION`
- User roles: `user`, `admin`, `expert` - admin routes check `current_user.role == 'admin'`
