# Stories — Workout Tracker (Astron Web Client)

Epics and stories derived from [`PRD.md`](./PRD.md). Built **sequentially, top to bottom** — each epic depends on the ones above it.

| | |
|---|---|
| **Source** | PRD v0.2 |
| **Schema** | `server/data/models/table_models.py` |
| **Last updated** | 2026-06-12 |

**Legend** — `[ ]` todo · `[x]` done. Check the story box only when all its sub-tasks are checked.

**Scope reminders (decided in PRD):** single hardcoded `user_id` (no login) · weight is integer **lbs** only · sets are weight/reps/duration (no distance) · notes on **routines + sets** only · `workout_type` is **required** (pull/push/legs/cardio/core).

---

## Epic 0 — Project Foundation & Tooling

Stand up the app skeleton and the rules that keep it clean (PRD §9). Nothing user-facing ships here, but everything below depends on it.

- [x] **Scaffold the Next.js App Router + TypeScript project** under `web/`
  - [x] `create-next-app` (App Router, TS, ESLint), strict mode on
  - [x] Establish the §9.2 folder structure (`app/`, `api/`, `components/`, `design/`, `security/`, `lib/`, `config/`) with placeholder index files
- [x] **Install and wire the core libraries** (PRD §9.1)
  - [x] Tailwind CSS + PostCSS
  - [x] TanStack Query — root `QueryClientProvider` in `app/layout.tsx`
  - [x] React Hook Form + Zod
- [x] **Typed, validated environment config** (`config/env.ts`, PRD §9.4)
  - [x] Zod-validate `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_USER_ID` at startup; fail loudly if missing/invalid
  - [x] Export a typed `env` object; no scattered `process.env` reads elsewhere
  - [x] Commit `.env.example`; create local `.env.local` (`http://localhost:8000`)
- [x] **Base API client** (`api/client.ts`, PRD §9.2 — the only place that talks HTTP)
  - [x] Fetch wrapper applying base URL + JSON headers + injected `user_id`
  - [x] Normalize API errors into a typed error shape (status, message, field errors)
  - [x] Surface network failure as a distinct, retryable error (feeds §7.4)
- [x] **Repo hygiene**
  - [x] ESLint + Prettier config, `npm run lint`/`format`
  - [x] README: run order (start API container → `npm run dev`) and env setup (PRD §9.5)

---

## Epic 1 — Design System & App Shell

Implement the **Astron** identity (PRD §8) so every later screen composes from the same primitives.

- [x] **Design tokens** (`design/tokens.ts` + Tailwind theme extension, PRD §8.1)
  - [x] Color tokens: `ink`, `surface`, `accent` (+ `accent-dim/soft/glow`), gray ramp, `border`/`border-dark`
  - [x] Type scale + the two fonts (Rajdhani display, DM Sans body) loaded via `next/font`
  - [x] Spacing/radius (2px), hairline borders, underline-input styling in `globals.css`
- [x] **Resolve the semantic-color gap** (PRD §8.1 flag)
  - [x] Add `danger` (desaturated red) for validation/destructive; optional `success`/`warning`
- [x] **Core UI primitives** (`components/ui/`, PRD §8.4)
  - [x] `Button` (primary / destructive-ghost), `IconButton`
  - [x] `Card` (optional corner-accent), `ListRow`, `SectionHeader`, `Badge` (workout type)
  - [x] `FormField` (accent label + underline input), `SearchInput`, `Toggle`
  - [x] `Sheet`, `EmptyState`
  - [x] Signature motifs reusable: left accent bar, corner triangle, glow shadow, grid-paper surface
- [x] **App shell & navigation** (PRD §8.2)
  - [x] Top bar (hamburger · centered title/app-name · contextual right slot)
  - [x] Left slide-in drawer: avatar + username, nav (Home/Exercises/Workouts/Routines), Sign Out; active item styling
  - [x] Per-screen bottom-sticky primary action pattern
