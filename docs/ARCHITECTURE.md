# Architecture

This document describes the internal architecture of the AI Railway Section Controller.

---

## Layered Design

The application follows a strict **layered architecture** with unidirectional data flow:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (React)          │  ← user interactions
└──────────────────┬──────────────────────────┘
                   │ props / callbacks
┌──────────────────┴──────────────────────────┐
│        React Hook Layer (useSimulation)     │  ← orchestration
└──────────────────┬──────────────────────────┘
                   │ state in / actions out
┌──────────────────┴──────────────────────────┐
│           AI Engine (pure functions)        │  ← intelligence
└──────────────────┬──────────────────────────┘
                   │ enriched state
┌──────────────────┴──────────────────────────┐
│       Simulation Engine (pure reducer)      │  ← state evolution
└──────────────────┬──────────────────────────┘
                   │ reads
┌──────────────────┴──────────────────────────┐
│         Domain Layer (typed entities)       │  ← truth
└─────────────────────────────────────────────┘
```

### Why This Matters
- **Testability** — pure functions in lib/ require no React, no DOM
- **Determinism** — given the same state + tick, output is reproducible
- **Time-travel debugging** — every state snapshot can be replayed
- **Swappable UI** — the engine could power a CLI, mobile app, or backend service

---

## Data Flow per Tick

```
       ┌──────────────────────────────────────┐
       │  setInterval (700ms / speed)         │
       └──────────────┬───────────────────────┘
                      ▼
       ┌──────────────────────────────────────┐
       │  simulateTick(prevState) → newState  │
       └──────────────┬───────────────────────┘
                      ▼
       ┌──────────────────────────────────────┐
       │  • advance trains along routes       │
       │  • run delay predictor (EWMA)        │
       │  • detect conflicts                  │
       │  • generate alerts (de-duplicated)   │
       │  • compute recommendations           │
       │  • update metrics                    │
       └──────────────┬───────────────────────┘
                      ▼
       ┌──────────────────────────────────────┐
       │  setState → React re-renders         │
       │  every 4th tick → persist history    │
       └──────────────────────────────────────┘
```

---

## Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `lib/railway-types.ts` | Type definitions for the entire domain |
| `lib/railway-data.ts` | Seed network: stations, tracks, initial trains |
| `lib/railway-engine.ts` | Pure tick reducer + scenario application + AI helpers |
| `hooks/use-simulation.ts` | React lifecycle wrapper around the engine |
| `components/dashboard/*` | Presentation panels — receive state, emit no logic |
| `pages/Index.tsx` | Composition root — wires hook to panels |

---

## Design Principles

### 1. Pure Functions in `lib/`
Engine logic is **side-effect free**. No `Date.now()`, no `Math.random()` outside seeded contexts, no I/O. This makes every behavior reproducible and testable.

### 2. Immutability
State transitions return new objects — no in-place mutation. Enables React's structural sharing and cheap re-render detection.

### 3. Separation of Concerns
- Components **render** — they don't compute conflicts or routes
- Hooks **orchestrate** — they don't make decisions
- Engine **decides** — it doesn't know about React

### 4. Semantic Design Tokens
All colors are defined as HSL in `index.css` and referenced via Tailwind utilities (`text-primary`, `bg-accent`). No hardcoded color values in components.

---

## Production Scale-Out

To deploy this architecture for real Indian Railways scale (~13,000 trains, 7,000+ stations):

```
┌────────────────┐    WebSocket    ┌────────────────┐
│  Train GPS /   │ ───────────────► │  API Gateway   │
│  Track Sensors │                  │  (Node/Fastify)│
└────────────────┘                  └────────┬───────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          ▼                  ▼                  ▼
                  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                  │  Kafka Bus   │  │  Redis Cache │  │  PostgreSQL  │
                  │  (events)    │  │  (state)     │  │ + TimescaleDB│
                  └──────┬───────┘  └──────────────┘  └──────────────┘
                         │
                         ▼
                  ┌──────────────────────────────────┐
                  │  AI Engine (Kubernetes Pods)     │
                  │  • A* router · EWMA predictor    │
                  │  • Conflict detector             │
                  └──────────────┬───────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────────┐
                  │  React Dashboard (this repo)     │
                  │  • Multi-controller views        │
                  │  • RBAC + audit log              │
                  └──────────────────────────────────┘
```

Observability: **OpenTelemetry** → **Prometheus** + **Grafana** + **Loki**.

---

For details on individual algorithms, see [`AI_ALGORITHMS.md`](./AI_ALGORITHMS.md).
