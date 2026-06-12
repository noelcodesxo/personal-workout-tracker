# Product Requirements Document — Workout Tracker (Web Client)

| | |
|---|---|
| **Product** | Workout Tracker — Web Client |
| **Doc owner** | Noel |
| **Status** | Draft v0.2 — design system added, aligned to live schema |
| **Last updated** | 2026-06-12 |

---

## 1. Summary

A mobile-first web application that lets serious athletes log, store, and review their training over time. It is the client for an existing REST API and exposes full CRUD over the three core domain objects the API manages: **Exercises**, **Routines**, and **Workouts**.

The product philosophy is *minimalist but powerful*: a small, fast surface with no clutter, but enough capability that an athlete can capture everything they care about. The application is **discipline-agnostic** — the athlete is in charge of what gets stored. Calisthenics, lifting, running, swimming, mobility work, or anything else is a first-class citizen because exercises are unrestricted and set metrics are flexible.

---

## 2. Goals & Non-Goals

### 2.1 Goals (this version)

- Provide a clean, fast, mobile-first interface to the existing API.
- Cover 100% of the CRUD operations the API offers for Exercises, Routines, and Workouts.
- Let athletes log a workout quickly during or after a session (with per-set and per-routine notes).
- Let athletes build and edit reusable routines.
- Let athletes add *any* exercise without restriction, so any discipline is supported.
- Render correctly across the most common mobile and desktop breakpoints.
- Make the API endpoint configurable per environment (local Docker container, preview, production).

### 2.2 Non-Goals (this version)

These are explicitly **out of scope for v1** and tracked in the roadmap (§11):

- **Distance/endurance set metrics** (distance + pace for running/swimming/cycling) — needs API support; deferred (§11).
- Real user authentication — v1 runs single-user against a config `user_id` (§10).
- Automatic PR detection/storage and PR displays.
- Strava-style shareable workout images.
- Social graph / network feed / following.
- Trend and pattern analytics.
- AI-generated workouts.

Designing v1 cleanly so these can be added without a rewrite **is** a goal (see §9.6).

---

## 3. Target Users

### 3.1 Primary persona — "The Serious Athlete"

Trains deliberately and consistently. Wants to remember what they did, how it felt, and what to progress next time. Frustrated by apps that assume a single discipline (lift-only) or bury logging under social features and ads. Values speed, clean UI, and full ownership of their data.

### 3.2 Discipline coverage

The product must serve, equally:

- **Lifters** — weight + reps, optional RPE.
- **Calisthenics athletes** — reps, time-under-tension, progressions (e.g. front-lever holds), bodyweight + added load.
- **Runners / swimmers / cyclists** — distance + time, pace. ⚠️ *Not supported by the current API (no distance/pace fields) — see the scope flag in §6 and §13.*
- **Mixed / hybrid athletes** — any combination of the above in one session.

Implication: the logging model cannot hard-code "weight × reps." See §6.

---

## 4. Glossary & Domain Model

Clear, unambiguous terms used throughout this doc and the codebase.

| Term | Definition |
|---|---|
| **Exercise** | A movement in the athlete's catalog (e.g. "Pull-up", "Back Squat", "5k Run"). Unrestricted — the athlete can create any exercise. Reusable across routines and workouts. |
| **Routine** | A saved, reusable *plan* — a named, ordered collection of exercises (e.g. "Push Day A"). A template, not a log. |
| **Workout** | A logged *session* on a given date. May be started from a routine or built freestyle. Contains the exercises performed and their sets, plus session notes. |
| **Set** | A single logged entry under an exercise within a workout (e.g. reps/weight, or distance/time). The atomic unit of performance data. |

### 4.1 Relationships

Source of truth: `server/data/models/table_models.py`. Diagram and names below match the live schema.

```
Exercise (catalog) ──< RoutineExercise >── Routine ──< (also) Workout.routine_id
     │                       │
     │                       └──< PlannedSet
     │
     └──< ExerciseEntry >── Workout ── User
                  │
                  └──< CompletedSetEntry
```

**API naming** (use these in `api/types.ts`, not the informal terms above):

