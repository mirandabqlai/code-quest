# Code Quest — Design Spec

**Date:** 2026-04-14
**Author:** Miranda Li + Claude
**Status:** Approved

## What Is This

A web app where users paste a GitHub repo URL and get a retro pixel-art arcade game that teaches how that codebase works. No coding knowledge required.

Paste URL → AI analyzes the repo → pixel-art office with characters representing each component → 5 game modes teach architecture, data flow, code review, and feature planning through play.

## Target Users

1. **Primary: Vibe coders** — people who use AI to build software but want to understand what's happening under the hood. They want to steer AI tools better, detect hallucinations, debug when AI gets stuck, and talk to engineers confidently.

2. **Secondary: Educators** — teachers who want to gamify CS education. "Here, play this game to learn how React works."

**Assume zero technical background.** Every concept gets explained in plain language through character dialogue.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — paste a GitHub URL, hit Generate |
| `/g/[id]` | The game — shareable, playable by anyone |

Two routes. No auth screens, no dashboard, no settings.

### Landing Page (`/`)
Pixel-art aesthetic matching the game. Dark background, CRT scanlines, pixel font. Contains:
- Title: "CODE QUEST" in glitch-animated pixel text
- Subtitle: "Turn any codebase into a game"
- A single URL input field with a "GENERATE" pixel button
- Below: "Or sign in with GitHub for private repos" link (OAuth)
- Below: a few example games as clickable cards ("Try: facebook/react, vercel/next.js")

### Generation Progress
After clicking Generate, the landing page transitions to a progress view (same page, no navigation). Shows:
- An animated pixel-art loading scene (character at a desk, "analyzing...")
- Step-by-step status updates streamed via SSE: "Reading repo...", "Casting characters...", "Writing dialogues...", "Ready!"
- When Step 3 completes (tour content ready), auto-redirects to `/g/[id]` where the game is already playable

## Tech Stack

- **Framework:** Next.js 15 (App Router) on Vercel
- **Database:** Vercel Postgres (one table, stores generated game JSON)
- **AI:** Claude Sonnet via Anthropic SDK (codebase analysis + content generation)
- **Repo reading:** GitHub REST API (file tree + selective file fetch, no cloning)
- **Private repos:** GitHub OAuth (added to generation flow only)
- **Game rendering:** React + CSS (sprite sheets for characters, CSS transitions for walking, no game engine)
- **Styling:** Tailwind CSS + custom pixel-art CSS system
- **Hosting tier:** Vercel Pro ($20/month) — required because the SSE generation endpoint runs ~65 seconds, exceeding the Hobby plan's 60s timeout. Pro allows 300s.

## Generation Pipeline

When a user pastes a repo URL and clicks Generate, a streaming API route (`/api/generate`) orchestrates 5 steps:

### Step 1: Read Repo (~2 seconds)
- Fetch file tree via GitHub REST API
- Skip: `node_modules`, `.git`, `dist`, `build`, `vendor`, `__pycache__`, lock files
- Only read code files: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.java`, `.rb`, `.swift`, `.kt`, `.vue`, `.svelte`, plus `README`, `package.json`, `Cargo.toml`, etc.
- Identify key files: README, config files, entry points, top-level source
- Fetch ~30-50 key files (first 200 lines each)
- Output: a "codebase snapshot" (file tree + key contents)

### Step 2: Analyze Codebase (~15 seconds, Claude Sonnet)
- Input: codebase snapshot + analysis prompt
- Output: character casting (6-8 actors), their files, roles, data flows, interesting patterns, tech stack
- Save `analysis` column to DB
- Stream status to client: "Analyzing architecture..."

### Step 3: Generate Tour + Map (~15 seconds, Claude Sonnet)
- Input: analysis output + generation prompt
- Output: character dialogue trees (5 steps each with quizzes), folder ownership map, data flow descriptions
- Save `tour_content` column to DB
- Stream to client → **user can start playing now**

### Step 4: Generate Mail Room + Bug Hunt (~20 seconds, Claude Sonnet)
- Input: analysis + code snippets + generation prompt
- Output: 4 mail room scenarios with correct ordering, 5-6 bug hunt rounds with original/bugged code pairs
- Save `modes_content` column to DB
- Stream to client → modes unlock in game

### Step 5: Generate Build + Boss (~15 seconds, Claude Sonnet)
- Input: analysis + generation prompt
- Output: zone definitions with correct placements, 2 boss battle scenarios with multi-stage interactions
- Save `advanced_content` column to DB
- Stream to client → modes unlock in game

**Total generation time:** ~65 seconds. User starts playing at ~30 seconds.

**Streaming mechanism:** Server-Sent Events (SSE) from the API route. Each completed step sends a JSON event to the browser. The game component renders modes as they arrive.

**Cost per game:** ~$0.50-1.00 in Claude Sonnet API calls.

**Caching:** If a game already exists for a repo URL, serve it immediately (no regeneration). The `games` table acts as a cache.

## Database Schema

One table in Vercel Postgres:

```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,              -- short hash (8 chars, used in /g/[id])
  repo_url TEXT NOT NULL UNIQUE,    -- full github URL
  repo_name TEXT,                   -- "owner/repo" display name
  status TEXT DEFAULT 'pending',    -- pending | reading | analyzing | generating | complete | error
  error_message TEXT,               -- null unless status = error
  analysis JSONB,                   -- Step 2 output: characters, flows, patterns
  tour_content JSONB,               -- Step 3 output: dialogues, quizzes, folder map
  modes_content JSONB,              -- Step 4 output: mail room + bug hunt
  advanced_content JSONB,           -- Step 5 output: build + boss battle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INT DEFAULT 0
);

