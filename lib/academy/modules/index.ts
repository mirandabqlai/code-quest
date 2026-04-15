// lib/academy/modules/index.ts
//
// All 17 academy modules with full educational content. Each module has:
//   - mikeIntro: Mike's warm, jargon-free opening dialogue
//   - miniGame: Real playable data for the module's game mechanic
//   - quiz: One application-based question (tests judgment, not memorization)
//   - glossaryTerms: 3-5 key terms with plain English definitions
//
// Content is accurate, assumes zero technical knowledge, and uses humor
// and real-world analogies throughout. Mike is the friendly office manager
// who makes complex AI topics feel approachable.

import type { AcademyModule } from '@/lib/academy/types';

export const MODULES: AcademyModule[] = [
  // =====================================================================
  // PART 1: FOUNDATIONS
  // =====================================================================

  // --- Module 1: What is AI, Really? ---
  {
    id: 'what-is-ai',
    part: 1,
    moduleNumber: 1,
    title: 'What is AI, Really?',
    subtitle: 'Tokenization, prediction, and how LLMs actually work',
    durationMinutes: 8,
    mikeIntro: [
      "Welcome to your first day! Before we dive into anything technical, let me explain what AI actually is — it's simpler than you think.",
      "AI isn't magic. It's basically the world's best autocomplete. It reads a bunch of text, learns patterns, and predicts what word should come next.",
      "Let's play a game to see how that works. I'm going to give you some word fragments — called tokens — and you'll arrange them into sentences. Watch the prediction meter as you go!",
    ],
    miniGame: {
      type: 'token-tetris',
      tokens: [
        'AI', 'predicts', 'the', 'next', 'word', 'in', 'a', 'sentence',
        'Language', 'models', 'learn', 'from', 'patterns', 'text',
        'Tokens', 'are', 'pieces', 'of', 'words', 'that', 'AI', 'reads',
      ],
      validSentences: [
        'AI predicts the next word in a sentence',
        'Language models learn from patterns in text',
        'Tokens are pieces of words that AI reads',
        'AI models learn from text',
      ],
      speedMs: 1000,
    },
    glossaryTerms: [
      { id: 'ai', term: 'AI (Artificial Intelligence)', definition: 'Software that can learn patterns from data and make predictions — like autocomplete, but for almost anything.' },
      { id: 'llm', term: 'LLM (Large Language Model)', definition: 'An AI trained on massive amounts of text so it can understand and generate human language. ChatGPT and Claude are LLMs.' },
      { id: 'token', term: 'Token', definition: 'A small piece of text that an AI reads — usually a word or part of a word. "unhappiness" might be three tokens: "un", "happi", "ness".' },
      { id: 'training-data', term: 'Training Data', definition: 'The text an AI learned from. Like how you learned English by reading and hearing millions of sentences as a kid.' },
      { id: 'prediction', term: 'Next-Word Prediction', definition: 'The core trick behind LLMs: given some text, guess which word most likely comes next. "The capital of France is ___" → "Paris".' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'An LLM sees the text "The capital of France is ___". What is the AI actually doing to fill in the blank?',
      options: [
        { text: 'Looking up the answer in a database', correct: false, explanation: 'LLMs don\'t have a database of facts. They predict based on patterns learned during training.' },
        { text: 'Predicting the most likely next word based on patterns it learned', correct: true, explanation: 'Exactly! An LLM is a prediction engine. It saw "The capital of France is Paris" thousands of times during training, so "Paris" has the highest probability.' },
        { text: 'Understanding geography and reasoning about capital cities', correct: false, explanation: 'LLMs don\'t truly "understand" concepts the way humans do. They recognize statistical patterns in text. The result looks like understanding, but the mechanism is pattern matching.' },
        { text: 'Searching the internet for the answer', correct: false, explanation: 'Basic LLMs don\'t search the internet. They only know what was in their training data. Some AI tools add internet search as an extra feature, but the core LLM itself just predicts.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 2: Talking to AI ---
  {
    id: 'talking-to-ai',
    part: 1,
    moduleNumber: 2,
    title: 'Talking to AI',
    subtitle: 'Prompts, context windows, and why phrasing matters',
    durationMinutes: 8,
    mikeIntro: [
      "The way you talk to AI changes everything. Same question, totally different answers — just because of how you phrased it.",
      "Think of it like ordering food. 'Give me something good' vs 'I'd like a medium-rare ribeye with garlic butter, no onions.' Which order gets you a better meal?",
      "Let's test this out. I'll give you a task and three different prompts. See which one gets the best result — and learn why.",
    ],
    miniGame: {
      type: 'prompt-lab',
      task: 'Write an email to your team announcing a new company policy: all meetings must have an agenda shared 24 hours in advance.',
      prompts: [
        {
          text: 'Write an email about meetings.',
          quality: 25,
          explanation: 'Way too vague! The AI doesn\'t know what kind of email, who it\'s for, or what about meetings. You\'d get a generic, useless response. It\'s like telling a chef "make food" — technically correct, but not helpful.',
        },
        {
          text: 'Write a professional email to my team about a new meeting policy. The policy is that all meetings must have an agenda shared 24 hours in advance. Keep it friendly but firm.',
          quality: 70,
          explanation: 'Much better! This tells the AI the audience (team), the topic (new policy), the details (agenda, 24 hours), and the tone (friendly but firm). You\'d get a solid, usable email.',
        },
        {
          text: 'Write a professional email to my engineering team (about 15 people) announcing a new policy: all meetings must have an agenda shared at least 24 hours in advance. Tone: friendly but firm. Include: why this matters (respects everyone\'s time), what happens if no agenda is shared (meeting gets cancelled), and when it starts (next Monday). Keep it under 200 words. Sign it from me, Jordan.',
          quality: 95,
          explanation: 'This is an expert-level prompt. It specifies audience, content, tone, structure, length, consequences, timing, and signature. The AI has everything it needs to write exactly what you want on the first try. No back-and-forth needed.',
        },
      ],
      sliders: ['Specificity', 'Context', 'Examples', 'Constraints'],
    },
    glossaryTerms: [
      { id: 'prompt', term: 'Prompt', definition: 'The text you type to an AI. It\'s your instruction, question, or request. Better prompts = better answers.' },
      { id: 'context-window', term: 'Context Window', definition: 'How much text an AI can "see" at once — like its short-term memory. If your conversation gets too long, it forgets the beginning.' },
      { id: 'system-prompt', term: 'System Prompt', definition: 'Hidden instructions that tell the AI how to behave. Like a manager briefing a new employee before they start: "Be helpful, be concise, don\'t make stuff up."' },
      { id: 'temperature', term: 'Temperature', definition: 'A setting that controls how creative or predictable the AI is. Low temperature = safe, expected answers. High temperature = wild, creative answers.' },
      { id: 'few-shot', term: 'Few-Shot Examples', definition: 'Giving the AI a few examples of what you want before asking it to do something. Like showing a painter a reference photo before they start.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You ask AI to "Write code" and get a useless mess. You then ask "Write a Python function that takes a list of numbers and returns the average, with error handling for empty lists." Which gets better results, and why?',
      options: [
        { text: 'Both are equally good — the AI understands what you mean either way', correct: false, explanation: 'AI doesn\'t read your mind. It literally works with the words you give it. Vague input = vague output.' },
        { text: 'The specific one is better because AI works better with clear, detailed instructions', correct: true, explanation: 'Nailed it. The second prompt tells the AI the language (Python), the input (list of numbers), the output (average), and edge cases (empty lists). Specificity is the #1 skill for getting good AI results.' },
        { text: 'The short one is better because AI gets confused by long prompts', correct: false, explanation: 'The opposite is usually true. AI handles long, detailed prompts well — they give it more context to work with. Short, vague prompts leave too much for the AI to guess.' },
        { text: 'The specific one is better but only because it mentions Python', correct: false, explanation: 'The language helps, but it\'s the whole package: function type, input, output, and error handling. Every detail reduces ambiguity and improves the result.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 3: The AI Landscape ---
  {
    id: 'ai-landscape',
    part: 1,
    moduleNumber: 3,
    title: 'The AI Landscape',
    subtitle: 'Claude, GPT, Gemini — who does what and when to use which',
    durationMinutes: 7,
    mikeIntro: [
      "There are a LOT of AI models out there. Claude, GPT, Gemini, Llama — it can feel like a zoo. Let me help you make sense of it.",
      "Each model has strengths. Some are fast and cheap (great for simple tasks). Some are slow and powerful (great for hard problems). Some can see images. Some can browse the web.",
      "Let's play matchmaker — I'll give you real tasks, and you'll figure out which model fits best.",
    ],
    miniGame: {
      type: 'model-matchmaker',
      tasks: [
        {
          description: 'Quickly summarize a short email into 3 bullet points',
          validModels: ['Claude Haiku', 'GPT-4o Mini'],
          bestModel: 'Claude Haiku',
          explanation: 'This is a simple, fast task. A small, cheap model like Haiku or GPT-4o Mini handles it perfectly. Using a big model here wastes money and time — like hiring a PhD to sort your mail.',
        },
        {
          description: 'Analyze a 200-page legal contract for potential risks',
          validModels: ['Claude Opus', 'GPT-4o', 'Gemini 1.5 Pro'],
          bestModel: 'Claude Opus',
          explanation: 'Long, complex documents need a model with a large context window (to fit all 200 pages) and strong reasoning ability. Claude Opus and Gemini 1.5 Pro have massive context windows. Speed doesn\'t matter here — accuracy does.',
        },
        {
          description: 'Generate a photorealistic image of a sunset over mountains',
          validModels: ['DALL-E 3', 'Midjourney', 'Stable Diffusion'],
          bestModel: 'Midjourney',
          explanation: 'This needs an image generation model, not a text model! Claude and GPT generate text, not images. DALL-E 3, Midjourney, and Stable Diffusion are purpose-built for creating images.',
        },
        {
          description: 'Build and run an AI-powered app on your own computer for free, without sending data to any company',
          validModels: ['Llama 3', 'Mistral'],
          bestModel: 'Llama 3',
          explanation: 'This requires an open-source model you can run locally. Llama (by Meta) and Mistral are open-source — you download them and run them on your own hardware. Claude and GPT are closed-source cloud services.',
        },
        {
          description: 'Write a nuanced, well-researched essay about the ethics of AI in healthcare',
          validModels: ['Claude Opus', 'GPT-4o', 'Claude Sonnet'],
          bestModel: 'Claude Opus',
          explanation: 'Complex writing with nuance and depth benefits from the most capable models. Claude Opus and GPT-4o excel at thoughtful, structured long-form writing. Smaller models tend to produce more generic content.',
        },
        {
          description: 'Auto-complete code as you type in your editor, hundreds of times per day',
          validModels: ['Claude Haiku', 'GPT-4o Mini', 'Codestral'],
          bestModel: 'Claude Haiku',
          explanation: 'Code autocomplete needs to be FAST (under 500ms) and cheap (you make hundreds of requests per day). Small, fast models are perfect. Using a big model for autocomplete would be slow and expensive.',
        },
      ],
    },
    glossaryTerms: [
      { id: 'model', term: 'Model', definition: 'A specific AI system trained on data. Think of it like a chef — different chefs (models) have different specialties and skill levels.' },
      { id: 'open-source', term: 'Open Source', definition: 'Software whose code is freely available for anyone to use, modify, and run. Llama and Mistral are open-source models you can run on your own computer.' },
      { id: 'closed-source', term: 'Closed Source / Proprietary', definition: 'Software you can only use through the company\'s service. Claude (Anthropic) and GPT (OpenAI) are closed-source — you access them through their websites or APIs.' },
      { id: 'context-window-size', term: 'Context Window Size', definition: 'How many tokens (roughly words) a model can process at once. A 200K context window can handle about 150,000 words — roughly a 500-page book.' },
      { id: 'model-size', term: 'Model Size (Parameters)', definition: 'How big and capable a model is. Bigger models (Opus, GPT-4) are smarter but slower and more expensive. Smaller models (Haiku, GPT-4o Mini) are faster and cheaper.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You need to analyze a 500-page legal document for your company. Which consideration matters MOST when choosing an AI model for this task?',
      options: [
        { text: 'The model\'s response speed — faster is always better', correct: false, explanation: 'Speed is nice, but useless if the model can\'t even read the whole document. For a 500-page doc, you need a model that can fit it all in its context window first.' },
        { text: 'Context window size — the document needs to fit in the model\'s memory', correct: true, explanation: 'Exactly right. A 500-page document is roughly 375,000 words. You need a model with a context window large enough to hold all of it. If the document doesn\'t fit, the model literally can\'t see parts of it.' },
        { text: 'The model\'s price — always pick the cheapest option', correct: false, explanation: 'For high-stakes legal analysis, accuracy matters more than cost. A cheap model that misses a critical clause could cost you far more than the AI bill.' },
        { text: 'Whether the model can generate images', correct: false, explanation: 'Image generation is irrelevant for analyzing a text document. You need strong reading comprehension and a large context window.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 4: Safety & When AI Fails ---
  {
    id: 'safety-and-failures',
    part: 1,
    moduleNumber: 4,
    title: 'Safety & When AI Fails',
    subtitle: 'Hallucinations, bias, and knowing when NOT to trust AI',
    durationMinutes: 7,
    mikeIntro: [
      "AI gets things wrong. And here's the scary part — it gets things wrong *confidently*. No hesitation, no 'I'm not sure.' Just wrong, with a straight face.",
      "These are called hallucinations. The AI generates something that sounds perfectly reasonable but is completely made up. Your job is to catch them.",
      "Let's practice. I'm going to show you AI outputs. Some are correct. Some are dangerously wrong. Flag the bad ones before they 'ship'!",
    ],
    miniGame: {
      type: 'red-flag-spotter',
      outputs: [
        {
          text: 'Python was created by Guido van Rossum and first released in 1991.',
          isRedFlag: false,
          explanation: 'This is accurate. Python was indeed created by Guido van Rossum, with the first version released in February 1991.',
        },
        {
          text: 'The CEO of Anthropic (the company that makes Claude) is Sam Altman.',
          isRedFlag: true,
          explanation: 'Hallucination! Sam Altman is the CEO of OpenAI, not Anthropic. Anthropic\'s CEO is Dario Amodei. AI often confuses people associated with similar companies.',
        },
        {
          text: 'To delete all files on your computer, run: rm -rf / in the terminal. This is a common cleanup command.',
          isRedFlag: true,
          explanation: 'DANGEROUS! This command permanently deletes EVERYTHING on your computer. Never run commands from AI without understanding what they do. This is why blind trust in AI is risky.',
        },
        {
          text: 'JavaScript is the most widely used programming language for web development.',
          isRedFlag: false,
          explanation: 'This is accurate. JavaScript is indeed the dominant language for web development, used by virtually every website for interactive features.',
        },
        {
          text: 'The landmark Supreme Court case "Henderson v. Digital Systems Corp (2019)" established that AI-generated content is automatically copyrighted.',
          isRedFlag: true,
          explanation: 'Completely fabricated! This case does not exist. AI loves generating fake citations — fake court cases, fake research papers, fake statistics. ALWAYS verify legal and academic references independently.',
        },
        {
          text: 'Here\'s the API key for the database: sk-proj-abc123xyz. You can use this to connect directly.',
          isRedFlag: true,
          explanation: 'Data leak! If this were a real API key, it should never appear in an AI output. Be careful about pasting sensitive information (passwords, API keys, private data) into AI — it could show up in responses.',
        },
        {
          text: 'React is a JavaScript library for building user interfaces, created by Facebook (now Meta).',
          isRedFlag: false,
          explanation: 'This is accurate. React was created at Facebook and is one of the most popular UI libraries. It was open-sourced in 2013.',
        },
        {
          text: 'Studies show that women are 40% less likely to succeed in technical roles, according to a 2023 Stanford report.',
          isRedFlag: true,
          explanation: 'This is fabricated and biased. No such Stanford report exists. AI can generate fake statistics that reinforce harmful stereotypes. Always verify claims, especially those about demographics or social groups.',
        },
        {
          text: 'Git was created by Linus Torvalds in 2005, originally to manage the Linux kernel source code.',
          isRedFlag: false,
          explanation: 'This is accurate. Linus Torvalds created Git in 2005 after a dispute with the commercial tool BitKeeper. It was designed to handle the massive Linux kernel codebase.',
        },
        {
          text: 'To fix the login bug, add this code to your authentication handler: if (password == "admin") { grantAccess(); }',
          isRedFlag: true,
          explanation: 'Security nightmare! This "fix" hardcodes a password and uses a weak comparison. AI-generated code can contain serious security vulnerabilities. Always review AI code suggestions carefully, especially around authentication.',
        },
      ],
      timePerOutput: 8000,
    },
    glossaryTerms: [
      { id: 'hallucination', term: 'Hallucination', definition: 'When AI generates information that sounds confident and plausible but is completely made up — fake citations, wrong facts, invented statistics.' },
      { id: 'bias', term: 'AI Bias', definition: 'When AI produces unfair or skewed results because of patterns in its training data. If the training data has biases, the AI learns them too.' },
      { id: 'guardrails', term: 'Guardrails', definition: 'Safety rules built into AI to prevent harmful outputs — like refusing to help with illegal activities or generating dangerous content.' },
      { id: 'verification', term: 'Verification', definition: 'The practice of independently checking AI outputs before trusting them. Especially critical for facts, code, legal references, and medical information.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'An AI tool confidently tells you: "The CEO of Anthropic is Sam Altman." You\'re about to include this in a presentation to your boss. What should you do?',
      options: [
        { text: 'Use it — the AI said it confidently, so it must be right', correct: false, explanation: 'Confidence does NOT equal accuracy. AI hallucinations sound just as confident as correct answers. That\'s what makes them dangerous.' },
        { text: 'Verify it with an independent source before using it', correct: true, explanation: 'Always verify factual claims independently. A quick Google search would show that Anthropic\'s CEO is Dario Amodei, not Sam Altman (who runs OpenAI). This is the single most important AI safety skill.' },
        { text: 'Ask the same AI again to double-check', correct: false, explanation: 'Asking the same AI the same question often gives you the same wrong answer. It\'s like asking a confident friend who told you wrong info to confirm — they\'ll just say it again. Use an external source.' },
        { text: 'Skip it — if AI gets names wrong, it probably gets everything wrong', correct: false, explanation: 'AI gets many things right. The key is knowing WHEN to verify. Names, dates, statistics, citations, and code security are high-risk areas that need checking. Don\'t throw the baby out with the bathwater.' },
      ],
    },
    xpReward: 100,
  },

  // =====================================================================
  // PART 2: YOUR COMPUTER
  // =====================================================================

  // --- Module 5: The Terminal ---
  {
    id: 'the-terminal',
    part: 2,
    moduleNumber: 5,
    title: 'The Terminal',
    subtitle: 'Navigate your computer like a developer',
    durationMinutes: 8,
    mikeIntro: [
      "Forget clicking around in Finder or File Explorer. The terminal is how developers move fast — and it's how AI coding tools work behind the scenes.",
      "It looks intimidating at first. A blinking cursor on a black screen. But it's really just a text-based way to tell your computer what to do. Instead of double-clicking a folder, you type 'cd folder-name'.",
      "Let's explore a virtual file system. I'll give you missions — find hidden files, peek inside folders, navigate like a pro.",
    ],
    miniGame: {
      type: 'file-explorer',
      missions: [
        {
          instruction: 'Navigate to the config folder and find the hidden .env file that contains the database password.',
          targetPath: '/home/user/my-app/config/.env',
          commands: ['cd my-app', 'cd config', 'ls -a', 'cat .env'],
        },
        {
          instruction: 'Go up to the project root and check what\'s inside package.json to see what libraries the app uses.',
          targetPath: '/home/user/my-app/package.json',
          commands: ['cd ..', 'cd ..', 'cat package.json'],
        },
        {
          instruction: 'Find out which directory you\'re currently in, then list all files (including hidden ones) in the project root.',
          targetPath: '/home/user/my-app',
          commands: ['pwd', 'ls -a'],
        },
      ],
      fileSystem: [
        {
          name: 'home',
          type: 'directory',
          children: [
            {
              name: 'user',
              type: 'directory',
              children: [
                {
                  name: 'my-app',
                  type: 'directory',
                  children: [
                    {
                      name: 'config',
                      type: 'directory',
                      children: [
                        { name: '.env', type: 'file', content: 'DATABASE_URL=postgres://localhost:5432/mydb\nSECRET_KEY=do-not-share-this' },
                        { name: 'settings.json', type: 'file', content: '{ "debug": true, "port": 3000 }' },
                      ],
                    },
                    {
                      name: 'src',
                      type: 'directory',
                      children: [
                        { name: 'index.ts', type: 'file', content: 'import express from "express";\nconst app = express();' },
                        { name: 'utils.ts', type: 'file', content: 'export function formatDate(d: Date) { return d.toISOString(); }' },
                      ],
                    },
                    { name: 'package.json', type: 'file', content: '{\n  "name": "my-app",\n  "dependencies": {\n    "express": "^4.18.0",\n    "typescript": "^5.0.0"\n  }\n}' },
                    { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\ndist/' },
                    { name: 'README.md', type: 'file', content: '# My App\nA simple web server built with Express and TypeScript.' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    glossaryTerms: [
      { id: 'terminal', term: 'Terminal / Command Line', definition: 'A text-based interface for controlling your computer. Instead of clicking, you type commands. It\'s faster and more powerful for many developer tasks.' },
      { id: 'directory', term: 'Directory (Folder)', definition: 'A container that holds files and other directories. "Directory" is the technical term for what you see as a "folder" in Finder or File Explorer.' },
      { id: 'path', term: 'Path', definition: 'The address of a file on your computer. Like a street address: /home/user/documents/report.pdf tells you exactly where a file lives.' },
      { id: 'env-file', term: '.env File', definition: 'A hidden file that stores secrets (passwords, API keys) that your app needs but you don\'t want to share publicly. The dot at the start means it\'s hidden by default.' },
      { id: 'cli-commands', term: 'Basic Commands (cd, ls, pwd, cat)', definition: 'cd = change directory (go to a folder), ls = list files, pwd = print working directory (where am I?), cat = show file contents. These four commands cover 80% of terminal navigation.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You\'re in /Users/you/projects/my-app and you want to go up to the projects folder. What command do you type?',
      options: [
        { text: 'cd projects', correct: false, explanation: 'This would look for a folder called "projects" INSIDE your current folder. You want to go UP one level, not into a subfolder.' },
        { text: 'cd ..', correct: true, explanation: 'Two dots (..) means "the parent directory" — one level up. So cd .. takes you from my-app up to projects. It\'s one of the most common terminal commands.' },
        { text: 'cd /projects', correct: false, explanation: 'Starting with / means "from the very top of the computer." This would look for /projects at the root level, not your ~/projects folder.' },
        { text: 'go back', correct: false, explanation: 'The terminal doesn\'t understand plain English (at least not yet). You need the specific command: cd .. to go up one directory.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 6: How Code Is Organized ---
  {
    id: 'how-code-is-organized',
    part: 2,
    moduleNumber: 6,
    title: 'How Code Is Organized',
    subtitle: 'Files, APIs, and how a web app fits together',
    durationMinutes: 8,
    mikeIntro: [
      "A codebase is like an office building. The lobby (frontend) is what visitors see. The back offices (backend) do the real work. The filing cabinets (database) store everything.",
      "They talk to each other through hallways (APIs). When you click 'Login' on a website, your request walks down a hallway from the lobby to the back office, checks the filing cabinet, and walks back with an answer.",
      "Let's wire up a web app. Connect the pieces and watch data flow through the system!",
    ],
    miniGame: {
      type: 'wiring-puzzle',
      components: [
        { id: 'browser', name: 'Browser (Frontend)', type: 'frontend' },
        { id: 'api', name: 'API Server', type: 'backend' },
        { id: 'auth', name: 'Auth Service', type: 'service' },
        { id: 'database', name: 'Database', type: 'storage' },
        { id: 'cache', name: 'Cache (Redis)', type: 'storage' },
      ],
      correctWires: [
        { from: 'browser', to: 'api', label: 'HTTP request (e.g., POST /login)' },
        { from: 'api', to: 'auth', label: 'Verify credentials' },
        { from: 'auth', to: 'database', label: 'Check user record' },
        { from: 'api', to: 'cache', label: 'Store session token' },
        { from: 'api', to: 'browser', label: 'Return response (success/failure)' },
      ],
    },
    glossaryTerms: [
      { id: 'frontend', term: 'Frontend', definition: 'The part of a web app that users see and interact with — buttons, text, images, forms. Built with HTML, CSS, and JavaScript.' },
      { id: 'backend', term: 'Backend', definition: 'The part of a web app that runs on a server, hidden from users. Handles business logic, talks to databases, processes payments, etc.' },
      { id: 'api', term: 'API (Application Programming Interface)', definition: 'A structured way for two pieces of software to talk to each other. Like a waiter in a restaurant: takes your order (request) to the kitchen (server) and brings back your food (response).' },
      { id: 'database', term: 'Database', definition: 'Where an app stores its data permanently — user accounts, posts, orders. Like a giant organized spreadsheet that the backend can query.' },
      { id: 'json', term: 'JSON', definition: 'A standard format for sending data between systems. Looks like: { "name": "Mike", "role": "manager" }. Almost every API uses it.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'A user clicks "Login" on a website. Put these events in the correct order: 1) Database checks password, 2) Browser sends request to API, 3) API receives request, 4) Browser shows "Welcome!"',
      options: [
        { text: '1, 2, 3, 4', correct: false, explanation: 'The database can\'t check anything until it receives a request. The browser has to send the request first, then the API processes it.' },
        { text: '2, 3, 1, 4', correct: true, explanation: 'Correct! The browser sends a request → the API receives it → the database checks the password → the browser shows the result. Data flows from frontend to backend to database and back.' },
        { text: '3, 1, 2, 4', correct: false, explanation: 'The API can\'t receive a request before the browser sends one. The user action (clicking Login) triggers the whole chain.' },
        { text: '2, 1, 3, 4', correct: false, explanation: 'The API needs to receive and process the request before it talks to the database. The API is the middleman — it doesn\'t skip straight to the database.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 7: Git & GitHub ---
  {
    id: 'git-and-github',
    part: 2,
    moduleNumber: 7,
    title: 'Git & GitHub',
    subtitle: 'Version control, branches, and collaboration',
    durationMinutes: 8,
    mikeIntro: [
      "Imagine if Google Docs tracked every single change anyone ever made — and you could rewind to any point in history. That's Git.",
      "Git is the save system for code. Every time you make a meaningful change, you create a 'commit' — a snapshot of your project. If something breaks, you just roll back.",
      "GitHub is where you store your Git project online, so others can see it and contribute. Let's build a timeline of commits!",
    ],
    miniGame: {
      type: 'timeline-builder',
      commits: [
        { id: 'c1', message: 'Initial commit: project setup with package.json', timestamp: 1 },
        { id: 'c2', message: 'Add homepage with welcome message', timestamp: 2 },
        { id: 'c3', message: 'Add user login page', timestamp: 3 },
        { id: 'c4', message: 'Fix typo on homepage', timestamp: 4 },
        { id: 'c5', message: 'Add dark mode feature', timestamp: 5 },
        { id: 'c6', message: 'Merge dark mode into main', timestamp: 6 },
      ],
      correctOrder: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
      branches: [
        { name: 'main', commits: ['c1', 'c2', 'c3', 'c4', 'c6'] },
        { name: 'feature/dark-mode', commits: ['c5'] },
      ],
    },
    glossaryTerms: [
      { id: 'git', term: 'Git', definition: 'A version control system that tracks every change to your code. Like an unlimited undo history. Created by Linus Torvalds (the Linux creator) in 2005.' },
      { id: 'commit', term: 'Commit', definition: 'A snapshot of your project at a specific moment. Each commit has a message describing what changed, like "Fix login bug" or "Add dark mode".' },
      { id: 'branch', term: 'Branch', definition: 'A parallel version of your project where you can make changes without affecting the main code. Like a "draft" that you can merge in when it\'s ready.' },
      { id: 'merge', term: 'Merge', definition: 'Combining changes from one branch into another. When your feature is done, you merge it back into the main branch.' },
      { id: 'pull-request', term: 'Pull Request (PR)', definition: 'A request to merge your branch into the main branch. Other people can review your changes, leave comments, and approve before it goes live.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You and a coworker both edit the same file at the same time on different branches. What happens when you try to merge?',
      options: [
        { text: 'Git automatically picks the best version', correct: false, explanation: 'Git doesn\'t know which version is "better." It can\'t make judgment calls about your code. It needs a human to decide.' },
        { text: 'The second person\'s changes overwrite the first', correct: false, explanation: 'Git is smarter than that. It won\'t silently throw away anyone\'s work. It flags the conflict so you can resolve it.' },
        { text: 'A merge conflict occurs — you have to manually choose which changes to keep', correct: true, explanation: 'Correct! When two people change the same lines, Git says "I don\'t know which one you want — you decide." You see both versions side by side and pick what to keep. This is normal and happens all the time.' },
        { text: 'Git refuses to merge and deletes both changes', correct: false, explanation: 'Git would never delete your work. It pauses the merge and asks you to resolve the conflict. No data is lost.' },
      ],
    },
    xpReward: 100,
  },

  // =====================================================================
  // PART 3: AI TOOLS YOU CAN USE TODAY
  // =====================================================================

  // --- Module 8: AI Chat (Claude.ai) ---
  {
    id: 'ai-chat',
    part: 3,
    moduleNumber: 8,
    title: 'AI Chat (Claude.ai)',
    subtitle: 'Conversations, projects, and getting the best results',
    durationMinutes: 8,
    mikeIntro: [
      "Chat is where most people start with AI. You type something, the AI responds. Simple, right? But there's a big difference between using it well and using it badly.",
      "The key insight: AI chat remembers the conversation. So you can build on previous messages, refine your request, and have a real back-and-forth. But if the conversation gets too long, it starts forgetting the beginning.",
      "Let's practice strategy. For each scenario, you'll decide how to set up your AI chat session for the best results.",
    ],
    miniGame: {
      type: 'chat-strategist',
      scenarios: [
        {
          task: 'Write a 10-part blog series about cooking techniques, all with the same witty voice.',
          options: [
            { choice: 'Start a new chat for each blog post', score: 30, explanation: 'Each post would have a different voice because the AI can\'t see the previous ones. No consistency.' },
            { choice: 'Write all 10 posts in one long conversation', score: 60, explanation: 'Better — the AI can reference earlier posts for consistency. But a 10-post conversation gets very long, and the AI might forget your style instructions from the beginning.' },
            { choice: 'Create a project with a style guide, then write each post as a separate conversation within the project', score: 95, explanation: 'Best approach! A project keeps your style guide available across ALL conversations. Each post gets a fresh conversation (no context overload) but the style stays consistent.' },
          ],
        },
        {
          task: 'Debug a complex error in your Python code that you\'ve been stuck on for 2 hours.',
          options: [
            { choice: 'Describe the error from memory in a new chat', score: 40, explanation: 'You might forget important details. The AI won\'t see the actual error message or code context.' },
            { choice: 'Paste the error message, relevant code, and what you\'ve already tried', score: 90, explanation: 'Perfect. Give the AI the complete picture: error message, code, and failed attempts. This is like going to the doctor with your symptoms AND medical history.' },
            { choice: 'Just paste the error message with no context', score: 50, explanation: 'The error message helps, but without seeing the code, the AI is guessing. It\'s like telling a mechanic "the car makes a noise" without letting them see the car.' },
          ],
        },
        {
          task: 'Analyze a 50-page quarterly earnings report and create an executive summary.',
          options: [
            { choice: 'Type a description of the report from memory', score: 20, explanation: 'You\'ll miss crucial details and numbers. AI can\'t analyze what it can\'t see.' },
            { choice: 'Upload the PDF directly and ask for a summary', score: 85, explanation: 'Great approach! Claude and GPT can read uploaded PDFs. Let the AI see the actual document rather than your paraphrase.' },
            { choice: 'Copy-paste the entire report text into the chat', score: 70, explanation: 'Works, but might hit context limits on longer reports, and you lose formatting. Uploading the file preserves tables and structure better.' },
          ],
        },
        {
          task: 'Brainstorm 20 creative names for a new coffee shop.',
          options: [
            { choice: 'Ask for all 20 names in one message', score: 60, explanation: 'You\'ll get 20 names, but they might all be in the same style. One-shot brainstorming tends to be less creative.' },
            { choice: 'Ask for 5, pick your favorites, then ask for 10 more "in the same style as" your picks', score: 95, explanation: 'Iterative brainstorming is powerful! By telling the AI which names you liked, you steer it toward your taste. Each round gets more targeted.' },
            { choice: 'Ask 4 different AI tools for 5 names each', score: 75, explanation: 'Not bad — different models generate different styles. But you lose the ability to refine and iterate. Combining models with iteration is the real power move.' },
          ],
        },
      ],
    },
    glossaryTerms: [
      { id: 'conversation', term: 'Conversation', definition: 'A single chat thread with an AI. The AI remembers everything said in the conversation, but nothing from other conversations.' },
      { id: 'project', term: 'Project (in Claude)', definition: 'A workspace in Claude that holds a set of documents (like a style guide or codebase). All conversations within the project can reference these documents.' },
      { id: 'artifact', term: 'Artifact / Canvas', definition: 'A separate panel in Claude or ChatGPT where the AI puts longer outputs (code, documents, tables) so you can edit them without scrolling through the chat.' },
      { id: 'knowledge-base', term: 'Knowledge Base', definition: 'Documents you upload to give the AI extra context. Like giving a new employee a company handbook on their first day.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You\'re writing a 10-part blog series that needs a consistent voice across all posts. What\'s the best approach?',
      options: [
        { text: 'Start a new chat for each blog post', correct: false, explanation: 'Each chat is independent — the AI won\'t remember the voice from previous posts. You\'d get 10 posts that all sound different.' },
        { text: 'Write all 10 posts in one very long conversation', correct: false, explanation: 'This can work, but very long conversations cause the AI to "forget" earlier messages. By post 8, it might lose the voice established in post 1.' },
        { text: 'Create a project with a style guide, then write each post as a separate conversation within it', correct: true, explanation: 'This is the pro move. The project keeps your style guide accessible to EVERY conversation. Each post gets a fresh context window, but the voice stays locked in.' },
        { text: 'Use a different AI model for each post to get variety', correct: false, explanation: 'You want consistency, not variety. Different models produce different writing styles, which is the opposite of what you need.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 9: AI in Your Editor ---
  {
    id: 'ai-in-your-editor',
    part: 3,
    moduleNumber: 9,
    title: 'AI in Your Editor',
    subtitle: 'Copilot, Cursor, and inline AI assistance',
    durationMinutes: 7,
    mikeIntro: [
      "What if AI could look over your shoulder while you code and suggest the next line before you type it? That's what editor AI does.",
      "GitHub Copilot, Cursor, Windsurf — these tools live inside your code editor. They see your file, understand the patterns, and offer completions in real-time.",
      "But here's the thing: sometimes the suggestions are brilliant. Sometimes they're subtly wrong. Let's practice telling the difference!",
    ],
    miniGame: {
      type: 'editor-dash',
      snippets: [
        {
          code: 'function calculateTotal(items) {\n  return items.reduce((sum, item) => ',
          suggestion: 'sum + item.price * item.quantity, 0);',
          correct: true,
        },
        {
          code: 'function validateEmail(email) {\n  return ',
          suggestion: 'email.includes("@");',
          correct: false,
        },
        {
          code: 'async function fetchUserData(userId) {\n  const response = await fetch(`/api/users/${userId}`);\n  ',
          suggestion: 'const data = await response.json();\n  return data;',
          correct: true,
        },
        {
          code: 'function sortByDate(posts) {\n  return posts.sort((a, b) => ',
          suggestion: 'a.date - b.date);',
          correct: true,
        },
        {
          code: '// Delete a user and all their data\nasync function deleteUser(userId) {\n  ',
          suggestion: 'await db.query("DROP TABLE users");',
          correct: false,
        },
        {
          code: 'function isAdult(age) {\n  return ',
          suggestion: 'age >= 18;',
          correct: true,
        },
      ],
      timeLimit: 60,
    },
    glossaryTerms: [
      { id: 'ide', term: 'IDE (Integrated Development Environment)', definition: 'A program where developers write code. VS Code is the most popular one. Think of it as Microsoft Word, but for code — with syntax coloring, error detection, and built-in tools.' },
      { id: 'copilot', term: 'GitHub Copilot', definition: 'An AI plugin for code editors (by GitHub/Microsoft) that suggests code as you type. It sees your current file and tries to predict what you\'ll write next.' },
      { id: 'cursor', term: 'Cursor', definition: 'A code editor with AI built in at every level — autocomplete, chat, multi-file editing. It\'s a modified version of VS Code designed around AI assistance.' },
      { id: 'inline-completion', term: 'Inline Completion', definition: 'When AI suggests code directly where your cursor is, shown as faded gray text. Press Tab to accept, keep typing to ignore. Like predictive text on your phone, but for code.' },
      { id: 'refactoring', term: 'Refactoring', definition: 'Rewriting code to be cleaner or more efficient without changing what it does. AI can help by suggesting better ways to write the same logic.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'AI suggests completing your function. The code looks right but you\'re not sure it handles empty lists correctly. What should you do?',
      options: [
        { text: 'Accept it — AI usually handles edge cases', correct: false, explanation: 'AI often misses edge cases like empty lists, null values, or unexpected inputs. These are exactly the things you should check.' },
        { text: 'Test it with an empty list before accepting', correct: true, explanation: 'Always test AI suggestions with edge cases. Run it with an empty list, a single item, null values, etc. This takes 30 seconds and can save hours of debugging later.' },
        { text: 'Reject it and write the whole function yourself', correct: false, explanation: 'You don\'t need to throw it away entirely. The suggestion might be 90% right. Test it, fix the edge case if needed, and save yourself most of the typing.' },
        { text: 'Accept it and add error handling later', correct: false, explanation: 'If you accept bad code now, you might forget to fix it later. It\'s much easier to verify and fix in the moment than to hunt down bugs weeks later.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 10: AI Coding Agents ---
  {
    id: 'ai-coding-agents',
    part: 3,
    moduleNumber: 10,
    title: 'AI Coding Agents',
    subtitle: 'Autonomous AI that reads, plans, and writes code',
    durationMinutes: 8,
    mikeIntro: [
      "Chat answers questions. Agents take action. That's the big difference.",
      "An AI chat can tell you HOW to add dark mode to your app. An AI agent will actually open your files, read your code, plan the changes, write the code, and test it. All on its own.",
      "Let's see what that feels like. In this game, YOU are the agent. A user gives you a task, and you have to figure out the right sequence of actions to complete it.",
    ],
    miniGame: {
      type: 'agent-simulator',
      task: 'Add a dark mode toggle to the app',
      fileTree: [
        'src/',
        'src/App.tsx',
        'src/styles/',
        'src/styles/globals.css',
        'src/components/',
        'src/components/Header.tsx',
        'src/components/ThemeToggle.tsx',
        'package.json',
      ],
      correctSequence: [
        { tool: 'Read', target: 'src/App.tsx', reason: 'First, read the main app file to understand how the app is structured and where the theme would be applied.' },
        { tool: 'Read', target: 'src/styles/globals.css', reason: 'Read the existing styles to understand the current color system and how to add dark mode colors.' },
        { tool: 'Edit', target: 'src/styles/globals.css', reason: 'Add dark mode CSS variables and a .dark class that changes the color scheme.' },
        { tool: 'Edit', target: 'src/components/ThemeToggle.tsx', reason: 'Create the toggle button component that switches between light and dark mode.' },
        { tool: 'Edit', target: 'src/App.tsx', reason: 'Import and add the ThemeToggle component to the app layout.' },
        { tool: 'Bash', target: 'npm run build', reason: 'Run the build to make sure everything compiles without errors before calling it done.' },
      ],
    },
    glossaryTerms: [
      { id: 'agent', term: 'AI Agent', definition: 'An AI that doesn\'t just talk — it takes actions. It can read files, write code, run commands, and make decisions autonomously. Think of a chat as a consultant; an agent is an employee.' },
      { id: 'agentic-loop', term: 'Agentic Loop', definition: 'The cycle an agent repeats: Think about what to do → Take an action → Observe the result → Think again. It keeps looping until the task is done.' },
      { id: 'claude-code', term: 'Claude Code', definition: 'Anthropic\'s AI coding agent. It runs in your terminal, reads your codebase, plans changes, writes code, runs tests, and creates commits — all autonomously.' },
      { id: 'planning', term: 'Planning (Agent)', definition: 'The step where an agent thinks through its approach before acting. Good agents read first, plan second, act third — just like a good employee.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'An AI coding agent is tasked with fixing a bug in the login function. What should it do FIRST?',
      options: [
        { text: 'Start editing the login file immediately to try a fix', correct: false, explanation: 'Editing before reading is like prescribing medicine before diagnosing the patient. You might "fix" the wrong thing or make it worse.' },
        { text: 'Read the relevant code to understand the problem', correct: true, explanation: 'Always read first. A good agent reads the login code, understands the expected behavior, identifies where it breaks, THEN plans and implements a fix. Read → Plan → Act.' },
        { text: 'Delete the login function and rewrite it from scratch', correct: false, explanation: 'Nuclear option! Rewriting from scratch might introduce new bugs and lose working logic. Understand the existing code first, then make targeted changes.' },
        { text: 'Run the test suite to see what fails', correct: false, explanation: 'Running tests is smart, but reading the code first is better. Tests tell you WHAT failed, but reading the code tells you WHY. Start with understanding, then verify with tests.' },
      ],
    },
    xpReward: 100,
  },

  // =====================================================================
  // PART 4: HOW AGENTS ACTUALLY WORK
  // =====================================================================

  // --- Module 11: Tool Calling ---
  {
    id: 'tool-calling',
    part: 4,
    moduleNumber: 11,
    title: 'Tool Calling',
    subtitle: 'Read, Edit, Bash, Grep — the tools AI agents use',
    durationMinutes: 7,
    mikeIntro: [
      "An AI agent without tools is like a chef without a kitchen. It might know every recipe in the world, but it can't actually cook anything.",
      "Tools are the hands of an AI agent. Read lets it look at files. Edit lets it change them. Bash lets it run terminal commands. Grep lets it search for patterns. Each tool has a specific job.",
      "Let's see if you can match the right tool to each request. Think of it like a toolbox — you wouldn't use a hammer to screw in a bolt!",
    ],
    miniGame: {
      type: 'toolbox-challenge',
      requests: [
        { description: "What's inside server.js?", correctTool: 'Read', explanation: 'Read opens and displays a file\'s contents. It\'s the "look at this file" tool — perfect when you need to see what\'s in a file.' },
        { description: 'Change the port number from 3000 to 8080 in server.js', correctTool: 'Edit', explanation: 'Edit modifies a specific part of a file. It finds the old text and replaces it with new text — like find-and-replace, but more precise.' },
        { description: 'Run the test suite to check for failures', correctTool: 'Bash', explanation: 'Bash runs terminal commands. "npm test", "git status", "python script.py" — anything you\'d type in a terminal, Bash can execute.' },
        { description: 'Find all files that contain the word "password"', correctTool: 'Grep', explanation: 'Grep searches INSIDE files for text patterns. It\'s like Ctrl+F, but across your entire project. Need to find where "password" appears? Grep is your tool.' },
        { description: 'Find all TypeScript files in the project', correctTool: 'Glob', explanation: 'Glob finds files by name pattern. "*.ts" means all TypeScript files. Grep searches file contents; Glob searches file names.' },
        { description: 'Create a brand new configuration file from scratch', correctTool: 'Write', explanation: 'Write creates a new file with content you specify. Edit modifies existing files; Write creates new ones from nothing.' },
        { description: 'Install the express package using npm', correctTool: 'Bash', explanation: 'Installing packages means running "npm install express" in the terminal. That\'s a Bash command — any terminal operation goes through Bash.' },
        { description: 'Look at line 42 of a specific error log file', correctTool: 'Read', explanation: 'Read can open any file and show specific lines. When you know which file to look at, Read is faster and more direct than Grep.' },
      ],
      tools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob'],
    },
    glossaryTerms: [
      { id: 'tool-calling', term: 'Tool Calling', definition: 'How AI agents interact with the outside world. The AI says "I want to use the Read tool on server.js" and the system executes it. The AI proposes, the system disposes.' },
      { id: 'read-tool', term: 'Read', definition: 'Opens a file and shows its contents. Like opening a document to look at it — you see the text but don\'t change anything.' },
      { id: 'edit-tool', term: 'Edit', definition: 'Changes specific text in an existing file. You tell it "replace THIS with THAT" and it makes the swap. Surgical precision.' },
      { id: 'bash-tool', term: 'Bash', definition: 'Runs terminal commands — install packages, run tests, start servers, check git status. Anything you\'d type in a terminal.' },
      { id: 'grep-tool', term: 'Grep', definition: 'Searches inside files for text patterns. Find every file that contains "TODO", or every line that mentions "database". Like a project-wide Ctrl+F.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'An AI agent wants to search for all files in your project that contain the word "password". Which tool should it use?',
      options: [
        { text: 'Read — it reads file contents', correct: false, explanation: 'Read opens ONE specific file. You\'d need to know which file to look in. If you want to search ALL files, you need Grep.' },
        { text: 'Glob — it finds files by pattern', correct: false, explanation: 'Glob finds files by NAME pattern (like *.ts). It doesn\'t look inside files. You need a tool that searches file CONTENTS.' },
        { text: 'Grep — it searches inside files for text patterns', correct: true, explanation: 'Grep is the right tool. It searches the contents of every file in your project for the pattern "password" and shows you where it appears. It\'s the project-wide search engine.' },
        { text: 'Bash — just use the terminal', correct: false, explanation: 'You could technically run a grep command in Bash, but the dedicated Grep tool is optimized for this exact task and gives better-formatted results.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 12: The Harness ---
  {
    id: 'the-harness',
    part: 4,
    moduleNumber: 12,
    title: 'The Harness',
    subtitle: 'The control room that runs an AI agent',
    durationMinutes: 7,
    mikeIntro: [
      "Someone has to be in charge. The AI agent is powerful, but it needs a program to manage it — decide which tools it can use, how long it runs, when to ask permission. That program is called the harness.",
      "Think of it like a control room in a factory. The worker (agent) does the hands-on work. The control room (harness) monitors everything, sets rules, and hits the emergency stop if needed.",
      "Let's configure a harness. You'll balance between giving the agent freedom (so it can work fast) and keeping control (so it doesn't break things).",
    ],
    miniGame: {
      type: 'control-room',
      agent: { task: 'Refactor the authentication module to use JWT tokens instead of session cookies' },
      settings: [
        {
          name: 'Model Selection',
          options: ['Haiku (fast, cheap)', 'Sonnet (balanced)', 'Opus (powerful, expensive)'],
          correct: 'Sonnet (balanced)',
          explanation: 'Refactoring auth is moderately complex — Sonnet gives you good reasoning at reasonable cost. Haiku might miss security implications; Opus is overkill for a refactor.',
        },
        {
          name: 'File Read Permission',
          options: ['Ask every time', 'Auto-allow', 'Deny all'],
          correct: 'Auto-allow',
          explanation: 'Reading files is safe — the agent can\'t break anything by looking. Auto-allowing reads lets it work efficiently without constant interruptions.',
        },
        {
          name: 'File Edit Permission',
          options: ['Ask every time', 'Auto-allow', 'Deny all'],
          correct: 'Ask every time',
          explanation: 'Edits change your code! For a security-sensitive auth refactor, you want to review each change before it\'s applied. Better safe than sorry.',
        },
        {
          name: 'Bash Command Permission',
          options: ['Ask every time', 'Auto-allow safe commands only', 'Deny all'],
          correct: 'Auto-allow safe commands only',
          explanation: 'The agent needs to run tests (safe), but you don\'t want it running destructive commands. Auto-allowing safe commands (like npm test) keeps the workflow smooth while blocking risky operations.',
        },
        {
          name: 'Max Iterations',
          options: ['10 (conservative)', '50 (moderate)', '200 (generous)'],
          correct: '50 (moderate)',
          explanation: 'An auth refactor might touch several files and need multiple read-edit-test cycles. 10 is too few (agent gets cut off mid-task); 200 is wasteful. 50 gives plenty of room.',
        },
      ],
    },
    glossaryTerms: [
      { id: 'harness', term: 'Harness', definition: 'The program that runs an AI agent. It manages the conversation loop, executes tool calls, enforces permissions, and decides when the agent is done. Claude Code is an example of a harness.' },
      { id: 'permissions', term: 'Permissions', definition: 'Rules about what an agent is allowed to do. "Auto-allow Read" means it can look at files freely. "Ask for Edit" means a human must approve each code change.' },
      { id: 'claude-md', term: 'CLAUDE.md', definition: 'A file in your project that gives the AI agent instructions — coding style, project rules, what to avoid. Like a new-employee orientation document that the agent reads before starting.' },
      { id: 'compaction', term: 'Compaction', definition: 'When the conversation gets too long, the harness summarizes earlier messages to free up space. Like making meeting notes instead of keeping the full recording.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'Your AI agent keeps stopping to ask permission every time it reads a file, slowing down the task dramatically. How do you fix this without going fully autonomous?',
      options: [
        { text: 'Give it full auto-allow on everything', correct: false, explanation: 'That\'s the fully autonomous option. It\'s fast, but risky — the agent could run destructive commands without you knowing.' },
        { text: 'Add Read to the auto-allow list in permissions, keep Edit and Bash as ask-first', correct: true, explanation: 'Perfect balance! Reading files is safe (it can\'t break anything). So auto-allow reads, but keep approval required for edits and commands. The agent works fast for research, but checks with you before making changes.' },
        { text: 'Increase the timeout so it has more time to wait for your approval', correct: false, explanation: 'The problem isn\'t time — it\'s friction. The agent is doing safe reads but constantly waiting for permission. The fix is to auto-allow the safe operations.' },
        { text: 'Switch to a faster model', correct: false, explanation: 'A faster model doesn\'t help if the bottleneck is permission approvals. The agent is fast enough — it\'s the permission checks that slow it down.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 13: Skills & Plugins ---
  {
    id: 'skills-and-plugins',
    part: 4,
    moduleNumber: 13,
    title: 'Skills & Plugins',
    subtitle: 'Reusable AI workflows and slash commands',
    durationMinutes: 7,
    mikeIntro: [
      "Why do the same thing twice? If you find yourself asking AI to do the same 5-step process over and over, there's a better way.",
      "Skills are reusable AI workflows. You define the steps once, give it a trigger (like /deploy or /review), and from then on, you just type the command. Think of it like programming a macro, but for AI.",
      "Let's build a skill from scratch. You'll assemble the building blocks — trigger, inputs, actions, outputs — into a working automation.",
    ],
    miniGame: {
      type: 'skill-builder',
      blocks: [
        { id: 'trigger', type: 'trigger', label: 'When user types /deploy' },
        { id: 'read-config', type: 'input', label: 'Read deployment config file' },
        { id: 'run-tests', type: 'action', label: 'Run test suite' },
        { id: 'build', type: 'action', label: 'Run build command' },
        { id: 'deploy', type: 'action', label: 'Push to production server' },
        { id: 'show-url', type: 'output', label: 'Show deployed URL and status' },
        { id: 'notify', type: 'output', label: 'Send notification to team channel' },
      ],
      correctAssembly: ['trigger', 'read-config', 'run-tests', 'build', 'deploy', 'show-url'],
    },
    glossaryTerms: [
      { id: 'skill', term: 'Skill', definition: 'A reusable AI workflow triggered by a slash command. "/commit" might analyze your changes, write a commit message, and create the commit — all in one step.' },
      { id: 'slash-command', term: 'Slash Command', definition: 'A shortcut that starts with /. Type "/deploy" and the AI runs a pre-defined workflow instead of treating it as a normal chat message.' },
      { id: 'plugin', term: 'Plugin', definition: 'An extension that adds new capabilities to an AI tool. Like installing an app on your phone — it gives the AI new powers it didn\'t have before.' },
      { id: 'workflow', term: 'Workflow', definition: 'A sequence of steps that happen in order. Read config → Run tests → Build → Deploy is a deployment workflow. Skills automate workflows.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'Every day you do the same 5-step deployment process: read config, run tests, build, deploy, send notification. What should you build?',
      options: [
        { text: 'A very detailed prompt that describes all 5 steps', correct: false, explanation: 'You\'d have to paste that prompt every single day. A skill automates it into one command you run forever.' },
        { text: 'A skill that packages all 5 steps into a single /deploy command', correct: true, explanation: 'A skill runs the same workflow every time with one command. No re-typing, no forgetting steps, no variation. It\'s like recording a macro that runs perfectly every time.' },
        { text: 'Five separate skills, one for each step', correct: false, explanation: 'Then you\'d have to run 5 commands in the right order every day. The whole point is to bundle related steps into one workflow.' },
        { text: 'A bookmark to the AI conversation where you did it last time', correct: false, explanation: 'Past conversations don\'t re-execute. You\'d be copying and pasting from an old conversation — error-prone and tedious. A skill is the permanent solution.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 14: MCP (Model Context Protocol) ---
  {
    id: 'mcp',
    part: 4,
    moduleNumber: 14,
    title: 'MCP (Model Context Protocol)',
    subtitle: 'Connecting AI to databases, APIs, and services',
    durationMinutes: 7,
    mikeIntro: [
      "MCP is like USB for AI. Before USB, every device had a different plug. Printers, mice, keyboards — all different connectors. USB made one plug that works for everything.",
      "MCP does the same thing for AI. Instead of building custom code to connect AI to your database, calendar, email, and Slack, you install an MCP server for each one — and the AI can talk to all of them through the same standard.",
      "Let's connect some services to an AI brain and see what becomes possible!",
    ],
    miniGame: {
      type: 'server-plugboard',
      services: [
        { id: 'postgres', name: 'PostgreSQL Database', icon: 'database' },
        { id: 'github', name: 'GitHub', icon: 'code' },
        { id: 'slack', name: 'Slack', icon: 'chat' },
        { id: 'calendar', name: 'Google Calendar', icon: 'calendar' },
        { id: 'filesystem', name: 'Local Files', icon: 'folder' },
      ],
      testQueries: [
        { question: 'What meetings do I have tomorrow?', requiredService: 'calendar' },
        { question: 'Show me all users who signed up this week', requiredService: 'postgres' },
        { question: 'Post a deployment update to #engineering', requiredService: 'slack' },
        { question: 'Create a pull request for my changes', requiredService: 'github' },
        { question: 'Read the README file in my project', requiredService: 'filesystem' },
      ],
    },
    glossaryTerms: [
      { id: 'mcp', term: 'MCP (Model Context Protocol)', definition: 'A standard protocol that connects AI to external services. Like USB for AI — one standard interface that works with databases, APIs, calendars, and more.' },
      { id: 'mcp-server', term: 'MCP Server', definition: 'A small program that translates between a specific service (like Postgres or Slack) and the MCP standard. Install the right MCP server, and the AI can talk to that service.' },
      { id: 'protocol', term: 'Protocol', definition: 'An agreed-upon format for communication. Like how English is a protocol for human communication — both parties know the rules, so they can understand each other.' },
      { id: 'integration', term: 'Integration', definition: 'Connecting two systems so they can share data and work together. "Integrating Slack" means your AI can read and send Slack messages.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You want your AI agent to be able to read and write to a PostgreSQL database. What do you need?',
      options: [
        { text: 'Paste the database password directly into the chat', correct: false, explanation: 'Never paste credentials into AI chat! That\'s a security risk. MCP servers handle authentication securely behind the scenes.' },
        { text: 'An MCP server for PostgreSQL that translates between the AI and the database', correct: true, explanation: 'An MCP server is the bridge. It handles the database connection, authentication, and translates the AI\'s requests into SQL queries. The AI talks MCP, the server talks Postgres. Everyone\'s happy.' },
        { text: 'Train the AI on your specific database schema', correct: false, explanation: 'You can\'t retrain a model for your database. MCP lets the AI access your database at runtime through a standard interface — no training needed.' },
        { text: 'Write custom API code to connect them', correct: false, explanation: 'That\'s the old way! MCP exists precisely so you don\'t have to write custom code for every service. Just install the MCP server and configure it.' },
      ],
    },
    xpReward: 100,
  },

  // =====================================================================
  // PART 5: BUILDING WITH AI
  // =====================================================================

  // --- Module 15: The AI API ---
  {
    id: 'the-ai-api',
    part: 5,
    moduleNumber: 15,
    title: 'The AI API',
    subtitle: 'Build requests, stream responses, call models from code',
    durationMinutes: 7,
    mikeIntro: [
      "APIs are how your code talks to AI. When you use Claude.ai or ChatGPT in a browser, there's a website handling everything for you. But if you want to build YOUR OWN app with AI built in, you use the API directly.",
      "It's simpler than you think. You send a message (JSON), you get a response back. That's it. The tricky parts are choosing the right settings and handling the response.",
      "Let's build an API request from scratch and see how each piece affects the output!",
    ],
    miniGame: {
      type: 'api-playground',
      defaults: {
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that explains things simply.' },
          { role: 'user', content: 'What is an API?' },
        ],
      },
      experiments: [
        { change: 'Remove the system message', effect: 'The response is still good but less focused. Without a system message, the AI uses its default personality. System messages are like giving the AI a job description.' },
        { change: 'Set max_tokens to 50', effect: 'The response gets cut off mid-sentence! max_tokens limits the length of the response. Set it too low and you lose the ending. Too high and you pay for tokens you don\'t use.' },
        { change: 'Set temperature to 1.0 (high)', effect: 'The response becomes more creative and varied — but potentially less accurate. High temperature = more randomness. Great for brainstorming, risky for factual answers.' },
        { change: 'Add an assistant message "An API is" before the response', effect: 'The AI continues from where you left off! You can "prime" the response by starting the assistant\'s reply. This is a trick for controlling the format and style of the output.' },
      ],
    },
    glossaryTerms: [
      { id: 'api-key', term: 'API Key', definition: 'A secret password that identifies your app to the AI service. Like a membership card — it proves you\'re allowed to use the API and tracks your usage for billing.' },
      { id: 'messages-array', term: 'Messages Array', definition: 'The conversation history you send to the API. Each message has a role (system, user, or assistant) and content. The AI reads all messages to understand the context.' },
      { id: 'streaming', term: 'Streaming', definition: 'Getting the AI\'s response word by word as it generates, instead of waiting for the whole thing. It\'s why you see text appear gradually in ChatGPT instead of all at once.' },
      { id: 'max-tokens', term: 'max_tokens', definition: 'The maximum number of tokens (roughly words) the AI can generate in its response. A safety limit to control cost and length.' },
      { id: 'api-pricing', term: 'API Pricing', definition: 'AI APIs charge per token — both input (what you send) and output (what you get back). Bigger models cost more. A typical API call costs fractions of a cent.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'Your API response is cut off mid-sentence — it just stops in the middle of a word. What\'s most likely wrong?',
      options: [
        { text: 'The AI crashed', correct: false, explanation: 'AI APIs are very stable. A mid-sentence cutoff almost always means a token limit was hit, not a crash.' },
        { text: 'max_tokens is set too low — increase it to get the full response', correct: true, explanation: 'max_tokens limits how many tokens the AI can generate. If it\'s set to 100 but the full answer needs 200, the response gets chopped off mid-sentence. Increase it and you\'ll get the complete answer.' },
        { text: 'The model is too small for the question', correct: false, explanation: 'Model size affects quality, not response length. Even a small model can generate long responses if max_tokens allows it.' },
        { text: 'Your internet connection dropped', correct: false, explanation: 'If the connection dropped, you\'d get an error, not a partial response. A clean cutoff mid-sentence is the classic sign of a max_tokens limit.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 16: AI Patterns ---
  {
    id: 'ai-patterns',
    part: 5,
    moduleNumber: 16,
    title: 'AI Patterns',
    subtitle: 'RAG, prompt chains, embeddings, and real architectures',
    durationMinutes: 7,
    mikeIntro: [
      "Now we're getting to the good stuff. These are the building blocks that real AI apps are made of.",
      "RAG, prompt chains, embeddings — they sound fancy, but each one solves a specific problem. RAG fixes outdated answers. Prompt chains break complex tasks into steps. Embeddings help AI understand meaning, not just words.",
      "Let's build some pipelines on a factory floor. Raw materials (user questions) go in, finished products (great answers) come out!",
    ],
    miniGame: {
      type: 'factory-floor',
      machines: [
        { id: 'retrieve', name: 'Retrieve Docs', type: 'retrieval' },
        { id: 'chunk', name: 'Chunk Text', type: 'processing' },
        { id: 'embed', name: 'Generate Embeddings', type: 'processing' },
        { id: 'search', name: 'Vector Search', type: 'retrieval' },
        { id: 'llm', name: 'Send to LLM', type: 'generation' },
        { id: 'format', name: 'Format Response', type: 'output' },
        { id: 'classify', name: 'Classify Intent', type: 'processing' },
        { id: 'validate', name: 'Validate Output', type: 'quality' },
      ],
      pipelines: [
        {
          name: 'RAG (Retrieval Augmented Generation)',
          correctOrder: ['retrieve', 'chunk', 'embed', 'search', 'llm', 'format'],
          description: 'User asks a question → Retrieve relevant documents → Chunk them into pieces → Generate embeddings → Search for the most relevant chunks → Send them with the question to the LLM → Format the answer. This is how AI chatbots give up-to-date, company-specific answers.',
        },
        {
          name: 'Prompt Chain',
          correctOrder: ['classify', 'llm', 'validate', 'format'],
          description: 'User sends a request → Classify what kind of request it is → Send to the LLM with the right prompt for that type → Validate the output meets quality standards → Format and return. Chaining lets you break complex tasks into reliable steps.',
        },
      ],
    },
    glossaryTerms: [
      { id: 'rag', term: 'RAG (Retrieval Augmented Generation)', definition: 'A pattern where you first search for relevant documents, then send them to the AI along with the question. It\'s like giving a student their textbook before an exam — they give much better answers.' },
      { id: 'embeddings', term: 'Embeddings', definition: 'A way to convert text into numbers so AI can measure how similar two pieces of text are. "happy" and "joyful" would have similar embeddings. Used for search and recommendations.' },
      { id: 'prompt-chain', term: 'Prompt Chain', definition: 'Breaking a complex task into a sequence of simpler prompts. Instead of asking AI to do everything in one shot, you chain: Step 1 → Step 2 → Step 3. Each step is easier to get right.' },
      { id: 'vector-search', term: 'Vector Search', definition: 'Searching by meaning instead of keywords. A regular search for "dog" only finds "dog." A vector search also finds "puppy", "canine", and "golden retriever" because they mean similar things.' },
      { id: 'guardrails-pattern', term: 'Guardrails', definition: 'Automated checks that validate AI output before showing it to users. Like a quality inspector on a factory line — reject anything that doesn\'t meet standards.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'Your AI customer support chatbot keeps giving outdated answers about your product pricing (which changed last month). What pattern fixes this?',
      options: [
        { text: 'Retrain the entire AI model with new pricing data', correct: false, explanation: 'Retraining a model is extremely expensive and slow (weeks/months). You don\'t need to change the model — you need to give it current information at query time.' },
        { text: 'RAG — retrieve current pricing docs before generating the answer', correct: true, explanation: 'RAG is the solution. Before the AI answers, search your current pricing documents and include the relevant info in the prompt. The AI now has accurate, up-to-date context every time.' },
        { text: 'Add "prices may have changed" as a disclaimer to every response', correct: false, explanation: 'That\'s a band-aid, not a fix. The customer still gets wrong prices. RAG gives the AI the correct prices so it can answer accurately.' },
        { text: 'Increase the temperature so the AI generates more varied responses', correct: false, explanation: 'Temperature controls randomness, not accuracy. Higher temperature would give you more creative wrong answers, not more correct ones.' },
      ],
    },
    xpReward: 100,
  },

  // --- Module 17: Graduation ---
  {
    id: 'graduation',
    part: 5,
    moduleNumber: 17,
    title: 'Graduation',
    subtitle: 'The final mission — ship an AI feature from scratch',
    durationMinutes: 8,
    mikeIntro: [
      "You've learned everything you need. From tokens to tools, from prompts to pipelines. Now it's time to put it all together.",
      "Here's the scenario: your company wants to add an AI-powered Q&A feature to their product. Customers ask questions, the AI answers using your company docs.",
      "You'll make every key decision — model choice, architecture, safety, deployment. This is the real deal. Let's ship it!",
    ],
    miniGame: {
      type: 'final-mission',
      stages: [
        {
          title: 'Stage 1: Choose Your Model',
          type: 'model-choice',
          options: [
            { text: 'Claude Haiku — fast and cheap, good for simple Q&A', correct: false, explanation: 'Haiku is fast but may struggle with nuanced customer questions that require understanding complex product docs. For customer-facing features, quality matters more than speed.' },
            { text: 'Claude Sonnet — balanced speed, cost, and intelligence', correct: true, explanation: 'Sonnet gives you the best balance for a customer Q&A feature. Smart enough to handle complex questions, fast enough for real-time chat, affordable enough to scale.' },
            { text: 'Claude Opus — the most powerful model available', correct: false, explanation: 'Opus is brilliant but expensive and slower. For a customer Q&A feature that might get thousands of requests per day, the cost would be enormous. Sonnet handles this well at a fraction of the price.' },
          ],
        },
        {
          title: 'Stage 2: Design the Architecture',
          type: 'architecture-choice',
          options: [
            { text: 'Send the entire product documentation with every question', correct: false, explanation: 'Your docs might be thousands of pages. Sending everything is expensive (you pay per token) and most of it would be irrelevant to the specific question.' },
            { text: 'Use RAG: search docs for relevant sections, then send only those with the question', correct: true, explanation: 'RAG is the right pattern. Search your docs, find the 3-5 most relevant sections, and include those in the prompt. The AI gets focused context, answers are accurate, and costs stay low.' },
            { text: 'Just let the AI answer from its training data, no docs needed', correct: false, explanation: 'The AI doesn\'t know YOUR specific product details, pricing, or policies. It would hallucinate answers. You need to give it your actual documentation.' },
          ],
        },
        {
          title: 'Stage 3: Handle Safety',
          type: 'safety-choice',
          options: [
            { text: 'Trust the AI — modern models are accurate enough', correct: false, explanation: 'Never blindly trust AI for customer-facing features. Even the best models hallucinate. You need guardrails.' },
            { text: 'Add guardrails: verify answers reference real docs, flag uncertain responses, include "contact support" fallback', correct: true, explanation: 'Defense in depth! Verify the AI cites real sources, flag low-confidence answers for human review, and always offer a path to human support. This is how production AI features stay safe.' },
            { text: 'Add a disclaimer "AI-generated, may be inaccurate" and call it done', correct: false, explanation: 'A disclaimer doesn\'t prevent bad answers — it just shifts blame. Customers still get wrong information and lose trust. Guardrails actively prevent bad outputs.' },
          ],
        },
        {
          title: 'Stage 4: Connect Your Data',
          type: 'connection-choice',
          options: [
            { text: 'Manually copy-paste docs into the system prompt every time they change', correct: false, explanation: 'This is manual, error-prone, and doesn\'t scale. What happens when docs update weekly? You need an automated pipeline.' },
            { text: 'Use MCP to connect the AI to your documentation system, with automatic sync', correct: true, explanation: 'MCP gives the AI a live connection to your docs. When pricing changes, the AI automatically sees the new data. No manual updates, always current.' },
            { text: 'Upload a PDF of your docs once and never update it', correct: false, explanation: 'Static uploads become outdated immediately. Your product changes, prices change, policies change. The AI would give stale answers within weeks.' },
          ],
        },
        {
          title: 'Stage 5: Ship It',
          type: 'deployment-choice',
          options: [
            { text: 'Deploy to all customers immediately', correct: false, explanation: 'Never go from zero to 100% at once. What if there\'s a bug? What if the AI gives wrong answers in an edge case? Start small, catch issues, then scale up.' },
            { text: 'Start with a beta group, monitor quality, then gradually roll out', correct: true, explanation: 'Gradual rollout is the professional approach. Start with 5% of users, monitor answer quality, check for hallucinations, gather feedback, fix issues, then expand. This is how real AI features ship.' },
            { text: 'Keep it internal-only forever — too risky for customers', correct: false, explanation: 'Playing it too safe means your customers never benefit from AI. With proper guardrails, RAG, and gradual rollout, customer-facing AI features are safe and valuable.' },
          ],
        },
      ],
    },
    glossaryTerms: [
      { id: 'production', term: 'Production', definition: 'The live version of your app that real users interact with. "Shipping to production" means releasing your feature to the real world.' },
      { id: 'gradual-rollout', term: 'Gradual Rollout', definition: 'Releasing a feature to a small percentage of users first, then slowly expanding. Catches bugs before they affect everyone. Also called a "staged rollout" or "canary release."' },
      { id: 'monitoring', term: 'Monitoring', definition: 'Watching how your AI feature performs in the real world — are answers accurate? Are users happy? Are costs within budget? Like a dashboard for your feature\'s health.' },
      { id: 'iteration', term: 'Iteration', definition: 'The cycle of ship → measure → improve → ship again. The first version is never perfect. Ship it, learn from real usage, make it better.' },
    ],
    quiz: {
      characterId: 'mike',
      question: 'You\'ve built an AI Q&A feature. It works great in testing. Your boss says "Ship it to all 50,000 customers today!" What do you recommend?',
      options: [
        { text: 'Ship it — testing went great, so it\'s ready', correct: false, explanation: 'Testing can\'t catch every real-world scenario. 50,000 users will find edge cases you never thought of. Starting with all users is risky.' },
        { text: 'Start with a small beta group, monitor closely, then gradually expand', correct: true, explanation: 'This is the professional approach. Start with 5% of users. Monitor answer quality. Fix issues. Expand to 25%, then 50%, then 100%. Each step catches problems before they scale. Every major AI feature ships this way.' },
        { text: 'Delay 6 months and do more testing', correct: false, explanation: 'Analysis paralysis! No amount of internal testing replaces real-world usage. Ship to a small group now and iterate. You\'ll learn more from 100 real users than 6 months of internal testing.' },
        { text: 'Remove all guardrails so the AI can respond faster', correct: false, explanation: 'Speed without safety is a disaster. Guardrails are NOT optional for customer-facing AI. A wrong answer to one customer can damage your brand far more than a slightly slower response.' },
      ],
    },
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
