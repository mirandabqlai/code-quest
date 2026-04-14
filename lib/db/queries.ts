import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import type { GameRow, GameStatus } from '@/lib/game/types';

export async function createGame(repoUrl: string, repoName: string): Promise<string> {
  const id = nanoid(8);
  await sql`
    INSERT INTO games (id, repo_url, repo_name, status)
    VALUES (${id}, ${repoUrl}, ${repoName}, 'pending')
    ON CONFLICT (repo_url) DO UPDATE SET status = 'pending', error_message = NULL
    RETURNING id
  `;
  return id;
}

export async function getGame(id: string): Promise<GameRow | null> {
  const { rows } = await sql`SELECT * FROM games WHERE id = ${id}`;
  return (rows[0] as GameRow) ?? null;
}

export async function getGameByRepo(repoUrl: string): Promise<GameRow | null> {
  const { rows } = await sql`SELECT * FROM games WHERE repo_url = ${repoUrl}`;
  return (rows[0] as GameRow) ?? null;
}

export async function updateGameStatus(id: string, status: GameStatus, errorMessage?: string) {
  await sql`
    UPDATE games SET status = ${status}, error_message = ${errorMessage ?? null}
    WHERE id = ${id}
  `;
}

export async function updateGameAnalysis(id: string, analysis: object) {
  await sql`
    UPDATE games SET analysis = ${JSON.stringify(analysis)}, status = 'generating'
    WHERE id = ${id}
  `;
}

export async function updateGameTourContent(id: string, tourContent: object) {
  await sql`
    UPDATE games SET tour_content = ${JSON.stringify(tourContent)}
    WHERE id = ${id}
  `;
}

export async function updateGameModesContent(id: string, modesContent: object) {
  await sql`
    UPDATE games SET modes_content = ${JSON.stringify(modesContent)}
    WHERE id = ${id}
  `;
}

export async function updateGameAdvancedContent(id: string, advancedContent: object) {
  await sql`
    UPDATE games SET advanced_content = ${JSON.stringify(advancedContent)}, status = 'complete'
    WHERE id = ${id}
  `;
}

export async function incrementViewCount(id: string) {
  await sql`UPDATE games SET view_count = view_count + 1 WHERE id = ${id}`;
}
