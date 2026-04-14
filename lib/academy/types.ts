// lib/academy/types.ts
//
// Type definitions for AI Academy — the 17-module course that teaches
// AI fundamentals through mini-games. These types mirror the spec at
// docs/superpowers/specs/2026-04-14-ai-academy-design.md.
//
// Key idea: each module has ONE mini-game with a unique mechanic.
// The MiniGame union type describes all 17 possible game shapes.
// Academy content is static JSON (generated once by a script),
// unlike repo games which are generated per-repo.

import type { GlossaryTerm, SmartQuiz } from '@/lib/game/types-v2';

// Re-export so consumers can import everything from one place
export type { GlossaryTerm, SmartQuiz };

// ===== MODULE METADATA =====

export interface AcademyModule {
  id: string;                         // URL slug: "what-is-ai", "the-terminal", etc.
  part: number;                       // 1-5 (which section of the course)
  moduleNumber: number;               // 1-17 (global ordering)
  title: string;
  subtitle: string;
  durationMinutes: number;
  mikeIntro: string[];                // Mike's opening dialogue lines
  miniGame: MiniGame;                 // The core interactive mechanic
  glossaryTerms: GlossaryTerm[];      // Terms that get tooltip treatment
  quiz: SmartQuiz;                    // End-of-module knowledge check
  xpReward: number;                   // Base XP for completing this module
}

// ===== MINI-GAME DISCRIMINATED UNION =====
// Each variant has a 'type' field that tells React which component to render.
// Think of it like a menu — the type says "this is a pizza order" or
// "this is a burger order", and each has different fields.

export type MiniGame =
  | { type: 'token-tetris'; tokens: string[]; validSentences: string[]; speedMs: number }
  | { type: 'prompt-lab'; task: string; prompts: { text: string; quality: number; explanation: string }[]; sliders: string[] }
  | { type: 'model-matchmaker'; tasks: { description: string; validModels: string[]; bestModel: string; explanation: string }[] }
  | { type: 'red-flag-spotter'; outputs: { text: string; isRedFlag: boolean; explanation: string }[]; timePerOutput: number }
  | { type: 'file-explorer'; missions: { instruction: string; targetPath: string; commands: string[] }[]; fileSystem: FileSystemNode[] }
  | { type: 'wiring-puzzle'; components: { id: string; name: string; type: string }[]; correctWires: { from: string; to: string; label: string }[] }
  | { type: 'timeline-builder'; commits: { id: string; message: string; timestamp: number }[]; correctOrder: string[]; branches: { name: string; commits: string[] }[] }
  | { type: 'chat-strategist'; scenarios: { task: string; options: { choice: string; score: number; explanation: string }[] }[] }
  | { type: 'editor-dash'; snippets: { code: string; suggestion: string; correct: boolean }[]; timeLimit: number }
  | { type: 'agent-simulator'; task: string; fileTree: string[]; correctSequence: { tool: string; target: string; reason: string }[] }
  | { type: 'toolbox-challenge'; requests: { description: string; correctTool: string; explanation: string }[]; tools: string[] }
  | { type: 'control-room'; agent: { task: string }; settings: { name: string; options: string[]; correct: string; explanation: string }[] }
  | { type: 'skill-builder'; blocks: { id: string; type: string; label: string }[]; correctAssembly: string[] }
  | { type: 'server-plugboard'; services: { id: string; name: string; icon: string }[]; testQueries: { question: string; requiredService: string }[] }
  | { type: 'api-playground'; defaults: { model: string; messages: { role: string; content: string }[] }; experiments: { change: string; effect: string }[] }
  | { type: 'factory-floor'; machines: { id: string; name: string; type: string }[]; pipelines: { name: string; correctOrder: string[]; description: string }[] }
  | { type: 'final-mission'; stages: { title: string; mechanic: string; data: unknown }[] };

// ===== FILE SYSTEM (for the File Explorer mini-game) =====
// A tree structure that mimics a real computer's directory layout.
// 'directory' nodes have children, 'file' nodes have content.

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileSystemNode[];
  content?: string;                   // Only for files — what you'd see if you `cat` it
}

// ===== PLAYER PROGRESS =====
// Tracked in localStorage — no database needed for Academy.
// XP is shared with repo games (same XPBar component).

export interface AcademyState {
  completedModules: Set<string>;      // Set of module IDs the player finished
  currentModule: string | null;       // ID of the module currently in progress
  xp: number;
  achievements: string[];
}

// ===== PART METADATA =====
// Used by the module selector page to group modules into sections.

export interface AcademyPart {
  number: number;
  title: string;
  durationLabel: string;              // "~30 min", "~25 min", etc.
}

export const ACADEMY_PARTS: AcademyPart[] = [
  { number: 1, title: 'Foundations', durationLabel: '~30 min' },
  { number: 2, title: 'Your Computer', durationLabel: '~25 min' },
  { number: 3, title: 'AI Tools You Can Use Today', durationLabel: '~25 min' },
  { number: 4, title: 'How Agents Actually Work', durationLabel: '~25 min' },
  { number: 5, title: 'Building with AI', durationLabel: '~20 min' },
];
