// lib/game/character-utils.ts
//
// Shared helpers for looking up characters by ID.
// Mike (the manager NPC) isn't in the characters array — he's
// synthesized on the fly when needed.

import type { GameCharacter } from '@/lib/game/types-v2';

const MIKE_STUB = { name: 'Mike', color: '#00ff41', id: 'mike' } as const;

const DEFAULT_COLOR = '#7a7a8e';

/** Look up a character by ID, returning Mike's stub if the ID is 'mike'. */
export function findCharacter(
  characters: GameCharacter[],
  id: string
): Pick<GameCharacter, 'name' | 'color' | 'id'> | undefined {
  if (id === 'mike') return MIKE_STUB;
  return characters.find(c => c.id === id);
}

/** Fallback color when a character lookup returns undefined. */
export { DEFAULT_COLOR };
