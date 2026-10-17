# MedAlloc: Intelligent Medical Resource Allocation Platform

MedAlloc is a high-performance, full-stack medical resource allocation system designed to optimize emergency hospital resource distribution (ICU beds, ventilators, ECMO machines, oxygen cylinders, and specialized medical staff) under crisis scenarios.

---

## Architecture Overview

MedAlloc follows a clean, decoupled three-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend: Next.js 15 (App Router)        │
│    TypeScript • Tailwind CSS • shadcn/ui • React Flow  │
│                   Recharts • Lucide React              │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend: Express.js (Node.js)            │
│         CORS • dotenv • nodemon • Clean Router         │
└───────────────────────────┬────────────────────────────┘
                            │ stdin / stdout (JSON Streams)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Algorithm Engine: C (C17 / GCC)            │
│      High-performance optimization engine binary       │
└────────────────────────────────────────────────────────┘
```

1. **Frontend (`client/`)**: Modern Next.js 15 App Router interface with responsive dashboards, interactive graph visualization via React Flow, telemetry charts with Recharts, and styled with Tailwind CSS.
2. **Backend (`server/`)**: Express.js REST API providing CORS-enabled endpoints, modular routes/controllers/services/utils, and an IPC bridge to the C engine.
3. **Algorithm Engine (`dsa/`)**: Independent compiled C17 engine engineered for raw performance, communicating with Express through standard I/O (`stdin`/`stdout`) using structured JSON payloads.

---

## Directory Structure

```
MedAlloc/
├── client/                     # Next.js 15 Frontend
│   ├── app/                    # App Router pages and layout
│   ├── components/             # Reusable UI & diagram components
│   ├── lib/                    # Shared utilities (cn, clsx)
│   ├── hooks/                  # Custom React hooks (e.g. useHealthCheck)
│   ├── types/                  # TypeScript interface definitions
│   └── public/                 # Static assets
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── routes/             # Express API routes
│   │   ├── controllers/        # Request/response handlers
│   │   ├── services/           # Business logic & IPC coordination
│   │   ├── utils/              # C Engine bridge & child process helpers
│   │   └── index.js            # Express server entrypoint
│   └── package.json            # Backend dependencies
│
├── dsa/                        # Algorithm Engine (C17)
│   ├── include/                # Header files (.h)
│   ├── src/                    # Implementation modules (.c)
│   ├── build/                  # Compiled binary output
│   ├── allocator.c             # Engine entrypoint & initialization
│   ├── allocator.h             # Core engine declarations
│   └── Makefile                # Cross-platform compilation script
│
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules
└── package.json                # Root orchestration & scripts
```

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v25+ tested)
- **npm**: v9.0.0 or later
- **GCC**: MinGW GCC (Windows) or GCC / Clang (Linux/macOS)
- **Make**: `make` or `mingw32-make` (Windows)

---

## Getting Started

### 1. Install All Dependencies

From the repository root, install dependencies for both the root orchestrator, frontend, and backend:

```bash
npm run install:all
```

Or install individually:

```bash
# Backend dependencies
cd server && npm install

# Frontend dependencies
cd ../client && npm install
```

### 2. Build the C Algorithm Engine

Compile the C executable via Makefile or npm script:

```bash
# Using root npm script:
npm run build:engine

# Or using Make directly:
cd dsa && mingw32-make all   # On Windows
cd dsa && make all           # On Linux/macOS
```

Test running the engine directly:

```bash
npm run run:engine
# Outputs: MedAlloc Engine Ready
```

---

## Running in Development Mode

You can run both the Next.js frontend and Express backend concurrently with a single command from the project root:

```bash
npm run dev
```

This launches:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Running Services Individually

- **Frontend only**:
  ```bash
  npm run dev:client
  ```

- **Backend only**:
  ```bash
  npm run dev:server
  ```

---

## API Endpoints

### Health Check

- **Route**: `GET /health` (also aliased under `GET /api/health`)
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

---

## Clean Architecture Principles

- **Separation of Concerns**: UI rendering is decoupled from allocation computation and API routing.
- **IPC Protocol**: Express invokes the C allocator via standard I/O pipes. JSON inputs are written to `stdin` and allocation results are read from `stdout`.
- **Extensibility**: Future allocation heuristics (Linear Programming, Hungarian algorithm, priority-queue triage, etc.) can be added inside `dsa/src/` without modifying frontend contracts.
