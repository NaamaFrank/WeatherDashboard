# Weather Alert System

A full-stack weather monitoring application that integrates with [Tomorrow.io](https://www.tomorrow.io/) to provide real-time weather data and customizable weather alerts. Built as a distributed system with React frontend, Express backend, and SQLite persistence.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server │◄──►│  Tomorrow.io    │
│   (Port 5173)   │    │   (Port 4000)   │    │      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌─────────────────┐              
         └─────────────►│  SQLite Database│              
                        │   (app.db)      │              
                        └─────────────────┘              
```

**Design Philosophy**: Separation of concerns with clear boundaries between presentation (React), business logic (Express), and external services (Tomorrow.io API).

---

## Features

### Weather Data
- **Current Weather**: Real-time conditions for any location
- **3-Day Forecast**: Hourly weather predictions with timeline visualization
- **Parameter Focus**: Temperature, Wind Speed, and Humidity (core weather metrics)

### Alert System
- **Custom Alerts**: User-defined thresholds for weather conditions
- **Real-time Status**: Live monitoring of alert trigger states
- **Forecast Analysis**: 3-day prediction window showing when alerts will trigger
- **Smart Notifications**: Toast notifications when conditions are met
- **Persistent Storage**: Alerts survive application restarts

### User Experience
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Interactive Modals**: Detailed forecast views and alert management
- **Visual Indicators**: Status badges, weather icons, and trigger highlights
- **Real-time Updates**: Automatic status checking every 5 minutes

---

## Project Structure

```
tomorrow.io/
├── client/                 # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── routes/         # Page components (Home, Alerts)
│   │   ├── lib/            # Types, constants
│   │   └── services/       # API communication layer
│   └── public/             # Static assets
├── server/                 # Express Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── routes/         # HTTP endpoints
│   │   ├── controllers/    # Request handling
│   │   ├── services/       # Business logic
│   │   ├── db/             # Data persistence layer
│   │   ├── clients/        # External API integration
│   │   └── core/           # Configuration and database setup
│   └── data/               # SQLite database files
├── shared/                 # Shared TypeScript types and constants
│   ├── alerts.ts           # Alert-related types
│   ├── weather.ts          # Weather data types
│   ├── constants.ts        # Application constants
│   └── index.ts            # Barrel exports
└── README.md
```
---

## API Endpoints

### Weather
- `GET /api/weather/current?location={location}` - Current weather conditions
- `GET /api/weather/forecast?location={location}` - 3-day hourly forecast

### Alerts
- `GET /api/alerts` - List all alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/:id/status` - Check current alert status
- `GET /api/alerts/:id/forecast-window` - Get 3-day forecast window for alert

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express and TypeScript
- **SQLite** with better-sqlite3
- **Axios** for HTTP requests
- **dotenv** for environment configuration

### Shared
- **TypeScript** for type safety across the stack

---

## Setup & Development

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Tomorrow.io API key ([get free trial](https://www.tomorrow.io/))

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd tomorrow.io

# Install client dependencies
cd client && npm install

# Install server dependencies  
cd ../server && npm install
```

2. **Environment Configuration**:
```bash
# In server/ directory
echo "TOMORROW_API_KEY=your_key_here" > .env
```

3. **Start Development Servers**:
```bash
# Terminal 1: Start server (from server/ directory)
npm run dev

# Terminal 2: Start client (from client/ directory)
npm run dev
```

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Database**: `server/data/app.db`

### Development Workflow
1. Server starts with automatic database initialization
2. Client connects to server API on port 4000
3. All changes auto-reload with hot module replacement

---

## Technical Decisions & Trade-offs

### Approach Decisions

#### 1. **Monorepo with Shared Types**
- **Approach**: Single repository with `shared/` folder for TypeScript types
- **Benefit**: Type safety across client/server boundary, DRY principle

#### 2. **SQLite for Persistence**
- **Approach**: File-based SQLite database with better-sqlite3
- **Benefit**: Zero configuration, perfect for development, built-in transactions
- **Trade-off**: Not suitable for high-concurrency production 

#### 3. **Direct API Integration**
- **Approach**: Direct Tomorrow.io API calls without caching layer
- **Benefit**: Always fresh data, simpler architecture
- **Trade-off**: Higher API usage, potential rate limiting (would need Redis caching for production)

### Technical Debt & Future Improvements

#### High Priority
- [ ] Add request/response logging
- [ ] Database migrations system
- [ ] API rate limiting and caching

#### Medium Priority
- [ ] WebSocket for real-time updates
- [ ] Location autocomplete with geocoding
- [ ] Historical weather data storage

#### Low Priority
- [ ] Alert notification via email/SMS
- [ ] More weather parameters support
- [ ] Data export functionality
- [ ] Mobile app version

---
