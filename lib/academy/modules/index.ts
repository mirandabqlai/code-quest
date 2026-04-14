// lib/academy/modules/index.ts
//
// All 17 academy modules as stubs. Each has correct metadata (id, title, part, etc.)
// but empty miniGame/quiz/glossary content. A content generation script will call
// Claude to fill these in later — for now the shell renders placeholders.
//
// Module IDs are URL slugs used in the /academy/[module] route.

import type { AcademyModule } from '@/lib/academy/types';

// Helper to create a stub quiz — satisfies the SmartQuiz interface
// with placeholder content that will be replaced by generated content.
function stubQuiz(characterId: string = 'mike') {
  return {
    characterId,
    question: 'Coming soon...',
    options: [
      { text: 'Option A', correct: true, explanation: 'This module has not been generated yet.' },
      { text: 'Option B', correct: false, explanation: 'This module has not been generated yet.' },
    ],
  };
}

export const MODULES: AcademyModule[] = [
  // ===== PART 1: FOUNDATIONS =====
  {
    id: 'what-is-ai',
    part: 1,
    moduleNumber: 1,
    title: 'What is AI, Really?',
    subtitle: 'Tokenization, prediction, and how LLMs actually work',
    durationMinutes: 8,
    mikeIntro: ["AI isn't magic — it's a really good autocomplete. Let me show you..."],
    miniGame: { type: 'token-tetris', tokens: [], validSentences: [], speedMs: 1000 },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'talking-to-ai',
    part: 1,
    moduleNumber: 2,
    title: 'Talking to AI',
    subtitle: 'Prompts, context windows, and why phrasing matters',
    durationMinutes: 8,
    mikeIntro: ['The way you talk to AI changes everything. Same question, totally different answers.'],
    miniGame: { type: 'prompt-lab', task: '', prompts: [], sliders: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'ai-landscape',
    part: 1,
    moduleNumber: 3,
    title: 'The AI Landscape',
    subtitle: 'Claude, GPT, Gemini — who does what and when to use which',
    durationMinutes: 7,
    mikeIntro: ['There are a LOT of AI models out there. Let me help you make sense of the zoo.'],
    miniGame: { type: 'model-matchmaker', tasks: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'safety-and-failures',
    part: 1,
    moduleNumber: 4,
    title: 'Safety & When AI Fails',
    subtitle: 'Hallucinations, bias, and knowing when NOT to trust AI',
    durationMinutes: 7,
    mikeIntro: ['AI gets things wrong. Confidently wrong. Your job is to catch it.'],
    miniGame: { type: 'red-flag-spotter', outputs: [], timePerOutput: 5000 },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },

  // ===== PART 2: YOUR COMPUTER =====
  {
    id: 'the-terminal',
    part: 2,
    moduleNumber: 5,
    title: 'The Terminal',
    subtitle: 'Navigate your computer like a developer',
    durationMinutes: 8,
    mikeIntro: ['Forget clicking around in Finder. The terminal is how developers move fast.'],
    miniGame: { type: 'file-explorer', missions: [], fileSystem: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'how-code-is-organized',
    part: 2,
    moduleNumber: 6,
    title: 'How Code Is Organized',
    subtitle: 'Files, APIs, and how a web app fits together',
    durationMinutes: 8,
    mikeIntro: ['A codebase is like an office building. Each room has a job. Let me show you the floor plan.'],
    miniGame: { type: 'wiring-puzzle', components: [], correctWires: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'git-and-github',
    part: 2,
    moduleNumber: 7,
    title: 'Git & GitHub',
    subtitle: 'Version control, branches, and collaboration',
    durationMinutes: 8,
    mikeIntro: ['Imagine if Google Docs tracked every single change anyone ever made. That is Git.'],
    miniGame: { type: 'timeline-builder', commits: [], correctOrder: [], branches: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },

  // ===== PART 3: AI TOOLS YOU CAN USE TODAY =====
  {
    id: 'ai-chat',
    part: 3,
    moduleNumber: 8,
    title: 'AI Chat (Claude.ai)',
    subtitle: 'Conversations, projects, and getting the best results',
    durationMinutes: 8,
    mikeIntro: ['Chat is where most people start. But there is a big difference between using it well and using it badly.'],
    miniGame: { type: 'chat-strategist', scenarios: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'ai-in-your-editor',
    part: 3,
    moduleNumber: 9,
    title: 'AI in Your Editor',
    subtitle: 'Copilot, Cursor, and inline AI assistance',
    durationMinutes: 7,
    mikeIntro: ['What if AI could autocomplete your code while you type? That is what editor AI does.'],
    miniGame: { type: 'editor-dash', snippets: [], timeLimit: 60 },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'ai-coding-agents',
    part: 3,
    moduleNumber: 10,
    title: 'AI Coding Agents',
    subtitle: 'Autonomous AI that reads, plans, and writes code',
    durationMinutes: 8,
    mikeIntro: ['Chat answers questions. Agents take action. Big difference.'],
    miniGame: { type: 'agent-simulator', task: '', fileTree: [], correctSequence: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },

  // ===== PART 4: HOW AGENTS ACTUALLY WORK =====
  {
    id: 'tool-calling',
    part: 4,
    moduleNumber: 11,
    title: 'Tool Calling',
    subtitle: 'Read, Edit, Bash, Grep — the tools AI agents use',
    durationMinutes: 7,
    mikeIntro: ['An AI agent without tools is like a chef without a kitchen. Let me show you the toolbox.'],
    miniGame: { type: 'toolbox-challenge', requests: [], tools: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'the-harness',
    part: 4,
    moduleNumber: 12,
    title: 'The Harness',
    subtitle: 'The control room that runs an AI agent',
    durationMinutes: 7,
    mikeIntro: ['Someone has to be in charge. The harness is the program that keeps the agent on track.'],
    miniGame: { type: 'control-room', agent: { task: '' }, settings: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'skills-and-plugins',
    part: 4,
    moduleNumber: 13,
    title: 'Skills & Plugins',
    subtitle: 'Reusable AI workflows and slash commands',
    durationMinutes: 7,
    mikeIntro: ['Why do the same thing twice? Skills let you package up a workflow and reuse it forever.'],
    miniGame: { type: 'skill-builder', blocks: [], correctAssembly: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'mcp',
    part: 4,
    moduleNumber: 14,
    title: 'MCP (Model Context Protocol)',
    subtitle: 'Connecting AI to databases, APIs, and services',
    durationMinutes: 7,
    mikeIntro: ['MCP is like USB for AI. One standard plug that connects to everything.'],
    miniGame: { type: 'server-plugboard', services: [], testQueries: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },

  // ===== PART 5: BUILDING WITH AI =====
  {
    id: 'the-ai-api',
    part: 5,
    moduleNumber: 15,
    title: 'The AI API',
    subtitle: 'Build requests, stream responses, call models from code',
    durationMinutes: 7,
    mikeIntro: ['APIs are how your code talks to AI. It is simpler than you think.'],
    miniGame: { type: 'api-playground', defaults: { model: '', messages: [] }, experiments: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'ai-patterns',
    part: 5,
    moduleNumber: 16,
    title: 'AI Patterns',
    subtitle: 'RAG, prompt chains, embeddings, and real architectures',
    durationMinutes: 7,
    mikeIntro: ['Now we are getting to the good stuff. These are the building blocks of real AI apps.'],
    miniGame: { type: 'factory-floor', machines: [], pipelines: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
  {
    id: 'graduation',
    part: 5,
    moduleNumber: 17,
    title: 'Graduation',
    subtitle: 'The final mission — ship an AI feature from scratch',
    durationMinutes: 8,
    mikeIntro: ['You have learned everything you need. Time to put it all together.'],
    miniGame: { type: 'final-mission', stages: [] },
    glossaryTerms: [],
    quiz: stubQuiz(),
    xpReward: 100,
  },
];

// Lookup a module by its URL slug. Returns undefined if not found.
export function getModuleBySlug(slug: string): AcademyModule | undefined {
  return MODULES.find(m => m.id === slug);
}

// Get all modules for a specific part (1-5).
export function getModulesByPart(part: number): AcademyModule[] {
  return MODULES.filter(m => m.part === part);
}
