# AI Academy — Design Spec

## Vision

A playable 2-hour game that teaches everything a non-technical person needs to know about AI — from "what is an LLM" to "how to build an AI app." Built into Code Quest as a second game mode alongside repo exploration.

**The narrative:** You're a new hire at an AI company. Mike is your office manager. Each day is a new challenge — you learn by doing, not reading.

**The feel:** Mini-games, not lectures. Each concept has its own playable mechanic (drag-and-drop, simulators, puzzles, timed challenges). Mike gives short intros, but the core of each module is playing.

## Entry Point

Landing page has two buttons:
- **AI ACADEMY** — Learn AI fundamentals through mini-games (~2 hours)
- **EXPLORE A REPO** — Paste a GitHub URL (existing v2 flow)

No gating. Player picks what they need.

## Academy Structure

17 modules across 5 parts. Each module: ~7-8 minutes, one core mini-game, short Mike intro, glossary tooltips, XP rewards.

### Part 1: Foundations (~30 min)

#### Module 1: What is AI, Really?
**Mini-game: Token Tetris**
Tokens (word fragments) fall from the top of the screen. Player arranges them into valid sentences. As tokens land, a "prediction meter" shows what the AI thinks comes next. Teaches: tokenization, next-word prediction, how LLMs actually work.

**Mike intro:** "AI isn't magic — it's a really good autocomplete. Let me show you..."

**Key concepts:** Machine learning, LLMs, training data, tokens, prediction, neural networks (simplified)

**Quiz:** "An LLM sees 'The capital of France is ___'. What is it actually doing?" → "Predicting the most likely next word based on patterns it learned"

#### Module 2: Talking to AI
**Mini-game: Prompt Lab**
Player sees a task ("Write me a haiku about coding"). They're given 3 prompt drafts — bad, ok, great. They pick one, then watch the AI "think" step by step (animated thought process). Then they tweak the prompt with sliders (specificity, context, examples) and see how output changes.

**Key concepts:** Prompts, context windows, system prompts, temperature, few-shot examples, why phrasing matters

**Quiz:** "Which prompt gets better results: 'Write code' or 'Write a Python function that takes a list of numbers and returns the average, with error handling for empty lists'?" → The specific one, because AI works better with clear instructions.

#### Module 3: The AI Landscape
**Mini-game: Model Matchmaker**
Cards show different AI tasks ("Write an essay", "Analyze a spreadsheet", "Generate an image", "Code a website"). Player drags each card to the right model/provider. Some tasks have multiple valid answers — teaches that different models have different strengths.

**Key concepts:** Claude, GPT, Gemini, Llama, Anthropic, OpenAI, Google, Meta, open vs closed source, model sizes (Haiku/Sonnet/Opus), when to use which, pricing/tokens

**Quiz:** "You need to analyze a 500-page legal document. Which matters more — model speed or context window size?" → Context window, because the document needs to fit.

#### Module 4: Safety & When AI Fails
**Mini-game: Red Flag Spotter**
AI outputs scroll across the screen (like a news ticker). Some are correct, some are hallucinated, some leak private data, some are biased. Player clicks the red flags before they "ship." Timer pressure. Gets harder as flags become more subtle.

