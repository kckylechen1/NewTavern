# Etheria UI Migration Agent Notes

This folder contains the “Etheria Tavern” mock UI (`new UI design/etheria-tavern/`) and the working plan for migrating SillyTavern’s backend + data model to that new frontend.

## Goal

Build a modern UI (“Etheria”) that preserves SillyTavern’s existing capabilities (characters, chats, providers, settings, files, etc.) while keeping the current UI available as a fallback during the migration.

## Key Reality Check (Important)

SillyTavern’s “backend” is mostly an API + file server. A lot of “app logic” (prompt building, chat state, extensions behavior, UI-driven workflows) currently lives in the existing frontend (`public/script.js` + `public/scripts/*`).

So this migration is **not** just “swap HTML”. It is:
- new frontend (React/Vite design) +
- a new/ported “client-core” layer (prompt building, settings, orchestration) that talks to existing `/api/*` routes.

## Repo Areas You’ll Touch

- `src/` (Express server + API endpoints) — only if we need new routes to serve the new UI entrypoint or small backend helpers.
- `public/` — where the new built frontend will be served from (recommended: `public/etheria/`).
- `new UI design/etheria-tavern/` — the mock UI source (React/Vite). Treat as the starting point for the new frontend.
- `tests/` — add/extend e2e smoke tests for the new UI routes once they exist.

## Recommended Structure (Keep It Predictable)

1. Keep mock source in a dedicated workspace folder:
   - Source: `ui/etheria/` (recommended final home)
   - Build output: `public/etheria/`

2. Keep `new UI design/etheria-tavern/` as an “imported reference snapshot” (don’t edit it long-term), and copy/rename into `ui/etheria/` when starting implementation.

## Dev Workflow (Target State)

Backend:
- From repo root: `npm start`

Etheria UI (dev server):
- `cd ui/etheria && npm install && npm run dev`
- Configure Vite proxy so `/api`, `/csrf-token`, `/characters`, `/backgrounds`, etc. forward to the SillyTavern server.

Etheria UI (production build):
- `cd ui/etheria && npm run build`
- Copy build output into `public/etheria/` (or configure Vite `build.outDir` to write there directly).
- Add a server route like `/etheria` that `sendFile`s `public/etheria/index.html` and mirrors the login redirect behavior used by `/`.

## Non-Negotiables

- Do not break existing data formats (chat `.jsonl`, character card PNG, preset JSON).
- Keep CSRF protection working: fetch `/csrf-token` and send `x-csrf-token` for state-changing requests.
- Keep the “classic UI” working until Etheria reaches parity.
- Avoid CDN dependencies in production (Tailwind CDN + Google Fonts) — bundle locally.

## Where The Plan Lives

- `new UI design/DEV_PLAN.md`

