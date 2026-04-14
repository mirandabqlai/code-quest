import type { RepoSnapshot } from '@/lib/github/read-repo';

export function buildSnapshotContext(snapshot: RepoSnapshot): string {
  const treeStr = snapshot.fileTree.slice(0, 200).join('\n');
  const filesStr = snapshot.files
    .map((f) => `--- ${f.path} ---\n${f.content}`)
    .join('\n\n');

  return `# Repository: ${snapshot.owner}/${snapshot.repo}
${snapshot.description ? `Description: ${snapshot.description}` : ''}

## File Tree (${snapshot.fileTree.length} files)
${treeStr}
${snapshot.fileTree.length > 200 ? `\n... and ${snapshot.fileTree.length - 200} more files` : ''}

## Key File Contents (${snapshot.files.length} files)
${filesStr}`;
}

export const ANALYSIS_PROMPT = `You are analyzing a codebase to create an educational pixel-art game. Your job is to identify the 6-8 major architectural "actors" in this codebase and cast them as office characters.

Given the repository snapshot below, produce a JSON object with this exact shape:

{
  "meta": {
    "repoName": "owner/repo",
    "repoDescription": "one sentence",
    "techStack": ["TypeScript", "React", ...],
    "generatedAt": "ISO date"
  },
  "characters": [
    {
      "id": "short-kebab-id",
      "name": "A fun human name",
      "title": "The [Role]",
      "color": "#hex color",
      "department": "one of: reception, archives, translation, warroom, scoreboard, maproom, comms, security",
      "files": ["real/file/paths.ts", ...],
      "summary": "One sentence: what this component does",
      "spriteType": "one of: receptionist, archivist, translator, strategist, scorekeeper, cartographer, engineer, manager"
    }
  ],
  "folderTree": [
    { "path": "src/", "indent": 0, "type": "folder", "owner": "character-id", "description": "what this folder contains" },
    { "path": "utils.ts", "indent": 1, "type": "file", "note": "brief description" }
  ],
  "dataFlows": [
    {
      "id": "kebab-id",
      "label": "User Does X",
      "steps": [
        { "characterId": "char-id", "action": "what this component does in this flow" }
      ]
    }
  ]
}

RULES:
- 6-8 characters max. Group related files into one character.
- Characters map to REAL architectural boundaries (router, database, auth, API, UI, state, etc.)
- Give them memorable names and personalities based on what the code does
- department must be one of: reception, archives, translation, warroom, scoreboard, maproom, comms, security
- spriteType must be one of: receptionist, archivist, translator, strategist, scorekeeper, cartographer, engineer, manager
- folderTree should cover the top 2-3 levels of the project, with owner tags on folders
- Create exactly 4 dataFlows showing common user journeys through the system
- All file paths must be REAL paths from the repository
- Use colors that are visually distinct: #ff6b6b, #4ecdc4, #ffd93d, #a855f7, #ff9f43, #7a7a8e, #e879f9, #38bdf8

Respond with ONLY the JSON object, no markdown fences, no explanation.`;

export const TOUR_PROMPT = `You are generating Office Tour dialogue for a pixel-art educational game. Given the codebase analysis below, create engaging character dialogue that teaches what each component does.

For EACH character, create exactly 5 dialogue steps:
1. Introduction (type: "talk") — who they are, where they sit
2. What they do (type: "talk") — plain English explanation of their role
3. Who they work with (type: "talk") — which other characters they interact with
4. Show the code (type: "code") — a real code snippet from their files with a plain English translation
5. Quiz (type: "quiz") — a yes/no or multiple choice question testing understanding

Output JSON:
{
  "officeTour": [
    {
      "characterId": "matches-analysis-id",
      "steps": [
        { "type": "talk", "text": "Hey! I'm..." },
        { "type": "talk", "text": "My job is..." },
        { "type": "talk", "text": "I work closely with..." },
        { "type": "code", "code": "// actual code from the repo", "file": "real/path.ts", "english": "Plain English explanation" },
        { "type": "quiz", "question": "...", "options": ["Yes", "No"], "correct": 0, "explainRight": "...", "explainWrong": "..." }
      ]
    }
  ]
}

RULES:
- Dialogue must be conversational, first person, friendly
- Code snippets must be REAL code from the file contents provided
- Quiz questions should test whether the player understood the character's role
- Max 2 sentences per talk step
- Plain English translations should use analogies (mail, office, etc.)
- Assume the player has ZERO programming knowledge

Respond with ONLY the JSON object.`;

