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
