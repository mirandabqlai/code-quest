# Code Quest v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Code Quest into a living pixel-art office where rooms ARE codebase folders, Mike the Office Manager gives guided tours, and teaching quality matches codebase-to-course (code-to-English, group chats, glossary tooltips, data flow animations).

**Architecture:** Canvas 2D engine renders the office (tiles, sprites, furniture, z-sorting). React handles all UI overlays (dialogue, tabs, teaching components). AI prompts are rewritten to generate room layouts, Mike's tour, code-to-English blocks, and per-room challenges. The game flow changes from "6 global modes" to "Mike's tour → free room exploration with tabbed mini-hubs."

**Tech Stack:** Next.js 16 (App Router), Canvas 2D API, React 19, TypeScript 5.9, Tailwind CSS 4, Claude Sonnet via Anthropic SDK, Vercel Postgres.

**Spec:** `docs/superpowers/specs/2026-04-14-code-quest-v2-design.md`

---

## File Structure

### New Files

```
lib/game/types-v2.ts                     — All v2 TypeScript interfaces
lib/engine/
  game-loop.ts                           — requestAnimationFrame loop, delta time
  tile-map.ts                            — Room grid, tile types, floor colors
  renderer.ts                            — Z-sorted canvas drawing
  camera.ts                              — Zoom levels, smooth pan, room focus
  office-state.ts                        — Central state: rooms, characters, furniture positions
lib/engine/sprites/
  sprite-data.ts                         — SpriteData type (2D hex array), palette swap, cache
  character-sprites.ts                   — 4 base character templates × animation states
  furniture-sprites.ts                   — Furniture sets per room type
lib/ai/
  prompts-v2.ts                          — All v2 prompt templates
  generate-mike-tour.ts                  — Mike's tour content generation
lib/ai/generate-room-content.ts          — Per-room content (story, code, challenges)
components/game/
  PixelOffice.tsx                        — Canvas wrapper + React overlay bridge
  RoomView.tsx                           — Zoomed-in room left panel
  RoomHub.tsx                            — Tabbed right panel (Story/Code/Challenges)
  MikeTour.tsx                           — Guided tour overlay
  GameShellV2.tsx                        — Top-level game container (replaces GameShell)
  OfficeOverview.tsx                     — Right panel when no room selected
components/game/teaching/
  CodeToEnglish.tsx                      — Side-by-side code + plain English
  GroupChat.tsx                          — iMessage-style animated chat
  GlossaryTooltip.tsx                    — Hover tooltip for technical terms
  DataFlowAnimation.tsx                  — Animated packet traveling between rooms
  SmartQuiz.tsx                          — Application-based quiz component
components/game/room-tabs/
  StoryTab.tsx                           — Dialogue + group chat + data flow
  CodeTab.tsx                            — Code-to-English blocks per file
  ChallengesTab.tsx                      — Mission board (quiz, bug hunt, mail sort, boss)
```

### Files to Modify

```
lib/game/types.ts                        — Import and re-export v2 types
lib/game/xp.ts                           — Add room mastery tracking
lib/db/queries.ts                        — Add mike_content, room_content columns
app/api/generate/route.ts                — Add Mike tour + room content generation steps
app/g/[id]/page.tsx                      — Load v2 content, render GameShellV2
app/globals.css                          — Add teaching component styles
```

### Files Replaced (remove after v2 works)

```
components/game/OfficeScene.tsx          → PixelOffice.tsx
components/game/GameShell.tsx            → GameShellV2.tsx
components/game/InteractionPanel.tsx     → RoomHub.tsx + OfficeOverview.tsx
components/game/modes/OfficeTour.tsx     → StoryTab.tsx
components/game/modes/CodebaseMap.tsx    → OfficeOverview.tsx
components/game/modes/MailRoom.tsx       → ChallengesTab.tsx
components/game/modes/BugHunt.tsx        → ChallengesTab.tsx
components/game/modes/BuildOffice.tsx    → (removed, concept replaced by room mastery)
components/game/modes/BossBattle.tsx     → ChallengesTab.tsx
```

---

## Wave Dependencies

```
Wave 0 — Foundation (sequential)
  Task 1: v2 Types

Wave 1 — Core Modules (3 parallel tasks)
  Task 2: Canvas Engine (game loop, tiles, camera, renderer)
  Task 3: Sprite System (character sprites, furniture, palette swap)
  Task 4: Teaching Components (5 components)

Wave 2 — AI & Content (2 parallel tasks)
  Task 5: Enhanced AI Prompts (analysis v2, tour v2, modes v2, Mike)
  Task 6: XP & Progression Updates (room mastery, v2 state)

Wave 3 — Scene Assembly (3 parallel tasks)
  Task 7: PixelOffice Component (Canvas + React bridge, room clicks)
  Task 8: Room Mini-Hub (RoomHub, StoryTab, CodeTab, ChallengesTab)
  Task 9: Mike's Tour Mode (guided walkthrough overlay)

Wave 4 — Integration (sequential)
  Task 10: GameShellV2 + Game Page + API Route Updates

Wave 5 — End-to-End (sequential)
  Task 11: Wiring, DB Migration, Verification
```

---

## Task 1: v2 Types

**Files:**
- Create: `lib/game/types-v2.ts`
- Modify: `lib/game/types.ts`

All other tasks depend on these types. This defines every data shape in the v2 system.

- [ ] **Step 1: Create types-v2.ts with all v2 interfaces**

```typescript
// lib/game/types-v2.ts
//
// All TypeScript interfaces for Code Quest v2.
// These define the shapes of AI-generated content, engine state, and UI props.

// ===== RE-EXPORTS from v1 that are unchanged =====
// GameMeta, GameStatus, GameRow are kept from types.ts

// ===== ROOM SYSTEM =====

export type RoomType =
  | 'reception'
  | 'server-room'
  | 'workshop'
  | 'lab'
  | 'map-room'
  | 'archives'
  | 'comms'
  | 'security'
  | 'generic-office';

export interface Room {
  id: string;
  name: string;              // "Reception", "API Room", etc.
  type: RoomType;            // determines furniture set
  folder: string;            // "/app", "/api", etc.
  characterId: string;       // which character works here
  position: { row: number; col: number };
  floorColor: string;        // hex color for this room's floor tiles
}

export interface Connection {
  from: string;              // room id
  to: string;                // room id
  label?: string;            // "handles requests", "reads data", etc.
}

export interface OfficeLayout {
  rooms: Room[];
  connections: Connection[];
  gridCols: number;          // number of columns in the grid (max 4)
  gridRows: number;          // number of rows (max 3)
}

// ===== CHARACTERS (enhanced from v1) =====

export type SpriteType =
  | 'receptionist'
  | 'archivist'
  | 'translator'
  | 'strategist'
  | 'scorekeeper'
  | 'cartographer'
  | 'engineer'
  | 'manager';

export interface GameCharacter {
  id: string;
  name: string;
  title: string;             // "The Receptionist"
  color: string;             // hex color for this character
  department: string;
  files: string[];           // real file paths owned by this character
  summary: string;
  spriteType: SpriteType;
  roomId: string;            // which room this character belongs to
}

// ===== MIKE THE OFFICE MANAGER =====

export interface GroupChatMessage {
  characterId: string;       // 'mike' or a character id
  message: string;
  delay: number;             // ms before this message appears (cumulative)
}

export interface DataFlowStep {
  roomId: string;
  characterId: string;
  description: string;       // one-line: "Roxi receives the URL"
}

export interface MikeTour {
  welcomeDialogue: string[];
  roomIntros: { roomId: string; intro: string }[];
  tracedAction: {
    title: string;           // "When a user pastes a GitHub URL..."
    steps: { roomId: string; description: string; characterDialogue: string }[];
    groupChat: GroupChatMessage[];
    dataFlow: DataFlowStep[];
  };
}

// ===== TEACHING TOOLS =====

export interface CodeToEnglishBlock {
  file: string;              // real file path
  startLine: number;
  code: string[];            // exact lines from repo
  english: string[];         // one plain-English explanation per code line
  glossaryRefs: string[];    // term IDs referenced in explanations
}

export interface GlossaryTerm {
  id: string;
  term: string;              // "API route"
  definition: string;        // "A door that lets the outside world talk to your app"
}

// ===== PER-CHARACTER CONTENT (Story, Code, Challenges tabs) =====

export type DialogueStepType = 'talk' | 'code' | 'chat' | 'flow';

export type DialogueStep =
  | { type: 'talk'; text: string }
  | { type: 'code'; block: CodeToEnglishBlock }
  | { type: 'chat'; messages: GroupChatMessage[] }
  | { type: 'flow'; flow: DataFlowStep[] };

export interface SmartQuiz {
  characterId: string;
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

export interface MailSortChallenge {
  id: string;
  title: string;
  brief: string;
  correctOrder: string[];    // character IDs in correct order
  stopDialogue: string[];    // what each char says (length = correctOrder.length)
}

export interface BugHuntRound {
  id: string;
  title: string;
  file: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explainerCharId: string;
  original: string[];
  bugged: string[];
  bugLine: number;           // 0-indexed
  explanation: string;
}

export interface BossChallenge {
  id: string;
  title: string;
  brief: string;
  stages: BossStage[];
}

export type BossStage =
  | { type: 'select'; instruction: string; options: { characterId: string; correct: boolean; explanation: string }[] }
  | { type: 'order'; instruction: string; correctOrder: string[]; stopDialogue: string[] }
  | { type: 'choice'; instruction: string; question: string; options: { text: string; correct: boolean }[]; explanation: string }
  | { type: 'prompt'; instruction: string; question: string; keywords: { words: string[]; points: number; label: string }[]; idealAnswer: string };

export interface CharacterContent {
  characterId: string;
  roomId: string;

  // Story tab
  storyDialogue: DialogueStep[];
  groupChats: GroupChatMessage[][];
  dataFlows: DataFlowStep[][];

  // Code tab
  codeBlocks: CodeToEnglishBlock[];
  glossaryTerms: GlossaryTerm[];

  // Challenges tab
  quizzes: SmartQuiz[];
  mailSort: MailSortChallenge[];
  bugHunt: BugHuntRound[];
  bossChallenge: BossChallenge | null;
}

// ===== FULL GAME CONTENT (v2) =====

export interface GameContentV2 {
  meta: GameMeta;
  characters: GameCharacter[];
  office: OfficeLayout;
  mike: MikeTour;
  roomContent: Record<string, CharacterContent>;  // keyed by room ID
}

// Re-import from v1 types for backwards compat
import type { GameMeta } from './types';
export type { GameMeta };

// ===== ENGINE TYPES =====

export type AnimationState = 'idle' | 'walk' | 'sit' | 'type' | 'talk';
export type Direction = 'up' | 'down' | 'left' | 'right';

/** 2D array of hex color strings. '' = transparent pixel. */
export type SpriteData = string[][];

export interface SpriteFrame {
  data: SpriteData;
  width: number;
  height: number;
}

export interface CharacterSpriteSet {
  idle: { down: SpriteFrame[]; up: SpriteFrame[]; left: SpriteFrame[]; right: SpriteFrame[] };
  walk: { down: SpriteFrame[]; up: SpriteFrame[]; left: SpriteFrame[]; right: SpriteFrame[] };
  sit: { down: SpriteFrame[] };
  type: { down: SpriteFrame[] };
}

export interface FurnitureItem {
  id: string;
  sprite: SpriteFrame;
  x: number;                 // tile x within room
  y: number;                 // tile y within room
  interactable?: boolean;
}

export interface EngineCharacter {
  id: string;
  x: number;                 // pixel x position
  y: number;                 // pixel y position
  targetX: number;
  targetY: number;
  direction: Direction;
  state: AnimationState;
  frame: number;
  spriteSet: CharacterSpriteSet;
  color: string;
  speed: number;             // pixels per second
}

// ===== GAME STATE (v2) =====

export interface RoomProgress {
  storyComplete: boolean;
  codeComplete: boolean;
  challengesComplete: {
    quizzes: Set<number>;    // indices of completed quizzes
    mailSort: Set<string>;   // IDs of completed mail sorts
    bugHunt: Set<string>;    // IDs of completed bug hunts
    bossComplete: boolean;
  };
}

export interface GameStateV2 {
  xp: number;
  level: number;
  streak: number;
  glitchTokens: number;
  achievements: string[];
  mikeTourComplete: boolean;
  roomProgress: Record<string, RoomProgress>;  // keyed by room ID
  activeRoomId: string | null;
  activeTab: 'story' | 'code' | 'challenges' | null;
}

// ===== DATABASE (v2) =====

export interface GameRowV2 {
  id: string;
  repo_url: string;
  repo_name: string | null;
  status: GameStatus;
  error_message: string | null;
  // v1 columns (kept for backwards compat)
  analysis: { characters: GameCharacter[]; folderTree: FolderNode[]; dataFlows: DataFlow[] } | null;
  tour_content: unknown | null;
  modes_content: unknown | null;
  advanced_content: unknown | null;
  // v2 columns
  office_layout: OfficeLayout | null;
  mike_content: MikeTour | null;
  room_content: Record<string, CharacterContent> | null;
  created_at: string;
  view_count: number;
  version: 1 | 2;
}

import type { GameStatus, FolderNode, DataFlow } from './types';
export type { GameStatus, FolderNode, DataFlow };
```

- [ ] **Step 2: Update types.ts to re-export v2 types**

Add to the bottom of `lib/game/types.ts`:

