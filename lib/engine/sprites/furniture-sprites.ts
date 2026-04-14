// lib/engine/sprites/furniture-sprites.ts
//
// Furniture sprite sets for each room type.
// Each room type gets a desk, chair, monitor, and 1-2 themed items.

import type { FurnitureItem, RoomType, SpriteData } from '@/lib/game/types-v2';
import { createFrame } from './sprite-data';

// ===== Common furniture =====

const DESK_SPRITE: SpriteData = [
  // 32x12 desk
  ...Array.from({ length: 2 }, () => Array(32).fill('#5a4a3c')),
  ...Array.from({ length: 6 }, () => [
    '#5a4a3c', '#5a4a3c', ...Array(28).fill('#4a3a2c'), '#5a4a3c', '#5a4a3c',
  ]),
  ['#5a4a3c', '#5a4a3c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a4a3c', '#5a4a3c'],
  ['#5a4a3c', '#5a4a3c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a4a3c', '#5a4a3c'],
  ['#4a3a2c', '#4a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#4a3a2c', '#4a3a2c'],
  ['#4a3a2c', '#4a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#4a3a2c', '#4a3a2c'],
];

const MONITOR_ON_SPRITE: SpriteData = [
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#0a1a2e', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#0a1a2e', '#3a3a5c'],
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['', '', '', '', '', '', '#5a5a8c', '#5a5a8c', '', '', '', '', '', ''],
  ['', '', '', '', '', '#5a5a8c', '#5a5a8c', '#5a5a8c', '#5a5a8c', '', '', '', '', ''],
];

const CHAIR_SPRITE: SpriteData = [
  ['', '', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '#4a3a6c', '', ''],
  ['', '', '#4a3a6c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#4a3a6c', '', ''],
  ['', '', '#4a3a6c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#4a3a6c', '', ''],
  ['', '', '', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '', '', ''],
  ['', '', '', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '#3a2a5c', '', '', ''],
  ['', '', '', '', '#2c2c54', '', '', '', '#2c2c54', '', '', ''],
];

const PLANT_SPRITE: SpriteData = [
  ['', '', '', '#2a8a3c', '#2a8a3c', '', '', '', ''],
  ['', '', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', '', ''],
  ['', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', ''],
  ['', '#2a8a3c', '#3aaa4c', '#2a8a3c', '#3aaa4c', '#3aaa4c', '#2a8a3c', '', ''],
  ['', '', '#2a8a3c', '#2a8a3c', '#2a8a3c', '#2a8a3c', '', '', ''],
  ['', '', '', '#3a2a1c', '#3a2a1c', '', '', '', ''],
  ['', '', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '', '', ''],
  ['', '', '#5a3a2c', '#4a2a1c', '#4a2a1c', '#5a3a2c', '', '', ''],
  ['', '', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '', '', ''],
];

// ===== Themed furniture =====

const BOOKSHELF_SPRITE: SpriteData = [
  ['#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c', '#5a3a2c'],
  ['#5a3a2c', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#38bdf8', '#38bdf8', '#38bdf8', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#5a3a2c'],
  ['#5a3a2c', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#4ecdc4', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#38bdf8', '#38bdf8', '#38bdf8', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#5a3a2c'],
  ['#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c'],
  ['#5a3a2c', '#a855f7', '#a855f7', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#38bdf8', '#38bdf8', '#38bdf8', '#ffd93d', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#5a3a2c'],
  ['#5a3a2c', '#a855f7', '#a855f7', '#ff9f43', '#ff9f43', '#ff9f43', '#ff6b6b', '#ff6b6b', '#4ecdc4', '#4ecdc4', '#38bdf8', '#38bdf8', '#38bdf8', '#ffd93d', '#ffd93d', '#ffd93d', '#a855f7', '#a855f7', '#a855f7', '#5a3a2c'],
  ['#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c', '#4a2a1c'],
  ['#5a3a2c', '#5a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a3a2c', '#5a3a2c'],
  ['#5a3a2c', '#5a3a2c', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '#5a3a2c', '#5a3a2c'],
];

const SERVER_RACK_SPRITE: SpriteData = [
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#00ff41', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#4ecdc4', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#00ff41', '#3a3a5c'],
  ['#3a3a5c', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#2c2c54', '#3a3a5c'],
  ['#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c'],
];

const FILING_CABINET_SPRITE: SpriteData = [
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#7a9a8c', '#7a9a8c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#2a4a3c', '#3a5a4c'],
  ['#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c', '#3a5a4c'],
];

const WHITEBOARD_SPRITE: SpriteData = [
  ['#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#ff6b6b', '#ff6b6b', '', '', '#4ecdc4', '', '', '#ffd93d', '#ffd93d', '', '', '', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '', '', '', '#ff6b6b', '', '#4ecdc4', '', '', '', '#ffd93d', '', '', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '', '', '', '', '', '', '#4ecdc4', '', '', '', '#a855f7', '#a855f7', '', '', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#7a7a8e'],
  ['#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e', '#7a7a8e'],
];

// ===== Room furniture layouts =====

/** Get furniture items for a room type, positioned relative to room tile origin */
export function getFurnitureForRoom(type: RoomType, roomTileX: number, roomTileY: number): FurnitureItem[] {
  const items: FurnitureItem[] = [];
  const baseX = roomTileX;
  const baseY = roomTileY;

  // Every room gets a desk, chair, monitor, and plant
  items.push(
    { id: `${type}-desk`, sprite: createFrame(DESK_SPRITE), x: baseX + 4, y: baseY + 4, interactable: false },
    { id: `${type}-monitor`, sprite: createFrame(MONITOR_ON_SPRITE), x: baseX + 5, y: baseY + 2, interactable: false },
    { id: `${type}-chair`, sprite: createFrame(CHAIR_SPRITE), x: baseX + 5, y: baseY + 6, interactable: false },
    { id: `${type}-plant`, sprite: createFrame(PLANT_SPRITE), x: baseX + 1, y: baseY + 7, interactable: false },
  );

  // Room-specific themed items
  switch (type) {
    case 'reception':
      // Welcome sign (use whiteboard as stand-in)
      items.push({ id: `${type}-sign`, sprite: createFrame(WHITEBOARD_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'server-room':
      items.push({ id: `${type}-rack`, sprite: createFrame(SERVER_RACK_SPRITE), x: baseX + 9, y: baseY + 2, interactable: false });
      break;
    case 'archives':
      items.push(
        { id: `${type}-cabinet`, sprite: createFrame(FILING_CABINET_SPRITE), x: baseX + 9, y: baseY + 1, interactable: false },
        { id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 1, y: baseY + 1, interactable: false },
      );
      break;
    case 'lab':
      items.push({ id: `${type}-board`, sprite: createFrame(WHITEBOARD_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'workshop':
      items.push({ id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 8, y: baseY + 1, interactable: false });
      break;
    case 'map-room':
      // Bookshelf doubles as strategy board
      items.push({ id: `${type}-shelf`, sprite: createFrame(BOOKSHELF_SPRITE), x: baseX + 1, y: baseY + 1, interactable: false });
      break;
    default:
      // Generic office — just the basics (already added above)
      break;
  }

  return items;
}
