# Etheria UI ↔ SillyTavern Migration Plan

## 0) Context (What We’re Migrating)

### Current SillyTavern Architecture (What exists today)

- Backend: Node/Express (`server.js` → `src/server-main.js`), serves:
  - Static frontend assets from `public/`
  - User content routes like `/characters/*`, `/backgrounds/*` from the user data root (`src/users.js`)
  - A large set of private JSON APIs under `/api/*` (`src/server-startup.js`)
  - CSRF token endpoint at `/csrf-token`
- Frontend: “classic UI” is a large DOM-based app:
  - Main entry: `public/index.html`
  - App logic: `public/script.js` + many ES modules under `public/scripts/`
  - Lots of logic is *frontend-only*: prompt building, injection rules, extension hooks, chat behaviors

### New “Etheria Tavern” UI (What you provided)

Located at:
- `new UI design/etheria-tavern/` (React 19 + TypeScript + Vite)

Notes:
- It currently uses Gemini directly (`services/geminiService.ts`) and Tailwind CDN in `index.html`.
- It is a **mock UI**: feature coverage does not match SillyTavern yet.

## 1) Strategy (How we migrate without breaking everything)

### Core Strategy: “Parallel UI” + Incremental Parity

1. **Keep the existing UI** running at `/` (classic).
2. Add **a new UI entrypoint** (Etheria) at `/etheria` (or similar).
3. Build Etheria feature-by-feature against existing SillyTavern APIs.
4. Only consider switching default UI once parity + testing is strong.

This reduces risk and allows you to keep using SillyTavern while Etheria is under development.

### Critical Constraint: “Backend-only migration” is not enough

To match SillyTavern functionality, we will need to port/recreate logic currently living in the classic frontend, not only call the backend.

So the work splits into:
- **Etheria UI** (React components, layout, UX)
- **Client Core** (data models, API wrapper, prompt builder, streaming parser, chat persistence)

## 2) Milestones & Tasks (Do these in order)

Each task includes: goal, deliverables, acceptance criteria.

### Milestone A — Scaffold Etheria inside SillyTavern

#### Task 1 — Create a real Etheria workspace in-repo

Goal:
- Make Etheria editable/buildable as part of this repo (not just a zip snapshot).

Deliverables:
- New folder: `ui/etheria/` containing the Vite React app (copied from `new UI design/etheria-tavern/`)
- A short README in `ui/etheria/` explaining dev/prod flow.

Acceptance:
- `npm install` works in `ui/etheria/`
- `npm run dev` starts Etheria in isolation (even before backend wiring)

#### Task 2 — Remove CDN dependencies (production-safe UI assets)

Goal:
- Etheria must run without external CDNs (SillyTavern users commonly run offline).

Deliverables:
- Replace Tailwind CDN with local Tailwind build (or equivalent local CSS):
  - add `tailwindcss`, `postcss`, `autoprefixer` to `ui/etheria/`
  - add `tailwind.config.*`, `postcss.config.*`, `src/index.css`
  - update `index.html` to remove CDN scripts
- Replace Google Fonts CDN:
  - either use SillyTavern’s existing fonts (Noto) or bundle Inter/JetBrains locally

Acceptance:
- Etheria builds with `npm run build` with no network requests required at runtime.

#### Task 3 — Build output served by SillyTavern

Goal:
- Open Etheria UI from the SillyTavern server.

Deliverables:
- Vite build outputs into `public/etheria/` (either by `outDir` config or copy step)
- Add a backend route (recommended) in `src/server-main.js`:
  - `GET /etheria` returns `public/etheria/index.html`
  - Mirrors the login redirect behavior used by `/` (if not logged in, redirect to `/login`)

Acceptance:
- Visiting `http://<server>/etheria` loads the Etheria shell page.

### Milestone B — Establish a clean API client (CSRF + auth + errors)

#### Task 4 — Implement `stClient` fetch wrapper in Etheria

Goal:
- Centralize request headers, CSRF token handling, JSON parsing, and auth redirects.

Deliverables (in `ui/etheria/`):
- `src/api/stClient.ts`:
  - `getCsrfToken()` calls `/csrf-token`
  - `stFetch(path, { method, body })` injects `x-csrf-token`, `Content-Type: application/json`, and handles 401/403 gracefully

Acceptance:
- A simple “Ping” call (e.g. `POST /api/ping`) succeeds when logged in.
- When not logged in, UI detects 401 and navigates user to `/login` (or shows a login prompt).

#### Task 5 — Add Vite dev proxy to SillyTavern backend

Goal:
- Run Etheria dev server while using SillyTavern backend without CORS pain.

Deliverables:
- Vite `server.proxy` routes:
  - `/api` → backend
  - `/csrf-token` → backend
  - `/characters`, `/backgrounds`, `/assets`, `/user/*` → backend

Acceptance:
- With backend running, Etheria dev server can call `/api/settings/get` through the proxy.

### Milestone C — Data model mapping (Characters, Chats, Messages)

#### Task 6 — Map SillyTavern character data to Etheria’s UI model

Goal:
- Replace static `CHARACTERS` with real characters from `/api/characters/all`.

Deliverables:
- `src/api/characters.ts` that calls `POST /api/characters/all`
- Map to Etheria display model:
  - id: `avatar` (filename) or `data?.id` if present
  - name: `name`
  - avatar URL: `/characters/${avatar}`
  - description: `description`
  - first message: `first_mes`
  - system prompt seed: start from `description/personality/scenario/mes_example` (initially minimal)