- [x] **Shared states** (PRD §8.5)
  - [x] `EmptyState`, loading skeletons (list/card), error/offline retry banner
  - [x] Inactive (soft-deleted) row treatment: struck-through + "Inactive" via `ListRow`
- [x] **Responsive & touch baseline** (PRD §7.1)
  - [x] Verify primary breakpoints (360–430 primary, up through ≥1024)
  - [x] Bump touch targets to ≥44px — `IconButton` is 44×44px

---

## Epic 2 — Exercises CRUD

Catalog management. Simplest domain object (`Exercise`: `name` unique, `active`) — good first vertical slice (PRD §5 Exercises).

- [x] **Exercises API layer** (`api/exercises.ts`, `api/types.ts`)
  - [x] Typed list / get / create / rename / soft-delete endpoints (aligned to real API: `/exercise`, name-keyed)
  - [x] `useExercises` hooks in `lib/hooks/` (TanStack Query: cache + optimistic updates)
- [x] **As an athlete, I can view my full exercise catalog and search/filter it** (`/exercises`)
  - [x] List screen with search input (client-side filter)
  - [x] Note: inactive exercises not shown — API only returns active (GET /exercise/ filters server-side)
  - [x] Empty / loading / error states wired
- [x] **As an athlete, I can create a new exercise with a name** (`/exercises/new`)
  - [x] Form (RHF + Zod): name required, duplicate name surfaced inline
  - [x] Optimistic cache update on success
- [x] **As an athlete, I can edit an exercise** (`/exercises/[id]`)
  - [x] Name field + Save Changes (rename via PUT)
  - [x] Note: active toggle omitted — API does not return `active` in ExerciseRead
- [x] **As an athlete, I can delete an exercise I no longer use**
  - [x] Soft delete via DELETE /exercise/{name}; confirm step; optimistic cache removal

---

## Epic 3 — Routines CRUD

Reusable plans (`Routine` + `RoutineExercise` + `PlannedSet`). Depends on Exercises (Epic 2) for the picker (PRD §5 Routines).

- [ ] **Routines API layer** (`api/routines.ts`, types for `Routine`/`RoutineExercise`/`PlannedSet`)
  - [ ] Typed CRUD incl. nested routine-exercises and planned sets
  - [ ] `useRoutines` hooks
- [ ] **As an athlete, I can view all my routines** (`/routines`)
  - [ ] Cards: name, `workout_type` badge, exercise count, last-used
  - [ ] Empty / loading / error states
- [ ] **As an athlete, I can create a routine** (`/routines/new`)
  - [ ] Name (required, unique), **`workout_type` required** (enum select), optional notes
  - [ ] Add exercises via add-exercise picker sheet
  - [ ] Define planned sets per exercise (planned weight / reps / duration, all optional)
- [ ] **As an athlete, I can open a routine to see its exercises** (`/routines/[id]`)
  - [ ] Planned exercises list with planned-set summary (e.g. "135 lb · 4×8")
  - [ ] Sticky "Start Workout" CTA (hands off to Epic 4)
- [ ] **As an athlete, I can edit a routine** (`/routines/[id]` edit mode, `✎`)
  - [ ] Rename, change type/notes, add/remove exercises, edit planned sets
  - [ ] Reordering is **display-only for v1** — persistence blocked on API ordering field (PRD §13)
- [ ] **As an athlete, I can delete a routine**
  - [ ] Soft delete; confirm action

---

## Epic 4 — Active Workout & Logging

The core loop (PRD §5 Workouts, §14 success criterion). `Workout` + `ExerciseEntry` + `CompletedSetEntry`; start/end times owned by the API. Depends on Exercises + Routines.

- [ ] **Workouts API layer** (`api/workouts.ts`, types for `Workout`/`ExerciseEntry`/`CompletedSetEntry`)
  - [ ] Start workout (stamps `workout_start_time`), update log, finish (`workout_end_time`)
  - [ ] `useWorkouts` / active-session hooks; **optimistic updates** for set logging (PRD §7.2)
