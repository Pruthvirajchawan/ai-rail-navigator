# AI Algorithms

Detailed reference for the AI techniques powering the system.

---

## 1. A* Pathfinding

**Purpose:** find the optimal route from origin station to destination station.

### Formulation
- **Graph** — Stations as nodes, TrackSections as weighted edges
- **g(n)** — Cumulative cost from origin to node `n`
- **h(n)** — Heuristic estimate from `n` to goal (Euclidean distance)
- **f(n) = g(n) + h(n)** — Priority key

### Edge Cost
```
cost(edge) = distance × congestionFactor × electrificationPenalty
```
Where:
- `congestionFactor` ∈ [1.0, 2.5] based on current section status
- `electrificationPenalty` = 1.0 (electrified) or 1.15 (diesel)

### Why A\*?
- **Optimal** when `h` is admissible (Euclidean is)
- **Faster than Dijkstra** thanks to goal-directed exploration
- **Easily extensible** with custom cost functions (priority, time-of-day, weather)

### Complexity
- **Time:** O(E log V) with a binary heap
- **Space:** O(V)

---

## 2. EWMA Delay Prediction

**Purpose:** forecast each train's near-term delay trajectory.

### Formula
```
predicted_delay[t] = α × actual_delay[t] + (1 - α) × predicted_delay[t-1]
```
Where **α = 0.3** balances responsiveness vs. stability.

### Contextual Adjustments
The base prediction is multiplied by feature-specific factors:

| Factor | Range | Rationale |
|--------|-------|-----------|
| Train type | 0.85–1.20 | Freight degrades faster than superfast |
| Time of day | 0.95–1.30 | Peak-hour congestion amplifies delays |
| Section congestion | 1.0–1.50 | Crowded sections compound problems |

### Risk Classification
| Trend | Condition | Color |
|-------|-----------|-------|
| **Worsening** | predicted > actual + 2 min | 🔴 destructive |
| **Stable** | within ±2 min | 🟡 warning |
| **Recovering** | predicted < actual − 2 min | 🟢 success |

### Why EWMA?
- **No training data required** — useful for cold-start systems
- **Constant memory** — only the previous prediction is stored
- **Tunable** — α can be learned per route from historical data
- **LSTM-equivalent for stationary signals** — production systems can swap in a learned LSTM without changing the interface

---

## 3. Conflict Detection & Resolution

**Purpose:** prevent unsafe co-occupation of track sections.

### Detection
For every pair of trains `(A, B)` sharing a section:
1. Compute spatial separation `Δs` (km)
2. Compute closing speed `Δv` (km/h)
3. Compute time-to-conflict `t = Δs / Δv`
4. **Risk %** = `clamp(100 × (1 − t/safetyMargin), 0, 100)`

### Resolution Logic
```
if risk > 70%:
    if priority(A) > priority(B):
        action(B) = HOLD
        action(A) = PASS
    else:
        action(A) = HOLD
        action(B) = PASS
else:
    action(both) = MONITOR
```

### Priority Order
1. Emergency / medical specials
2. Superfast / Rajdhani / Shatabdi
3. Express / Mail
4. Local / Passenger
5. Freight

---

## 4. Rule-Based Recommender

**Purpose:** surface actionable suggestions to controllers.

The recommender scans the simulation state and emits suggestions when triggers fire:

| Trigger | Recommendation Type | Example |
|---------|---------------------|---------|
| Train delay > 10 min on uncongested route | `speed-adjust` | "Increase to 110 km/h to recover 6 min" |
| Section occupied + alternate available | `reroute` | "Divert via Vadodara — saves 12 min" |
| Two superfasts conflict | `priority-override` | "Hold #12951 for #12952 (higher load)" |
| Platform double-booked | `platform-change` | "Reassign #14215 to PF-3" |

Each recommendation includes a **confidence score** (0–100) and **estimated minutes saved**.

---

## Roadmap: ML Upgrades

| Current (Heuristic) | Future (Learned) |
|---------------------|------------------|
| Euclidean A* heuristic | Graph Neural Network heuristic |
| EWMA delay forecast | LSTM / Transformer time-series |
| Rule-based recommender | Reinforcement Learning policy (PPO) |
| Static congestion factor | Real-time traffic prediction model |

The current architecture is **algorithm-agnostic** — replacing heuristics with learned models requires only swapping the implementation behind a stable interface.
