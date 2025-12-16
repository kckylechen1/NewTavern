# Etheria UI (New SillyTavern UI)

This folder contains the **Etheria** React + Vite UI scaffold (copied from `new UI design/etheria-tavern/`). It is currently a mock UI and will be migrated to use SillyTavern’s existing backend APIs.

## Dev (UI only)

1. `cd ui/etheria`
2. `npm install`
3. `npm run dev`

Vite serves the app at `http://localhost:3000`.

## Dev (with SillyTavern backend)

For now, Etheria runs standalone. In the next tasks we will add a Vite proxy so it can call the SillyTavern server APIs (`/api/*`, `/csrf-token`, `/characters/*`, etc.) while you develop.

## Build (production assets)

- `npm run build` outputs to `dist/` (will be wired into SillyTavern `public/` in later tasks).

## Notes

- `.env.local` currently contains a placeholder `GEMINI_API_KEY` for the mock generation flow; this will be removed once we switch to SillyTavern’s generation endpoints.