Acceptance:
- Etheria sidebar lists the same characters you see in classic UI.
- Clicking a character updates header/avatar/background (background optional in early phase).

#### Task 7 — Render existing chats (read-only)

Goal:
- Load and render an existing chat file for the selected character.

Deliverables:
- `src/api/chats.ts`:
  - list chats: `POST /api/characters/chats` (simple mode)
  - load chat: `POST /api/chats/get` (requires `avatar_url` + `file_name`)
- Map `ChatMessage` → Etheria `Message`:
  - role: `is_user ? user : model`
  - content: `mes` (fall back to `extra.display_text` if relevant)
  - timestamp: `send_date` or `Date.now()` fallback

Acceptance:
- Selecting a character loads its most recent chat (or prompts to choose if multiple).
- Messages render with user/assistant styling.

### Milestone D — “Send message” using SillyTavern backends (streaming)

#### Task 8 — Basic generation via `/api/backends/chat-completions/generate`

Goal:
- Replace Gemini generation with SillyTavern’s backend generation pipeline.

Deliverables:
- `src/api/generate.ts`:
  - Build a minimal OpenAI-style `messages` array:
    - system: a simple compiled character prompt
    - user/assistant history from loaded chat
    - new user message
  - Call `POST /api/backends/chat-completions/generate` with:
    - `chat_completion_source` and `model` read from existing SillyTavern settings (initially “read-only config”)
    - `stream: true`
    - generation params: temperature/top_p/max_tokens etc
- Implement streaming parser:
  - reuse the same event-stream shape SillyTavern uses (SSE-like chunks)
  - update the last assistant message as chunks arrive

Acceptance:
- Sending a message produces a streaming assistant response in Etheria UI.
- Abort/cancel works (optional in first pass).

#### Task 9 — Persist chat back to SillyTavern storage

Goal:
- After message generation, save the updated chat `.jsonl` so classic UI sees it too.

Deliverables:
- Implement save using `POST /api/chats/save` with:
  - `avatar_url` (character avatar filename)
  - `file_name` (existing or new)
  - `chat` array of `ChatMessage` objects (proper fields)
- Decide naming:
  - If no chat exists, create a new file name (timestamp-based) consistent with SillyTavern patterns.

Acceptance:
- Reloading in classic UI shows the newly generated messages.

### Milestone E — Bring back “missing” core UX features

#### Task 10 — Chat controls parity (minimum set)

Goal:
- Implement the high-frequency chat actions users expect.

Deliverables:
- New UI affordances for:
  - Regenerate last response (call generate again with same history)
  - Delete last message(s)
  - Edit last user message and re-run
  - Scroll lock / jump to bottom

Acceptance:
- These actions match classic UI outcomes and persist to the same chat file.

#### Task 11 — Settings: “read existing config” → “edit config”

Goal:
- Don’t reimplement all settings at once; start with what’s required to chat.

Deliverables:
- Load via `POST /api/settings/get`
- Edit & save the minimal subset needed for chat completions:
  - model selection
  - streaming toggle
  - temperature/top_p/max_tokens
  - selected “backend source” (OpenAI/OpenRouter/Claude/etc.)
- Persist via the same route classic UI uses (likely `/api/settings/save` or similar; confirm in code when implementing)

Acceptance:
- Changing settings in Etheria affects generation immediately and is still respected by classic UI.

### Milestone F — Full parity areas (larger workstreams)

These are big. Treat each as its own multi-task track once Milestone D/E is stable.

- Characters:
  - import/export, edit card fields, tags/favs, thumbnail cache, advanced definitions
- World Info / Lorebooks:
  - list world files (`/api/worldinfo/*`), inject rules, depth/position, token budgeting
- Personas:
  - manage personas, connect to prompts, per-chat persona selection
- Groups:
  - group chats, group member order, per-member disable/speak, group metadata
- Attachments & media:
  - file attachments, images/videos, inline gallery, captioning, SD generation UI
- Extensions:
  - decide scope: either “not supported” initially or design a new extension API not tied to DOM IDs
- Theming:
  - either map Etheria to SillyTavern theme system or create a parallel theming system for Etheria only

Acceptance (for “parity”):
- A user can switch to Etheria and complete the same workflows as classic UI without returning to classic.

## 3) Mapping: Etheria Mock → SillyTavern Concepts

- Etheria “Characters” → SillyTavern character cards (`/api/characters/*`, assets at `/characters/*`)
- Etheria “Messages” → SillyTavern `ChatMessage` lines in `.jsonl` (`/api/chats/get|save`)
- Etheria “Settings Panel” → SillyTavern settings + presets (`/api/settings/get`, `/api/presets/*`, `/api/secrets/*`)
- Etheria “World Info / Lorebook” → SillyTavern world info files + injection logic (`/api/worldinfo/*`)
- Etheria “Generate” → SillyTavern backend generation endpoints (`/api/backends/chat-completions/generate`, etc.)

## 4) Definition of Done (Practical)

Etheria can be considered “ready to replace classic” when:
- All daily-driver chat flows work (send, regen, edit, delete, manage chats)
- Character management is usable (select, import, edit, tag)
- Settings for major providers are usable (OpenAI/OpenRouter/Claude at minimum)
- World info + persona + prompt building match classic behavior closely enough
- A small e2e suite runs against `/etheria` to prevent regressions