```typescript
// v2 types — new game system
export type {
  RoomType, Room, Connection, OfficeLayout,
  GroupChatMessage, DataFlowStep, MikeTour,
  CodeToEnglishBlock, GlossaryTerm,
  DialogueStep, DialogueStepType,
  SmartQuiz, MailSortChallenge, BugHuntRound, BossChallenge,
  CharacterContent, GameContentV2,
  AnimationState, Direction, SpriteData, SpriteFrame,
  CharacterSpriteSet, FurnitureItem, EngineCharacter,
  RoomProgress, GameStateV2, GameRowV2,
} from './types-v2';
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit lib/game/types-v2.ts`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/game/types-v2.ts lib/game/types.ts
git commit -m "feat: add v2 TypeScript interfaces for rooms, Mike, teaching tools, engine"
```

---

## Task 2: Canvas Engine Core

**Files:**
- Create: `lib/engine/game-loop.ts`
- Create: `lib/engine/tile-map.ts`
- Create: `lib/engine/camera.ts`
- Create: `lib/engine/renderer.ts`
- Create: `lib/engine/office-state.ts`

**Depends on:** Task 1 (types)

This task builds the rendering engine that draws the pixel-art office. No React — pure TypeScript + Canvas 2D API. React integration happens in Task 7.

- [ ] **Step 1: Create game-loop.ts**

```typescript
// lib/engine/game-loop.ts
//
// The game loop runs ~60 times per second and calls update() then draw().
// Delta time is clamped to prevent physics jumps when the tab is backgrounded.

export interface GameLoopCallbacks {
  update: (dt: number) => void;  // dt = seconds since last frame
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export class GameLoop {
  private animationId: number | null = null;
  private lastTime = 0;
  private callbacks: GameLoopCallbacks;

  constructor(callbacks: GameLoopCallbacks) {
    this.callbacks = callbacks;
  }

  start(): void {
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (now: number): void => {
    const rawDt = (now - this.lastTime) / 1000;
    // Clamp to 100ms max — prevents huge jumps if tab was hidden
    const dt = Math.min(rawDt, 0.1);
    this.lastTime = now;

    this.callbacks.update(dt);
    // draw is called by the renderer which owns the canvas context

    this.animationId = requestAnimationFrame(this.tick);
  };
}
```

- [ ] **Step 2: Create tile-map.ts**

```typescript
// lib/engine/tile-map.ts
//
// The tile map defines the office grid. Each room occupies a rectangular
// area of tiles. Walls separate rooms, doorways connect them.

import type { OfficeLayout, Room, Connection } from '@/lib/game/types-v2';

export const TILE_SIZE = 16;      // pixels per tile
export const ROOM_WIDTH = 12;     // tiles per room (horizontal)
export const ROOM_HEIGHT = 10;    // tiles per room (vertical)
export const WALL_THICKNESS = 1;  // tiles for walls between rooms
export const DOORWAY_WIDTH = 2;   // tiles wide for doorway openings

export type TileType = 'floor' | 'wall' | 'doorway' | 'void';

export interface Tile {
  type: TileType;
  roomId: string | null;    // which room this tile belongs to
  color: string;            // floor color (hex)
}

export interface TileMap {
  width: number;            // total tiles across
  height: number;           // total tiles down
  tiles: Tile[][];          // [row][col]
  rooms: Map<string, { x: number; y: number; w: number; h: number }>; // room bounds in tiles
}

/** Build a tile map from the AI-generated office layout */
export function buildTileMap(layout: OfficeLayout): TileMap {
  const { rooms, connections, gridCols, gridRows } = layout;

  // Total grid size in tiles, including walls between rooms
  const totalW = gridCols * ROOM_WIDTH + (gridCols + 1) * WALL_THICKNESS;
  const totalH = gridRows * ROOM_HEIGHT + (gridRows + 1) * WALL_THICKNESS;

  // Initialize all tiles as void
  const tiles: Tile[][] = Array.from({ length: totalH }, () =>
    Array.from({ length: totalW }, () => ({
      type: 'void' as TileType,
      roomId: null,
      color: '#0f0f23',
    }))
  );

  // Room bounds lookup
  const roomBounds = new Map<string, { x: number; y: number; w: number; h: number }>();

  // Place rooms
  for (const room of rooms) {
    const startX = WALL_THICKNESS + room.position.col * (ROOM_WIDTH + WALL_THICKNESS);
    const startY = WALL_THICKNESS + room.position.row * (ROOM_HEIGHT + WALL_THICKNESS);

    roomBounds.set(room.id, { x: startX, y: startY, w: ROOM_WIDTH, h: ROOM_HEIGHT });

    // Fill room tiles with floor
    for (let row = startY; row < startY + ROOM_HEIGHT; row++) {
      for (let col = startX; col < startX + ROOM_WIDTH; col++) {
        if (row < totalH && col < totalW) {
          tiles[row][col] = {
            type: 'floor',
            roomId: room.id,
            color: room.floorColor,
          };
        }
      }
    }
  }

  // Place walls around rooms (tiles between rooms that aren't void)
  for (let row = 0; row < totalH; row++) {
    for (let col = 0; col < totalW; col++) {
      if (tiles[row][col].type === 'void') {
        // Check if adjacent to any floor tile
        const neighbors = [
          row > 0 ? tiles[row - 1][col] : null,
          row < totalH - 1 ? tiles[row + 1][col] : null,
          col > 0 ? tiles[row][col - 1] : null,
          col < totalW - 1 ? tiles[row][col + 1] : null,
        ];
        const hasFloorNeighbor = neighbors.some(n => n?.type === 'floor');
        if (hasFloorNeighbor) {
          tiles[row][col] = { type: 'wall', roomId: null, color: '#2c2c54' };
        }
      }
    }
  }

  // Carve doorways for connections
  for (const conn of connections) {
    const boundsA = roomBounds.get(conn.from);
    const boundsB = roomBounds.get(conn.to);
    if (!boundsA || !boundsB) continue;

    carveDoorway(tiles, boundsA, boundsB, conn);
  }

  return { width: totalW, height: totalH, tiles, rooms: roomBounds };
}

/** Carve a doorway between two adjacent rooms */
function carveDoorway(
  tiles: Tile[][],
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  conn: Connection
): void {
  // Determine if rooms are horizontally or vertically adjacent
  const isHorizontal = a.y === b.y; // same row
  const isVertical = a.x === b.x;   // same column

  if (isHorizontal) {
    // Doorway in the wall between left and right rooms
    const leftRoom = a.x < b.x ? a : b;
    const rightRoom = a.x < b.x ? b : a;
    const wallCol = leftRoom.x + leftRoom.w; // the wall column
    const doorY = leftRoom.y + Math.floor(leftRoom.h / 2) - Math.floor(DOORWAY_WIDTH / 2);

    for (let i = 0; i < DOORWAY_WIDTH; i++) {
      const row = doorY + i;
      // The wall might be multiple tiles thick
      for (let col = wallCol; col < rightRoom.x; col++) {
        if (row >= 0 && row < tiles.length && col >= 0 && col < tiles[0].length) {
          tiles[row][col] = {
            type: 'doorway',
            roomId: null,
            color: '#1a1a2e', // darker floor for doorways
          };
        }
      }
    }
  } else if (isVertical) {
    // Doorway in the wall between top and bottom rooms
    const topRoom = a.y < b.y ? a : b;
    const bottomRoom = a.y < b.y ? b : a;
    const wallRow = topRoom.y + topRoom.h;
    const doorX = topRoom.x + Math.floor(topRoom.w / 2) - Math.floor(DOORWAY_WIDTH / 2);

    for (let i = 0; i < DOORWAY_WIDTH; i++) {
      const col = doorX + i;
      for (let row = wallRow; row < bottomRoom.y; row++) {
        if (row >= 0 && row < tiles.length && col >= 0 && col < tiles[0].length) {
          tiles[row][col] = {
            type: 'doorway',
            roomId: null,
            color: '#1a1a2e',
          };
        }
      }
    }
  }
  // If rooms are diagonal, skip doorway (AI should avoid this)
}

/** Convert tile coordinates to pixel coordinates */
export function tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
  return { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE };
}

/** Convert pixel coordinates to tile coordinates */
export function pixelToTile(pixelX: number, pixelY: number): { col: number; row: number } {
  return {
    col: Math.floor(pixelX / TILE_SIZE),
    row: Math.floor(pixelY / TILE_SIZE),
  };
}

/** Get the center pixel position of a room */
export function getRoomCenter(tileMap: TileMap, roomId: string): { x: number; y: number } | null {
  const bounds = tileMap.rooms.get(roomId);
  if (!bounds) return null;
  return {
    x: (bounds.x + bounds.w / 2) * TILE_SIZE,
    y: (bounds.y + bounds.h / 2) * TILE_SIZE,
  };
}
```

- [ ] **Step 3: Create camera.ts**

```typescript
// lib/engine/camera.ts
//
// The camera controls what part of the office is visible on screen.
// Two modes: zoomed out (see all rooms) and zoomed in (one room fills the view).
// Smooth transitions between positions using linear interpolation.

export type CameraMode = 'overview' | 'room' | 'tour';

export interface Camera {
  x: number;          // current center x in world pixels
  y: number;          // current center y in world pixels
  zoom: number;       // current zoom level (1 = 1 world pixel = 1 screen pixel)
  targetX: number;
  targetY: number;
  targetZoom: number;
  mode: CameraMode;
}

export function createCamera(): Camera {
  return {
    x: 0, y: 0, zoom: 1,
    targetX: 0, targetY: 0, targetZoom: 1,
    mode: 'overview',
  };
}

/** Smoothly move camera toward its target. Called every frame. */
export function updateCamera(camera: Camera, dt: number): void {
  const lerpSpeed = 4; // higher = faster transitions
  const t = 1 - Math.exp(-lerpSpeed * dt);

  camera.x += (camera.targetX - camera.x) * t;
  camera.y += (camera.targetY - camera.y) * t;
  camera.zoom += (camera.targetZoom - camera.zoom) * t;

  // Snap when close enough to avoid floating point drift
  if (Math.abs(camera.x - camera.targetX) < 0.5) camera.x = camera.targetX;
  if (Math.abs(camera.y - camera.targetY) < 0.5) camera.y = camera.targetY;
  if (Math.abs(camera.zoom - camera.targetZoom) < 0.001) camera.zoom = camera.targetZoom;
}

/** Set camera to show the entire office */
export function focusOverview(
  camera: Camera,
  worldWidth: number,
  worldHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'overview';
  camera.targetX = worldWidth / 2;
  camera.targetY = worldHeight / 2;
  // Fit the whole world in the canvas with some padding
  const zoomX = canvasWidth / (worldWidth + 32);
  const zoomY = canvasHeight / (worldHeight + 32);
  camera.targetZoom = Math.min(zoomX, zoomY);
}

/** Set camera to zoom into a specific room */
export function focusRoom(
  camera: Camera,
  roomCenterX: number,
  roomCenterY: number,
  roomPixelWidth: number,
  roomPixelHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'room';
  camera.targetX = roomCenterX;
  camera.targetY = roomCenterY;
  // Zoom so room fills ~80% of canvas
  const zoomX = (canvasWidth * 0.8) / roomPixelWidth;
  const zoomY = (canvasHeight * 0.8) / roomPixelHeight;
  camera.targetZoom = Math.min(zoomX, zoomY);
}

/** Set camera to follow a character (for Mike's tour) */
export function followCharacter(
  camera: Camera,
  charX: number,
  charY: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'tour';
  camera.targetX = charX;
  camera.targetY = charY;
  // Moderate zoom for tour — not too close, not too far
  camera.targetZoom = Math.min(canvasWidth, canvasHeight) / 200;
}

/** Transform world coordinates to screen coordinates for drawing */
export function worldToScreen(
  camera: Camera,
  worldX: number,
  worldY: number,
  canvasWidth: number,
  canvasHeight: number
): { screenX: number; screenY: number } {
  return {
    screenX: (worldX - camera.x) * camera.zoom + canvasWidth / 2,
    screenY: (worldY - camera.y) * camera.zoom + canvasHeight / 2,
  };
}

/** Transform screen coordinates to world coordinates (for click detection) */
export function screenToWorld(
  camera: Camera,
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number
): { worldX: number; worldY: number } {
  return {
    worldX: (screenX - canvasWidth / 2) / camera.zoom + camera.x,
    worldY: (screenY - canvasHeight / 2) / camera.zoom + camera.y,
  };
}
```

- [ ] **Step 4: Create renderer.ts**

```typescript
// lib/engine/renderer.ts
//
// Draws the entire office scene to a Canvas 2D context.
// Uses Z-sorting: all drawable objects are collected, sorted by Y, drawn back-to-front.

import type { SpriteFrame, FurnitureItem, EngineCharacter } from '@/lib/game/types-v2';
import type { TileMap, TileType } from './tile-map';
import type { Camera } from './camera';
import { TILE_SIZE } from './tile-map';
import { worldToScreen } from './camera';

export interface Drawable {
  y: number;     // world Y for sorting
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/** Draw the full office scene */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  tileMap: TileMap,
  camera: Camera,
  furniture: FurnitureItem[],
  characters: EngineCharacter[],
  canvasWidth: number,
  canvasHeight: number
): void {
  // Clear
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();

  // Apply camera transform
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // 1. Draw tiles (floor, walls)
  drawTiles(ctx, tileMap, camera, canvasWidth, canvasHeight);

  // 2. Collect drawables and Z-sort
  const drawables: Drawable[] = [];

  for (const item of furniture) {
    const worldY = item.y * TILE_SIZE + item.sprite.height;
    drawables.push({
      y: worldY,
      draw: (c) => drawSprite(c, item.sprite, item.x * TILE_SIZE, item.y * TILE_SIZE),
    });
  }

  for (const char of characters) {
    drawables.push({
      y: char.y + 16, // sort by feet position
      draw: (c) => drawCharacter(c, char),
    });
  }

  // Sort by Y (back to front)
  drawables.sort((a, b) => a.y - b.y);

  // Draw all
  for (const d of drawables) {
    d.draw(ctx);
  }

  ctx.restore();

  // 3. Draw scanlines overlay (screen-space, after camera transform)
  drawScanlines(ctx, canvasWidth, canvasHeight);
}

/** Draw floor and wall tiles */
function drawTiles(
  ctx: CanvasRenderingContext2D,
  tileMap: TileMap,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Only draw tiles visible on screen (culling for performance)
  const margin = TILE_SIZE * 2;
  const halfW = (canvasWidth / 2) / camera.zoom + margin;
  const halfH = (canvasHeight / 2) / camera.zoom + margin;

  const startCol = Math.max(0, Math.floor((camera.x - halfW) / TILE_SIZE));
  const endCol = Math.min(tileMap.width, Math.ceil((camera.x + halfW) / TILE_SIZE));
  const startRow = Math.max(0, Math.floor((camera.y - halfH) / TILE_SIZE));
  const endRow = Math.min(tileMap.height, Math.ceil((camera.y + halfH) / TILE_SIZE));

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const tile = tileMap.tiles[row][col];
      if (tile.type === 'void') continue;

      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile.type === 'wall') {
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Wall top highlight
        ctx.fillStyle = '#3a3a5c';
        ctx.fillRect(x, y, TILE_SIZE, 2);
      } else {
        // Floor — checkered pattern
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? tile.color : darken(tile.color, 15);
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

/** Draw a sprite (furniture or static element) */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteFrame,
  x: number,
  y: number
): void {
  const { data, width, height } = sprite;
  for (let row = 0; row < height && row < data.length; row++) {
    for (let col = 0; col < width && col < data[row].length; col++) {
      const color = data[row][col];
      if (color === '') continue; // transparent
      ctx.fillStyle = color;
      ctx.fillRect(x + col, y + row, 1, 1);
    }
  }
}

/** Draw an animated character */
function drawCharacter(ctx: CanvasRenderingContext2D, char: EngineCharacter): void {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(char.x - 4, char.y + 12, 12, 3);

  // Get current animation frame
  const dirFrames = char.spriteSet[char.state]?.[char.direction]
    ?? char.spriteSet.idle.down;
  const frameIndex = Math.floor(char.frame) % dirFrames.length;
  const frame = dirFrames[frameIndex];

  if (frame) {
    drawSprite(ctx, frame, char.x - Math.floor(frame.width / 2), char.y - Math.floor(frame.height / 2));
  }
}

/** CRT scanline overlay */
function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/** Darken a hex color by a percentage */
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
```

- [ ] **Step 5: Create office-state.ts**

```typescript
// lib/engine/office-state.ts
//
// Central state manager for the pixel office. Holds the tile map,
// furniture positions, and character states. Updated every frame.

import type {
  OfficeLayout, GameCharacter, EngineCharacter,
  FurnitureItem, AnimationState, Direction,
} from '@/lib/game/types-v2';
import type { TileMap } from './tile-map';
import { buildTileMap, getRoomCenter, TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT } from './tile-map';
import { getFurnitureForRoom } from './sprites/furniture-sprites';
import { buildCharacterSpriteSet } from './sprites/character-sprites';

export interface OfficeStateData {
  tileMap: TileMap;
  furniture: FurnitureItem[];
  characters: EngineCharacter[];
  mikeCharacter: EngineCharacter | null;
}

/** Build the initial office state from AI-generated layout + characters */
export function createOfficeState(
  layout: OfficeLayout,
  characters: GameCharacter[]
): OfficeStateData {
  const tileMap = buildTileMap(layout);
  const furniture: FurnitureItem[] = [];
  const engineChars: EngineCharacter[] = [];

  for (const room of layout.rooms) {
    const bounds = tileMap.rooms.get(room.id);
    if (!bounds) continue;

    // Add furniture for this room type
    const roomFurniture = getFurnitureForRoom(room.type, bounds.x, bounds.y);
    furniture.push(...roomFurniture);

    // Place the character at their desk (center-ish of room)
    const character = characters.find(c => c.roomId === room.id);
    if (character) {
      const centerX = (bounds.x + Math.floor(bounds.w / 2)) * TILE_SIZE;
      const centerY = (bounds.y + Math.floor(bounds.h / 2) + 1) * TILE_SIZE;

      engineChars.push({
        id: character.id,
        x: centerX,
        y: centerY,
        targetX: centerX,
        targetY: centerY,
        direction: 'down',
        state: 'sit',
        frame: 0,
        spriteSet: buildCharacterSpriteSet(character.color),
        color: character.color,
        speed: 60, // pixels per second
      });
    }
  }

  return { tileMap, furniture, characters: engineChars, mikeCharacter: null };
}

/** Update all character animations. Called every frame. */
export function updateCharacters(state: OfficeStateData, dt: number): void {
  for (const char of state.characters) {
    // Advance animation frame
    char.frame += dt * 4; // 4 frames per second for animations

    // Move toward target
    if (char.state === 'walk') {
      const dx = char.targetX - char.x;
      const dy = char.targetY - char.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        // Arrived
        char.x = char.targetX;
        char.y = char.targetY;
        char.state = 'idle';
      } else {
        const step = char.speed * dt;
        char.x += (dx / dist) * step;
        char.y += (dy / dist) * step;
        // Face direction of movement
        if (Math.abs(dx) > Math.abs(dy)) {
          char.direction = dx > 0 ? 'right' : 'left';
        } else {
          char.direction = dy > 0 ? 'down' : 'up';
        }
      }
    }
  }