CREATE INDEX idx_games_repo_url ON games(repo_url);
```

Content is split across 4 JSONB columns so we can save/load progressively. When a user visits `/g/[id]`, we load whatever exists — if only `tour_content` is filled, they play that while the rest generates.

## Game JSON Shape

```typescript
// What Claude generates — the complete game content for one repo
interface GameContent {
  meta: {
    repoName: string;            // "facebook/react"
    repoDescription: string;     // from README or package.json
    techStack: string[];         // ["TypeScript", "React", "Node.js"]
    generatedAt: string;         // ISO date
  };

  // Characters (6-8 actors)
  characters: {
    id: string;                  // "router", "database", etc.
    name: string;                // "Roxi"
    title: string;               // "The Receptionist"
    color: string;               // hex color for their accent
    department: string;          // "reception", "archives", etc.
    files: string[];             // real file paths they own
    summary: string;             // one-line description of their role
    spriteType: string;          // maps to a sprite sheet variant
  }[];

  // Project structure with ownership
  folderTree: {
    path: string;
    indent: number;
    type: 'folder' | 'file';
    owner?: string;              // character id
    description?: string;
    note?: string;
  }[];

  // Data flows (4 user journeys)
  dataFlows: {
    id: string;
    label: string;               // "User Opens a Page"
    steps: {
      characterId: string;
      action: string;            // what happens at this step
    }[];
  }[];

  // Office Tour: per-character dialogue trees
  officeTour: {
    characterId: string;
    steps: (
      | { type: 'talk'; text: string }
      | { type: 'code'; code: string; file: string; english: string }
      | { type: 'quiz'; question: string; options: string[]; correct: number;
          explainRight: string; explainWrong: string }
    )[];
  }[];

  // Mail Room: drag-and-drop flow tracing
  mailRoom: {
    id: string;
    title: string;
    brief: string;               // scenario description
    correctOrder: string[];      // character ids in correct order
    stopDialogue: string[];      // what each character says when the cart arrives
  }[];

  // Bug Hunt: spot-the-difference code review
  bugHunt: {
    id: string;
    title: string;
    file: string;                // real file path
    difficulty: 'Easy' | 'Medium' | 'Hard';
    explainerCharId: string;
    original: string[];          // lines of real code
    bugged: string[];            // lines with one bug introduced
    bugLine: number;             // 0-indexed line with the bug
    explanation: string;         // what the bug would cause
  }[];

  // Build the Office: architecture puzzle
  buildOffice: {
    zones: { id: string; name: string; description: string }[];
    correctPlacements: Record<string, string>; // zoneId → characterId
    connections: { from: string; to: string; label: string }[];
  };

