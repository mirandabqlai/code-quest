// lib/ai/generate-room-content.ts

import Anthropic from '@anthropic-ai/sdk';
import { ROOM_CONTENT_PROMPT, extractJSON, withRetry, buildSnapshotContext } from './prompts-v2';
import type { CharacterContent, GameCharacter, Room } from '@/lib/game/types-v2';
import type { RepoSnapshot } from '@/lib/github/read-repo';

const client = new Anthropic();

/**
 * Generate content for a single room/character.
 * Called once per room — can be parallelized across rooms.
 */
export async function generateRoomContent(
  character: GameCharacter,
  room: Room,
  analysisJSON: string,
  snapshot: RepoSnapshot
): Promise<CharacterContent> {
  // Filter snapshot to only include files owned by this character
  const relevantFiles = snapshot.files.filter(f =>
    character.files.some(cf => f.path.startsWith(cf) || cf.startsWith(f.path))
  );

  const filesContext = relevantFiles.length > 0
    ? relevantFiles.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n')
    : 'No file contents available for this character.';

  return withRetry(async () => {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `${ROOM_CONTENT_PROMPT}\n\n---\n\nGENERATE CONTENT FOR:\nCharacter: ${character.name} (${character.id})\nRoom: ${room.name} (${room.id})\nFolder: ${room.folder}\nFiles: ${character.files.join(', ')}\n\n---\n\nANALYSIS:\n${analysisJSON}\n\n---\n\nFILE CONTENTS FOR THIS CHARACTER:\n${filesContext}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(extractJSON(text)) as CharacterContent;
  });
}