**Key concepts:** Hallucinations, confident wrongness, data privacy (don't paste secrets), bias, verifying output, when NOT to use AI, responsible use

**Quiz:** "The AI confidently says 'The CEO of Anthropic is Sam Altman.' What should you do?" → Verify it independently — AI can state wrong facts with full confidence.

### Part 2: Your Computer (~25 min)

#### Module 5: The Terminal
**Mini-game: File Explorer Adventure**
A pixel-art file system. Player navigates using typed commands (cd, ls, pwd) or by clicking. Missions: "Find the .env file hiding in the config folder", "Create a new directory called 'projects'", "What's inside package.json?" Timer makes it feel like a game.

**Key concepts:** Command line, directories, paths, cd/ls/pwd/mkdir/cat, environment variables, why developers use the terminal instead of clicking around

**Quiz:** "You're in /Users/you/projects/app. You want to go up to the projects folder. What do you type?" → cd ..

#### Module 6: How Code Is Organized
**Mini-game: Wiring Puzzle**
Components shown as boxes: "Frontend", "API", "Database", "Auth". Player drags wires between them to show how data flows. When wired correctly, a little animation shows a user action flowing through the system. Wrong wires spark and disconnect.

**Key concepts:** Files, programming languages (Python/JS/etc), imports, functions, APIs (what they are), JSON, how a web app is structured, what each file type does

**Quiz:** "A user clicks 'Login' on a website. Put these in order: 1) Browser sends request, 2) Database checks password, 3) API receives request, 4) Browser shows success" → 1, 3, 2, 4

#### Module 7: Git & GitHub
**Mini-game: Timeline Builder**
A visual git timeline. Player drags commits onto branches, creates branches by dragging off the main line, merges by connecting branch endpoints. Real scenarios: "Fix the bug on a branch, then merge it back."

**Key concepts:** Version control (why), repositories, commits, branches, merging, pull requests, README files, how to read a GitHub repo, issues

**Quiz:** "You and a coworker both edit the same file at the same time. What happens when you try to merge?" → A merge conflict — you have to choose which changes to keep.

### Part 3: AI Tools You Can Use Today (~25 min)

#### Module 8: AI Chat (Claude.ai)
**Mini-game: Chat Strategist**
Scenarios come in: "Write a blog post", "Debug this error", "Analyze sales data". Player decides: start new conversation or continue existing one? Use a project with knowledge base? Attach a file? Each choice affects the quality of the result (shown as a star rating).

**Key concepts:** Conversations, context persistence, projects, knowledge bases, artifacts/canvas, system prompts, when chat is the right tool vs overkill

**Quiz:** "You're writing a 10-part blog series with consistent voice. Should you: A) Start a new chat each time, B) Use one long conversation, C) Create a project with a style guide?" → C — projects keep context across conversations.

#### Module 9: AI in Your Editor
**Mini-game: Editor Dash**
A simplified code editor view. Cursor blinks. Player sees incomplete code and chooses: accept AI autocomplete suggestion? Open chat sidebar for help? Use AI to refactor a block? Each tool is mapped to a keyboard shortcut. Speed matters — fastest correct completion wins bonus XP.

**Key concepts:** IDEs (VS Code), GitHub Copilot, Cursor, Windsurf, inline completions, chat sidebar, AI-assisted refactoring, when to accept vs reject suggestions

**Quiz:** "AI suggests completing your function. The code looks right but you're not sure it handles empty lists. What do you do?" → Test it with an empty list before accepting.

#### Module 10: AI Coding Agents
**Mini-game: Agent Simulator**
YOU are the AI agent. A user gives you a task ("Add a dark mode toggle"). You see a file tree. You must: 1) Decide which files to read, 2) Plan your changes, 3) Pick tools (Read, Edit, Bash), 4) Execute in the right order. Mistakes (editing before reading, running untested code) cost lives.

**Key concepts:** What agents are (autonomous AI that takes actions), Claude Code, the agentic loop (think → act → observe → repeat), sub-agents, planning, how agents differ from chat

**Quiz:** "An AI agent needs to fix a bug. What should it do FIRST?" → Read the relevant code to understand the problem, not jump straight to editing.

### Part 4: How Agents Actually Work (~25 min)

#### Module 11: Tool Calling
**Mini-game: Toolbox Challenge**
Requests come in: "What's in server.js?", "Change the port to 8080", "Run the tests", "Find all files with 'auth'". Player picks the right tool for each from a toolbox (Read, Edit, Write, Bash, Grep, Glob). Wrong tool = funny failure animation. Combo chains for getting multiple right in a row.

**Key concepts:** Read, Edit, Write, Bash, Grep, Glob, WebSearch, the tool loop (AI proposes → user approves → execute → AI sees result), permissions, why tool calling matters

**Quiz:** "The AI wants to search for all files containing 'password'. Which tool?" → Grep — it searches inside files. Glob finds files by name pattern.

