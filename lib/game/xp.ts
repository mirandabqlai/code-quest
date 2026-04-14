import type { GameStateV2, RoomProgress } from './types-v2';

export const LEVELS = [
  { name: 'Observer', xp: 0 },
  { name: 'Intern', xp: 100 },
  { name: 'Junior', xp: 300 },
  { name: 'Senior', xp: 600 },
  { name: 'Architect', xp: 1000 },
  { name: 'Code Whisperer', xp: 1500 },
] as const;

export const ACHIEVEMENTS = [
  { id: 'first-look', name: 'First Look', description: 'Complete your first character tour' },
  { id: 'mail-carrier', name: 'Mail Carrier', description: 'Complete your first Mail Room scenario' },
  { id: 'bug-spotter', name: 'Bug Spotter', description: 'Find your first bug' },
  { id: 'junior-architect', name: 'Junior Architect', description: 'Complete Build the Office' },
  { id: 'battle-ready', name: 'Battle Ready', description: 'Complete your first Boss Battle' },
  { id: 'perfect-delivery', name: 'Perfect Delivery', description: 'Perfect score on any Mail Room scenario' },
  { id: 'eagle-eye', name: 'Eagle Eye', description: 'Find all bugs without hints' },
  { id: 'team-player', name: 'Team Player', description: 'Complete all character tours' },
  { id: 'master-planner', name: 'Master Planner', description: 'Score 400+ on a Boss Battle' },
  { id: 'code-whisperer', name: 'Code Whisperer', description: 'Reach Level 5' },
] as const;

export interface GameState {
  xp: number;
  streak: number;
  glitchTokens: number;
  achievements: string[];
  completedTours: Set<string>;
  completedMail: Set<string>;
  completedBugs: Set<string>;
  completedBuild: boolean;
  completedBoss: Set<string>;
}

export function createInitialState(): GameState {
  return {
    xp: 0,
    streak: 0,
    glitchTokens: 0,
    achievements: [],
    completedTours: new Set(),
    completedMail: new Set(),
    completedBugs: new Set(),
    completedBuild: false,
    completedBoss: new Set(),
  };
}

export function getLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return i;
  }
  return 0;
}

export function getLevelInfo(xp: number) {
  const level = getLevel(xp);
  const current = LEVELS[level];
  const next = level < LEVELS.length - 1 ? LEVELS[level + 1] : null;
  const progress = next
    ? ((xp - current.xp) / (next.xp - current.xp)) * 100
    : 100;

  return {
    level,
    name: current.name,
    xp,
    nextXp: next?.xp ?? current.xp,
    progress: Math.min(100, progress),
  };
}

export function calculateStreakBonus(baseXP: number, streak: number): number {
  const multiplier = Math.min(streak, 5);
  return Math.round(baseXP * (multiplier - 1) * 0.2);
}

export function isUnlocked(mode: string, state: GameState): boolean {
  switch (mode) {
    case 'tour': return true;
    case 'codemap': return true;
    case 'mailroom': return state.completedTours.size >= 3;
    case 'bughunt': return state.completedMail.size >= 1;
    case 'build': return state.completedBugs.size >= 2;
    case 'boss': return state.completedBuild;
    default: return false;
  }
}

// ===== V2 GAME STATE =====

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

// Returns existing room progress or initializes a blank slate for a new room.
// Mutates state.roomProgress in place — callers are responsible for managing state immutability.
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

// A room is "mastered" when the player has finished Story, Code, and the Boss challenge.
export function isRoomMastered(progress: RoomProgress): boolean {
  return progress.storyComplete && progress.codeComplete && progress.challengesComplete.bossComplete;
}

export function countMasteredRooms(state: GameStateV2): number {
  return Object.values(state.roomProgress).filter(isRoomMastered).length;
}

// Boss Battle unlocks once the player has mastered at least 3 rooms.
export function isBossBattleUnlocked(state: GameStateV2): boolean {
  return countMasteredRooms(state) >= 3;
}