- [ ] **As an athlete, I can start a live workout** (freestyle or from a routine)
  - [ ] From routine: prefill exercises/planned sets, link `routine_id` (confirm copy behavior — PRD §13)
  - [ ] Freestyle: empty session, `workout_type` required
- [ ] **As an athlete, I see a running timer and my routine label** (`/workouts/[id]`)
  - [ ] Live elapsed timer from `workout_start_time`; routine name + type badge
- [ ] **As an athlete, I can record and check off sets**
  - [ ] Set rows: weight (lbs) / reps / duration; show only relevant fields
  - [ ] Check off completed sets (visual completed state); add set; add exercise mid-session
  - [ ] Per-set notes (`CompletedSetEntry.notes`)
- [ ] **As an athlete, I can finish a workout**
  - [ ] Stamps `workout_end_time`; computes session duration; returns to summary/history
- [ ] **Validation & failure handling** (PRD §6)
  - [ ] Numeric ranges client-side; inline API errors; non-blocking retry on network failure

---

## Epic 5 — Home & Workout History

Surfaces logged sessions (PRD §5 Workouts, §8.3). Depends on Epic 4 data.

- [ ] **As an athlete, I land on a Home/Today screen** (`/`)
  - [ ] Time-based greeting, "Start a Workout" CTA, recent-workouts list, "View all →"
- [ ] **As an athlete, I can view my workout history ordered by date** (`/workouts`)
  - [ ] List by date; type badge, set count, duration; empty/loading/error states
  - [ ] Pagination/limit handling (confirm API support — PRD §13)
- [ ] **As an athlete, I can open a past workout and see exactly what I did** (`/workouts/[id]` read mode)
  - [ ] Read-only exercise/set breakdown + session notes-where-present
- [ ] **As an athlete, I can edit or delete a logged workout**
  - [ ] Edit sets/entries; soft-delete the workout (confirm)
  - [ ] Backfill start/end times (depends on API accepting client-supplied times — PRD §13)

---

## Epic 6 — Reliability, Offline & Accessibility

Cross-cutting quality (PRD §5 cross-cutting, §7.3, §7.4). Hardens what Epics 2–5 built.

- [ ] **Leverage local storage / cache so the UI doesn't block on the network** (PRD §5 cross-cutting)
  - [ ] Persist TanStack Query cache; serve cached data when API is unavailable
  - [ ] Graceful degraded state when the local container is down (PRD §7.4)
- [ ] **No data loss on transient failures**
  - [ ] Retry affordances on every mutation; queued/optimistic writes reconcile on reconnect
- [ ] **Accessibility pass to WCAG 2.1 AA** (PRD §7.3)
  - [ ] Semantic HTML, labelled inputs, contrast check, full keyboard navigation
- [ ] **Responsive verification** across all §7.1 tiers (one-handed mobile primary)

---

## Epic 7 — Configuration & Deploy

Ship it (PRD §9.4–9.5, §12, §14).

- [ ] **Environment switching with zero code changes** (PRD §14)
  - [ ] Local / Preview / Production via `NEXT_PUBLIC_API_BASE_URL`; verify all three
- [ ] **API CORS coordination** — API allows the web client origin(s) (PRD §12 dependency)
- [ ] **Vercel project + preview deploys per branch** (PRD §9.1, §12)
- [ ] **Production deploy** with env vars set in dashboard; smoke-test core flows
- [ ] **README finalized** — run order, env table, deploy notes

---

## Definition of Done (per story)

- [ ] Matches the relevant PRD section and the `mock-v2.html` design language
- [ ] All API calls go through `api/*` (no `fetch` in components)
- [ ] Empty / loading / error states handled — never a blank screen
- [ ] Works one-handed at the 360–430px primary breakpoint
- [ ] Type-checks and lints clean