  // Boss Battle: feature request scenarios
  bossBattle: {
    id: string;
    title: string;
    brief: string;
    stages: (
      | { type: 'select'; instruction: string;
          options: { characterId: string; correct: boolean; explanation: string }[] }
      | { type: 'order'; instruction: string;
          correctOrder: string[]; stopDialogue: string[] }
      | { type: 'choice'; instruction: string; question: string;
          options: { text: string; correct: boolean }[];
          explanation: string }
      | { type: 'prompt'; instruction: string; question: string;
          keywords: { words: string[]; points: number; label: string }[];
          idealAnswer: string }
    )[];
  }[];
}
```

## Game UI: Single-Page Split Layout

The game page (`/g/[id]`) is a single screen with a persistent left/right split:

```
+---XP BAR (full width, always visible)---+
|                    |                     |
|   OFFICE SCENE     |  INTERACTION PANEL  |
|   (left, ~45%)     |  (right, ~55%)      |
|                    |                     |
|   Pixel-art office |  Active game mode:  |
|   with animated    |  - Tour dialogue    |
|   characters at    |  - Code panels      |
|   desks.           |  - Drag-and-drop    |
|                    |  - Quizzes          |
|   Characters walk  |  - Boss stages      |
|   to folders.      |                     |
|   Chat bubbles     |  Mode tabs at top   |
|   float near them. |  of this panel.     |
|                    |                     |
+--------------------+---------------------+
```

### Left Panel: Office Scene
- Pixel-art office background (desks, monitors, filing cabinets)
- 6-8 character sprites with idle animations (typing, filing, etc.)
- Characters are 32x32 pixel sprites rendered via CSS sprite sheets
- Clicking a character activates their tour in the right panel
- When a character is speaking, they have a chat bubble above their head
- Characters walk (CSS transition on position) to folder locations when explaining
- A semi-transparent folder tree overlay shows the project structure on the "floor"
- Always visible — never hidden or replaced by game modes

### Right Panel: Interaction Panel
- Mode selector tabs at top (Tour, Mail Room, Bug Hunt, Build, Boss)
- Locked modes show a pixel padlock and XP requirement
- Active mode content fills the panel (scrollable)
- Quizzes, drag-and-drop, code panels, boss stages all render here
- Dialogue text appears here (synced with character chat bubbles on the left)

### Responsive (Mobile)
- Office scene becomes a compact horizontal strip at top (~120px tall)
- Characters shown as small sprites in a row
- Interaction panel fills the rest of the screen below
- Drag-and-drop uses touch events

## Pixel Art Approach

### Character Sprites
- 32x32 pixel PNG sprite sheets, 4 frames per character: idle-1, idle-2, walk-left, walk-right
- CSS `background-position` + `animation: steps()` cycles frames
- Each character has a distinct outfit color matching their role
- Generic base sprite with color variations (shirt color, accessory) — Claude specifies `spriteType` and the app maps it to a sprite variant
- 8 pre-made sprite variants created as part of implementation: receptionist (coral), archivist (gold + glasses), translator (teal), strategist (purple + badge), scorekeeper (orange), cartographer (teal + map), engineer (gray), manager (blue). Sprites are hand-drawn pixel art in a shared PNG sprite sheet, created using a pixel art tool (Aseprite, Piskel, or drawn in code via CSS box-shadow). Claude's `spriteType` field maps each character to one of these 8 variants.

### Office Environment
- Static pixel-art background image for the office (or CSS-drawn with borders/backgrounds)
- Furniture elements: pixel desks, monitors, filing cabinets, bookshelves
- These are static — no animation needed
- The office layout adapts to the number of characters (6 = 2 rows of 3, 8 = 2 rows of 4)

### Animations
- Idle: 2-frame CSS `steps(2)` animation, ~1s loop (typing, filing, etc.)
- Walking: CSS transition on `left`/`top` properties, ~0.5s duration. Walking sprite frames play during transition.
- Chat bubble: fade-in with a small bounce, positioned above character's head
- All animations respect `prefers-reduced-motion`

### Visual System
- 16-color NES-inspired palette (from prototype)
- "Press Start 2P" pixel font for headers and game chrome
- Monospace for body text and code
- CRT scanline overlay (CSS `repeating-linear-gradient`, `pointer-events: none`)
- Glitch effects on titles (CSS `clip-path` animation)
- 8-bit sound effects via Web Audio API oscillators (mute toggle, opt-in after first click)

## Progression System

- **XP** earned for correct answers, completed challenges
- **Levels:** Observer (0) → Intern (100) → Junior (300) → Senior (600) → Architect (1000) → Code Whisperer (1500)
- **Streak bonuses:** consecutive correct answers multiply XP (up to 5x)
- **Glitch tokens:** earned from achievements, spent on hints
- **Achievements:** 11 badges for milestones
- **Mode unlocking:** Tour always available. Other modes unlock based on completion (Tour 3+ chars → Mail Room, etc.)
- All state lives in browser memory (single session). Shareable link reloads the game content, not progress.

## GitHub Integration

### Public Repos (no auth)
- User pastes any `github.com/owner/repo` URL
- Server reads via GitHub REST API using a server-side token (for higher rate limits: 5000 req/hour)
- No user sign-in needed

### Private Repos (OAuth)
- User clicks "Sign in with GitHub" on the landing page
- Standard OAuth flow → access token stored in HTTP-only cookie (session only)
- Token used server-side to read the private repo
- Token is NOT stored in the database — session only
- Code content is NOT stored — only the generated game JSON

## Error Handling

| Scenario | Response |
|----------|----------|
| Invalid URL format | Inline error: "That doesn't look like a GitHub repo URL" |
| Repo not found / 404 | "Couldn't find that repo. Check the URL or make sure it's public." |
| Private repo, no auth | "This is a private repo. Sign in with GitHub to analyze it." + OAuth button |
| Repo too large (>1000 code files) | "This repo is very large. Try pointing to a specific subdirectory or a smaller repo." |
| Empty repo / no code files | "This repo doesn't have enough code to generate a game." |
| Claude API fails mid-generation | Save partial results. Show "X of 5 modes ready" with retry button for remaining modes. |
| GitHub API rate limit | "We're getting a lot of requests. Try again in a few minutes." |
| Game JSON corrupted / invalid | Show whatever modes loaded successfully. Log error for debugging. |

## Security

- Code from repos is sent to Claude API for analysis but NOT stored in the database — only the generated game content is persisted
- GitHub OAuth tokens stored in HTTP-only session cookies, never in DB
- All code displayed in Bug Hunt mode is HTML-escaped to prevent XSS
- Server-side GitHub token stored in environment variable, never exposed to client
- Generation endpoint rate-limited by IP (no auth = basic abuse prevention)

## What's NOT in MVP

- User accounts / persistent auth
- Payment / billing
- Rate limiting beyond basic IP throttling
- Re-generation when repo gets new commits
- Custom game settings or difficulty selection
- Mobile native app
- Analytics / admin dashboard
- Multiplayer / leaderboards
- Custom sprite uploads

## Project Structure

```
code-quest/
  app/
    page.tsx                        — Landing page
    g/[id]/page.tsx                 — Game page
    api/
      generate/route.ts             — SSE generation endpoint
      github/callback/route.ts      — OAuth callback
  components/
    landing/
      RepoInput.tsx                 — URL input + Generate button
      GenerationProgress.tsx        — Animated progress steps
    game/
      GameShell.tsx                 — Split layout wrapper
      OfficeScene.tsx               — Pixel office (left panel)
      InteractionPanel.tsx          — Mode content (right panel)
      CharacterSprite.tsx           — Animated pixel character
      ChatBubble.tsx                — Speech bubble near character
      FolderOverlay.tsx             — Folder tree on office floor
      modes/
        OfficeTour.tsx
        CodebaseMap.tsx
        MailRoom.tsx
        BugHunt.tsx
        BuildOffice.tsx
        BossBattle.tsx
      ui/
        PixelButton.tsx
        XPBar.tsx
        DragDrop.tsx
        SoundToggle.tsx
  lib/
    ai/
      prompts.ts                    — All Claude prompt templates
      analyze-repo.ts               — Codebase → character casting
      generate-tour.ts              — Characters → dialogues + quizzes
      generate-modes.ts             — Analysis → mail room + bug hunt
      generate-advanced.ts          — Analysis → build + boss
    github/
      read-repo.ts                  — File tree + selective file fetch
      oauth.ts                      — OAuth helpers
    db/
      schema.sql                    — Vercel Postgres DDL
      queries.ts                    — CRUD for games table
    game/
      types.ts                      — GameContent TypeScript interfaces
      xp.ts                         — XP calc, levels, achievements
      sprites.ts                    — Sprite variant → sheet mapping
  public/
    sprites/                        — Character sprite sheet PNGs