  // Update Mike if present
  if (state.mikeCharacter) {
    const mike = state.mikeCharacter;
    mike.frame += dt * 4;
    if (mike.state === 'walk') {
      const dx = mike.targetX - mike.x;
      const dy = mike.targetY - mike.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        mike.x = mike.targetX;
        mike.y = mike.targetY;
        mike.state = 'talk';
      } else {
        const step = mike.speed * dt;
        mike.x += (dx / dist) * step;
        mike.y += (dy / dist) * step;
        mike.direction = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      }
    }
  }
}

/** Set a character to walk to a room */
export function moveCharacterToRoom(
  state: OfficeStateData,
  characterId: string,
  roomId: string
): void {
  const char = state.characters.find(c => c.id === characterId)
    ?? (state.mikeCharacter?.id === characterId ? state.mikeCharacter : null);
  if (!char) return;

  const center = getRoomCenter(state.tileMap, roomId);
  if (!center) return;

  char.targetX = center.x;
  char.targetY = center.y;
  char.state = 'walk';
}

/** Set a character's animation state directly */
export function setCharacterState(
  state: OfficeStateData,
  characterId: string,
  animState: AnimationState
): void {
  const char = state.characters.find(c => c.id === characterId)
    ?? (state.mikeCharacter?.id === characterId ? state.mikeCharacter : null);
  if (char) {
    char.state = animState;
    char.frame = 0;
  }
}

/** Add Mike to the office (for the guided tour) */
export function addMike(state: OfficeStateData, startRoomId: string): void {
  const center = getRoomCenter(state.tileMap, startRoomId);
  if (!center) return;

  state.mikeCharacter = {
    id: 'mike',
    x: center.x,
    y: center.y - 20,
    targetX: center.x,
    targetY: center.y - 20,
    direction: 'down',
    state: 'talk',
    frame: 0,
    spriteSet: buildCharacterSpriteSet('#00ff41'), // Mike is neon green
    color: '#00ff41',
    speed: 50,
  };
}

/** Get which room a screen click hit (returns room ID or null) */
export function getRoomAtPosition(
  state: OfficeStateData,
  worldX: number,
  worldY: number
): string | null {
  const col = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);

  if (row < 0 || row >= state.tileMap.height || col < 0 || col >= state.tileMap.width) {
    return null;
  }

  return state.tileMap.tiles[row][col].roomId;
}
```

- [ ] **Step 6: Verify engine compiles**

Run: `npx tsc --noEmit lib/engine/game-loop.ts lib/engine/tile-map.ts lib/engine/camera.ts lib/engine/renderer.ts lib/engine/office-state.ts`

Note: office-state.ts imports from sprites/ which don't exist yet. This is expected — those are Task 3. For now, verify the other files compile individually:

Run: `npx tsc --noEmit lib/engine/game-loop.ts lib/engine/tile-map.ts lib/engine/camera.ts`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add lib/engine/
git commit -m "feat: Canvas 2D engine — game loop, tile map, camera, renderer, office state"
```

---

## Task 3: Sprite System

**Files:**
- Create: `lib/engine/sprites/sprite-data.ts`
- Create: `lib/engine/sprites/character-sprites.ts`
- Create: `lib/engine/sprites/furniture-sprites.ts`

**Depends on:** Task 1 (types)

Sprites are 2D arrays of hex color strings — each string is one pixel. This format is JSON-serializable, resolution-independent, and cache-friendly (same as pixel-agents).

- [ ] **Step 1: Create sprite-data.ts**

```typescript
// lib/engine/sprites/sprite-data.ts
//
// SpriteData is a 2D array of hex color strings.
// '' = transparent pixel, '#RRGGBB' = opaque pixel.
// This matches the pixel-agents format.

import type { SpriteData, SpriteFrame } from '@/lib/game/types-v2';

/** Create a SpriteFrame from raw pixel data */
export function createFrame(data: SpriteData): SpriteFrame {
  return {
    data,
    width: data[0]?.length ?? 0,
    height: data.length,
  };
}

/** Flip a sprite horizontally (for left-facing variants) */
export function flipHorizontal(frame: SpriteFrame): SpriteFrame {
  const flipped: SpriteData = frame.data.map(row => [...row].reverse());
  return { data: flipped, width: frame.width, height: frame.height };
}

/** Recolor a sprite — replace all instances of one color with another */
export function recolorSprite(frame: SpriteFrame, colorMap: Record<string, string>): SpriteFrame {
  const recolored: SpriteData = frame.data.map(row =>
    row.map(pixel => colorMap[pixel] ?? pixel)
  );
  return { data: recolored, width: frame.width, height: frame.height };
}

/**
 * Palette-swap a sprite by shifting hue.
 * Takes a base sprite with placeholder clothing color and replaces it
 * with the character's assigned color.
 */
export function paletteSwap(
  frame: SpriteFrame,
  baseClothingColor: string,
  targetColor: string
): SpriteFrame {
  // Convert the base clothing color and any shades of it
  const baseR = parseInt(baseClothingColor.slice(1, 3), 16);
  const baseG = parseInt(baseClothingColor.slice(3, 5), 16);
  const baseB = parseInt(baseClothingColor.slice(5, 7), 16);

  const targetR = parseInt(targetColor.slice(1, 3), 16);
  const targetG = parseInt(targetColor.slice(3, 5), 16);
  const targetB = parseInt(targetColor.slice(5, 7), 16);

  const recolored: SpriteData = frame.data.map(row =>
    row.map(pixel => {
      if (pixel === '' || pixel === baseClothingColor) {
        return pixel === '' ? '' : targetColor;
      }
      // Check if it's a shade of the base color (darker/lighter variant)
      const pr = parseInt(pixel.slice(1, 3), 16);
      const pg = parseInt(pixel.slice(3, 5), 16);
      const pb = parseInt(pixel.slice(5, 7), 16);

      // If the ratio between channels matches the base, it's a shade
      const diffR = pr - baseR;
      const diffG = pg - baseG;
      const diffB = pb - baseB;

      if (Math.abs(diffR - diffG) < 20 && Math.abs(diffG - diffB) < 20) {
        // It's a shade — apply same offset to target
        const nr = Math.max(0, Math.min(255, targetR + diffR));
        const ng = Math.max(0, Math.min(255, targetG + diffG));
        const nb = Math.max(0, Math.min(255, targetB + diffB));
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
      }

      return pixel;
    })
  );

  return { data: recolored, width: frame.width, height: frame.height };
}

// Canvas cache for rendered sprites (avoids re-drawing pixel-by-pixel each frame)
const spriteCanvasCache = new Map<string, HTMLCanvasElement>();

/** Render a sprite to an offscreen canvas and cache it */
export function getSpriteCanvas(frame: SpriteFrame, scale: number, cacheKey: string): HTMLCanvasElement {
  const key = `${cacheKey}_${scale}`;
  const cached = spriteCanvasCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = frame.width * scale;
  canvas.height = frame.height * scale;
  const ctx = canvas.getContext('2d')!;

  for (let row = 0; row < frame.height && row < frame.data.length; row++) {
    for (let col = 0; col < frame.width && col < frame.data[row].length; col++) {
      const color = frame.data[row][col];
      if (color === '') continue;
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  spriteCanvasCache.set(key, canvas);
  return canvas;
}

/** Clear the sprite canvas cache (call on cleanup) */
export function clearSpriteCache(): void {
  spriteCanvasCache.clear();
}
```

- [ ] **Step 2: Create character-sprites.ts**

