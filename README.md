# BusPulse – College Bus Tracking System 🚌⚡

> **A Complete Full-Stack Real-Time University Transit & Telematics Platform**  
> Built with React (Vite), Tailwind CSS, Node.js, Express, MongoDB (Mongoose), Socket.IO, and Leaflet OpenStreetMap.

---

## 🌟 Overview & Key Features

Students frequently struggle with unanswered questions:
- *When will the college bus arrive at my stop?*
- *Is my bus delayed due to traffic or weather?*
- *Where is the bus currently located on the city map?*
- *Which route, waypoints, and boarding stops does it follow?*

**BusPulse** solves these challenges with a modern, Apple-inspired interface and a high-frequency real-time telematics backend:

1. **Live GPS Map Telematics:** Interactive Leaflet maps with custom animated SVG vehicle markers that glide along route waypoints without page refresh.
2. **Dynamic Stop ETA Engine:** Intelligent calculation using the geodesic Haversine distance formula and vehicle speed to calculate stop-by-stop estimated arrival countdowns in minutes.
3. **Instant Push Delay Alerts:** Real-time Socket.IO broadcasts when admins flag traffic congestion or delay events, automatically notifying students.
4. **Role-Based Workflows:** Distinct student commuter portals and administrator management suites with JWT token security.
5. **Interactive Demo Simulation Mode:** Built-in waypoint simulator enabling seamless live testing with simulated GPS bus movement along real university routes.
6. **Dual Persistence Mode:** Native Mongoose support with seamless automated in-memory persistence fallback for immediate zero-config testing.

---

## 🏗️ Project Architecture

```
buspulse/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── public/
│   │   └── bus-icon.svg        # Custom bus SVG favicon
│   ├── src/
│   │   ├── assets/             # Brand logos & vector assets
│   │   ├── components/
│   │   │   ├── cards/          # BusCard, RouteCard, NotificationCard
│   │   │   ├── common/         # Navbar, Footer, Badge, Button, Modal, StatCard, LoadingSpinner
│   │   │   └── map/            # BusMap, Leaflet markers, Route Polyline & popups
│   │   ├── context/            # AuthContext (JWT session), SocketContext (Real-time feed)
│   │   ├── layouts/            # MainLayout, ProtectedRoute (Role-guard)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Apple-inspired hero, features, how it works
│   │   │   ├── LoginPage.jsx          # Student & Admin login with 1-click demo fill
│   │   │   ├── RegisterPage.jsx       # Student enrollment with route selector
│   │   │   ├── StudentDashboard.jsx   # Commuter overview, ETA, mini map, notifications
│   │   │   ├── LiveTrackingPage.jsx   # Fullscreen interactive Leaflet map & telematics
│   │   │   ├── RoutesPage.jsx         # Campus transit timetables & stop timelines
│   │   │   ├── NotificationsPage.jsx  # Categorized delay & arrival alerts
│   │   │   └── AdminDashboard.jsx     # Fleet CRUD, Route Builder, Driver & Student rosters
│   │   ├── services/           # Axios API client, domain endpoints, Socket.IO client
│   │   ├── App.jsx             # React Router DOM configuration
│   │   ├── index.css           # Tailwind directives & Leaflet styling overrides
│   │   └── main.jsx            # React 18 DOM mount
│   ├── index.html              # HTML5 entry with fonts & Leaflet stylesheet
│   ├── package.json
│   ├── tailwind.config.js      # Custom #2563EB primary palette & Apple shadow design
│   └── vite.config.js          # Vite config with dev proxy for /api & /socket.io
│
├── server/                     # Backend (Node.js + Express + Socket.IO + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection with graceful memory fallback
│   ├── controllers/            # Auth, Bus, Route, Notification, Student, Simulation
│   ├── middleware/             # JWT auth verification, admin authorization, error handling
│   ├── models/                 # Mongoose models: User, Bus, Route, Notification
│   ├── routes/                 # Express REST routers
│   ├── services/
│   │   ├── dataStore.js        # Unified data adapter (Mongoose & instant persistence)
│   │   ├── etaService.js       # Haversine geodesic distance & velocity ETA engine
│   │   └── simulationService.js# Waypoint interpolation movement simulator
│   ├── sockets/
│   │   └── busSocket.js        # Socket.IO emitter & room manager
│   ├── utils/
│   │   ├── jwt.js              # Token signing utility
│   │   ├── seedData.js         # Realistic university routes, stops & fleet data
│   │   └── seeder.js           # CLI database seeder script (`npm run seed`)
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express + HTTP + Socket.IO server entry
│
└── package.json                # Root package script runner
```

---

## 🔑 Demo Access Credentials

