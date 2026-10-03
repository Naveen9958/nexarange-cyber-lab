# NexaRange Command Center — Backend API Engine

Production-ready, zero-trust backend API powering the **NexaRange Cyber Simulation Labs & Command Center**.

Built with **Node.js**, **Express.js (ES Modules)**, **MongoDB/Mongoose**, and **JWT Authentication**.

---

## 🔒 Security Architecture & Simulated Terminal Rule

> **CRITICAL SECURITY GUARANTEE:**
> This platform is a **CONTROLLED SIMULATION**.
> The terminal and security labs **NEVER** execute real arbitrary operating system commands, malware, shell execution (`exec`, `spawn`, `child_process`, `eval`), network scanners against external targets, or destructive operations.
> All terminal commands are handled by a strict backend whitelist against predefined, deterministic simulation telemetry. Any non-whitelisted command is safely rejected with `command not recognized`.

---

## 📦 Tech Stack

- **Runtime:** Node.js (v18+ recommended)
- **Framework:** Express.js (ES Modules)
- **Database:** MongoDB via Mongoose ODM (with automatic in-memory fallback for testing/offline dev)
- **Authentication:** JWT (JSON Web Tokens) with hashed credentials (`bcryptjs`, cost factor 12)
- **Security:** Helmet, CORS with credentials validation, express-rate-limit, express-validator
- **Logging:** Morgan and structured zero-trust logger (never logging secrets, tokens, or passwords)
- **Test Framework:** Node.js Native Test Runner (`node:test`, `supertest`)

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # Database connection & in-memory fallback
│   │   └── env.js                # Validated environment configuration
│   ├── controllers/
│   │   ├── auth.controller.js        # Register, login, logout, me, refresh
│   │   ├── user.controller.js        # Profile & theme settings
│   │   ├── dashboard.controller.js   # Single aggregated dashboard telemetry
│   │   ├── mission.controller.js     # Mission lifecycle & idempotent XP awards
│   │   ├── lab.controller.js         # Operations & lab completion
│   │   ├── terminal.controller.js    # Simulated safe enclave terminal
│   │   ├── progress.controller.js    # Operator progress & reset
│   │   ├── stats.controller.js       # Specialization radar & XP curve telemetry
│   │   ├── rank.controller.js        # Dynamic rank & global leaderboard
│   │   ├── certificate.controller.js # Official accredited certificates
│   │   ├── squad.controller.js       # Operator squad peer intelligence
│   │   └── notification.controller.js# Security notifications & alerts
│   ├── middleware/
│   │   ├── auth.middleware.js        # Session & token verification
│   │   ├── rateLimit.middleware.js   # Auth & API throttling
│   │   ├── validate.middleware.js    # Request body & param validation
│   │   ├── error.middleware.js       # Centralized production-safe error handler
│   │   └── notFound.middleware.js    # 404 handler
│   ├── models/
│   │   ├── User.js                   # Operator account & preferences
│   │   ├── Session.js                # Revocable session state
│   │   ├── Lab.js                    # 5 Operations definition
│   │   ├── Mission.js                # 25 Operational missions
│   │   ├── MissionAttempt.js         # User mission attempts (unique index for idempotency)
│   │   ├── Progress.js               # Overall XP, level, badges, skill matrix
│   │   ├── TerminalSession.js        # Safe terminal sessions
│   │   ├── TerminalCommand.js        # Terminal audit log
│   │   ├── Certificate.js            # Issued credentials
│   │   └── Notification.js           # In-app notifications
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── mission.routes.js
│   │   ├── lab.routes.js
│   │   ├── terminal.routes.js
│   │   ├── progress.routes.js
│   │   ├── stats.routes.js
│   │   ├── rank.routes.js
│   │   ├── certificate.routes.js
│   │   ├── squad.routes.js
│   │   └── notification.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── mission.service.js
│   │   ├── xp.service.js             # Atomic XP awards & duplicate prevention
│   │   ├── rank.service.js
│   │   ├── progress.service.js
│   │   ├── terminal.service.js       # Whitelist-based simulation engine
│   │   └── certificate.service.js
│   ├── utils/
│   │   ├── apiResponse.js            # Standardized API response contract
│   │   ├── constants.js              # Formulas, whitelists, themes, categories
│   │   ├── jwt.js                    # JWT signing & verification
│   │   └── logger.js                 # Redacted structured logging
│   ├── seed/
│   │   └── seed.js                   # Idempotent seed script (5 labs, 25 missions)
│   ├── app.js
│   └── server.js
├── tests/
│   └── api.test.js                   # 38 passing comprehensive integration & security tests
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create `.env` inside `backend/` from `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `PORT` | API Server listening port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/nexarange` |
| `JWT_SECRET` | Secret key for signing session tokens | `(strong secret)` |
| `JWT_EXPIRES_IN` | JWT token validity window | `1d` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Set true in production over HTTPS | `false` |
| `COOKIE_SAME_SITE` | SameSite cookie policy | `lax` |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database
Seeds 5 operations, 25 missions, and a default operator (`naveen@nexarange.internal` / `CyberAccess2026!`):
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Run Automated Tests
Runs all 38 integration, idempotency, and security tests:
```bash
npm test
```

