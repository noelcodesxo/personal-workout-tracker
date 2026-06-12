# Astron — Workout Tracker Web Client

Mobile-first web app for logging and reviewing training. Client for the Workout Tracker REST API.

## Run locally

1. Start the API container (from project root):
   ```bash
   docker compose up
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the env template and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Workout Tracker API | `http://localhost:8000` |
   | `NEXT_PUBLIC_USER_ID` | Single-user ID for v1 (no login) | `1` |

4. Start the dev server:
   ```bash
   npm run dev
   ```

   App runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format `src/` |

## Deployment (Vercel)

- Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_USER_ID` in the Vercel environment variable dashboard per environment (Preview / Production).
- Preview deploys are created automatically per branch.

## Architecture

```
src/
├── app/          # Next.js App Router — routes and layouts only
├── api/          # API client layer — the ONLY place that talks HTTP
├── components/   # Reusable UI (ui/, exercise/, routine/, workout/, layout/)
├── design/       # Design tokens (Astron design system)
├── security/     # Auth scaffolding (inert in v1; ready for real auth)
├── lib/          # Cross-cutting utils and TanStack Query hooks
└── config/       # Env config — validated at startup, no scattered process.env
```
