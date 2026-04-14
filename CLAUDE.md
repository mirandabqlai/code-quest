# Code Quest — Project Instructions

## What This Is
A web app where users paste a GitHub repo URL and get a retro pixel-art arcade game that teaches how that codebase works. No coding knowledge required.

## Status
Pre-implementation. Design spec and implementation plan are complete. The project has not been scaffolded yet — Task 1 of the plan initializes the Next.js project in this directory.

## Key Documents
- **Design Spec:** `docs/superpowers/specs/2026-04-14-code-quest-design.md` — full architecture, types, pipeline, UI
- **Implementation Plan:** `docs/superpowers/plans/2026-04-14-code-quest-implementation.md` — 15 tasks with code
- **Game Design Reference:** `docs/game-design-reference.md` — character casting, game modes, tone, pixel art rules
- **Prototype:** `docs/prototype.html` — working single-file HTML game built for the Strategy Mastery codebase. Open in a browser to see the look/feel. **This is the visual and behavioral authority for all game modes.**

## Tech Stack
- **Framework:** Next.js 15 (App Router) on Vercel
- **Database:** Vercel Postgres
- **AI:** Claude Sonnet via Anthropic SDK
- **Repo reading:** GitHub REST API (no cloning)
- **Game rendering:** React + CSS (sprite sheets, CSS transitions, no game engine)
- **Styling:** Tailwind CSS + custom pixel-art CSS system

## Architecture Overview
```
Landing page (/) → paste GitHub URL → SSE generation endpoint
  → Step 1: Read repo via GitHub API (~2s)
  → Step 2: Analyze with Claude (~15s)
  → Step 3: Generate tour content (~15s) → redirect to game
  → Step 4: Generate mail room + bug hunt (~20s, background)
  → Step 5: Generate build + boss (~15s, background)

Game page (/g/[id]) → load from Vercel Postgres → render split layout
  Left: pixel-art office scene with animated characters
  Right: interaction panel with 5 game modes
```

## Who Built This
Miranda Li — investment professional learning to code by building real products. Not an engineer by training. Code should be readable, well-commented, and educational.

---

## Execution Waves (Parallel Task Dependencies)

Tasks are organized into waves. All tasks within a wave can run in parallel (isolated worktrees). A wave cannot start until every task in the previous wave is merged.

```
Wave 0 — Foundation (sequential)
  Task 1: Project Scaffold

Wave 1 — Core Modules (4 parallel agents)
  Task 2: Database Schema + Game Types         → depends on: Task 1
  Task 3: GitHub Repo Reader                   → depends on: Task 1
  Task 7: Game UI Components (Shared)          → depends on: Task 1
  Task 9: Character Sprites + Sprite System    → depends on: Task 1

Wave 2 — Logic Layer (3 parallel agents)
  Task 4: Claude AI Prompts + Generation       → depends on: Task 2
  Task 6: XP + Progression System              → depends on: Task 2
  Task 8: Landing Page + Generation Progress   → depends on: Task 7

Wave 3 — Assembly (3 parallel agents)
  Task 5: SSE Generation API Route             → depends on: Tasks 2, 3, 4
  Task 10: Office Scene (Left Panel)           → depends on: Tasks 7, 9
  Task 11: Game Modes (Right Panel)            → depends on: Tasks 6, 7

Wave 4 — Integration (2 parallel agents)
  Task 12: GameShell + Game Page               → depends on: Tasks 10, 11
  Task 13: Implement Game Modes (Full)         → depends on: Tasks 2, 11

Wave 5 — End-to-End (sequential)
  Task 14: End-to-End Wiring + Database Setup

Wave 6 — Ship (sequential, needs Miranda)
  Task 15: Deploy to Vercel
```

### Merge Protocol Between Waves
1. Each agent works in a git worktree on a feature branch (`task-N-description`)
2. When all agents in a wave complete, merge each branch into `main` sequentially
3. Resolve any merge conflicts (should be rare — tasks touch different files)
4. Next wave agents start from the updated `main`

---

## Decision Rules (Autonomous Agents)

These rules exist so agents can make decisions without waiting for Miranda.

### Always Do
- **Follow the implementation plan literally.** The plan has exact file paths, exact code. Write what it says. If you think something in the plan is wrong, add a `// TODO: [concern]` comment and keep going.
- **Consult the prototype for visual/behavioral questions.** `docs/prototype.html` is the working reference. If the plan doesn't specify how something should look or behave, match the prototype.
- **Consult the design spec for architectural questions.** `docs/superpowers/specs/2026-04-14-code-quest-design.md` has the full types, data shapes, and pipeline design.
- **Write code now, integrate later.** If your task needs a database connection, API key, or another module that doesn't exist yet, import it as if it exists. The types and interfaces are defined in the plan — use them. Real integration happens in Task 14.
- **Commit after completing your task.** One commit per task, message format: `feat: <short description>`.

### Never Do
- **Don't add features not in the plan.** No extra config options, no "nice to have" improvements, no additional error handling beyond what the spec describes.
- **Don't refactor another task's code.** If you see something questionable in a file owned by another task, leave it alone. Add a `// TODO` if it blocks you.
- **Don't install extra dependencies.** The plan specifies all npm packages in Task 1. If you think you need something else, use what's available or leave a `// TODO: may need [package] for [reason]`.
- **Don't block on missing env vars.** Code should compile and be structurally correct without runtime secrets. Don't add fallback/mock logic — just import and use.

