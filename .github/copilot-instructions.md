# Copilot Instructions for Mona Mayhem

## Build, test, and lint commands

Use npm scripts from `package.json`:

- `npm install` — install dependencies
- `npm run dev` — start Astro dev server (default `http://localhost:4321`)
- `npm run build` — production build (`dist/`)
- `npm run preview` — preview production build
- `npm run astro -- <command>` — run Astro CLI subcommands

Testing and linting are **not configured yet** in this repository:

- No test script in `package.json`
- No lint script/config present (no ESLint/Biome/Prettier config in repo root)
- No existing `*.test.*` / `*.spec.*` files

## High-level architecture

This repository has two parallel surfaces:

1. **Astro app scaffold (`src/`)**  
   - `src/pages/index.astro` is the starter app page students extend during the workshop.
   - `src/pages/api/contributions/[username].ts` is the server API route scaffold for GitHub contribution proxy logic.
   - Astro is configured for server output with Node standalone adapter (`astro.config.mjs`).

2. **Published workshop site (`docs/` + `workshop/`)**  
   - `docs/index.html` and `docs/step.html` are static entry points for the workshop experience.
   - `docs/step.html` loads workshop markdown steps dynamically from `workshop/*.md` (local: `../`, hosted: GitHub raw URL).
   - GitHub Pages deployment (`.github/workflows/deploy.yml`) copies `docs/*` plus localized workshop markdown (`workshop/es`, `workshop/pt_BR`) into `_site`; it does **not** run `astro build`.

## Key conventions specific to this codebase

- **Track-specific workshop content is embedded in one markdown file** using markers:
  - `<!-- track:vscode:start --> ... <!-- track:vscode:end -->`
  - `<!-- track:cli:start --> ... <!-- track:cli:end -->`
  `docs/step.html` filters these blocks at runtime based on selected track.

- **Workshop step routing convention** maps IDs to markdown filenames:
  - `00-overview` ↔ `workshop/00-overview.md`
  - `01-setup` ↔ `workshop/01-setup.md`
  - etc.  
  Keep this naming consistent when adding steps so sidebar/nav and link rewriting keep working.

- **Localization layout is path-based**:
  - English default at root (`/`)
  - Spanish under `/es/`
  - Portuguese (Brazil) under `/pt_BR/`
  Locale switching logic in `docs/index.html` and `docs/step.html` expects these exact folder names.

- **Client persistence keys are already standardized** for docs UX:
  - `theme`
  - `monaMayhemWorkshopTrack`
  - `mona-mayhem-workshop-checks:<stepId>`
  Reuse these keys/patterns when extending existing behavior.

- **API route pattern in Astro**: keep API handlers in `src/pages/api/**` and set `export const prerender = false` for runtime endpoints.