---

## 📡 API Reference & Standard Response Shapes

All API responses follow a strict contract:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

### Core API Endpoints

#### 1. System Health
- `GET /api/health` — Returns server health status.

#### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Create operator account (`{ name, email, callsign, password }`).
- `POST /api/auth/login` — Sign in (`{ identifier, password }`).
- `POST /api/auth/logout` — Revoke session token and clear cookies.
- `GET /api/auth/me` — Get authenticated operator profile.
- `POST /api/auth/refresh` — Refresh active session token.

#### 3. User & Settings (`/api/user`)
- `GET /api/user/profile` — Get operator profile.
- `PATCH /api/user/profile` — Update name, callsign, avatar.
- `GET /api/user/settings` — Get theme settings.
- `PATCH /api/user/settings` — Update theme (`{ "themePreference": "dark" | "light" | "system" }`).

#### 4. Dashboard (`/api/dashboard`)
- `GET /api/dashboard` — Single aggregated endpoint returning XP, level, rank, completion rate, DEFCON status, active mission, and badges.

#### 5. Missions (`/api/missions`)
- `GET /api/missions` — List all active missions.
- `GET /api/missions/:id` — Get mission details.
- `POST /api/missions/:id/start` — Start mission attempt.
- `POST /api/missions/:id/complete` — Complete mission (server calculates XP, prevents duplicate rewards).
- `GET /api/missions/:id/progress` — Check mission progress.

#### 6. Simulation Labs (`/api/labs`)
- `GET /api/labs` — List 5 simulation operations.
- `GET /api/labs/:id` — Get operation details and associated missions.
- `POST /api/labs/:id/start` — Initiate lab scenario.
- `POST /api/labs/:id/complete` — Complete operation scenario (verifies all 5 missions).
- `GET /api/labs/:id/progress` — Operation progress.

#### 7. Simulated Terminal (`/api/terminal`)
- `POST /api/terminal/session` — Establish a safe virtual enclave session.
- `POST /api/terminal/command` — Run simulated command (`{ sessionId, command }`).
- `GET /api/terminal/session/:id` — Inspect terminal session.
- `POST /api/terminal/session/:id/close` — Close terminal session.

**Whitelisted Commands:**
`help`, `status`, `scan`, `inspect`, `trace`, `analyze`, `clear`, `whoami`, `reset`, `nmap localhost`, `kubectl get pods`, `pip list`.

#### 8. Operator Progress & Telemetry (`/api/progress` & `/api/stats`)
- `GET /api/progress` — Overall progression, completed missions map, badges, skill matrix.
- `POST /api/progress/reset` — Reset workspace to baseline benchmark.
- `GET /api/stats/overview` — Operational telemetry metrics.
- `GET /api/stats/skills` — 6-vector specialization radar values.
- `GET /api/stats/xp-history` — Incident mitigation curve data points.
- `GET /api/stats/session` — Session telemetry.

#### 9. Rank & Certificates (`/api/rank` & `/api/certificates`)
- `GET /api/rank/me` — Current global ranking and next milestone.
- `GET /api/rank/leaderboard` — Global operator leaderboard.
- `GET /api/certificates` — Issued official accredited certificates.
- `GET /api/certificates/:id` — Certificate verification.

---

## 🛡️ Production Deployment

1. Set `NODE_ENV=production`.
2. Configure `MONGODB_URI` pointing to your hosted MongoDB cluster (e.g., MongoDB Atlas).
3. Set a strong `JWT_SECRET`.
4. Set `CLIENT_URL` to your production frontend domain.
5. Set `COOKIE_SECURE=true`.
6. Deploy using `npm start` on Node.js hosting (Render, Railway, AWS ECS, Fly.io, etc.).