```typescript
// lib/engine/sprites/character-sprites.ts
//
// Base character sprite templates. Each character is 16x16 pixels.
// The clothing color '#4488cc' is a placeholder that gets palette-swapped
// to each character's assigned color at runtime.

import type { CharacterSpriteSet, SpriteFrame, SpriteData } from '@/lib/game/types-v2';
import { createFrame, flipHorizontal, paletteSwap } from './sprite-data';

// Placeholder clothing color used in all base sprites
const BASE_CLOTHING = '#4488cc';
const SKIN = '#e8c4a0';
const SKIN_SHADOW = '#c4a080';
const HAIR = '#3a2a1c';
const PANTS = '#2c2c54';
const SHOES = '#1a1a2e';

// ===== BASE CHARACTER — facing down, idle frame 1 =====
const BASE_IDLE_DOWN_1: SpriteData = [
  // 16 rows × 16 cols — a small pixel person
  //                (centered in 16x16, actual figure ~8x14)
  ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''],
  ['', '', '', '', '', HAIR, HAIR, HAIR, HAIR, HAIR, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', HAIR, SKIN, SKIN, SKIN, SKIN, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '#1a1a2e', SKIN, '#1a1a2e', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, SKIN, SKIN, SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN_SHADOW, SKIN, SKIN, SKIN_SHADOW, '', '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '', '', SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, '', '', PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, '', '', PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SHOES, '', '', SHOES, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Idle frame 2 — slight bob (shift body down 1px)
const BASE_IDLE_DOWN_2: SpriteData = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ...BASE_IDLE_DOWN_1.slice(0, 15),
];

// Walking frame 1 — left leg forward
const BASE_WALK_DOWN_1: SpriteData = [
  ...BASE_IDLE_DOWN_1.slice(0, 11),
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', PANTS, PANTS, '', '', '', PANTS, '', '', '', '', ''],
  ['', '', '', '', '', SHOES, '', '', '', '', SHOES, '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Walking frame 2 — right leg forward
const BASE_WALK_DOWN_2: SpriteData = [
  ...BASE_IDLE_DOWN_1.slice(0, 11),
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', PANTS, PANTS, '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SHOES, '', '', SHOES, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Sitting frame (for at desk) — legs bent, body lower
const BASE_SIT_DOWN: SpriteData = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''],
  ['', '', '', '', '', HAIR, HAIR, HAIR, HAIR, HAIR, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', HAIR, SKIN, SKIN, SKIN, SKIN, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '#1a1a2e', SKIN, '#1a1a2e', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, SKIN, SKIN, SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', SKIN, '', PANTS, PANTS, '', SKIN, '', '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Typing frames — same as sitting but arms alternate
const BASE_TYPE_DOWN_1: SpriteData = [
  ...BASE_SIT_DOWN.slice(0, 10),
  ['', '', '', '', SKIN, '', '', PANTS, PANTS, '', '', SKIN, '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ...BASE_SIT_DOWN.slice(12),
];

const BASE_TYPE_DOWN_2: SpriteData = [
  ...BASE_SIT_DOWN.slice(0, 10),
  ['', '', '', '', '', SKIN, '', PANTS, PANTS, '', SKIN, '', '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ...BASE_SIT_DOWN.slice(12),
];

// Up-facing sprites (just show back of head, no face details)
const BASE_IDLE_UP: SpriteData = BASE_IDLE_DOWN_1.map((row, i) => {
  if (i === 3) return ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''];
  if (i === 4) return ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''];
  return [...row];
});

/**
 * Build a complete sprite set for a character by palette-swapping
 * the base templates with their assigned color.
 */
export function buildCharacterSpriteSet(characterColor: string): CharacterSpriteSet {
  const swap = (data: SpriteData) => paletteSwap(createFrame(data), BASE_CLOTHING, characterColor);

  const idleDown1 = swap(BASE_IDLE_DOWN_1);
  const idleDown2 = swap(BASE_IDLE_DOWN_2);
  const walkDown1 = swap(BASE_WALK_DOWN_1);
  const walkDown2 = swap(BASE_WALK_DOWN_2);
  const sitDown = swap(BASE_SIT_DOWN);
  const typeDown1 = swap(BASE_TYPE_DOWN_1);
  const typeDown2 = swap(BASE_TYPE_DOWN_2);
  const idleUp = swap(BASE_IDLE_UP);

  // Right = base, Left = flipped
  const idleRight1 = idleDown1; // simplified: same sprite for right
  const idleLeft1 = flipHorizontal(idleRight1);

  return {
    idle: {
      down: [idleDown1, idleDown2],
      up: [idleUp, idleUp],
      left: [idleLeft1, flipHorizontal(idleDown2)],
      right: [idleRight1, idleDown2],
    },
    walk: {
      down: [walkDown1, idleDown1, walkDown2, idleDown1],
      up: [swap(BASE_IDLE_UP), swap(BASE_IDLE_UP)],
      left: [flipHorizontal(walkDown1), flipHorizontal(idleDown1), flipHorizontal(walkDown2), flipHorizontal(idleDown1)],
      right: [walkDown1, idleDown1, walkDown2, idleDown1],
    },
    sit: { down: [sitDown] },
    type: { down: [typeDown1, typeDown2] },
  };
}
```

- [ ] **Step 3: Create furniture-sprites.ts**

```typescript
// lib/engine/sprites/furniture-sprites.ts
//
// Furniture sprite sets for each room type.
// Each room type gets a desk, chair, monitor, and 1-2 themed items.

import type { FurnitureItem, RoomType, SpriteData } from '@/lib/game/types-v2';
import { createFrame } from './sprite-data';

// ===== Common furniture =====

const DESK_SPRITE: SpriteData = [
  // 32x12 desk
  ...Array.from({ length: 2 }, () => Array(32).fill('#5a4a3c')),
  ...Array.from({ length: 6 }, () => [
    '#5a4a3c', '#5a4a3c', ...Array(28).fill('#4a3a2c'), '#5a4a3c', '#5a4a3c',
  ]),
  ['#5a4a3c', '#5a4a3c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a4a3c', '#5a4a3c'],
  ['#5a4a3c', '#5a4a3c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a4a3c', '#5a4a3c'],
  ['#4a3a2c', '#4a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#4a3a2c', '#4a3a2c'],
  ['#4a3a2c', '#4a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#4a3a2c', '#4a3a2c'],
];

const MONITOR_ON_SPRITE: SpriteData = [
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['', '', '', '', '', '', '#5a5a8c', '#5a5a8c', '', '', '', '', '', ''],
  ['', '', '', '', '', '#5a5a8c', '#5a5a8c', '#5a5a8c', '#5a5a8c', '', '', '', '', ''],
];

const CHAIR_SPRITE: SpriteData = [
  ['', '', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '', ''],
  ['', '', '#4a3a6c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#4a3a6c', '', ''],
  ['', '', '#4a3a6c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#4a3a6c', '', ''],
  ['', '', '', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '', '', ''],
  ['', '', '', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '', '', ''],
  ['', '', '', '', '#2c2c54', '', '', '', '#2c2c54', '', '', ''],
];

const PLANT_SPRITE: SpriteData = [
  ['', '', '', '#2a8a3c', '#2a8a3c', '', '', '', ''],
  ['', '', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', '', ''],
  ['', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', ''],
  ['', '#2a8a3c', '#3aaa4c', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', ''],
  ['', '', '#2a8a3c', '#2a8a3c', '#2a8a3c', '#2a8a3c', '', '', ''],
  ['', '', '', '#3a2a1c', '#3a2a1c', '', '', '', ''],
  ['', '', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '', '', ''],
  ['', '', '#5a3a2c', '#4a2a1c', '#4a2a1c', '#5a3a2c', '', '', ''],
  ['', '', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '', '', ''],
];

// ===== Themed furniture =====

const BOOKSHELF_SPRITE: SpriteData = [
  ['#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c'],
  ['#5a3a2c', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#38bdf8', '#38bdf8', '#38bdf8', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#5a3a2c'],
  ['#5a3a2c', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#38bdf8', '#38bdf8', '#38bdf8', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#5a3a2c'],
  ['#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c'],
  ['#5a3a2c', '#a855f7', '#a855f7', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#38bdf8', '#38bdf8', '#38bdf8', '#ffd93d', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#5a3a2c'],
  ['#5a3a2c', '#a855f7', '#a855f7', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#38bdf8', '#38bdf8', '#38bdf8', '#ffd93d', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#5a3a2c'],
  ['#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c'],
  ['#5a3a2c', '#5a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a3a2c', '#5a3a2c'],
  ['#5a3a2c', '#5a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a3a2c', '#5a3a2c'],
];

const SERVER_RACK_SPRITE: SpriteData = [
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#00ff41', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#4ecdc4', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#00ff41', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
];

const FILING_CABINET_SPRITE: SpriteData = [
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
];

const WHITEBOARD_SPRITE: SpriteData = [
  ['#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#ff6b6b', '#ff6b6b', '', '', '#4ecdc4', '', '', '#ffd93d', '#ffd93d', '', '', '', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '', '', '', '#ff6b6b', '', '#4ecdc4', '', '', '', '#ffd93d', '', '', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '', '', '', '', '', '', '#4ecdc4', '', '', '', '#a855f7', '#a855f7', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e'],
];

// ===== Room furniture layouts =====

/** Get furniture items for a room type, positioned relative to room tile origin */
export function getFurnitureForRoom(type: RoomType, roomTileX: number, roomTileY: number): FurnitureItem[] {
  const items: FurnitureItem[] = [];
  const baseX = roomTileX;
  const baseY = roomTileY;

  // Every room gets a desk, chair, monitor, and plant
  items.push(
    { id: `${type}-desk`, sprite: createFrame(DESK_SPRITE), x: baseX + 4, y: baseY + 4, interactable: false },
    { id: `${type}-monitor`, sprite: createFrame(MONITOR_ON_SPRITE), x: baseX + 5, y: baseY + 2, interactable: false },
    { id: `${type}-chair`, sprite: createFrame(CHAIR_SPRITE), x: baseX + 5, y: baseY + 6, interactable: false },
    { id: `${type}-plant`, sprite: createFrame(PLANT_SPRITE), x: baseX + 1, y: baseY + 7, interactable: false },
  );

  // Room-specific themed items
  switch (type) {
    case 'reception':
      // Welcome sign (use whiteboard as stand-in)
      items.push({ id: `${type}-sign`, sprite: createFrame(WHITEBOARD_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'server-room':
      items.push({ id: `${type}-rack`, sprite: createFrame(SERVER_RACK_SPRITE), x: baseX + 9, y: baseY + 2, interactable: false });
      break;
    case 'archives':
      items.push(
        { id: `${type}-cabinet`, sprite: createFrame(FILING_CABINET_SPRITE), x: baseX + 9, y: baseY + 1, interactable: false },
        { id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 1, y: baseY + 1, interactable: false },
      );
      break;
    case 'lab':
      items.push({ id: `${type}-board`, sprite: createFrame(WHITEBOARD_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'workshop':
      items.push({ id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'map-room':
      // Bookshelf doubles as strategy board
      items.push({ id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 1, y: baseY + 1, interactable: false });
      break;
    default:
      // Generic office — just the basics (already added above)
      break;
  }

  return items;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/engine/sprites/
git commit -m "feat: sprite system — character templates, furniture sets, palette swap"
```

---

## Task 4: Teaching Components

**Files:**
- Create: `components/game/teaching/CodeToEnglish.tsx`
- Create: `components/game/teaching/GroupChat.tsx`
- Create: `components/game/teaching/GlossaryTooltip.tsx`
- Create: `components/game/teaching/DataFlowAnimation.tsx`
- Create: `components/game/teaching/SmartQuiz.tsx`

**Depends on:** Task 1 (types)

These are pure React components — no Canvas dependency. They render the teaching tools inspired by codebase-to-course.

- [ ] **Step 1: Create GlossaryTooltip.tsx**

```tsx
// components/game/teaching/GlossaryTooltip.tsx
'use client';

import { useState } from 'react';
import type { GlossaryTerm } from '@/lib/game/types-v2';

interface GlossaryTooltipProps {
  term: string;
  glossary: GlossaryTerm[];
  children: React.ReactNode;
}

/**
 * Wraps text in a hover tooltip that shows a plain-English definition.
 * Used throughout Story and Code tabs to explain technical terms.
 */
export default function GlossaryTooltip({ term, glossary, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);

  const entry = glossary.find(g =>
    g.term.toLowerCase() === term.toLowerCase()
  );

  if (!entry) return <>{children}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span
        className="cursor-help"
        style={{
          color: 'var(--neon-blue)',
          borderBottom: '1px dashed var(--neon-blue)',
        }}
      >
        {children}
      </span>

      {visible && (
        <span
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-desk)',
            border: '1px solid var(--neon-blue)',
            borderRadius: '3px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            maxWidth: '280px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
          }}
        >
          {entry.definition}
          {/* Arrow pointing down */}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '5px solid transparent',
              borderTopColor: 'var(--neon-blue)',
            }}
          />
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Create CodeToEnglish.tsx**

```tsx
// components/game/teaching/CodeToEnglish.tsx
'use client';

import { useState } from 'react';
import type { CodeToEnglishBlock, GlossaryTerm } from '@/lib/game/types-v2';
import GlossaryTooltip from './GlossaryTooltip';

interface CodeToEnglishProps {
  block: CodeToEnglishBlock;
  glossary: GlossaryTerm[];
}

/**
 * Side-by-side view: real code on the left, plain English on the right.
 * Hover a line on either side to highlight the matching line.
 */