| Doc term | API model | Key fields |
|---|---|---|
| Exercise | `Exercise` | `name` (unique), `active` |
| Routine | `Routine` | `name` (unique), `notes`, `active`, **`workout_type` (required)** |
| Routine ↔ Exercise | `RoutineExercise` | `routine_id`, `exercise_id` *(no order field — see §13)* |
| Planned set | `PlannedSet` | `planned_weight`, `planned_reps`, `planned_durations_in_seconds` (all nullable) |
| Workout | `Workout` | `workout_type` (required), `workout_start_time`, `workout_end_time?`, `user_id`, `routine_id?`, `active` |
| Workout ↔ Exercise | `ExerciseEntry` | `workout_id`, `exercise_id` *(no order field)* |
| Logged set | `CompletedSetEntry` | `weight_in_lbs`, `rep_count`, `duration_in_seconds`, `notes` |

- An **Exercise** can appear in many Routines and many Workouts.
- A **Routine** carries a required `workout_type` and references Exercises, each with one or more **planned sets** (target weight/reps/duration).
- A **Workout** is a timed session (`start`/`end` time, owned by the API) optionally linked to a routine, containing exercise entries, each with one or more **completed sets**.
- **Soft delete** via `active` applies to **Exercise, Routine, Workout only** — not to entries/sets.

> **Schema realities that shape the client (confirmed against the model):**
> - **`workout_type` is required** on both Routine and Workout, and is a fixed enum: `pull · push · legs · cardio · core`. The type badge in §8 is not decorative — every routine/workout must pick one.
> - **Weight is `weight_in_lbs` (integer, lbs only)** — no kg, no decimals. A unit toggle or fractional plates would need an API change.
> - **Notes** exist on **Routine** and **CompletedSetEntry** only. There is **no workout-level notes field** (see §13).
> - **No ordering field** on `RoutineExercise` / `ExerciseEntry` / sets — order is insertion order by id; reordering is not persistable today (§13).

---

## 5. User Stories

### Exercises
- As an athlete, I can create a new exercise with a name
- As an athlete, I can view my full exercise catalog and search/filter it.
- As an athlete, I can edit an exercise's details (name is the only detail at the moment).
- As an athlete, I can delete an exercise I no longer use.

### Routines
- As an athlete, I can create a routine and add exercises to it in a chosen order.
- As an athlete, I can view all my routines and open one to see its exercises.
- As an athlete, I can edit a routine (rename, add/remove/reorder exercises).
- As an athlete, I can delete a routine.
- As an athlete, I can start a workout from a routine so I don't re-enter everything.

### Workouts
- As an athlete, I can **start a live workout** (freestyle or from a routine); the API stamps the start time and a timer runs.
- As an athlete, during a session I can add exercises, add sets, and **check off each set as completed**.
- As an athlete, I can **finish** a workout, which stamps the end time (giving session duration).
- As an athlete, I can attach notes to a routine and to individual sets. *(No workout-level notes today — see §13.)*
- As an athlete, I can view my workout history, ordered by date.
- As an athlete, I can open a past workout and see exactly what I did.
- As an athlete, I can edit or delete a logged workout.
- As an athlete, I can backfill a past session by adjusting its start/end time. *(Depends on the API accepting client-supplied times — see §13.)*

### Cross-cutting
- As an athlete, I can use the app one-handed on my phone during a session.
- As an athlete, my data loads fast and the UI never blocks on the network unnecessarily. Meaning, to leverage local storage as much as possible for when server is unavailable/to cache things preemptively.

---

## 6. Functional Requirements
- Exercises CRUD
- Workouts CRUD
- Routines CRUD

### Flexible set metrics

A logged set (`CompletedSetEntry`) is **one generic shape** with three optional numeric fields — `weight_in_lbs`, `rep_count`, `duration_in_seconds` — plus `notes`. That single shape already serves several disciplines without per-exercise typing:

- **Strength** — weight + reps.
- **Bodyweight** — reps only (weight 0). Added/assisted load isn't a separate field; use weight.
- **Hold / time-based** — duration only (e.g. front-lever 12s).

The UI should show all three fields and let the athlete fill what's relevant, rather than branching on an exercise type — **the API has no exercise-level type.** "Type" exists only at the **workout/routine** level (`workout_type`: pull/push/legs/cardio/core), which drives the badge, not the set form.