#### Module 12: The Harness
**Mini-game: Control Room**
You're operating the "harness" — the control room that runs an AI agent. Dials and switches control: model selection, temperature, max tokens, permissions (auto-allow vs ask). An agent runs tasks and you adjust settings in real-time. Too permissive = agent runs wild. Too restrictive = agent keeps asking for approval and gets nothing done.

**Key concepts:** What a harness is (the program running the agent), Claude Code as a harness, settings.json, hooks (pre/post tool execution), permissions (auto-allow, ask, deny), CLAUDE.md (instructions for the agent), compaction, context window management

**Quiz:** "Your agent keeps asking permission for every file read. How do you fix it without going fully autonomous?" → Add Read to the auto-allow list in permissions.

#### Module 13: Skills & Plugins
**Mini-game: Skill Builder**
Building blocks on screen: Trigger ("when user says /deploy"), Input ("read the config"), Action ("run build command"), Output ("show deploy URL"). Player drags blocks to assemble a skill. Then tests it — the skill runs and they see the result. Bonus: modify an existing skill by swapping blocks.

**Key concepts:** Slash commands (/commit, /review), skills (reusable AI workflows), plugins (extend capabilities), installing skills, SKILL.md format, how skills get triggered, writing your own skill

**Quiz:** "You do the same 5-step deployment process every day. What should you build?" → A skill — it automates the repeated workflow into one command.

#### Module 14: MCP (Model Context Protocol)
**Mini-game: Server Plugboard**
A central AI brain in the middle. Around it: services (Database, GitHub, Slack, Email, Calendar). Each has a "plug" (MCP server). Player drags cables from services to the AI, configuring each connection. Once connected, the AI can access that service. Test it: "What's my next meeting?" only works after connecting Calendar.

**Key concepts:** MCP protocol (AI ↔ external tools), MCP servers, installing servers (npx, docker), configuration, available servers (filesystem, GitHub, Slack, databases), building custom MCP servers, why MCP matters (standard protocol vs custom integrations)

**Quiz:** "You want your AI agent to read and write to a Postgres database. What do you need?" → An MCP server for Postgres — it translates between the AI and the database.

### Part 5: Building with AI (~20 min)

#### Module 15: The AI API
**Mini-game: API Playground**
A visual API console. Player builds a request by dragging blocks: model selector, message blocks (system, user, assistant), parameters (max_tokens, temperature). Hit "Send" and watch the response stream in character by character. Modify and resend. See how changes affect output.

**Key concepts:** Anthropic/OpenAI APIs, API keys, messages array, roles (system/user/assistant), streaming, structured output, tool definitions in the API, multi-turn conversations, pricing (input vs output tokens)

**Quiz:** "Your API response is cut off mid-sentence. What's likely wrong?" → max_tokens is set too low — increase it to get the full response.

#### Module 16: AI Patterns
**Mini-game: Factory Floor**
A conveyor belt factory. Raw materials (user questions) enter one end. Player builds the processing pipeline by placing machines on the belt: "Retrieve docs" → "Chunk text" → "Generate embeddings" → "Find relevant chunks" → "Send to LLM" → "Return answer". Different pipelines for different patterns (RAG, chains, agents).

**Key concepts:** RAG (Retrieval Augmented Generation), prompt chains, embeddings, vector search, human-in-the-loop, evaluation/testing AI output, guardrails, the build vs buy decision

**Quiz:** "Your AI chatbot keeps giving outdated answers about your product. What pattern fixes this?" → RAG — retrieve current docs before generating the answer.

#### Module 17: Graduation
**Mini-game: The Final Mission**
A multi-stage boss battle combining everything learned. Scenario: "Ship an AI feature for a real app." Player must: 1) Choose the right model, 2) Write the prompt, 3) Set up tool calling, 4) Connect an MCP server, 5) Handle errors, 6) Deploy. Each stage uses mechanics from earlier modules. Complete it to unlock a "graduation" achievement and get directed to Code Quest repo explorer.

**Key concepts:** Everything integrated — this is the capstone that ties all modules together.

