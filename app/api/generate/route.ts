import { NextRequest } from 'next/server';
import { parseGitHubUrl, readRepo } from '@/lib/github/read-repo';
import { ANALYSIS_V2_PROMPT, buildSnapshotContext, extractJSON, withRetry } from '@/lib/ai/prompts-v2';
import { generateMikeTour } from '@/lib/ai/generate-mike-tour';
import { generateRoomContent } from '@/lib/ai/generate-room-content';
import Anthropic from '@anthropic-ai/sdk';
import type { OfficeLayout, GameCharacter } from '@/lib/game/types-v2';
import {
  createGame, getGameByRepo,
  updateGameStatus, updateGameAnalysis,
  updateGameOfficeLayout, updateGameMikeContent, updateGameRoomContent,
} from '@/lib/db/queries';

const client = new Anthropic();

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
        // === Step 1: Read repo ===
        send('status', { step: 'reading', message: 'Reading repository...' });
        await updateGameStatus(gameId, 'reading');
        const snapshot = await readRepo(parsed.owner, parsed.repo);
        send('status', { step: 'reading_done', message: `Found ${snapshot.fileTree.length} files, reading ${snapshot.files.length} key files` });

        // === Step 2: Analyze repo with v2 prompt ===
        // v2 analysis returns characters with roomId, plus an office layout object
        send('status', { step: 'analyzing', message: 'Analyzing architecture, designing office layout...' });
        await updateGameStatus(gameId, 'analyzing');

        const context = buildSnapshotContext(snapshot);
        const analysisResponse = await withRetry(() => client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: `${ANALYSIS_V2_PROMPT}\n\n${context}`,
          }],
        }));

        const analysisText = analysisResponse.content[0].type === 'text' ? analysisResponse.content[0].text : '';
        const analysisJSON = extractJSON(analysisText);
        const analysis = JSON.parse(analysisJSON) as {
          meta: { repoName: string; repoDescription: string; techStack: string[]; generatedAt: string };
          characters: GameCharacter[];
          office: OfficeLayout;
          folderTree: { path: string; indent: number; type: string; owner?: string }[];
          dataFlows: { id: string; label: string; steps: { characterId: string; action: string }[] }[];
        };

        // Save analysis to v1 columns for backwards compat, plus office layout to v2 column
        await updateGameAnalysis(gameId, {
          characters: analysis.characters,
          folderTree: analysis.folderTree,
          dataFlows: analysis.dataFlows,
        });
        await updateGameOfficeLayout(gameId, analysis.office);

        send('analysis', { characters: analysis.characters, office: analysis.office });

        // === Step 3: Generate Mike's guided tour ===
        send('status', { step: 'generating_tour', message: "Mike is preparing your guided tour..." });
        await updateGameStatus(gameId, 'generating');
        const mikeTour = await generateMikeTour(analysisJSON);
        await updateGameMikeContent(gameId, mikeTour);

        // === Step 4: Tour is ready — redirect user to game page ===
        // The player can start playing (Mike's tour) while room content generates in the background.
        send('tour_ready', { gameId });

        // === Step 5: Generate room content for each character ===
        // Process rooms sequentially to avoid Claude API rate limits.
        // Each room gets its own Story/Code/Challenges content.
        const roomContent: Record<string, import('@/lib/game/types-v2').CharacterContent> = {};
        const rooms = analysis.office.rooms;

        for (let i = 0; i < rooms.length; i++) {
          const room = rooms[i];
          const character = analysis.characters.find(c => c.id === room.characterId);
          if (!character) continue;

          send('status', {
            step: 'generating_room',
            message: `Generating content for ${room.name} (${i + 1}/${rooms.length})...`,
          });

          const content = await generateRoomContent(character, room, analysisJSON, snapshot);
          roomContent[room.id] = content;
        }

        // Save all room content and mark game as complete
        await updateGameRoomContent(gameId, roomContent);

        // === Step 6: All done ===
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
