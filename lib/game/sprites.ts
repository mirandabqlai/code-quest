import type { SpriteType } from './types';

export interface SpriteConfig {
  type: SpriteType;
  label: string;
  shirtColor: string;
  accessory: string; // emoji for fallback rendering
  idleFrames: number;
}

export const SPRITE_CONFIGS: Record<SpriteType, SpriteConfig> = {
  receptionist: { type: 'receptionist', label: 'Receptionist', shirtColor: '#ff6b6b', accessory: '🔔', idleFrames: 2 },
  archivist:    { type: 'archivist', label: 'Archivist', shirtColor: '#ffd93d', accessory: '📁', idleFrames: 2 },
  translator:   { type: 'translator', label: 'Translator', shirtColor: '#4ecdc4', accessory: '🌐', idleFrames: 2 },
  strategist:   { type: 'strategist', label: 'Strategist', shirtColor: '#a855f7', accessory: '⚔️', idleFrames: 2 },
  scorekeeper:  { type: 'scorekeeper', label: 'Scorekeeper', shirtColor: '#ff9f43', accessory: '📊', idleFrames: 2 },
  cartographer: { type: 'cartographer', label: 'Cartographer', shirtColor: '#4ecdc4', accessory: '🗺️', idleFrames: 2 },
  engineer:     { type: 'engineer', label: 'Engineer', shirtColor: '#7a7a8e', accessory: '⚙️', idleFrames: 2 },
  manager:      { type: 'manager', label: 'Manager', shirtColor: '#38bdf8', accessory: '📋', idleFrames: 2 },
};

// Pixel art character drawn with CSS box-shadow
// Each "pixel" is 1px, scaled up with transform: scale(4)
// Layout: 8x8 pixel character (head + torso)
export function generateCharacterPixels(shirtColor: string): string {
  const skin = '#f5c7a9';
  const hair = '#2d1b00';
  const eye = '#1a1a2e';
  const s = shirtColor;
  // 8x8 pixel person (row by row, left to right)
  // Row 0: hair
  // Row 1: hair + face
  // Row 2: face with eyes
  // Row 3: face
  // Row 4: shirt
  // Row 5: shirt with arms
  // Row 6: pants
  // Row 7: shoes
  const pixels: [number, string][] = [
    [0,hair], [1,hair], [2,hair], [3,hair], [4,hair], [5,hair],
    [8,hair], [9,skin], [10,skin], [11,skin], [12,skin], [13,hair],
    [16,skin], [17,eye], [18,skin], [19,skin], [20,eye], [21,skin],
    [16+8,skin], [17+8,skin], [18+8,skin], [19+8,skin], [20+8,skin], [21+8,skin],
    [32,s], [33,s], [34,s], [35,s], [36,s], [37,s],
    [38+2,s], [39+2,s], [40,s], [41,s], [42,s], [43,s], [44-2,s], [45-2,s],
    [48+1,s], [49+1,s], [50,s], [51,s],
    [56+1,'#1a1a2e'], [57+1,'#1a1a2e'], [58,'#1a1a2e'], [59,'#1a1a2e'],
  ];

  return pixels
    .map(([pos, color]) => {
      const x = (pos as number) % 8;
      const y = Math.floor((pos as number) / 8);
      return `${x}px ${y}px 0 ${color}`;
    })
    .join(', ');
}