## Technical Architecture

### Content Generation
- A one-time script generates all 17 modules by calling Claude with detailed prompts per module
- Output is typed JSON matching existing teaching component interfaces + new mini-game data
- Content saved as static JSON files in `lib/academy/modules/`
- No database needed for Academy — purely client-side

### New Interfaces

```typescript
interface AcademyModule {
  id: string;                         // "what-is-ai", "the-terminal", etc.
  part: number;                       // 1-5
  moduleNumber: number;               // 1-17
  title: string;
  subtitle: string;
  durationMinutes: number;
  mikeIntro: string[];                // Mike's opening dialogue
  miniGame: MiniGame;                 // The core game mechanic
  glossaryTerms: GlossaryTerm[];
  quiz: SmartQuiz;
  xpReward: number;
}

type MiniGame =
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
  | { type: 'final-mission'; stages: { title: string; mechanic: string; data: unknown }[] }

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileSystemNode[];
  content?: string;
}

interface AcademyState {
  completedModules: Set<string>;
  currentModule: string | null;
  xp: number;
  achievements: string[];
}
```

### New Components

Each mini-game type gets its own React component:

```
components/academy/
  AcademyShell.tsx          — Top-level shell (module list + active module)
  ModuleIntro.tsx           — Mike's intro dialogue for each module
  mini-games/
    TokenTetris.tsx         — Falling tokens, arrange into sentences
    PromptLab.tsx           — Prompt comparison + tweaking
    ModelMatchmaker.tsx     — Drag tasks to models
    RedFlagSpotter.tsx      — Click bad AI outputs
    FileExplorer.tsx        — Navigate pixel-art filesystem
    WiringPuzzle.tsx        — Connect components with wires
    TimelineBuilder.tsx     — Git timeline drag-and-drop
    ChatStrategist.tsx      — Choose chat strategies
    EditorDash.tsx          — Code editor simulation
    AgentSimulator.tsx      — Be the AI agent
    ToolboxChallenge.tsx    — Pick the right tool
    ControlRoom.tsx         — Adjust agent settings
    SkillBuilder.tsx        — Assemble skills from blocks
    ServerPlugboard.tsx     — Connect MCP services
    APIPlayground.tsx       — Build and send API requests
    FactoryFloor.tsx        — Build processing pipelines
    FinalMission.tsx        — Multi-stage capstone
```

### Reused Components
- `GlossaryTooltip` — same as repo game
- `SmartQuiz` — same as repo game
- `GroupChat` — same as repo game (for concept characters chatting)
- `DataFlowAnimation` — same as repo game
- `XPBar` — same as repo game
- `PixelButton` — same as repo game

### Pages

```
app/
  page.tsx                  — Updated landing page with Academy + Repo buttons
  academy/
    page.tsx                — Academy module selector
    [module]/page.tsx       — Individual module page
```

### Content Files

```
lib/academy/
  modules/
    01-what-is-ai.json
    02-talking-to-ai.json
    ...
    17-graduation.json
  generate-content.ts       — Script to generate all modules via Claude API
  types.ts                  — Re-export AcademyModule, MiniGame, etc.
```

## XP & Progression

- Each module: +100 XP
- Perfect quiz: +50 XP bonus
- Mini-game high score: +25 XP bonus
- Completing a Part (all modules in it): +200 XP bonus + achievement
- Completing all 17: "AI Academy Graduate" achievement + special badge shown in repo games

Levels same as repo game (Observer → Code Whisperer) — XP is shared across Academy and repo games.

## What Stays the Same

- All v2 repo game functionality unchanged
- Same pixel art aesthetic, fonts, colors
- Same XP system (shared)
- Same teaching components (reused)
- Same deployment (Vercel)

## What's New

- 17 mini-game components (the bulk of the work)
- Academy shell + module pages
- Static content JSON files (generated once)
- Updated landing page
- Content generation script

## Out of Scope

- Multiplayer / leaderboards
- User accounts / progress persistence across devices (localStorage only)
- Mobile responsive
- Sound effects
- Content updates after initial generation