> **Decided:** distance/endurance (distance + pace) is **out of scope for v1** — no API fields exist for it. v1 ships weight/reps/duration only; distance is on the roadmap (§11). `cardio` remains usable as a `workout_type` label (e.g. a duration-logged session), just without distance metrics.

### Validation & errors

- All forms validate client-side before submit (required fields, numeric ranges) and surface API validation errors inline.
- Network/API failures show a non-blocking, retryable error state — never a blank screen.

---

## 7. Non-Functional Requirements

### 7.1 Responsiveness
Mobile-first. Must render and remain usable across the common breakpoints:

| Tier | Target width | Priority |
|---|---|---|
| Mobile | 360–430px | **Primary** |
| Large mobile / small tablet | 480–768px | High |
| Tablet | 768–1024px | Medium |
| Desktop | ≥1024px | Medium |

Touch targets ≥ 44px; primary actions reachable one-handed on mobile.

### 7.2 Performance
- Fast first load and fast navigation (leverage Next.js routing + caching).
- Optimistic UI for create/edit where safe, so logging feels instant.

### 7.3 Accessibility
- Semantic HTML, labelled inputs, sufficient contrast, keyboard navigable.
- Target WCAG 2.1 AA as a baseline.

### 7.4 Reliability
- Graceful handling of API downtime (the local container may not be running).
- No data loss on transient failures; clear retry affordances.

---

## 8. Visual Design & UX

Source of truth: `web/design/mock-v2.html`. The product has a working name and visual identity — **Astron** — a minimalist, technical, "mecha-blueprint" aesthetic: hairline borders, faint grid-paper surfaces, sharp 2px corners, a single deep-navy accent, and a display typeface for numerals and headings.

### 8.1 Design tokens

These map 1:1 to `design/tokens.ts` (§9.2) and Tailwind theme extension.

**Color**

| Token | Value | Role |
|---|---|---|
| `ink` | `#111111` | Primary text, icons. |
| `surface` | `#ffffff` | Screen / card background. |
| `accent` | `#0D1B2A` | Brand. Primary buttons, active state, focus, key numerals. |
| `accent-dim` | `rgba(13,27,42,0.05)` | Active row / selected surface tint. |
| `accent-soft` | `rgba(13,27,42,0.10)` | Soft shadow / checkbox glow. |
| `accent-glow` | `rgba(0,50,140,0.22)` | Glow shadow under primary buttons, timer, checked sets. |
| `gray-100` | `#f4f4f4` | — |
| `gray-200` | `#e8e8e8` | Toggle track, subtle fills. |
| `gray-400` | `#aaaaaa` | Placeholder text, disabled, arrows. |
| `gray-600` | `#666666` | Secondary text (dates, meta, labels). |
| `gray-800` | `#2a2a2a` | — |
| `border` | `#e0e0e0` | 1px hairline separators. |
| `border-dark` | `#111111` | Underline inputs, emphasized rules. |

> **Gap to close:** the mock defines no **semantic** colors. v1 needs `danger` (validation/destructive — propose a desaturated red), and optional `success`/`warning`, since §6 requires inline errors and §7.4 requires offline/error states. Decide these before building the form/error primitives.

**Typography**

- **Display** — `Rajdhani` (300–700). Headings, large numerals, the app name, timers, exercise titles. Often uppercase with wide tracking.
- **Body** — `DM Sans` (300–500). Everything else.

| Size | Font / weight | Tracking | Usage |
|---|---|---|---|
| 54 | Rajdhani 600 | -0.01em | Home greeting |
| 42 | Rajdhani 600 | -0.01em | Routine detail title |
| 34 | Rajdhani 600 | 0.10em | Active-workout timer |
| 28 | Rajdhani 600 | 0.04em | Drawer username |
| 24 | Rajdhani 600 | -0.01em | Routine metric value |
| 18 | Rajdhani 600 | 0.22em / upper | App name; active-exercise name |
| 16 | DM Sans 400 | — | Form input value, drawer nav label |
| 15 | DM Sans 500 | -0.01em | List item names (exercise / workout / routine) |
| 13–14 | DM Sans 400–500 | 0.04–0.14em | Set values, top-bar title (upper), search |
| 10–11 | DM Sans 400–500 | 0.14–0.22em / upper | Section labels, form labels (accent, 70% opacity), dates, meta |
| 9–10 | DM Sans 500 | 0.16em / upper | Type badge |

