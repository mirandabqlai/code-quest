// ===== GAME CONTENT — what Claude generates for each repo =====

export interface GameContent {
  meta: GameMeta;
  characters: GameCharacter[];
  folderTree: FolderNode[];
  dataFlows: DataFlow[];
  officeTour: TourData[];
  mailRoom: MailScenario[];
  bugHunt: BugRound[];
  buildOffice: BuildPuzzle;
  bossBattle: BossBattle[];
}

export interface GameMeta {
  repoName: string;
  repoDescription: string;
  techStack: string[];
  generatedAt: string;
}

export interface GameCharacter {
  id: string;
  name: string;
  title: string;
  color: string;
  department: string;
  files: string[];
  summary: string;
  spriteType: SpriteType;
}

export type SpriteType =
  | 'receptionist'
  | 'archivist'
  | 'translator'
  | 'strategist'
  | 'scorekeeper'
  | 'cartographer'
  | 'engineer'
  | 'manager';

export interface FolderNode {
  path: string;
  indent: number;
  type: 'folder' | 'file';
  owner?: string;
  description?: string;
  note?: string;
}

export interface DataFlow {
  id: string;
  label: string;
  steps: { characterId: string; action: string }[];
}

// ===== Office Tour =====

export type TourStep =
  | { type: 'talk'; text: string }
  | { type: 'code'; code: string; file: string; english: string }
  | { type: 'quiz'; question: string; options: string[]; correct: number; explainRight: string; explainWrong: string };

export interface TourData {
  characterId: string;
  steps: TourStep[];
}

// ===== Mail Room =====

export interface MailScenario {
  id: string;
  title: string;
  brief: string;
  correctOrder: string[];
  stopDialogue: string[];
}

// ===== Bug Hunt =====

export interface BugRound {
  id: string;
  title: string;
  file: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explainerCharId: string;
  original: string[];
  bugged: string[];
  bugLine: number;
  explanation: string;
}

// ===== Build the Office =====

export interface BuildPuzzle {
  zones: { id: string; name: string; description: string }[];
  correctPlacements: Record<string, string>;
  connections: { from: string; to: string; label: string }[];
}

// ===== Boss Battle =====

export type BossStage =
  | { type: 'select'; instruction: string; options: { characterId: string; correct: boolean; explanation: string }[] }
  | { type: 'order'; instruction: string; correctOrder: string[]; stopDialogue: string[] }
  | { type: 'choice'; instruction: string; question: string; options: { text: string; correct: boolean }[]; explanation: string }
  | { type: 'prompt'; instruction: string; question: string; keywords: { words: string[]; points: number; label: string }[]; idealAnswer: string };

export interface BossBattle {
  id: string;
  title: string;
  brief: string;
  stages: BossStage[];
}

// ===== v2 types — new game system =====
// All the new interfaces for v2 are in types-v2.ts. We re-export them here
// so existing imports of '@/lib/game/types' keep working without changes.
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

// ===== Database row shape =====

export type GameStatus = 'pending' | 'reading' | 'analyzing' | 'generating' | 'complete' | 'error';

export interface GameRow {
  id: string;
  repo_url: string;
  repo_name: string | null;
  status: GameStatus;
  error_message: string | null;
  analysis: { characters: GameCharacter[]; folderTree: FolderNode[]; dataFlows: DataFlow[] } | null;
  tour_content: { officeTour: TourData[]; meta: GameMeta } | null;
  modes_content: { mailRoom: MailScenario[]; bugHunt: BugRound[] } | null;
  advanced_content: { buildOffice: BuildPuzzle; bossBattle: BossBattle[] } | null;
  created_at: string;
  view_count: number;
}