### When In Doubt
- Simpler is better. Pick the approach with fewer moving parts.
- Match existing patterns. If 3 files already do it one way, do it that way.
- Leave a `// TODO` and keep moving. A TODO is always better than being stuck.

---

## Code Conventions

All agents must follow these so parallel work produces consistent code.

### File Structure
```
'use client' directive (if needed — only for components with hooks/interactivity)
↓
External imports (react, next, libraries)
↓
Internal imports (@/ path alias, always)
↓
Types/interfaces (if local to this file)
↓
Constants
↓
Component or function (default export for components, named exports for lib)
```

### React Components
- One component per file. File name matches component name (PascalCase).
- Default export for components: `export default function ComponentName()`
- Named exports for library modules: `export function functionName()`
- Props interface defined in same file, named `ComponentNameProps`
- Use `'use client'` only when the component uses hooks, event handlers, or browser APIs. Server components are the default.

### TypeScript
- Strict mode. No `any` types — use the interfaces from `lib/game/types.ts`.
- Import types with `import type { ... }` when importing only types.
- Path alias `@/` for all internal imports (e.g., `@/lib/game/types`, `@/components/game/ui/PixelButton`).

### CSS / Styling
- Tailwind utility classes for layout and spacing (flex, padding, margin, sizing).
- CSS custom properties (`var(--neon-green)`, etc.) for the pixel design system colors and fonts. These are defined in `app/globals.css`.
- Inline `style={}` for dynamic values, font-family, and pixel-art-specific properties.
- Never use arbitrary Tailwind color values — always reference the CSS variables.
- The design system palette is defined in globals.css (created in Task 1). All color references should use those variables.

### Naming
- Files: PascalCase for components (`PixelButton.tsx`), kebab-case for lib modules (`read-repo.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- CSS variables: kebab-case with prefix (`--neon-green`, `--bg-panel`)
- Game mode IDs: lowercase single word (`tour`, `mailroom`, `bughunt`, `build`, `boss`)

---

## Error & Escalation Policy

### Keep Going (don't block)
- TypeScript type errors from modules that don't exist yet → import as if they exist
- Missing environment variables → code should reference `process.env.VAR_NAME` directly
- Uncertain about exact pixel sizes, colors, spacing → match the prototype or use the CSS variables
- A function from another task doesn't exist yet → import it by the name in the plan

### Flag with TODO (keep going, but mark it)
- Plan says to do X but it seems like it won't work → `// TODO: plan says X, but [concern]`
- Need a dependency not in the plan → `// TODO: may need [package] for [reason]`
- Ambiguity in the spec that could go either way → pick one, `// TODO: assumed [choice], verify`

### Actually Block (stop and report)
- A file you need to create already exists with different content than expected
- Merge conflict that changes the meaning of your code
- The plan's code has a syntax error that prevents the file from being valid TypeScript

---

## Environment Strategy

### Phase 1: Build Without Runtime (Waves 0–4)
All code is written to be structurally correct and type-safe without any running services.
- **No database needed yet.** `@vercel/postgres` imports are fine — they'll error at runtime but that's expected.
- **No API keys needed yet.** Claude and GitHub calls will fail at runtime. That's fine.
- **No `npm run dev` needed.** Agents should verify with `npx tsc --noEmit` (type checking) when useful, but runtime testing waits for Task 14.
- **Verification:** Each task should compile (`tsc --noEmit` on its files). Full build verification happens in Wave 5.

### Phase 2: Integration (Wave 5 — Task 14)
Miranda provides API keys and sets up Vercel Postgres. End-to-end flow is tested.

### Phase 3: Deploy (Wave 6 — Task 15)
Push to GitHub, deploy to Vercel. Miranda drives this.

---

## Visual Authority: The Prototype

`docs/prototype.html` (118KB) is a fully working single-file HTML/CSS/JS game built for the Strategy Mastery codebase. It demonstrates:
- The exact pixel-art aesthetic (colors, fonts, CRT scanlines, glitch effects)
- All 5 game modes with full interactivity
- Character sprites and animations
- The split layout (office left, interaction right)
- XP bar, streaks, achievements, level-up celebrations
- Sound effects via Web Audio API
- Drag-and-drop for Mail Room and Build modes
- Quiz interactions for Office Tour
- Code diff display for Bug Hunt
- Multi-stage flow for Boss Battle

**When building any UI component, open this file in a browser and match its look and feel.** The React components are the production version of what this prototype demonstrates.

---

## Working Conventions
- Follow the implementation plan task by task
- Commit after each task with format: `feat: <description>`
- The prototype HTML file is the visual reference — the production app should match its look and feel
- Pixel art aesthetic is non-negotiable: CRT scanlines, glitch effects, 8-bit sounds, pixel fonts
- All game content is generated by Claude AI — the React components are content-agnostic shells that render whatever JSON they receive
- Comments should explain WHY, not WHAT. Miranda is learning — readable code matters.
