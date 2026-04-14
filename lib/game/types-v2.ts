// lib/game/types-v2.ts
//
// All TypeScript interfaces for Code Quest v2.
// These define the shapes of AI-generated content, engine state, and UI props.
//
// Why imports are at the top (not the bottom like in the plan):
// TypeScript requires types to be imported before they're used in expressions.
// We import GameMeta, GameStatus, FolderNode, DataFlow from v1 types.ts so
// GameContentV2 and GameRowV2 can reference them without re-defining them.

import type { GameMeta, GameStatus, FolderNode, DataFlow } from './types';

// Re-export the v1 types we import so callers can get them from either file.
export type { GameMeta, GameStatus, FolderNode, DataFlow };

// ===== ROOM SYSTEM =====
// Rooms replace the flat folder tree from v1. Each room = a folder in the repo,
// staffed by one character. Rooms are connected like a real office building.

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
// v2 adds roomId so the engine knows where to place each character on the map.

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
  roomId: string;            // which room this character belongs to (new in v2)
}

// ===== MIKE THE OFFICE MANAGER =====
// Mike is a special character who gives the guided intro tour when you first load
// the game. He walks you through each room and shows one traced user action.

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
// These are the "translation layer" that makes real code readable to non-engineers.
// Each code block shows exact lines from the repo alongside plain-English captions.

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
// When you click on a character, you see three tabs. This type holds all the
// content for those tabs for one character.

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

// BossStage is a discriminated union — each variant has a different shape.
// The 'type' field tells you which variant you're dealing with.
export type BossStage =
  | { type: 'select'; instruction: string; options: { characterId: string; correct: boolean; explanation: string }[] }
  | { type: 'order'; instruction: string; correctOrder: string[]; stopDialogue: string[] }
  | { type: 'choice'; instruction: string; question: string; options: { text: string; correct: boolean }[]; explanation: string }
  | { type: 'prompt'; instruction: string; question: string; keywords: { words: string[]; points: number; label: string }[]; idealAnswer: string };

export interface CharacterContent {
  characterId: string;
  roomId: string;

  // Story tab — narrative dialogue walking through what this character does
  storyDialogue: DialogueStep[];
  groupChats: GroupChatMessage[][];
  dataFlows: DataFlowStep[][];

  // Code tab — annotated code blocks with plain-English explanations
  codeBlocks: CodeToEnglishBlock[];
  glossaryTerms: GlossaryTerm[];

  // Challenges tab — interactive exercises to test understanding
  quizzes: SmartQuiz[];
  mailSort: MailSortChallenge[];
  bugHunt: BugHuntRound[];
  bossChallenge: BossChallenge | null;
}

// ===== FULL GAME CONTENT (v2) =====
// This is the top-level object Claude generates for a repo.
// All game UI components read from this shape.

export interface GameContentV2 {
  meta: GameMeta;
  characters: GameCharacter[];
  office: OfficeLayout;
  mike: MikeTour;
  roomContent: Record<string, CharacterContent>;  // keyed by room ID
}

// ===== ENGINE TYPES =====
// These describe the canvas rendering engine's internal state.
// Think of these as the "physics objects" — position, velocity, animation frame.

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
// Tracks player progress. Stored in React state on the client — not persisted to DB
// (except XP/level which could be added later).

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
// GameRowV2 extends the v1 row with three new JSON columns for the v2 content.
// v1 columns are kept for backwards compatibility — existing cached games still work.

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