**Spacing, shape, motion**

- Screen gutter: **24px** horizontal. List rows ~18–20px vertical.
- Radius: **2px** everywhere (`--radius`). Sharp and technical — not rounded.
- Hairlines: 1px `border` separate rows; inputs are **underline-only** (bottom border), no filled boxes — border goes `ink` on focus/active.
- Reference frame: 390×844 (iPhone-class).
- Motion is currently unspecified in the mock — keep it minimal (drawer slide, sheet rise, set-check); define durations/easing when building.

**Signature motifs (the Astron identity)** — reuse these, don't reinvent per screen:
- Left **accent gradient bar** (2–3px, `accent`→transparent) down hero/detail headers.
- **Corner triangle notch** on cards (angular mark).
- **Glow shadow** (`accent-glow`) under primary buttons, the timer, and checked set boxes.
- Faint **grid-paper** background (24–48px lines at ~5–6% accent) on hero/header surfaces.
- Uppercase, wide-tracked **micro-labels** in accent at 70% opacity.
- **Type badge** rendering `workout_type` (Push / Pull / Legs / Cardio / Core).

### 8.2 Navigation model

**Left slide-in drawer — not a bottom tab bar.** (This supersedes the earlier "bottom nav" intent in the brief.)

- **Top bar** on every screen: hamburger (left) opens the drawer; centered app name (Home) or screen title; right slot for the contextual action — `+` to create, `✎` to edit, or empty.
- **Drawer**: avatar + username header, nav list — **Home · Exercises · Workouts · Routines** — and Sign Out. Active item gets an `accent` left-border + `accent-dim` tint.
- **Primary action** per screen is a full-width `accent` button (e.g. "Start a Workout", "Save Changes"), **bottom-sticky** on detail screens (Routine detail, editors).

### 8.3 Screen inventory

Mapped to the routes in §9.2. Screens 1–7 are drawn in the mock; the rest are implied by the flows and flagged.

| # | Screen | Route | In mock | Notes |
|---|---|---|---|---|
| 1 | Home / Today | `/` | ✅ | Time-based greeting, "Start a Workout" CTA, recent-workouts list, "View all". |
| 2 | Menu drawer | overlay | ✅ | Global nav (above). |
| 3 | Exercises (list) | `/exercises` | ✅ | Search, `+`, inactive rows shown struck-through + "Inactive". |
| 4 | Exercise detail / edit | `/exercises/[id]` | ✅ | Name field + Active toggle, Save, Delete. |
| 5 | Routines (list) | `/routines` | ✅ | Cards: name, type badge, exercise count, last-used. |
| 6 | Routine detail | `/routines/[id]` | ✅ | Planned exercises w/ planned sets, "Add Exercise", sticky "Start Workout"; `✎` to edit. |
| 7 | Active workout | `/workouts/[id]` | ✅ | Live timer, routine label, exercise blocks, set rows w/ checkboxes, "Add Set", "Add Exercise", "Finish". |
| — | Exercise create | `/exercises/new` (or sheet) | ⚠️ derive | Reuse screen 4's form. |
| — | Routine create / editor | `/routines/new`, `/routines/[id]` (edit mode) | ⚠️ derive | Reorder UI **pending API support — see §13**. |
| — | Workout history (list) | `/workouts` | ⚠️ derive | Target of "View all"; sessions by date. |
| — | Workout detail (past) | `/workouts/[id]` (read mode) | ⚠️ derive | Read-only view of a logged session; edit/delete. |
| — | Add-exercise picker | sheet/modal | ⚠️ derive | Used by routine editor and active workout. |

### 8.4 UI primitives