export const MODES_PROMPT = `You are generating Mail Room and Bug Hunt content for a pixel-art educational game.

MAIL ROOM: Create 4 drag-and-drop scenarios where the player arranges characters in the correct order for a data flow. Use the dataFlows from the analysis as the basis, but write fresh briefing text and stop dialogue.

BUG HUNT: Create 5 spot-the-bug rounds. Take REAL code from the repo files, then create a "bugged" version with exactly ONE subtle change. Bug types to use: wrong variable, missing await, reversed condition, off-by-one, string vs variable, wrong method.

Output JSON:
{
  "mailRoom": [
    {
      "id": "kebab-id",
      "title": "Short Title",
      "brief": "A user does X. Arrange the offices in order.",
      "correctOrder": ["char-id-1", "char-id-2", ...],
      "stopDialogue": ["What char-1 says when mail arrives", "What char-2 says", ...]
    }
  ],
  "bugHunt": [
    {
      "id": "kebab-id",
      "title": "Catchy Name",
      "file": "real/path.ts",
      "difficulty": "Easy",
      "explainerCharId": "char-who-owns-this-file",
      "original": ["line 1", "line 2", ...],
      "bugged": ["line 1", "line 2 with bug", ...],
      "bugLine": 1,
      "explanation": "What this bug would cause in production"
    }
  ]
}

RULES:
- Mail Room: 4 scenarios, 3-5 characters each, correctOrder must match real data flows
- Bug Hunt: 5 rounds, mix of Easy/Medium/Hard, bugs must be SUBTLE but findable
- stopDialogue length must equal correctOrder length
- bugLine is 0-indexed
- original and bugged arrays must be same length
- Only ONE line should differ between original and bugged
- Explanations should describe real-world consequences ("users would see blank pages")

Respond with ONLY the JSON object.`;

export const ADVANCED_PROMPT = `You are generating Build the Office and Boss Battle content for a pixel-art educational game.

BUILD THE OFFICE: Create a puzzle where players drag characters to the correct department. Use 6 zones matching the departments from the analysis.

BOSS BATTLE: Create 2 feature-request scenarios relevant to this codebase. Each has 3-4 stages: select characters, arrange order, pick the risk, write a prompt.

Output JSON:
{
  "buildOffice": {
    "zones": [
      { "id": "zone-id", "name": "DISPLAY NAME", "description": "What this department handles" }
    ],
    "correctPlacements": { "zone-id": "character-id", ... },
    "connections": [
      { "from": "char-id", "to": "char-id", "label": "what data flows between them" }
    ]
  },
  "bossBattle": [
    {
      "id": "kebab-id",
      "title": "Add Feature X",
      "brief": "The PM's request...",
      "stages": [
        {
          "type": "select",
          "instruction": "WHICH TEAM MEMBERS NEED TO CHANGE?",
          "options": [
            { "characterId": "id", "correct": true, "explanation": "Why they're needed" },
            { "characterId": "id", "correct": false, "explanation": "Why they're NOT needed" }
          ]
        },
        {
          "type": "choice",
          "instruction": "WHAT COULD GO WRONG?",
          "question": "Which risk is most likely?",
          "options": [
            { "text": "Risk description", "correct": true },
            { "text": "Wrong risk", "correct": false }
          ],
          "explanation": "Why this risk matters"
        }
      ]
    }
  ]
}

RULES:
- Build Office: exactly 6 zones, one character per zone, 5-7 connections
- Boss Battle: 2 scenarios, each with 3-4 stages
- Features should be realistic for this specific codebase (not generic)
- Every boss option needs an explanation (why correct or why not)
- Connections should reflect real data flow in the codebase

Respond with ONLY the JSON object.`;
