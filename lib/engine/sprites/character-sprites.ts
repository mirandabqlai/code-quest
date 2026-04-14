// lib/engine/sprites/character-sprites.ts
//
// Base character sprite templates. Each character is 16x16 pixels.
// The clothing color '#4488cc' is a placeholder that gets palette-swapped
// to each character's assigned color at runtime.

import type { CharacterSpriteSet, SpriteFrame, SpriteData } from '@/lib/game/types-v2';
import { createFrame, flipHorizontal, paletteSwap } from './sprite-data';

// Placeholder clothing color used in all base sprites
const BASE_CLOTHING = '#4488cc';
const SKIN = '#e8c4a0';
const SKIN_SHADOW = '#c4a080';
const HAIR = '#3a2a1c';
const PANTS = '#2c2c54';
const SHOES = '#1a1a2e';

// ===== BASE CHARACTER — facing down, idle frame 1 =====
const BASE_IDLE_DOWN_1: SpriteData = [
  // 16 rows × 16 cols — a small pixel person
  //                (centered in 16x16, actual figure ~8x14)
  ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''],
  ['', '', '', '', '', HAIR, HAIR, HAIR, HAIR, HAIR, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', HAIR, SKIN, SKIN, SKIN, SKIN, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '#1a1a2e', SKIN, '#1a1a2e', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, SKIN, SKIN, SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN_SHADOW, SKIN, SKIN, SKIN_SHADOW, '', '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '', '', SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, '', '', PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', PANTS, '', '', PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', SHOES, '', '', SHOES, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Idle frame 2 — slight bob (shift body down 1px)
const BASE_IDLE_DOWN_2: SpriteData = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ...BASE_IDLE_DOWN_1.slice(0, 15),
];

// Walking frame 1 — left leg forward
const BASE_WALK_DOWN_1: SpriteData = [
  ...BASE_IDLE_DOWN_1.slice(0, 11),
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', PANTS, PANTS, '', '', '', PANTS, '', '', '', '', ''],
  ['', '', '', '', '', SHOES, '', '', '', '', SHOES, '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Walking frame 2 — right leg forward
const BASE_WALK_DOWN_2: SpriteData = [
  ...BASE_IDLE_DOWN_1.slice(0, 11),
  ['', '', '', '', '', '', PANTS, PANTS, PANTS, PANTS, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', PANTS, PANTS, '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SHOES, '', '', SHOES, '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Sitting frame (for at desk) — legs bent, body lower
const BASE_SIT_DOWN: SpriteData = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''],
  ['', '', '', '', '', HAIR, HAIR, HAIR, HAIR, HAIR, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', HAIR, SKIN, SKIN, SKIN, SKIN, HAIR, '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, '#1a1a2e', SKIN, '#1a1a2e', '', '', '', '', '', ''],
  ['', '', '', '', '', '', SKIN, SKIN, SKIN, SKIN, '', '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, BASE_CLOTHING, '', '', '', '', ''],
  ['', '', '', '', '', SKIN, '', PANTS, PANTS, '', SKIN, '', '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

// Typing frames — same as sitting but arms alternate
const BASE_TYPE_DOWN_1: SpriteData = [
  ...BASE_SIT_DOWN.slice(0, 10),
  ['', '', '', '', SKIN, '', '', PANTS, PANTS, '', '', SKIN, '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ...BASE_SIT_DOWN.slice(12),
];

const BASE_TYPE_DOWN_2: SpriteData = [
  ...BASE_SIT_DOWN.slice(0, 10),
  ['', '', '', '', '', SKIN, '', PANTS, PANTS, '', SKIN, '', '', '', '', ''],
  ['', '', '', '', PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, PANTS, '', '', '', ''],
  ...BASE_SIT_DOWN.slice(12),
];

// Up-facing sprites (just show back of head, no face details)
const BASE_IDLE_UP: SpriteData = BASE_IDLE_DOWN_1.map((row, i) => {
  if (i === 3) return ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''];
  if (i === 4) return ['', '', '', '', '', '', HAIR, HAIR, HAIR, HAIR, '', '', '', '', '', ''];
  return [...row];
});

/**
 * Build a complete sprite set for a character by palette-swapping
 * the base templates with their assigned color.
 */
export function buildCharacterSpriteSet(characterColor: string): CharacterSpriteSet {
  const swap = (data: SpriteData) => paletteSwap(createFrame(data), BASE_CLOTHING, characterColor);

  const idleDown1 = swap(BASE_IDLE_DOWN_1);
  const idleDown2 = swap(BASE_IDLE_DOWN_2);
  const walkDown1 = swap(BASE_WALK_DOWN_1);
  const walkDown2 = swap(BASE_WALK_DOWN_2);
  const sitDown = swap(BASE_SIT_DOWN);
  const typeDown1 = swap(BASE_TYPE_DOWN_1);
  const typeDown2 = swap(BASE_TYPE_DOWN_2);
  const idleUp = swap(BASE_IDLE_UP);

  // Right = base, Left = flipped
  const idleRight1 = idleDown1; // simplified: same sprite for right
  const idleLeft1 = flipHorizontal(idleRight1);

  return {
    idle: {
      down: [idleDown1, idleDown2],
      up: [idleUp, idleUp],
      left: [idleLeft1, flipHorizontal(idleDown2)],
      right: [idleRight1, idleDown2],
    },
    walk: {
      down: [walkDown1, idleDown1, walkDown2, idleDown1],
      up: [swap(BASE_IDLE_UP), swap(BASE_IDLE_UP)],
      left: [flipHorizontal(walkDown1), flipHorizontal(idleDown1), flipHorizontal(walkDown2), flipHorizontal(idleDown1)],
      right: [walkDown1, idleDown1, walkDown2, idleDown1],
    },
    sit: { down: [sitDown] },
    type: { down: [typeDown1, typeDown2] },
  };
}