→ `components/ui/`: `Button` (primary / destructive-ghost), `IconButton`, `Card` (optional corner accent), `ListRow`, `Badge` (workout type), `Toggle`, `SearchInput`, `FormField` (underline input + accent label), `Drawer`, `Sheet`, `SetRow` (grid: #, weight, reps/duration, check), `Timer`, `SectionHeader`, `EmptyState`.

### 8.5 States — define before building (mock shows only the happy path)

| State | Requirement |
|---|---|
| Empty | First-run Home / Exercises / Routines / Workouts — friendly prompt + primary CTA, never a blank list. |
| Loading | Skeleton rows matching the list/card layout; no layout shift. |
| Error / offline | Non-blocking, retryable banner or inline message (§6, §7.4) — never a blank screen. Needs the `danger` token above. |
| Inactive (soft-deleted) | Struck-through name + "Inactive" label (pattern shown on the Exercises screen). |
| Touch targets | Mock icon buttons are 36px; **§7.1 requires ≥44px** — bump these when implementing. |

---

## 9. Technical Architecture

### 9.1 Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js (App Router)** | React-based, strong DX, first-class Vercel hosting. |
| Language | **TypeScript** | Type safety against the API contract. |
| Styling | **Tailwind CSS** | Fast, consistent, fits minimalist mobile-first design. |
| Data fetching / cache | **TanStack Query** | Cache, refetch, optimistic updates for CRUD over REST. |
| Forms | **React Hook Form + Zod** | Performant forms, schema validation shared with API DTO types. |
| Hosting | **Vercel** | Client deploy target; preview deploys per branch. |

### 9.2 Folder structure

A clean structure where each folder has a single, obvious responsibility.

```
src/
├── app/                 # Next.js App Router — routes & layouts only
│   ├── layout.tsx
│   ├── page.tsx               # Home / Today
│   ├── workouts/
│   │   ├── page.tsx           # history list
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx      # detail / edit
│   ├── routines/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── exercises/
│       ├── page.tsx
│       └── [id]/page.tsx
│
├── api/                 # API client layer — the ONLY place that talks HTTP
│   ├── client.ts             # base fetch wrapper (headers, base URL, errors)
│   ├── exercises.ts          # typed exercise endpoints
│   ├── routines.ts           # typed routine endpoints
│   ├── workouts.ts           # typed workout endpoints
│   └── types.ts              # DTOs / response & request types
│
├── components/          # Reusable UI
│   ├── ui/                   # primitives: Button, Card, Input, Sheet…
│   ├── exercise/
│   ├── routine/
│   ├── workout/
│   └── layout/               # nav, headers, shells
│
├── design/              # Design system, not logic
│   ├── tokens.ts             # color, spacing, type scale
│   └── globals.css
│
├── security/            # Auth & request safety
│   ├── auth.ts               # token handling (future user accounts)
│   ├── session.ts
│   └── guards.ts             # route protection helpers
│
├── lib/                 # Cross-cutting utilities
│   ├── hooks/                # useWorkouts, useRoutines, useExercises…
│   └── utils.ts
│
└── config/              # Environment configuration
    └── env.ts                # reads & validates env vars (see §9.4)
```

**Rules of the structure:**
- Only `api/` performs network calls. Components and pages call typed functions/hooks, never `fetch` directly.
- `app/` holds routing and composition only — no business logic.
- `design/` is presentation tokens; `security/` is auth/safety; they don't import each other.

### 9.3 Data flow

```
UI component ──> lib/hooks (TanStack Query) ──> api/* (typed) ──> api/client.ts ──> REST API
                          ▲                                                  │
                          └──────────────── cache / optimistic ◀────────────┘
```

### 9.4 Configuration (API endpoint)

The API base URL **must** be configurable per environment without code changes.

- Source of truth: environment variables, surfaced through `config/env.ts` (a single validated module — no scattered `process.env` reads).
- Public variable (browser-visible): `NEXT_PUBLIC_API_BASE_URL`.

```
# .env.local — local dev against the Dockerized API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# .env.example — committed template (no secrets)
NEXT_PUBLIC_API_BASE_URL=

# Vercel — set per environment (Preview / Production) in dashboard
NEXT_PUBLIC_API_BASE_URL=https://api.<your-domain>
```

`config/env.ts` validates presence/shape at startup (e.g. with Zod) and exports a typed `env` object the rest of the app imports. Missing/invalid config fails loudly rather than producing a broken runtime.

### 9.5 Local development against the API container

- The API runs locally in Docker (existing setup). The client targets `http://localhost:8000` (or the mapped port) via `.env.local`.
- CORS on the API must allow the client origin (e.g. `http://localhost:3000`) — flagged as a dependency in §12.
- Document the run order in the README: start API container → `npm run dev`.

### 9.6 Designed for the roadmap

To keep future features additive (not a rewrite):

- Keep the `api/` layer thin and typed so new endpoints (PRs, social, trends) are new files, not refactors.
- Keep `security/` ready for real user accounts/tokens even though v1 may run single-user/local.
- Keep workout/exercise data normalized in the client cache so analytics and PR views can read it without new shapes.

---

## 10. Security

| Area | v1 requirement |
|---|---|
| Authentication | **Single-user v1 — no login.** Writes use a fixed `user_id` from config (`config/env.ts`). `security/` is scaffolded (auth/session/guards) but inert, so real auth is an additive change, not a refactor (§9.6). |
| Transport | HTTPS in deployed environments; HTTP allowed only for local container. |
| Input handling | Validate and sanitize all inputs client-side; rely on API as source of truth. |
| Secrets | No secrets in client code or `NEXT_PUBLIC_*` beyond the API base URL. |

---

## 11. Roadmap (post-v1)

Dependent on upcoming API capabilities; listed in likely sequence.

0. **Distance/endurance metrics** — add distance + pace fields to the set model so running/swimming/cycling are first-class (unblocks the full "discipline-agnostic" vision in §3).
1. **Personal Records** — API auto-stores PRs; client surfaces PR badges and a PR view per exercise.
2. **Shareable workout image** — Strava-style generated graphic of a session for sharing.
3. **Social network** — follow other athletes; a feed of network activity/updates.
4. **Trends & patterns** — volume, frequency, and progression charts over time.
5. **AI-assisted programming** — generate/suggest workouts from the athlete's history and detected patterns.

---

## 12. Dependencies

- **Workout Tracker API** — live contract for Exercises, Routines, Workouts (CRUD), including the set-metric model and soft-delete semantics.
- **API CORS config** — must allow the web client origin(s).
- **Vercel project** — for client hosting and preview deploys.

---

## 13. Open Questions

**Resolved from the schema (`table_models.py`):**
- ✅ Schema/enums/set shape — documented in §4.1. `workout_type` ∈ {pull, push, legs, cardio, core}; set = weight_in_lbs / rep_count / duration_in_seconds / notes.
- ✅ Navigation & screen inventory — left drawer, screens in §8.2–8.3.

**Decided (2026-06-12):**
- ✅ **Distance/endurance metrics → roadmap.** v1 ships weight/reps/duration only; distance/pace deferred (§2.2, §11). No API change for v1.
- ✅ **Auth → single hardcoded user.** v1 writes use a fixed `user_id` from config; no login. `security/` stays scaffolded for future real auth (§9.6, §10).
- ✅ **Workout-level notes → dropped from v1.** Notes only where the API supports them: per-routine and per-set.

**Non-blocking — confirm with the running service / API owner:**
- [ ] "Start workout from routine": does the API copy planned sets → a new workout server-side, or does the client assemble it from routine + create-workout calls? (`Workout.routine_id` exists; copy behavior is service logic, not visible in the model.)
- [ ] **Exercise ordering:** no `order`/`position` column on `RoutineExercise` or `ExerciseEntry`. Reorder (§5 user story) is **not persistable** today — needs an API field. Treat as client-display-only for v1, or add the column?
- [ ] Pagination/limits on workout history and exercise lists.
- [ ] Weight unit: integer **lbs only** — confirm no kg / fractional-plate requirement for v1.

---

## 14. Success Criteria

- An athlete can log a complete multi-exercise workout on a phone in under a minute.
- All API CRUD operations for the three entities are reachable from the UI.
- The app is usable and correct across the breakpoints in §7.1.
- Switching the API endpoint requires only an env change — no code edits.
- The codebase is structured such that a roadmap feature can be added as new files in `api/`, `components/`, and `app/` without restructuring existing folders.