export default function CodeToEnglish({ block, glossary }: CodeToEnglishProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* File path label */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--text-dim)',
          marginBottom: '6px',
          letterSpacing: '1px',
        }}
      >
        {block.file}:{block.startLine}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Code side */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-gold)',
              marginBottom: '6px',
            }}
          >
            CODE
          </div>
          <div
            style={{
              background: 'var(--bg-void)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '3px',
              padding: '10px',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              lineHeight: '1.8',
              color: 'var(--text-code)',
              overflowX: 'auto',
            }}
          >
            {block.code.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredLine(i)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{
                  padding: '1px 4px',
                  background: hoveredLine === i
                    ? 'rgba(78, 205, 196, 0.1)'
                    : 'transparent',
                  borderLeft: hoveredLine === i
                    ? '2px solid var(--neon-blue)'
                    : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'pre',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* English side */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-gold)',
              marginBottom: '6px',
            }}
          >
            PLAIN ENGLISH
          </div>
          <div
            style={{
              fontSize: '13px',
              lineHeight: '1.8',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {block.english.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredLine(i)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{
                  padding: '2px 8px',
                  borderLeft: hoveredLine === i
                    ? '2px solid var(--neon-blue)'
                    : '2px solid transparent',
                  background: hoveredLine === i
                    ? 'rgba(78, 205, 196, 0.06)'
                    : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {renderWithGlossary(line, glossary)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Parse text and wrap glossary terms with GlossaryTooltip.
 * Terms are marked with [[term]] syntax in the AI-generated English text.
 */
function renderWithGlossary(text: string, glossary: GlossaryTerm[]): React.ReactNode {
  // Split on [[term]] markers
  const parts = text.split(/\[\[([^\]]+)\]\]/g);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // This is a glossary term
      return (
        <GlossaryTooltip key={i} term={part} glossary={glossary}>
          {part}
        </GlossaryTooltip>
      );
    }
    return part;
  });
}
```

- [ ] **Step 3: Create GroupChat.tsx**

```tsx
// components/game/teaching/GroupChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import type { GroupChatMessage, GameCharacter } from '@/lib/game/types-v2';

interface GroupChatProps {
  messages: GroupChatMessage[];
  characters: GameCharacter[];
  autoPlay?: boolean;
}

/**
 * iMessage-style chat between characters showing how components communicate.
 * Messages animate in one at a time with typing indicators.
 */
export default function GroupChat({ messages, characters, autoPlay = true }: GroupChatProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay || visibleCount >= messages.length) return;

    const nextMsg = messages[visibleCount];
    const delay = nextMsg?.delay ?? 500;

    // Show typing indicator
    setTyping(true);
    const typingTimer = setTimeout(() => {
      setTyping(false);
      setVisibleCount(c => c + 1);
    }, delay);

    return () => clearTimeout(typingTimer);
  }, [visibleCount, messages, autoPlay]);

  // Scroll to bottom as messages appear
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount]);

  const getCharacter = (id: string) =>
    id === 'mike'
      ? { name: 'Mike', color: '#00ff41', id: 'mike' }
      : characters.find(c => c.id === id);

  return (
    <div
      ref={containerRef}
      style={{
        maxWidth: '440px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '8px 0',
      }}
    >
      {messages.slice(0, visibleCount).map((msg, i) => {
        const char = getCharacter(msg.characterId);
        return (
          <div key={i} className="flex gap-2 items-start" style={{ marginBottom: '10px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '28px',
                height: '28px',
                border: `2px solid ${char?.color ?? '#7a7a8e'}`,
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7px',
                fontFamily: 'var(--font-pixel)',
                color: char?.color ?? '#7a7a8e',
                background: 'var(--bg-dark)',
                flexShrink: 0,
              }}
            >
              {(char?.name ?? '?').slice(0, 3).toUpperCase()}
            </div>

            <div>
              {/* Name */}
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: char?.color ?? '#7a7a8e',
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                }}
              >
                {char?.name ?? 'Unknown'}
              </div>

              {/* Bubble */}
              <div
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-pixel)',
                  borderRadius: '0 8px 8px 8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  maxWidth: '340px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {msg.message}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typing && visibleCount < messages.length && (
        <div className="flex gap-2 items-start" style={{ marginBottom: '10px', opacity: 0.6 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              border: `2px solid ${getCharacter(messages[visibleCount].characterId)?.color ?? '#7a7a8e'}`,
              borderRadius: '2px',
              background: 'var(--bg-dark)',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '0 8px 8px 8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span className="animate-pulse">• • •</span>
          </div>
        </div>
      )}

      {/* "Click to continue" if not autoplaying */}
      {!autoPlay && visibleCount < messages.length && (
        <button
          onClick={() => setVisibleCount(c => c + 1)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--neon-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          ▶ NEXT MESSAGE
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create DataFlowAnimation.tsx**

```tsx
// components/game/teaching/DataFlowAnimation.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DataFlowStep, GameCharacter } from '@/lib/game/types-v2';

interface DataFlowAnimationProps {
  steps: DataFlowStep[];
  characters: GameCharacter[];
}

/**
 * Animated diagram showing a request traveling room to room.
 * Click "Start" to watch the packet move step by step.
 */
export default function DataFlowAnimation({ steps, characters }: DataFlowAnimationProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const getCharacter = (id: string) =>
    id === 'mike'
      ? { name: 'Mike', color: '#00ff41', id: 'mike' }
      : characters.find(c => c.id === id);

  const play = useCallback(() => {
    setActiveStep(-1);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      setActiveStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [activeStep, playing, steps.length]);

  return (
    <div>
      <div
        className="flex items-center gap-1 flex-wrap justify-center"
        style={{ padding: '12px 0' }}
      >
        {steps.map((step, i) => {
          const char = getCharacter(step.characterId);
          const isActive = i === activeStep;
          const isPast = i < activeStep;

          return (
            <div key={i} className="flex items-center gap-1">
              {/* Node */}
              <div
                style={{
                  padding: '8px 12px',
                  border: `2px solid ${char?.color ?? '#7a7a8e'}`,
                  borderRadius: '3px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  textAlign: 'center',
                  background: isActive ? `${char?.color}22` : 'var(--bg-dark)',
                  color: char?.color ?? '#7a7a8e',
                  boxShadow: isActive ? `0 0 12px ${char?.color}44` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s',
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                {char?.name ?? step.characterId}
                {isActive && (
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      marginTop: '4px',
                      maxWidth: '120px',
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>

              {/* Arrow */}
              {i < steps.length - 1 && (
                <span
                  style={{
                    fontSize: '16px',
                    color: isPast || isActive ? 'var(--neon-green)' : 'var(--text-dim)',
                    opacity: isPast || isActive ? 1 : 0.3,
                    transition: 'all 0.3s',
                  }}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center" style={{ marginTop: '8px' }}>
        <button
          onClick={play}
          disabled={playing}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            padding: '8px 20px',
            background: 'var(--bg-dark)',
            color: playing ? 'var(--text-dim)' : 'var(--neon-green)',
            border: `2px solid ${playing ? 'var(--border-pixel)' : 'var(--neon-green)'}`,
            cursor: playing ? 'default' : 'pointer',
            borderRadius: '2px',
          }}
        >
          {playing ? '● PLAYING...' : '▶ START'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create SmartQuiz.tsx**

```tsx
// components/game/teaching/SmartQuiz.tsx
'use client';

import { useState } from 'react';
import type { SmartQuiz as SmartQuizType, GameCharacter } from '@/lib/game/types-v2';

interface SmartQuizProps {
  quiz: SmartQuizType;
  characters: GameCharacter[];
  onCorrect?: () => void;
  onWrong?: () => void;
}

/**
 * Application-based quiz component.
 * Tests understanding, not memory. Wrong answers teach too.
 */
export default function SmartQuiz({ quiz, characters, onCorrect, onWrong }: SmartQuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const char = characters.find(c => c.id === quiz.characterId);
  const selectedOption = selectedIndex !== null ? quiz.options[selectedIndex] : null;
  const isCorrect = selectedOption?.correct ?? false;

  function handleSelect(index: number) {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);

    if (quiz.options[index].correct) {
      onCorrect?.();
    } else {
      onWrong?.();
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--neon-gold)',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      {/* Asker label */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: char?.color ?? 'var(--neon-gold)',
          marginBottom: '10px',
        }}
      >
        {char?.name ?? 'QUIZ'} ASKS:
      </div>

      {/* Question */}
      <div
        style={{
          fontSize: '14px',
          marginBottom: '14px',
          lineHeight: '1.5',
          fontFamily: 'var(--font-body)',
        }}
      >
        {quiz.question}
      </div>

      {/* Options */}
      {quiz.options.map((option, i) => {
        const isSelected = selectedIndex === i;
        const showCorrect = answered && option.correct;
        const showWrong = answered && isSelected && !option.correct;

        return (
          <div
            key={i}
            onClick={() => handleSelect(i)}
            style={{
              background: 'var(--bg-panel)',
              border: `1px solid ${showCorrect ? 'var(--neon-green)' : showWrong ? 'var(--neon-coral)' : 'var(--border-pixel)'}`,
              borderRadius: '3px',
              padding: '10px 14px',
              marginBottom: '6px',
              cursor: answered ? 'default' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: answered && !isSelected && !option.correct ? 0.5 : 1,
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: 'var(--neon-gold)',
                flexShrink: 0,
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span>{option.text}</span>
          </div>
        );
      })}

      {/* Feedback */}
      {answered && selectedOption && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '13px',
            lineHeight: '1.5',
            background: isCorrect
              ? 'rgba(0, 255, 65, 0.08)'
              : 'rgba(255, 107, 107, 0.08)',
            border: `1px solid ${isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)'}`,
            color: isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {isCorrect ? '✓ ' : '✗ '}
          {selectedOption.explanation}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/game/teaching/
git commit -m "feat: teaching components — CodeToEnglish, GroupChat, GlossaryTooltip, DataFlow, SmartQuiz"
```

---

## Task 5: Enhanced AI Prompts

**Files:**
- Create: `lib/ai/prompts-v2.ts`
- Create: `lib/ai/generate-mike-tour.ts`
- Create: `lib/ai/generate-room-content.ts`

**Depends on:** Task 1 (types)

Rewrites the AI prompts to generate v2 content: room layouts, Mike's tour, code-to-English blocks, glossary terms, group chats, and per-room challenges.

- [ ] **Step 1: Create prompts-v2.ts**

```typescript
// lib/ai/prompts-v2.ts
//
// All v2 prompt templates. These tell Claude what JSON to generate
// for the room-based, teaching-quality game content.

import type { RepoSnapshot } from '@/lib/github/read-repo';
export { extractJSON, withRetry, buildSnapshotContext } from './prompts';

export const ANALYSIS_V2_PROMPT = `You are analyzing a codebase to create an educational pixel-art game where the office IS the codebase — each room represents a real folder/module.

Given the repository snapshot below, produce a JSON object with this exact shape:

{
  "meta": {
    "repoName": "owner/repo",
    "repoDescription": "one sentence what this project does, in plain English a non-coder would understand",
    "techStack": ["TypeScript", "React", ...],
    "generatedAt": "ISO date"
  },
  "characters": [
    {
      "id": "short-kebab-id",
      "name": "A fun memorable human name",
      "title": "The [Role]",
      "color": "#hex color from palette below",
      "department": "one of: reception, archives, translation, warroom, scoreboard, maproom, comms, security",
      "files": ["real/file/paths.ts", ...],
      "summary": "One sentence: what this component does, in non-technical terms",
      "spriteType": "one of: receptionist, archivist, translator, strategist, scorekeeper, cartographer, engineer, manager",
      "roomId": "matches a room ID below"
    }
  ],
  "office": {
    "rooms": [
      {
        "id": "kebab-room-id",
        "name": "Themed Room Name",
        "type": "one of: reception, server-room, workshop, lab, map-room, archives, comms, security, generic-office",
        "folder": "/real/folder/path",
        "characterId": "matches a character ID above",
        "position": { "row": 0, "col": 0 },
        "floorColor": "#hex color for this room's floor"
      }
    ],
    "connections": [
      { "from": "room-id-1", "to": "room-id-2", "label": "what flows between them" }
    ],
    "gridCols": 3,
    "gridRows": 2
  },
  "folderTree": [
    { "path": "src/", "indent": 0, "type": "folder", "owner": "character-id" }
  ],
  "dataFlows": [
    {
      "id": "flow-id",
      "label": "When a user does X",
      "steps": [{ "characterId": "char-id", "action": "what they do in this flow" }]
    }
  ]
}

RULES:
- 4-8 characters, one per room. Group related files into one character.
- Room NAMES should be themed (e.g., "Reception", "Archives", "War Room"), NOT just the folder name
- Room TYPES determine furniture: reception gets a front desk, server-room gets racks, archives gets bookshelves, lab gets a whiteboard, etc.
- Position rooms so entry-point code (pages, routes) is in row 0 (front of office) and backend/data code is in later rows
- Adjacent rooms (horizontally or vertically, NOT diagonal) should have a connection if code flows between them
- gridCols max 4, gridRows max 3
- Floor colors should be visually distinct per room. Use warm browns, cool blues, soft greens, etc.
- Character colors: #ff6b6b, #4ecdc4, #ffd93d, #a855f7, #ff9f43, #7a7a8e, #e879f9, #38bdf8
- Create exactly 4 dataFlows showing common user journeys
- All file paths must be REAL paths from the repository

Respond with ONLY the JSON object, no markdown fences.`;

export const MIKE_TOUR_PROMPT = `You are generating Mike the Office Manager's guided tour for a pixel-art educational game.

Mike knows the whole codebase and gives new visitors the big picture. He walks them room by room, introduces each character, and traces one complete user action through the office.

Given the analysis below, produce JSON:

{
  "welcomeDialogue": [
    "Welcome to the [project name] office! I'm Mike, the office manager.",
    "This project does [one sentence what it does]. Let me show you how it works.",
    "We have [N] team members, each with their own room. Follow me!"
  ],
  "roomIntros": [
    {
      "roomId": "matches room ID",
      "intro": "This is [Room Name]. [Character Name] works here — they handle [one sentence what this room does]."
    }
  ],
  "tracedAction": {
    "title": "When a user does [specific action]...",
    "steps": [
      {
        "roomId": "room-id",
        "description": "What happens in this room during this action",
        "characterDialogue": "What the character says about their part"
      }
    ],
    "groupChat": [
      {
        "characterId": "char-id or mike",
        "message": "What they say in the group chat",
        "delay": 500
      }
    ],
    "dataFlow": [
      {
        "roomId": "room-id",
        "characterId": "char-id",
        "description": "One-line summary of what happens here"
      }
    ]
  }
}

RULES:
- welcomeDialogue: 3-4 messages, warm and friendly, assumes ZERO coding knowledge
- roomIntros: one per room, order matches the physical walkthrough path (start at reception/front, work back)
- tracedAction: pick the most common/interesting user journey through the app
- groupChat: 4-8 messages, conversational, characters talk to each other about the action. Delays between 300-800ms.
- dataFlow: same steps as tracedAction but as a linear sequence for the animation
- Use plain English throughout. No jargon without explanation.
- Character dialogue should be in character — each has personality based on their role

Respond with ONLY the JSON object.`;

export const ROOM_CONTENT_PROMPT = `You are generating in-depth teaching content for ONE room/character in a pixel-art educational game. This room represents a specific folder in a real codebase.

This content powers three tabs: Story (character's narrative), Code (real code with English translations), and Challenges (quizzes, puzzles, bug hunts).

Given the analysis and file contents below, produce JSON for the specified character:

{
  "characterId": "the character ID",
  "roomId": "the room ID",

  "storyDialogue": [
    { "type": "talk", "text": "Introduction in character's voice" },
    { "type": "talk", "text": "What this room/module does, explained simply" },
    { "type": "chat", "messages": [
      { "characterId": "this-char", "message": "Hey [other char], remember when...", "delay": 0 },
      { "characterId": "other-char", "message": "Yeah! I send you the data and then...", "delay": 500 }
    ]},
    { "type": "flow", "flow": [
      { "roomId": "room-1", "characterId": "char-1", "description": "Step 1" },
      { "roomId": "room-2", "characterId": "char-2", "description": "Step 2" }
    ]},
    { "type": "talk", "text": "Wrap-up connecting to the bigger picture" }
  ],

  "groupChats": [
    [
      { "characterId": "char-a", "message": "Message 1", "delay": 0 },
      { "characterId": "char-b", "message": "Response", "delay": 500 }
    ]
  ],

  "dataFlows": [
    [
      { "roomId": "room-1", "characterId": "char-1", "description": "Step 1" }
    ]
  ],

  "codeBlocks": [
    {
      "file": "real/file/path.ts",
      "startLine": 10,
      "code": ["const x = 1;", "return x;"],
      "english": ["Create a variable called x and set it to 1", "Send x back to whoever asked for it"],
      "glossaryRefs": ["variable", "return"]
    }
  ],

  "glossaryTerms": [
    { "id": "variable", "term": "variable", "definition": "A named container that holds a value — like a labeled box" },
    { "id": "return", "term": "return", "definition": "Send a result back to whoever called this function — like handing back a finished order" }
  ],

  "quizzes": [
    {
      "characterId": "this-char",
      "question": "A user reports [real scenario]. Where in this room would you look first?",
      "options": [
        { "text": "Correct answer", "correct": true, "explanation": "Why this is right — what you'd actually find there" },
        { "text": "Plausible but wrong", "correct": false, "explanation": "This seems right but actually [reason]. Good instinct though!" },
        { "text": "Wrong answer", "correct": false, "explanation": "This file handles [something else]. But now you know where to find [that]!" }
      ]
    }
  ],

  "mailSort": [
    {
      "id": "sort-id",
      "title": "Sort the Request",
      "brief": "A user does [action]. Arrange the team members in order.",
      "correctOrder": ["char-1", "char-2", "char-3"],
      "stopDialogue": ["What char-1 says", "What char-2 says", "What char-3 says"]
    }
  ],

  "bugHunt": [
    {
      "id": "bug-id",
      "title": "Catchy Bug Name",
      "file": "real/file.ts",
      "difficulty": "Easy",
      "explainerCharId": "this-char",
      "original": ["line 1", "line 2", "line 3"],
      "bugged": ["line 1", "line 2 with bug", "line 3"],
      "bugLine": 1,
      "explanation": "This bug would cause [real consequence] because [clear reason]"
    }
  ],

  "bossChallenge": {
    "id": "boss-id",
    "title": "Add [Feature] to This Room",
    "brief": "The PM wants [feature]. How would you change this room?",
    "stages": [
      {
        "type": "select",
        "instruction": "Which team members need to help?",
        "options": [
          { "characterId": "char-1", "correct": true, "explanation": "Why they're needed" },
          { "characterId": "char-2", "correct": false, "explanation": "Why they're NOT needed for this" }
        ]
      },
      {
        "type": "choice",
        "instruction": "What's the biggest risk?",
        "question": "Which problem is most likely?",
        "options": [
          { "text": "Real risk", "correct": true },
          { "text": "Unlikely risk", "correct": false }
        ],
        "explanation": "Why this risk matters in practice"
      }
    ]
  }
}

CONTENT QUALITY RULES:
- Code blocks: use EXACT code from the repo, 5-15 lines max. Choose naturally short, interesting snippets.
- English translations: one explanation per code line. Assume ZERO coding knowledge.
- Glossary: mark technical terms in english text with [[term]] syntax. EVERY technical word gets a tooltip.
  If there's even a 1% chance a non-coder wouldn't know a word, add it.
- Quizzes: NEVER ask definition questions. ALWAYS ask "where would you look?" or "what would happen if?" questions.
  Wrong answers should TEACH something, not just say "wrong."
- Bug hunts: bugs must be SUBTLE. One changed line only. Real consequences described.
- Group chats: characters talk to EACH OTHER, not to the player. Show how components communicate.
- Story dialogue: conversational, first person, personality-driven. Mix talk/chat/flow types.
- Mail sort: use data flows that pass through THIS room
- Boss challenge: realistic feature request scoped to this room's code. 2-3 stages.

Respond with ONLY the JSON object.`;
```

- [ ] **Step 2: Create generate-mike-tour.ts**

```typescript
// lib/ai/generate-mike-tour.ts

import Anthropic from '@anthropic-ai/sdk';
import { MIKE_TOUR_PROMPT, extractJSON, withRetry } from './prompts-v2';
import type { MikeTour } from '@/lib/game/types-v2';

const client = new Anthropic();

export async function generateMikeTour(analysisJSON: string): Promise<MikeTour> {
  return withRetry(async () => {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${MIKE_TOUR_PROMPT}\n\n---\n\nANALYSIS:\n${analysisJSON}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(extractJSON(text)) as MikeTour;
  });
}
```

- [ ] **Step 3: Create generate-room-content.ts**

```typescript
// lib/ai/generate-room-content.ts

import Anthropic from '@anthropic-ai/sdk';
import { ROOM_CONTENT_PROMPT, extractJSON, withRetry, buildSnapshotContext } from './prompts-v2';
import type { CharacterContent, GameCharacter, Room } from '@/lib/game/types-v2';
import type { RepoSnapshot } from '@/lib/github/read-repo';

const client = new Anthropic();

/**
 * Generate content for a single room/character.
 * Called once per room — can be parallelized across rooms.
 */
export async function generateRoomContent(
  character: GameCharacter,
  room: Room,
  analysisJSON: string,
  snapshot: RepoSnapshot
): Promise<CharacterContent> {
  // Filter snapshot to only include files owned by this character
  const relevantFiles = snapshot.files.filter(f =>
    character.files.some(cf => f.path.startsWith(cf) || cf.startsWith(f.path))
  );

  const filesContext = relevantFiles.length > 0
    ? relevantFiles.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n')
    : 'No file contents available for this character.';

  return withRetry(async () => {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `${ROOM_CONTENT_PROMPT}\n\n---\n\nGENERATE CONTENT FOR:\nCharacter: ${character.name} (${character.id})\nRoom: ${room.name} (${room.id})\nFolder: ${room.folder}\nFiles: ${character.files.join(', ')}\n\n---\n\nANALYSIS:\n${analysisJSON}\n\n---\n\nFILE CONTENTS FOR THIS CHARACTER:\n${filesContext}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(extractJSON(text)) as CharacterContent;
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ai/prompts-v2.ts lib/ai/generate-mike-tour.ts lib/ai/generate-room-content.ts
git commit -m "feat: v2 AI prompts — analysis, Mike tour, per-room content generation"
```

---

## Task 6: XP & Progression Updates

**Files:**
- Modify: `lib/game/xp.ts`

**Depends on:** Task 1 (types)

Updates the XP/progression system for room mastery and v2 game state.

- [ ] **Step 1: Add v2 state and room mastery to xp.ts**

Add to the end of `lib/game/xp.ts`:

```typescript
// ===== V2 GAME STATE =====

import type { GameStateV2, RoomProgress } from './types-v2';

export function createInitialStateV2(): GameStateV2 {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    glitchTokens: 0,
    achievements: [],
    mikeTourComplete: false,
    roomProgress: {},
    activeRoomId: null,
    activeTab: null,
  };
}

export function getRoomProgress(state: GameStateV2, roomId: string): RoomProgress {
  if (!state.roomProgress[roomId]) {
    state.roomProgress[roomId] = {
      storyComplete: false,
      codeComplete: false,
      challengesComplete: {
        quizzes: new Set(),
        mailSort: new Set(),
        bugHunt: new Set(),
        bossComplete: false,
      },
    };
  }
  return state.roomProgress[roomId];
}

export function isRoomMastered(progress: RoomProgress): boolean {
  return progress.storyComplete && progress.codeComplete && progress.challengesComplete.bossComplete;
}

export function countMasteredRooms(state: GameStateV2): number {
  return Object.values(state.roomProgress).filter(isRoomMastered).length;
}

export function isBossBattleUnlocked(state: GameStateV2): boolean {
  return countMasteredRooms(state) >= 3;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/game/xp.ts
git commit -m "feat: v2 XP system — room mastery, v2 game state"
```

---

## Task 7: PixelOffice Component

**Files:**
- Create: `components/game/PixelOffice.tsx`

**Depends on:** Tasks 2, 3 (engine + sprites)

This React component wraps the Canvas engine and bridges it with React state. It handles:
- Canvas setup and resize
- Game loop lifecycle
- Click detection → room selection
- Communicating selected room back to parent

- [ ] **Step 1: Create PixelOffice.tsx**

```tsx
// components/game/PixelOffice.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { OfficeLayout, GameCharacter } from '@/lib/game/types-v2';
import { GameLoop } from '@/lib/engine/game-loop';
import {
  createCamera, updateCamera, focusOverview, focusRoom, followCharacter,
  screenToWorld, worldToScreen,
} from '@/lib/engine/camera';
import { renderScene } from '@/lib/engine/renderer';
import { TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT, getRoomCenter } from '@/lib/engine/tile-map';
import {
  createOfficeState, updateCharacters, getRoomAtPosition,
  addMike, moveCharacterToRoom,
} from '@/lib/engine/office-state';
import type { OfficeStateData } from '@/lib/engine/office-state';

interface PixelOfficeProps {
  layout: OfficeLayout;
  characters: GameCharacter[];
  activeRoomId: string | null;
  onRoomClick: (roomId: string) => void;
  tourMode?: boolean;
  tourTargetRoomId?: string;
}

/**
 * Canvas-based pixel art office renderer.
 * Draws the tile map, furniture, and animated characters.
 * Reports room clicks back to parent via onRoomClick.
 */
export default function PixelOffice({
  layout,
  characters,
  activeRoomId,
  onRoomClick,
  tourMode = false,
  tourTargetRoomId,
}: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OfficeStateData | null>(null);
  const cameraRef = useRef(createCamera());
  const loopRef = useRef<GameLoop | null>(null);

  // Initialize office state once
  useEffect(() => {
    stateRef.current = createOfficeState(layout, characters);

    if (tourMode) {
      // Add Mike for the guided tour
      const firstRoom = layout.rooms[0];
      if (firstRoom) addMike(stateRef.current, firstRoom.id);
    }
  }, [layout, characters, tourMode]);

  // Camera mode based on activeRoomId
  useEffect(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;

    const camera = cameraRef.current;
    const { width, height } = canvas.getBoundingClientRect();

    if (activeRoomId) {
      // Zoom into the selected room
      const center = getRoomCenter(state.tileMap, activeRoomId);
      if (center) {
        focusRoom(
          camera,
          center.x, center.y,
          ROOM_WIDTH * TILE_SIZE, ROOM_HEIGHT * TILE_SIZE,
          width, height
        );
      }
    } else {
      // Show full office
      focusOverview(
        camera,
        state.tileMap.width * TILE_SIZE,
        state.tileMap.height * TILE_SIZE,
        width, height
      );
    }
  }, [activeRoomId]);

  // Move Mike during tour
  useEffect(() => {
    if (tourMode && tourTargetRoomId && stateRef.current?.mikeCharacter) {
      moveCharacterToRoom(stateRef.current, 'mike', tourTargetRoomId);

      // Camera follows Mike
      const center = getRoomCenter(stateRef.current.tileMap, tourTargetRoomId);
      if (center && canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        followCharacter(cameraRef.current, center.x, center.y, width, height);
      }
    }
  }, [tourMode, tourTargetRoomId]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.imageSmoothingEnabled = false; // pixel-perfect rendering
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = new GameLoop({
      update(dt) {
        const state = stateRef.current;
        if (!state) return;
        updateCharacters(state, dt);
        updateCamera(cameraRef.current, dt);
      },
      draw() {
        const state = stateRef.current;
        if (!state) return;

        const allChars = state.mikeCharacter
          ? [...state.characters, state.mikeCharacter]
          : state.characters;

        renderScene(
          ctx,
          state.tileMap,
          cameraRef.current,
          state.furniture,
          allChars,
          canvas.width,
          canvas.height
        );
      },
    });

    // The game loop calls update but we need to call draw from it too
    // Let's fix the loop to call both
    const animLoop = {
      update(dt: number) {
        const state = stateRef.current;
        if (!state) return;
        updateCharacters(state, dt);
        updateCamera(cameraRef.current, dt);

        // Draw after update
        const allChars = state.mikeCharacter
          ? [...state.characters, state.mikeCharacter]
          : state.characters;

        renderScene(
          ctx,
          state.tileMap,
          cameraRef.current,
          state.furniture,
          allChars,
          canvas.width,
          canvas.height
        );
      },
      draw() {}, // handled in update
    };

    const gameLoop = new GameLoop(animLoop);
    loopRef.current = gameLoop;
    gameLoop.start();

    return () => {
      gameLoop.stop();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Click handler — detect which room was clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = (e.clientX - rect.left) * window.devicePixelRatio;
    const screenY = (e.clientY - rect.top) * window.devicePixelRatio;

    const { worldX, worldY } = screenToWorld(
      cameraRef.current,
      screenX, screenY,
      canvas.width, canvas.height
    );

    const roomId = getRoomAtPosition(state, worldX, worldY);
    if (roomId) {
      onRoomClick(roomId);
    }
  }, [onRoomClick]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/PixelOffice.tsx
git commit -m "feat: PixelOffice React component — Canvas wrapper with room click detection"
```

---

## Task 8: Room Mini-Hub

**Files:**
- Create: `components/game/RoomHub.tsx`
- Create: `components/game/room-tabs/StoryTab.tsx`
- Create: `components/game/room-tabs/CodeTab.tsx`
- Create: `components/game/room-tabs/ChallengesTab.tsx`
- Create: `components/game/OfficeOverview.tsx`

**Depends on:** Tasks 1, 4 (types + teaching components)

- [ ] **Step 1: Create RoomHub.tsx**

```tsx
// components/game/RoomHub.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter, GameStateV2 } from '@/lib/game/types-v2';
import StoryTab from './room-tabs/StoryTab';
import CodeTab from './room-tabs/CodeTab';
import ChallengesTab from './room-tabs/ChallengesTab';
import { getRoomProgress } from '@/lib/game/xp';

interface RoomHubProps {
  content: CharacterContent;
  characters: GameCharacter[];
  gameState: GameStateV2;
  onXP: (amount: number) => void;
  onBack: () => void;
}

type TabId = 'story' | 'code' | 'challenges';

export default function RoomHub({ content, characters, gameState, onXP, onBack }: RoomHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>('story');
  const character = characters.find(c => c.id === content.characterId);
  const progress = getRoomProgress(gameState, content.roomId);

  const tabs: { id: TabId; label: string; icon: string; done: boolean }[] = [
    { id: 'story', label: 'STORY', icon: '📖', done: progress.storyComplete },
    { id: 'code', label: 'CODE', icon: '💻', done: progress.codeComplete },
    { id: 'challenges', label: 'CHALLENGES', icon: '🎮', done: progress.challengesComplete.bossComplete },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '2px solid var(--border-pixel)' }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--neon-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← BACK
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: character?.color ?? 'var(--text-primary)',
            }}
          >
            {character?.name}&apos;s Room
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            {content.roomId}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '2px solid var(--border-pixel)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              padding: '10px 14px',
              border: '1px solid var(--border-pixel)',
              borderBottom: activeTab === tab.id ? '2px solid var(--bg-panel)' : 'none',
              background: activeTab === tab.id ? 'var(--bg-panel)' : 'var(--bg-dark)',
              color: activeTab === tab.id ? 'var(--neon-gold)' : 'var(--text-dim)',
              cursor: 'pointer',
              marginBottom: activeTab === tab.id ? '-2px' : '0',
            }}
          >
            {tab.icon} {tab.label} {tab.done && '✓'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
        {activeTab === 'story' && (
          <StoryTab
            content={content}
            characters={characters}
            onComplete={() => {
              progress.storyComplete = true;
              onXP(50);
            }}
          />
        )}
        {activeTab === 'code' && (
          <CodeTab
            codeBlocks={content.codeBlocks}
            glossary={content.glossaryTerms}
            onComplete={() => {
              progress.codeComplete = true;
              onXP(50);
            }}
          />
        )}
        {activeTab === 'challenges' && (
          <ChallengesTab
            content={content}
            characters={characters}
            progress={progress}
            onXP={onXP}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create StoryTab.tsx**

```tsx
// components/game/room-tabs/StoryTab.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter } from '@/lib/game/types-v2';
import GroupChat from '@/components/game/teaching/GroupChat';
import DataFlowAnimation from '@/components/game/teaching/DataFlowAnimation';
import CodeToEnglish from '@/components/game/teaching/CodeToEnglish';
import PixelButton from '@/components/game/ui/PixelButton';

interface StoryTabProps {
  content: CharacterContent;
  characters: GameCharacter[];
  onComplete: () => void;
}

export default function StoryTab({ content, characters, onComplete }: StoryTabProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = content.storyDialogue;
  const currentStep = steps[stepIndex];
  const character = characters.find(c => c.id === content.characterId);
  const isLast = stepIndex >= steps.length - 1;

  function advance() {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex(i => i + 1);
    }
  }

  if (!currentStep) return null;

  return (
    <div>
      {/* Progress dots */}
      <div className="flex gap-1 mb-4 justify-center">
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i <= stepIndex ? (character?.color ?? 'var(--neon-gold)') : 'var(--border-pixel)',
            }}
          />
        ))}
      </div>

      {/* Step content */}
      {currentStep.type === 'talk' && (
        <div className="flex gap-3 items-start mb-4">
          <div
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${character?.color ?? '#7a7a8e'}`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontFamily: 'var(--font-pixel)',
              color: character?.color,
              background: 'var(--bg-dark)',
              flexShrink: 0,
            }}
          >
            {(character?.name ?? '?').slice(0, 3).toUpperCase()}
          </div>
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '0 8px 8px 8px',
              padding: '10px 14px',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-body)',
            }}
          >
            {currentStep.text}
          </div>
        </div>
      )}

      {currentStep.type === 'code' && (
        <CodeToEnglish block={currentStep.block} glossary={content.glossaryTerms} />
      )}

      {currentStep.type === 'chat' && (
        <GroupChat messages={currentStep.messages} characters={characters} />
      )}

      {currentStep.type === 'flow' && (
        <DataFlowAnimation steps={currentStep.flow} characters={characters} />
      )}

      {/* Continue button */}
      <div className="text-center mt-4">
        <PixelButton onClick={advance}>
          {isLast ? 'COMPLETE STORY ✓' : 'CONTINUE →'}
        </PixelButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CodeTab.tsx**

```tsx
// components/game/room-tabs/CodeTab.tsx
'use client';

import { useState } from 'react';
import type { CodeToEnglishBlock, GlossaryTerm } from '@/lib/game/types-v2';
import CodeToEnglish from '@/components/game/teaching/CodeToEnglish';
import PixelButton from '@/components/game/ui/PixelButton';

interface CodeTabProps {
  codeBlocks: CodeToEnglishBlock[];
  glossary: GlossaryTerm[];
  onComplete: () => void;
}

export default function CodeTab({ codeBlocks, glossary, onComplete }: CodeTabProps) {
  const [blockIndex, setBlockIndex] = useState(0);
  const currentBlock = codeBlocks[blockIndex];
  const isLast = blockIndex >= codeBlocks.length - 1;

  if (!currentBlock) return <div style={{ color: 'var(--text-dim)' }}>No code to explore in this room.</div>;

  return (
    <div>
      {/* File selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {codeBlocks.map((block, i) => (
          <button
            key={i}
            onClick={() => setBlockIndex(i)}
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: '10px',
              padding: '4px 8px',
              background: i === blockIndex ? 'var(--bg-panel)' : 'var(--bg-dark)',
              color: i === blockIndex ? 'var(--neon-green)' : 'var(--text-dim)',
              border: `1px solid ${i === blockIndex ? 'var(--neon-green)' : 'var(--border-pixel)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            {block.file.split('/').pop()}
          </button>
        ))}
      </div>

      {/* Code-to-English block */}
      <CodeToEnglish block={currentBlock} glossary={glossary} />

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <PixelButton
          onClick={() => setBlockIndex(i => i - 1)}
          disabled={blockIndex === 0}
        >
          ← PREV FILE
        </PixelButton>
        <PixelButton
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setBlockIndex(i => i + 1);
            }
          }}
        >
          {isLast ? 'ALL FILES READ ✓' : 'NEXT FILE →'}
        </PixelButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ChallengesTab.tsx**

```tsx
// components/game/room-tabs/ChallengesTab.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter, RoomProgress } from '@/lib/game/types-v2';
import SmartQuiz from '@/components/game/teaching/SmartQuiz';
import PixelButton from '@/components/game/ui/PixelButton';

interface ChallengesTabProps {
  content: CharacterContent;
  characters: GameCharacter[];
  progress: RoomProgress;
  onXP: (amount: number) => void;
}

type ChallengeView = 'menu' | 'quiz' | 'mailsort' | 'bughunt' | 'boss';

export default function ChallengesTab({ content, characters, progress, onXP }: ChallengesTabProps) {
  const [view, setView] = useState<ChallengeView>('menu');
  const [quizIndex, setQuizIndex] = useState(0);

  const character = characters.find(c => c.id === content.characterId);

  // Mission board (menu view)
  if (view === 'menu') {
    const missions = [
      {
        id: 'quiz',
        icon: '❓',
        name: 'QUIZ TIME',
        desc: `${content.quizzes.length} questions about this room`,
        xp: content.quizzes.length * 25,
        color: '#a855f7',
        done: progress.challengesComplete.quizzes.size >= content.quizzes.length,
        onClick: () => { setQuizIndex(0); setView('quiz'); },
      },
      {
        id: 'mailsort',
        icon: '📬',
        name: 'SORT THE MAIL',
        desc: `Put the request steps in order`,
        xp: content.mailSort.length * 100,
        color: '#ff9f43',
        done: progress.challengesComplete.mailSort.size >= content.mailSort.length,
        onClick: () => setView('mailsort'),
      },
      {
        id: 'bughunt',
        icon: '🐛',
        name: 'FIND THE BUG',
        desc: `Spot what changed in the code`,
        xp: content.bugHunt.length * 150,
        color: '#ff6b6b',
        done: progress.challengesComplete.bugHunt.size >= content.bugHunt.length,
        onClick: () => setView('bughunt'),
      },
      {
        id: 'boss',
        icon: '⚔️',
        name: 'BOSS CHALLENGE',
        desc: content.bossChallenge?.title ?? 'Complete other challenges first',
        xp: 200,
        color: '#4ecdc4',
        done: progress.challengesComplete.bossComplete,
        locked: !progress.challengesComplete.quizzes.size, // Unlock after at least 1 quiz
        onClick: () => setView('boss'),
      },
    ];

    return (
      <div>
        <div className="flex gap-3 items-start mb-4">
          <div
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${character?.color ?? '#7a7a8e'}`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontFamily: 'var(--font-pixel)',
              color: character?.color,
              background: 'var(--bg-dark)',
              flexShrink: 0,
            }}
          >
            {(character?.name ?? '?').slice(0, 3).toUpperCase()}
          </div>
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '0 8px 8px 8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            }}
          >
            Pick any mission — or do them all to master my room!
          </div>
        </div>

        {missions.map(m => (
          <div
            key={m.id}
            onClick={m.locked ? undefined : m.onClick}
            style={{
              background: 'var(--bg-dark)',
              border: `1px solid ${m.color}`,
              borderRadius: '3px',
              padding: '10px',
              marginBottom: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              cursor: m.locked ? 'not-allowed' : 'pointer',
              opacity: m.locked ? 0.4 : m.done ? 0.6 : 1,
              transition: 'transform 0.15s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: m.color,
                  marginBottom: '3px',
                }}
              >
                {m.name} {m.done && '✓'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{m.desc}</div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-green)',
              }}
            >
              +{m.xp} XP
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Quiz view
  if (view === 'quiz') {
    const quiz = content.quizzes[quizIndex];
    if (!quiz) {
      return (
        <div className="text-center">
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-green)', marginBottom: '12px' }}>
            ALL QUIZZES COMPLETE ✓
          </div>
          <PixelButton onClick={() => setView('menu')}>← BACK TO MISSIONS</PixelButton>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-dim)' }}>
            QUIZ {quizIndex + 1}/{content.quizzes.length}
          </span>
          <button
            onClick={() => setView('menu')}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← MISSIONS
          </button>
        </div>
        <SmartQuiz
          quiz={quiz}
          characters={characters}
          onCorrect={() => {
            progress.challengesComplete.quizzes.add(quizIndex);
            onXP(25);
            setTimeout(() => setQuizIndex(i => i + 1), 1500);
          }}
          onWrong={() => {
            setTimeout(() => setQuizIndex(i => i + 1), 2000);
          }}
        />
      </div>
    );
  }

  // TODO: mailsort, bughunt, boss views — reuse existing MailRoom, BugHunt, BossBattle
  // components with minor adaptations. For now, show placeholder.
  return (
    <div className="text-center">
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-gold)', marginBottom: '12px' }}>
        {view.toUpperCase()} — COMING SOON
      </div>
      <PixelButton onClick={() => setView('menu')}>← BACK TO MISSIONS</PixelButton>
    </div>
  );
}
```

- [ ] **Step 5: Create OfficeOverview.tsx**

```tsx
// components/game/OfficeOverview.tsx
'use client';

import type { OfficeLayout, GameCharacter, GameStateV2 } from '@/lib/game/types-v2';
import { getRoomProgress, isRoomMastered, countMasteredRooms } from '@/lib/game/xp';

interface OfficeOverviewProps {
  layout: OfficeLayout;
  characters: GameCharacter[];
  gameState: GameStateV2;
  onRoomClick: (roomId: string) => void;
}

/**
 * Right panel when no room is selected.
 * Shows list of rooms with their mastery status.
 */
export default function OfficeOverview({ layout, characters, gameState, onRoomClick }: OfficeOverviewProps) {
  const mastered = countMasteredRooms(gameState);

  return (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--neon-gold)',
          marginBottom: '4px',
        }}
      >
        THE OFFICE
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>
        Click a room to explore. Master 3 rooms to unlock the Boss Battle.
      </div>

      {/* Room mastery bar */}
      <div className="flex items-center gap-2 mb-4">
        <div style={{ flex: 1, height: '6px', background: 'var(--bg-desk)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(mastered / layout.rooms.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))',
              borderRadius: '3px',
              transition: 'width 0.5s',
            }}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-green)' }}>
          {mastered}/{layout.rooms.length}
        </span>
      </div>

      {/* Room list */}
      {layout.rooms.map(room => {
        const char = characters.find(c => c.roomId === room.id);
        const progress = getRoomProgress(gameState, room.id);
        const mastered = isRoomMastered(progress);

        return (
          <div
            key={room.id}
            onClick={() => onRoomClick(room.id)}
            style={{
              background: 'var(--bg-dark)',
              border: `1px solid ${mastered ? 'var(--neon-gold)' : char?.color ?? 'var(--border-pixel)'}`,
              borderRadius: '3px',
              padding: '10px 14px',
              marginBottom: '8px',
              cursor: 'pointer',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              boxShadow: mastered ? '0 0 8px rgba(255,217,61,0.2)' : 'none',
              transition: 'transform 0.15s',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: `2px solid ${char?.color ?? '#7a7a8e'}`,
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-panel)',
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: char?.color,
              }}
            >
              {(char?.name ?? '?').slice(0, 3).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: char?.color ?? 'var(--text-primary)' }}>
                {room.name}
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--neon-green)' }}>
                {room.folder}
              </div>
            </div>
            <div className="flex gap-1">
              <span style={{ fontSize: '10px', opacity: progress.storyComplete ? 1 : 0.3 }}>📖</span>
              <span style={{ fontSize: '10px', opacity: progress.codeComplete ? 1 : 0.3 }}>💻</span>
              <span style={{ fontSize: '10px', opacity: progress.challengesComplete.bossComplete ? 1 : 0.3 }}>🎮</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/game/RoomHub.tsx components/game/room-tabs/ components/game/OfficeOverview.tsx
git commit -m "feat: room mini-hub — RoomHub, StoryTab, CodeTab, ChallengesTab, OfficeOverview"
```

---

## Task 9: Mike's Tour Mode

**Files:**
- Create: `components/game/MikeTour.tsx`

**Depends on:** Tasks 1, 4 (types + teaching components)

- [ ] **Step 1: Create MikeTour.tsx**

```tsx
// components/game/MikeTour.tsx
'use client';

import { useState } from 'react';
import type { MikeTour as MikeTourType, GameCharacter } from '@/lib/game/types-v2';
import GroupChat from '@/components/game/teaching/GroupChat';
import DataFlowAnimation from '@/components/game/teaching/DataFlowAnimation';
import PixelButton from '@/components/game/ui/PixelButton';

interface MikeTourProps {
  tour: MikeTourType;
  characters: GameCharacter[];
  onStepChange: (roomId: string | null) => void;
  onComplete: () => void;
}

type TourPhase = 'welcome' | 'rooms' | 'trace' | 'chat' | 'flow' | 'done';

/**
 * Mike's guided tour overlay.
 * Shows dialogue at the bottom of the screen while the PixelOffice
 * animates Mike walking between rooms.
 */
export default function MikeTour({ tour, characters, onStepChange, onComplete }: MikeTourProps) {
  const [phase, setPhase] = useState<TourPhase>('welcome');
  const [stepIndex, setStepIndex] = useState(0);

  // Welcome phase
  if (phase === 'welcome') {
    const msg = tour.welcomeDialogue[stepIndex];
    const isLast = stepIndex >= tour.welcomeDialogue.length - 1;

    return (
      <TourOverlay>
        <MikeDialogue text={msg ?? ''} />
        <PixelButton
          onClick={() => {
            if (isLast) {
              setPhase('rooms');
              setStepIndex(0);
              // Move to first room
              if (tour.roomIntros[0]) {
                onStepChange(tour.roomIntros[0].roomId);
              }
            } else {
              setStepIndex(i => i + 1);
            }
          }}
        >
          {isLast ? "LET'S GO! →" : 'CONTINUE →'}
        </PixelButton>
      </TourOverlay>
    );
  }

  // Room introductions
  if (phase === 'rooms') {
    const intro = tour.roomIntros[stepIndex];
    const isLast = stepIndex >= tour.roomIntros.length - 1;

    if (!intro) {
      setPhase('trace');
      setStepIndex(0);
      return null;
    }

    return (
      <TourOverlay>
        <MikeDialogue text={intro.intro} />
        <ProgressDots current={stepIndex} total={tour.roomIntros.length} />
        <PixelButton
          onClick={() => {
            if (isLast) {
              setPhase('trace');
              setStepIndex(0);
            } else {
              setStepIndex(i => i + 1);
              const next = tour.roomIntros[stepIndex + 1];
              if (next) onStepChange(next.roomId);
            }
          }}
        >
          {isLast ? 'NOW WATCH THIS →' : 'NEXT ROOM →'}
        </PixelButton>
      </TourOverlay>
    );
  }

  // Traced action — show group chat
  if (phase === 'trace' || phase === 'chat') {
    return (
      <TourOverlay>
        <MikeDialogue text={tour.tracedAction.title} />
        <GroupChat
          messages={tour.tracedAction.groupChat}
          characters={characters}
          autoPlay={true}
        />
        <PixelButton onClick={() => setPhase('flow')}>
          SEE THE FLOW →
        </PixelButton>
      </TourOverlay>
    );
  }

  // Data flow animation
  if (phase === 'flow') {
    return (
      <TourOverlay>
        <DataFlowAnimation steps={tour.tracedAction.dataFlow} characters={characters} />
        <PixelButton onClick={() => setPhase('done')}>
          GOT IT! →
        </PixelButton>
      </TourOverlay>
    );
  }

  // Done
  return (
    <TourOverlay>
      <MikeDialogue text="You're ready to explore on your own! Click any room to go deeper." />
      <PixelButton onClick={onComplete}>
        START EXPLORING ✓
      </PixelButton>
    </TourOverlay>
  );
}

// ===== Sub-components =====

function TourOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(15,15,35,0.95) 30%)',
        padding: '40px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

function MikeDialogue({ text }: { text: string }) {
  return (
    <div
      style={{
        maxWidth: '600px',
        width: '100%',
        background: 'var(--bg-dark)',
        border: '2px solid var(--neon-green)',
        borderRadius: '4px',
        padding: '14px 18px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '2px solid var(--neon-green)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--neon-green)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}
      >
        MIKE
      </div>
      <div style={{ fontSize: '14px', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>
        {text}
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: i <= current ? 'var(--neon-green)' : 'var(--border-pixel)',
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/game/MikeTour.tsx
git commit -m "feat: Mike's guided tour — overlay with dialogue, group chat, data flow"
```

---

## Task 10: GameShellV2 + Game Page + API Route

**Files:**
- Create: `components/game/GameShellV2.tsx`
- Modify: `app/g/[id]/page.tsx`
- Modify: `app/api/generate/route.ts`
- Modify: `lib/db/queries.ts`

**Depends on:** Tasks 5-9 (all previous)

This is the integration task that wires everything together.

- [ ] **Step 1: Create GameShellV2.tsx**

```tsx
// components/game/GameShellV2.tsx
'use client';

import { useState, useCallback } from 'react';
import type { GameContentV2, GameStateV2 } from '@/lib/game/types-v2';
import { createInitialStateV2, getLevelInfo } from '@/lib/game/xp';
import PixelOffice from './PixelOffice';
import RoomHub from './RoomHub';
import OfficeOverview from './OfficeOverview';
import MikeTour from './MikeTour';
import XPBar from './ui/XPBar';

interface GameShellV2Props {
  content: GameContentV2;
}

export default function GameShellV2({ content }: GameShellV2Props) {
  const [gameState, setGameState] = useState<GameStateV2>(createInitialStateV2);
  const [tourTargetRoomId, setTourTargetRoomId] = useState<string | null>(null);

  const addXP = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    setGameState(prev => ({ ...prev, activeRoomId: roomId, activeTab: 'story' }));
  }, []);

  const deselectRoom = useCallback(() => {
    setGameState(prev => ({ ...prev, activeRoomId: null, activeTab: null }));
  }, []);

  const completeTour = useCallback(() => {
    setGameState(prev => ({ ...prev, mikeTourComplete: true }));
  }, []);

  const showingTour = !gameState.mikeTourComplete;
  const activeContent = gameState.activeRoomId
    ? content.roomContent[gameState.activeRoomId]
    : null;

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        background: 'var(--bg-void)',
        color: 'var(--text-primary)',
      }}
    >
      {/* XP Bar */}
      <XPBar
        xp={gameState.xp}
        level={getLevelInfo(gameState.xp).level}
        levelName={getLevelInfo(gameState.xp).name}
        progress={getLevelInfo(gameState.xp).progress}
        glitchTokens={gameState.glitchTokens}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Pixel art office */}
        <div
          className="relative"
          style={{
            width: showingTour ? '100%' : gameState.activeRoomId ? '40%' : '45%',
            transition: 'width 0.3s',
          }}
        >
          <PixelOffice
            layout={content.office}
            characters={content.characters}
            activeRoomId={gameState.activeRoomId}
            onRoomClick={gameState.mikeTourComplete ? selectRoom : () => {}}
            tourMode={showingTour}
            tourTargetRoomId={tourTargetRoomId ?? undefined}
          />

          {/* Mike's tour overlay */}
          {showingTour && (
            <MikeTour
              tour={content.mike}
              characters={content.characters}
              onStepChange={setTourTargetRoomId}
              onComplete={completeTour}
            />
          )}
        </div>

        {/* Right: Interaction panel */}
        {!showingTour && (
          <div
            className="overflow-y-auto"
            style={{
              width: gameState.activeRoomId ? '60%' : '55%',
              borderLeft: '2px solid var(--border-pixel)',
              background: 'var(--bg-panel)',
              transition: 'width 0.3s',
            }}
          >
            {activeContent ? (
              <RoomHub
                content={activeContent}
                characters={content.characters}
                gameState={gameState}
                onXP={addXP}
                onBack={deselectRoom}
              />
            ) : (
              <OfficeOverview
                layout={content.office}
                characters={content.characters}
                gameState={gameState}
                onRoomClick={selectRoom}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update queries.ts — add v2 columns**

Add to `lib/db/queries.ts`:

```typescript
import type { MikeTour, OfficeLayout, CharacterContent } from '@/lib/game/types-v2';

export async function updateGameOfficeLayout(id: string, layout: OfficeLayout): Promise<void> {
  await sql`UPDATE games SET office_layout = ${JSON.stringify(layout)} WHERE id = ${id}`;
}

export async function updateGameMikeContent(id: string, mike: MikeTour): Promise<void> {
  await sql`UPDATE games SET mike_content = ${JSON.stringify(mike)} WHERE id = ${id}`;
}

export async function updateGameRoomContent(id: string, roomContent: Record<string, CharacterContent>): Promise<void> {
  await sql`UPDATE games SET room_content = ${JSON.stringify(roomContent)} WHERE id = ${id}`;
}
```

- [ ] **Step 3: Update API route — add v2 generation steps**

In `app/api/generate/route.ts`, after the existing analysis step, add Mike tour generation and room content generation. The v2 pipeline:

1. Read repo (unchanged)
2. Analyze repo (use ANALYSIS_V2_PROMPT instead of ANALYSIS_PROMPT)
3. Generate Mike's tour
4. Redirect user (tour_ready event)
5. Generate room content for each room (can be parallelized)
6. Complete

This is a significant rewrite of the route handler. The full updated file should import from `prompts-v2`, `generate-mike-tour`, and `generate-room-content`, and stream SSE events for each new step.

- [ ] **Step 4: Update game page to load v2 content**

In `app/g/[id]/page.tsx`, assemble `GameContentV2` from the database columns and render `GameShellV2` instead of `GameShell`.

- [ ] **Step 5: Commit**

```bash
git add components/game/GameShellV2.tsx lib/db/queries.ts app/api/generate/route.ts app/g/[id]/page.tsx
git commit -m "feat: GameShellV2 integration — new shell, API route v2, game page v2"
```

---

## Task 11: End-to-End Wiring & DB Migration

**Files:**
- Modify: DB schema (via SQL migration)
- Verify: Full pipeline from URL → game

**Depends on:** Task 10

- [ ] **Step 1: Add v2 columns to database**

Run via Vercel Postgres console or migration script:

```sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS office_layout JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS mike_content JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS room_content JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (or only warnings about unused v1 files)

- [ ] **Step 3: Run dev server and test end-to-end**

Run: `npm run dev`

Test flow:
1. Visit localhost:3000
2. Paste a small public GitHub repo URL
3. Watch SSE progress events (should show new v2 steps)
4. Game page loads with Mike's tour
5. Complete Mike's tour → office overview appears
6. Click a room → room hub with tabs
7. Explore Story, Code, Challenges tabs
8. Verify XP accumulates

- [ ] **Step 4: Remove v1 files (once v2 is verified working)**

```bash
git rm components/game/OfficeScene.tsx
git rm components/game/GameShell.tsx
git rm components/game/InteractionPanel.tsx
git rm components/game/modes/OfficeTour.tsx
git rm components/game/modes/CodebaseMap.tsx
git rm components/game/modes/MailRoom.tsx
git rm components/game/modes/BugHunt.tsx
git rm components/game/modes/BuildOffice.tsx
git rm components/game/modes/BossBattle.tsx
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Code Quest v2 — pixel office, Mike's tour, room-based teaching"
```

---

## Execution Notes

### What to verify between waves

After **Wave 1** (Tasks 2-4): Run `npx tsc --noEmit` on new files. Engine and teaching components should compile independently.

After **Wave 2** (Tasks 5-6): Verify prompts compile and AI generation functions have correct signatures.

After **Wave 3** (Tasks 7-9): All components should compile. Cannot test visually until integration.

After **Wave 4** (Task 10): First visual test. Run `npm run dev` and test the full flow.

After **Wave 5** (Task 11): Full E2E verification. This is where bugs surface — expect iteration.

### Known areas that will need iteration

1. **Sprite pixel data** — The base character sprites in Task 3 are functional but basic. They'll look blocky. Iteration on the pixel art will be needed after first visual test.
2. **Room layout algorithm** — The AI needs to produce positions that make sense spatially. The first few generations may produce odd layouts. Prompt iteration expected.
3. **ChallengesTab** — Task 8 has a placeholder for mail sort, bug hunt, and boss views. These need to be wired up from the existing v1 mode components.
4. **Canvas performance** — Drawing pixel-by-pixel every frame may be slow. The sprite canvas cache in Task 3 helps, but may need further optimization (pre-render rooms to offscreen canvases).
5. **XPBar props** — The v2 XPBar call in GameShellV2 uses `getLevelInfo()` which may need minor adjustments to match the existing XPBar component's prop interface.