The system includes pre-configured demo credentials with 1-click auto-fill buttons on the login page:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@buspulse.edu` | `Admin@123` | Fleet CRUD, Route Management, Status Updates, Delay Alerts, Student Roster |
| **Student** | `student@buspulse.edu` | `Student@123` | Live Tracking, Stop ETAs, Route Schedules, Preference Settings |
| **Sample Student 2** | `priya@buspulse.edu` | `Student@123` | Electronic City Route 204 Commuter |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or later)
- **npm** or **pnpm**
- **MongoDB** (Local `mongod` service or MongoDB Atlas cloud connection string). *Note: If MongoDB is not yet running, BusPulse will automatically start in in-memory persistence mode so you can test all features immediately!*

### Step 1: Clone or Navigate to the Project
```bash
cd /Users/advithkk/.gemini/antigravity/scratch/buspulse
```

### Step 2: Configure Environment Variables
Inside the `server/` directory:
```bash
cp server/.env.example server/.env
```
Default `.env` settings:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/buspulse
JWT_SECRET=buspulse_super_secret_jwt_key_2026
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

### Step 3: Seed Database (Optional for Real MongoDB)
If running a local MongoDB or Atlas instance:
```bash
cd server
npm run seed
```

### Step 4: Run the Backend Server
```bash
cd server
npm start
```
*The server will start on `http://localhost:5001` with Socket.IO enabled.*

### Step 5: Run the Frontend Client
In a separate terminal window:
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your browser to view the application.*

---

## 📡 Real-Time Telematics & Tracking Architecture

### How Live Tracking Works:
1. **Telemetry Feed:** The backend tracks each bus's `currentLocation` (`lat`, `lng`), speed (`km/h`), and active `status` (`On Time`, `Delayed`, `Arriving`).
2. **WebSocket Broadcast:** Whenever coordinates update (either via the Driver GPS update API `PATCH /api/buses/:id/location` or via the simulation engine), `emitBusLocation()` transmits a JSON telemetry packet over Socket.IO.
3. **No-Reload Map Updates:** The React `SocketContext` receives the event and updates the specific vehicle state in memory. Leaflet's marker animates smoothly across the canvas without refreshing the page.
4. **ETA Calculation:** The `etaService` computes the great-circle Haversine distance:
   $$\Delta\sigma = 2 \arcsin \sqrt{\sin^2(\Delta\phi/2) + \cos\phi_1\cos\phi_2\sin^2(\Delta\lambda/2)}$$
   $$\text{ETA (Minutes)} = \left(\frac{\text{Distance (km)}}{\text{Effective Speed (km/h)}}\right) \times 60 + \text{Delay Buffer}$$
5. **Proactive Alerts:** Changing a bus status to `Delayed` immediately produces a delay record in the database and broadcasts an alert toast to all student screens.

---

## 🛠️ API Reference

### Authentication
- `POST /api/auth/register` – Register new student commuter.
- `POST /api/auth/login` – Login student or admin (returns JWT).
- `GET /api/auth/me` – Fetch authenticated session profile.

### Buses
- `GET /api/buses` – Retrieve all buses with computed live ETAs.
- `GET /api/buses/:id` – Fetch single bus details.
- `POST /api/buses` – *[Admin]* Add new vehicle to fleet.
- `PUT /api/buses/:id` – *[Admin]* Edit bus details.
- `DELETE /api/buses/:id` – *[Admin]* Delete bus.
- `PATCH /api/buses/:id/location` – Driver GPS location update.
- `PATCH /api/buses/:id/status` – *[Admin]* Update status (`On Time` / `Delayed`).

### Routes
- `GET /api/routes` – List all college routes and stops.
- `GET /api/routes/:id` – Fetch route coordinates and assigned buses.
- `POST /api/routes` – *[Admin]* Create transit route.
- `PUT /api/routes/:id` – *[Admin]* Edit route stops.
- `DELETE /api/routes/:id` – *[Admin]* Delete route.

### Notifications & Students
- `GET /api/notifications` – Fetch live and archived alerts.
- `POST /api/notifications` – *[Admin]* Broadcast announcement.
- `PATCH /api/notifications/:id/read` – Mark notification as read.
- `GET /api/students` – *[Admin]* List registered students.
- `PUT /api/students/:id/preferred-route` – Save preferred transit route.

### Simulation Controls
- `GET /api/simulation/status` – Query simulator state.
- `POST /api/simulation/start` – Activate real-time GPS simulation.
- `POST /api/simulation/stop` – Halt simulation.

---

## 🚢 Production Deployment

### Frontend (e.g. Vercel, Netlify, Cloudflare Pages)
```bash
cd client
npm run build
```
Upload the generated `dist/` directory to your static host. Configure `VITE_API_URL` to your production server URL.

### Backend (e.g. Render, Railway, AWS EC2, DigitalOcean)
1. Set environment variables on your platform: `MONGODB_URI`, `JWT_SECRET`, `PORT`.
2. Start command: `node server.js`.
3. Ensure WebSocket support is enabled on your host.
