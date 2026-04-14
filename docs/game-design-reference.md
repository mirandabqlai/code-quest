# Code Quest — Game Design Reference

This document captures the creative design decisions from the initial brainstorming session. Use it as a reference when generating game content for any codebase.

## The Core Metaphor: Pixel-Art Office

Every codebase becomes a **pixel-art office building**. Each major component/module is a **character** — a pixel person sitting at a desk in a department.

- Data flowing between components = mail carts, pneumatic tubes between desks
- API calls = phone calls between departments
- The database = filing cabinets in the archives
- The frontend = the reception desk facing the public
- Config/env = bulletin board in the break room

## Character Casting Rules

Each codebase gets 6-8 characters. For each major component, assign:

1. **A department** — where they sit in the office:
   - Reception (frontend, public-facing, routing)
   - Archives (database, storage, queries)
   - Translation Bureau (i18n, localization, content formatting)
   - War Room (game logic, business logic, core algorithms)
   - Scoreboard (state management, progress tracking, analytics)
   - Map Room (visualization, UI components, rendering)
   - Communications (API handlers, external services, webhooks)
   - Security (auth, permissions, validation)

2. **A sprite type** — visual identity:
   - receptionist (coral vest, reception desk with bell)
   - archivist (gold cardigan + glasses, filing cabinets)
   - translator (teal outfit, dual desks/notebooks)
   - strategist (purple uniform + badge, war table)
   - scorekeeper (orange polo, chalkboard with tallies)
   - cartographer (teal outfit, drafting table with maps)
   - engineer (gray hoodie, multiple monitors)
   - manager (blue suit, clipboard)

3. **A personality** — based on what the component actually does. The Router isn't "the routing module" — she's the perky receptionist who directs every visitor. The Database isn't "the data layer" — he's the meticulous archivist who climbs ladders to reach filing cabinets.

## The 5 Game Modes

### 1. Office Tour — "Meet the Team"
- Click-through exploration of each character
- 5-step dialogue per character: intro, what I do, who I work with, show the code, quiz
- XP: 50 per character, +100 bonus for all completed
- This is the "tutorial" that teaches codebase overview

### 2. Mail Room — "Trace the Flow"
- Drag-and-drop ordering puzzle
- Given a user action, put components in the order they're visited
- Animated mail cart travels the route on success
- 4 scenarios per codebase, each tracing a different user journey
- XP: 100-200 per scenario

### 3. Bug Hunt — "Find the Glitch"
- Side-by-side code: real code vs bugged clone
- Click the line with the bug
- Bug types: wrong variable, missing await, reversed condition, off-by-one, string vs variable, wrong method, typo
- 5-6 rounds per codebase, mix of Easy/Medium/Hard
- XP: 150-250 per round

### 4. Build the Office — "Architecture Puzzle"
- Drag character tiles to department zones
- Then draw connections between characters (data flow)
- Check validates placement with green/red feedback
- XP: 200-300

### 5. Boss Battle — "The Feature Request"
- A Product Manager presents a feature request
- Multi-stage: which characters change? → what order? → what could go wrong? → write the AI prompt
- 2 scenarios per codebase, relevant to the actual code
- XP: 300-500

## Progression System

- **XP** earned for correct answers
- **Levels:** Observer (0) → Intern (100) → Junior (300) → Senior (600) → Architect (1000) → Code Whisperer (1500)
- **Streaks:** consecutive correct answers multiply XP (up to 5x)
- **Glitch tokens:** earned from achievements, spent on hints
- **Mode unlocking:** Tour always available → Mail Room (3+ tours) → Bug Hunt (1+ mail) → Build (2+ bugs) → Boss (build complete)

## Dialogue and Tone

- Characters speak in first person about their job
- Short, punchy lines (max 2 sentences per dialogue step)
- Assume ZERO technical background
- Technical terms get plain-language explanations inline
- Wrong answers trigger character explaining what went wrong
- Right answers trigger pixel confetti + XP celebration

## UI Layout

Single-page split layout (no screen navigation):
- **Left (~45%):** Pixel-art office scene — characters at desks, idle animations, chat bubbles, folder tree overlay
- **Right (~55%):** Interaction panel — mode tabs at top, active mode content below (scrollable)
- XP bar across the full width at top

## Visual System

- 16-color NES-inspired palette (see globals.css)
- "Press Start 2P" pixel font for headers/game chrome
- Monospace for body text and code
- CRT scanline overlay
- Glitch effects on titles
- 8-bit sound effects via Web Audio API
- All animations use `steps()` timing for pixel-art feel
- Respect `prefers-reduced-motion`

## Example: Strategy Mastery App Characters

The prototype (`docs/prototype.html`) was built for the Strategy Mastery learning app and demonstrates all patterns. The 6 characters cast were:

1. **Roxi the Receptionist** (Expo Router, `app/` directory) — routes every URL
2. **Dusty the Archivist** (Supabase + queries.ts) — stores/retrieves all bilingual content
3. **Babel the Bilinguist** (i18n system) — handles EN/ZH/Both language modes
4. **General Stratego** (Game Engine) — runs turn-based strategy scenarios
5. **Tally the Scorekeeper** (Zustand stores) — tracks XP, streaks, achievements
6. **Atlas the Cartographer** (ConceptMap + UI components) — draws interactive SVG maps

This casting demonstrates the principles: each character maps to a real architectural boundary, has a memorable name/personality, and owns specific files.
