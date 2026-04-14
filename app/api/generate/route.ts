import { NextRequest } from 'next/server';
import { parseGitHubUrl, readRepo } from '@/lib/github/read-repo';
import { analyzeRepo } from '@/lib/ai/analyze-repo';
import { generateTour } from '@/lib/ai/generate-tour';
import { generateModes } from '@/lib/ai/generate-modes';
import { generateAdvanced } from '@/lib/ai/generate-advanced';
import {
  createGame, getGameByRepo,
  updateGameStatus, updateGameAnalysis,
  updateGameTourContent, updateGameModesContent, updateGameAdvancedContent,
} from '@/lib/db/queries';

export const maxDuration = 120; // Vercel Pro: up to 300s

export async function POST(request: NextRequest) {
  const { repoUrl } = await request.json();

  // Validate URL
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return Response.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  // Check cache — if game already exists and is complete, return it
  const existing = await getGameByRepo(repoUrl);
  if (existing && existing.status === 'complete') {
    return Response.json({ gameId: existing.id, cached: true });
  }

  // Create game row (or reset existing)
  const gameId = existing?.id ?? await createGame(repoUrl, `${parsed.owner}/${parsed.repo}`);

  // Stream progress via SSE
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      try {
        // Step 1: Read repo
        send('status', { step: 'reading', message: 'Reading repository...' });
        await updateGameStatus(gameId, 'reading');
        const snapshot = await readRepo(parsed.owner, parsed.repo);
        send('status', { step: 'reading_done', message: `Found ${snapshot.fileTree.length} files, reading ${snapshot.files.length} key files` });

        // Step 2: Analyze
        send('status', { step: 'analyzing', message: 'Analyzing architecture, casting characters...' });
        await updateGameStatus(gameId, 'analyzing');
        const analysis = await analyzeRepo(snapshot);
        await updateGameAnalysis(gameId, analysis);
        send('analysis', { characters: analysis.characters });

        // Step 3: Generate tour
        send('status', { step: 'generating_tour', message: 'Writing character dialogues and quizzes...' });
        await updateGameStatus(gameId, 'generating');
        const tourContent = await generateTour(analysis, snapshot);
        const tourWithMeta = { ...tourContent, meta: analysis.meta };
        await updateGameTourContent(gameId, tourWithMeta);
        send('tour_ready', { gameId });

        // Step 4: Generate modes (continues in background for the player)
        send('status', { step: 'generating_modes', message: 'Creating Mail Room and Bug Hunt challenges...' });
        const modesContent = await generateModes(analysis, snapshot);
        await updateGameModesContent(gameId, modesContent);
        send('modes_ready', {});

        // Step 5: Generate advanced
        send('status', { step: 'generating_advanced', message: 'Building Boss Battle scenarios...' });
        const advancedContent = await generateAdvanced(analysis);
        await updateGameAdvancedContent(gameId, advancedContent);
        send('complete', { gameId });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[generate] Pipeline error:', error);
        await updateGameStatus(gameId, 'error', message);

        if (message === 'REPO_NOT_FOUND') {
          send('error', { message: "Couldn't find that repo. Check the URL or make sure it's public." });
        } else if (message === 'REPO_TOO_LARGE') {
          send('error', { message: 'This repo is too large for analysis. Try a smaller repo or subdirectory.' });
        } else if (message === 'RATE_LIMITED') {
          send('error', { message: "We're getting too many requests. Try again in a few minutes." });
        } else {
          send('error', { message: 'Something went wrong during generation. Try again.' });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
