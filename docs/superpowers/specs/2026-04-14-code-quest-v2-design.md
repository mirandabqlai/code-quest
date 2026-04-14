# Code Quest v2 — Design Spec

## Vision

Upgrade Code Quest from a functional prototype into a polished, pixel-art educational game that combines the **living office feel of [pixel-agents](https://github.com/pablodelucca/pixel-agents)** with the **teaching quality of [codebase-to-course](https://github.com/zarazhangrui/codebase-to-course)**.

The core experience: you paste a GitHub repo URL and get a top-down pixel-art office where each room IS a real folder in the codebase. An office manager named Mike walks you through the building, then you explore each room's character, code, and challenges at your own pace.

## What Changes from v1

| Area | v1 (Current) | v2 (This Spec) |
|------|-------------|-----------------|
| Office rendering | CSS boxes + emoji characters | Canvas 2D pixel-art engine with animated sprites |
| Office structure | Flat grid of all characters | Rooms = folders, connected by doorways |
| Entry experience | Immediately see all game modes | Mike the Office Manager guides you first |
| Character interaction | Click character → right panel mode | Click room → enter room → tabbed mini-hub |
| Teaching content | Basic dialogue + multiple choice quizzes | Code-to-English, group chat, glossary tooltips, data flow animations, smart quizzes |
| Game modes | 6 separate modes in right panel | Challenges distributed per-room + cross-office boss battle |
| Sprites | Emoji in bordered boxes | Real pixel-art characters that walk, sit, type, wander |

## Game Flow

```
1. LANDING PAGE
   User pastes a GitHub repo URL
   → AI reads repo, generates game content (same pipeline as v1, enhanced prompts)
   → Redirect to game page

2. MIKE'S GUIDED TOUR
   Mike the Office Manager greets you
   → Walks you room by room through the office
   → Introduces each character as you pass their room
   → Shows how rooms connect by tracing a real user action
   → Uses group chat + data flow animations during tour
   → Ends: "You're ready to explore on your own!"

3. FREE EXPLORATION
   All rooms unlock after Mike's tour
   → Click any room to enter it
   → Each room is a mini-hub with 3 tabs (Story, Code, Challenges)
   → Complete tabs to master a room
   → Mastered rooms glow on the office map

4. BOSS BATTLE
   Unlocks after mastering 3+ rooms
   → Cross-office feature request challenge
   → Tests understanding of how multiple rooms work together
```

## Mike the Office Manager

Mike is a special character generated for every game. Unlike other characters who own specific folders, Mike knows the whole codebase.

**Role:** First-day onboarding guide. He gives the big picture before anyone dives into details.

**What Mike does during his tour:**
- Welcomes you and explains what this project/app does (in plain English)
- Walks you through the building room by room, showing the folder structure spatially
- Introduces each character as you pass their room ("That's Roxi — she handles everything that comes through the front door")
- Traces a real user action through the office end-to-end (e.g., "When someone visits the site, the request goes from Reception → API Room → AI Lab → Archives → back to Reception")
- Uses group chat animations and data flow diagrams during the tour
- Ends with: "You're ready to explore on your own! Click any room to go deeper."

**AI generation:** Mike's tour content is a new generation step. The prompt receives the full analysis (characters, folder tree, data flows) and produces:
- Mike's welcome dialogue (what does this project do, in plain English)
- Room-by-room introduction script (one line per room/character)
- One end-to-end traced user action with group chat messages
- A data flow animation sequence

## The Office = The Codebase

### Room-to-Folder Mapping

The AI analysis step maps major folders/modules to office rooms. Each room has:
- **A name** — themed to the folder's purpose (e.g., "Reception" for `/app`, "Archives" for `/lib/db`)
- **A floor color/texture** — distinct per room so you can tell them apart visually
- **A character** — the NPC who "works" in this room and owns those files
- **Furniture** — themed to the character's role (bookshelves for archives, monitors for API handlers, etc.)
- **Doorways** — connections to other rooms that represent real code dependencies

### Room Layout

The office is a top-down grid. Rooms are placed based on their relationships:
- Entry-point folders (like `/app` or `src/pages`) are near the front/reception
- Backend/data folders are deeper in the building
- Closely related folders are adjacent rooms with doorways between them

The AI determines the layout based on the dependency graph. The Canvas engine renders it as a continuous office floor plan.

### Example (for a Next.js app)

```
┌─────────────┬──────────────┬──────────────┐
│  RECEPTION  │  API ROOM    │  WORKSHOP    │
│  /app       │  /api        │  /components │
│  (Roxi)     │  (Dusty)     │  (Babel)     │
├─────────────┼──────────────┼──────────────┤
│  AI LAB     │  MAP ROOM    │  ARCHIVES    │
│  /lib/ai    │  /lib/game   │  /lib/db     │
│  (Tally)    │  (Atlas)     │  (Slate)     │
└─────────────┴──────────────┴──────────────┘
```

Room names, characters, and layout are all AI-generated per repo. The above is illustrative only.

**Constraints:**
- 4-8 rooms per game (maps to 4-8 major folders/modules in the codebase)
- Grid layout is max 4 columns × 3 rows
- If a repo has more folders than rooms, the AI groups related folders into one room
- If a repo is very small (1-3 folders), rooms can represent individual files or concepts

## Inside a Room: The Tabbed Mini-Hub

When you click a room to enter it, the view changes:
- **Left panel:** The room's pixel-art interior (character at desk, room-specific furniture)
- **Right panel:** Three tabs

### Tab 1: Story

The character tells their story through dialogue, group chats, and data flow animations.

**Content includes:**
- Character introduction ("I'm Roxi, the front door of this app...")
- What this folder/module does, explained conversationally
- How this character connects to others (group chat showing messages between characters)
- Data flow animation showing a request passing through this room
- Key concepts explained with glossary tooltips on every technical term

**Interaction:** Click/tap to advance dialogue. Group chat messages animate in one at a time. Data flow plays on a "Start" button.

### Tab 2: Code

Real code from the repo, explained in plain English.

**Content includes:**
- Key files in this folder, shown one at a time
- Side-by-side layout: actual code on the left, line-by-line plain English on the right
- Glossary tooltips on every technical term in the English explanation
- Hover a line in the English side to highlight the matching code (and vice versa)

**Quality rules (from codebase-to-course):**
- Code is NEVER modified or simplified — it's exact from the repo
- Choose naturally short snippets (5-15 lines) rather than simplifying long ones
- Every technical word gets a tooltip ("if there is even a 1% chance a non-technical person doesn't know a word, tooltip it")
- The English explanation answers "what does this do?" and "why does it matter?"

### Tab 3: Challenges

A mission board with per-room challenges. Each earns XP.

**Challenge types per room:**
- **Quiz** (+25 XP per correct answer) — Application-based questions. "A user reports X is broken. Where in this room would you look?" Wrong answers get encouraging explanations that teach something.
- **Mail Sort** (+100 XP) — Drag characters into the correct order for a data flow that passes through this room.
- **Bug Hunt** (+150 XP) — Side-by-side code from this room's files. Find the one line that was changed. 3 lives, hints available.
- **Boss Challenge** (+200 XP, unlocks last) — A mini feature request scoped to this room.

**Progression:** Complete all challenges to "master" the room. Mastered rooms glow gold on the office map.

## Teaching Tools

These are the interactive elements used across Story and Code tabs. All inspired by codebase-to-course.

### 1. Code-to-English Blocks

Side-by-side: real code on the left, plain English explanation on the right. Lines are linked — hover one side to highlight the other.

**Rules:**
- Code is exact from the repo, never simplified
- English is conversational, assumes zero coding knowledge
- One block per key file, 5-15 lines each

### 2. Glossary Tooltips

Every technical term gets a hover tooltip with a one-sentence plain English definition.

**Rules:**
- Tooltip on first use per room (not globally — you might forget between rooms)
- Definitions use everyday analogies ("An API route is a door that lets the outside world talk to your app")
- Each tooltip also appears in a room-level glossary panel (accessible anytime)

### 3. Group Chat Animations

iMessage-style chat between characters showing how components communicate. Messages animate in one at a time with typing indicators.

**Example:**
```
ROXI: Hey team, someone just pasted a GitHub link! 📬
DUSTY: Got it! Let me read the repo first... 📖
TALLY: Send me the code when you're ready. I'll figure out who works where. 🧠
SLATE: I'll save everything once Tally's done. Just say when. 💾
```

**Rules:**
- Each character uses their color for the chat bubble border
- Messages appear with a short delay between each (300-500ms)
- Used in both Mike's tour and individual room Story tabs

### 4. Data Flow Animations

Animated diagram showing a request/action traveling room to room. Each node represents a character/room. Click "Start" to watch the packet move step by step.

**Rules:**
- Nodes light up sequentially with a brief pause at each
- Arrows animate between nodes
- Each step can optionally show a one-line description ("Roxi receives the URL")
- Multiple data flows per game (different user actions)

### 5. Smart Quizzes

Multiple-choice questions that test understanding, not memory.

**Question design rules (from codebase-to-course):**
- NEVER ask definition questions ("What does API stand for?")
- NEVER ask file name recall ("Which file handles routing?")
- ALWAYS ask application questions ("You want to add a favorites feature. Which rooms would you change?")
- ALWAYS ask debugging questions ("A user reports X is broken. Where would you look first?")
- Wrong answers get encouraging explanations that teach something new
- No scores displayed — the quiz is a "thinking exercise, not an exam"

### 6. Bug Hunts

Side-by-side code comparison. Original on the left (correct), clone on the right (has exactly one line changed). Find the bug.

**Rules:**
- Bugs are realistic: wrong variable, missing await, reversed condition, off-by-one
- 3 lives per round
- Hint available (highlights area near the bug, costs bonus XP)
- After solving, the room's character explains the real-world consequence of the bug

## Pixel Art Engine

### Rendering Approach

Canvas 2D for the office scene. React for all UI overlays (chat bubbles, tooltips, tabs, panels).

The Canvas renders:
- Tile-based floor (16x16 tiles, checkered pattern, different colors per room)
- Walls and doorways between rooms
- Furniture (desks, monitors, bookshelves, plants — per room theme)
- Character sprites with animations

React overlays on top of the Canvas:
- Speech/dialogue bubbles
- Tooltips and labels
- The entire right panel (tabs, content, challenges)
- XP bar, progress indicators
- Navigation (back button, room selector)

### Characters

Pixel-art sprites with multiple animation states:
- **Idle** — Slight breathing/bobbing animation
- **Walk** — 4-directional walking (used during Mike's tour and wandering)
- **Sit/Type** — At desk, hands moving on keyboard
- **Talk** — Facing the camera when in dialogue

Characters are rendered as small pixel people (16x16 base size, rendered at 2x on screen = 32px) with distinct:
- Hair color/style
- Outfit color (matches their character color from the AI analysis)
- Skin tone (varied across cast)

**Sprite generation approach:** Base character templates with color palette swapping. The AI assigns each character a color; the engine applies that color to clothing/accent pixels. This gives visual variety from a small set of base sprites (similar to pixel-agents' hue-shifting approach).

### Furniture

Each room type has a furniture set:
- **Reception/entry:** Front desk, welcome sign, plant
- **API/server room:** Server rack, cable runs, blinking LEDs
- **Component workshop:** Workbench, toolbox, component cards pinned to wall
- **AI/analysis lab:** Brain display, whiteboard with diagrams
- **Game/logic room:** Map table, strategy boards, dice
- **Database/archives:** Filing cabinets, bookshelves, ledgers
- **Generic office items:** Desks, chairs, monitors, coffee mugs, potted plants

Furniture is drawn at fixed positions within each room tile area. The AI determines room types; the engine picks furniture sets to match.

### Camera

- **Zoomed out (office overview):** See all rooms, characters as small sprites, room labels visible. This is the default view after Mike's tour.
- **Zoomed in (inside a room):** Room fills the left panel. Character is larger, furniture detail visible. This is the view when you click a room.
- **Smooth transitions** between zoom levels when entering/exiting rooms.

### Z-Sorting

All drawable objects (furniture, characters) are collected into an array, sorted by Y-coordinate, and drawn back-to-front. This creates proper depth — a character standing behind a desk is partially hidden by it.

## AI Generation Pipeline

### Existing Steps (kept, with enhanced prompts)

1. **Read repo** via GitHub API (unchanged)
2. **Analyze repo** → characters, folder tree, data flows (enhanced: also generates room layout, room names, room types, Mike's character)
3. **Generate tour content** → per-character dialogue, code snippets, quizzes (enhanced: code-to-English blocks, glossary terms, group chat scripts)
4. **Generate mode content** → mail room scenarios, bug hunt rounds (enhanced: scoped per-room instead of global)
5. **Generate advanced content** → boss battle (enhanced: cross-office feature requests)

### New Step: Mike's Tour Generation

After analysis, before per-character content:
- Input: Full analysis (characters, rooms, folder tree, data flows)
- Output: Mike's welcome script, room-by-room introductions, one traced end-to-end user action, group chat messages for the tour, data flow animation sequence

### Enhanced Analysis Output

The analysis step now also produces:

```typescript
interface OfficeLayout {
  rooms: Room[];
  connections: Connection[];
  mike: MikeCharacter;
}

interface Room {
  id: string;
  name: string;           // "Reception", "API Room", etc.
  type: RoomType;         // determines furniture set
  folder: string;         // "/app", "/api", etc.
  characterId: string;    // which character works here
  position: { row: number; col: number };
  floorColor: string;     // hex color for this room's floor
}

interface Connection {
  from: string;   // room id
  to: string;     // room id
  label?: string; // "handles requests", "reads data", etc.
}

interface MikeCharacter {
  welcomeDialogue: string[];
  roomIntros: { roomId: string; intro: string }[];
  tracedAction: {
    title: string;
    steps: { roomId: string; description: string; characterDialogue: string }[];
    groupChat: GroupChatMessage[];
    dataFlow: DataFlowStep[];
  };
}
```

### Enhanced Per-Character Content

Each character's content now includes:

```typescript
interface CharacterContent {
  // Story tab
  storyDialogue: DialogueStep[];         // character's narrative
  groupChats: GroupChatMessage[][];       // chats involving this character
  dataFlows: DataFlowAnimation[];        // flows passing through this room

  // Code tab
  codeBlocks: CodeToEnglishBlock[];      // side-by-side code + English
  glossaryTerms: GlossaryTerm[];         // all terms used in this room

  // Challenges tab
  quizzes: SmartQuiz[];                  // application-based questions
  mailSort: MailSortChallenge[];         // data flow ordering
  bugHunt: BugHuntRound[];              // per-room bug hunts
  bossChallenge: BossChallenge;          // room-scoped feature request
}

interface CodeToEnglishBlock {
  file: string;              // real file path
  startLine: number;
  code: string[];            // exact lines from repo
  english: string[];         // one explanation per code line
  glossaryRefs: string[];    // term IDs referenced in explanations
}

interface GlossaryTerm {
  id: string;
  term: string;              // "API route"
  definition: string;        // "A door that lets the outside world talk to your app"
}

interface GroupChatMessage {
  characterId: string;
  message: string;
  delay: number;             // ms before this message appears
}

interface DataFlowStep {
  roomId: string;
  characterId: string;
  description: string;       // one-line: "Roxi receives the URL"
}

interface SmartQuiz {
  characterId: string;       // who's asking
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
}
```

## XP and Progression

### XP Sources

| Action | XP |
|--------|-----|
| Complete a Story tab | +50 |
| Complete a Code tab (read all blocks) | +50 |
| Quiz correct answer | +25 |
| Mail Sort complete | +100 |
| Bug Hunt solve | +150 |
| Room Boss Challenge | +200 |
| Office Boss Battle | +300 |

### Levels

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Observer |
| 2 | 100 | Intern |
| 3 | 300 | Junior |
| 4 | 600 | Senior |
| 5 | 1000 | Architect |
| 6 | 1500 | Code Whisperer |

### Room Mastery

Each room tracks completion of its three tabs:
- Story: watched all dialogue
- Code: read all code-to-English blocks
- Challenges: completed all challenges (quizzes, bug hunt, mail sort, boss)

Mastered rooms glow gold on the office map. Office Boss Battle unlocks after mastering 3+ rooms.

## Screen Layout

### Office View (zoomed out)

```
┌──────────────────────────────────────────────────────────┐
│ [XP BAR]  Level 3 — Junior      ████████░░  450/600 XP  │
├────────────────────────┬─────────────────────────────────┤
│                        │                                 │
│   PIXEL ART OFFICE     │   INTERACTION PANEL             │
│   (Canvas)             │   (React)                       │
│                        │                                 │
│   Rooms visible        │   When no room selected:        │
│   Characters walking   │   Office overview, room list,   │
│   Click room to enter  │   progress summary              │
│                        │                                 │
│   ~45% width           │   ~55% width                    │
│                        │                                 │
├────────────────────────┴─────────────────────────────────┤
│ [ROOM MASTERY]  ●●●○○○  3/6 rooms mastered              │
└──────────────────────────────────────────────────────────┘
```

### Room View (zoomed in)

```
┌──────────────────────────────────────────────────────────┐
│ [← BACK TO OFFICE]    Roxi's Room — /app      [XP BAR]  │
├────────────────────────┬─────────────────────────────────┤
│                        │ [STORY]  [CODE]  [CHALLENGES]   │
│   ROOM INTERIOR        │─────────────────────────────────│
│   (Canvas, zoomed)     │                                 │
│                        │   Tab content:                  │
│   Character at desk    │   - Story: dialogue + chat      │
│   Room furniture       │   - Code: code-to-English       │
│   Detailed view        │   - Challenges: mission board   │
│                        │                                 │
│   ~40% width           │   ~60% width                    │
│                        │                                 │
├────────────────────────┴─────────────────────────────────┤
│ [ROOM PROGRESS]  Story ✓  Code ✓  Challenges ○           │
└──────────────────────────────────────────────────────────┘
```

### Mike's Tour (guided)

```
┌──────────────────────────────────────────────────────────┐
│ MIKE'S OFFICE TOUR                            [XP BAR]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   FULL-WIDTH PIXEL ART OFFICE (Canvas)                   │
│   Camera follows Mike as he walks room to room           │
│                                                          │
│   ┌──────────────────────────────────────┐               │
│   │ MIKE: "Welcome! Let me show you     │               │
│   │ around the office..."               │               │
│   │                        [CONTINUE →] │               │
│   └──────────────────────────────────────┘               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Tour progress:  ●●●○○○○  Introduction                    │
└──────────────────────────────────────────────────────────┘
```

## What Stays the Same

- **Landing page:** Paste URL, see generation progress, redirect to game (may get visual polish but same flow)
- **Database schema:** Same Vercel Postgres table, extended columns for new content types
- **GitHub repo reader:** Same API, same file prioritization
- **Deployment:** Same Vercel setup
- **Core generation pipeline:** Same 5-step SSE streaming, enhanced prompts

## What Gets Rebuilt

- **Office scene:** Complete rewrite from CSS to Canvas 2D engine
- **Character system:** From emoji to pixel-art sprites with animation states
- **Game modes:** From 6 global modes to per-room tabbed content (Story, Code, Challenges)
- **AI prompts:** Major rewrite to generate room layouts, Mike's tour, code-to-English blocks, glossary terms, group chats, per-room challenges
- **Interaction panel:** From mode selector to room-based tabbed interface
- **Content rendering:** New components for code-to-English, group chat, data flow animation, glossary tooltips

## Out of Scope for v2

- Mobile responsive layout (desktop-first for now)
- GitHub OAuth / private repos
- Sound effects (SoundManager exists, wiring deferred)
- Leaderboards or social features
- Custom sprite upload
- Multiplayer
