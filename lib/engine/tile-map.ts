// lib/engine/tile-map.ts
//
// Open-floor office layout. Rooms are distinguished by floor color,
// not walls. Thin border tiles mark room boundaries. The result looks
// like one big office with different "zones" — like a real open-plan office.

import type { OfficeLayout } from '@/lib/game/types-v2';

export const TILE_SIZE = 16;      // pixels per tile
export const ROOM_WIDTH = 12;     // tiles per room (horizontal)
export const ROOM_HEIGHT = 10;    // tiles per room (vertical)
export const BORDER_THICKNESS = 1; // thin floor border between rooms

// Top strip for Mike's manager area
export const MIKE_STRIP_HEIGHT = 3;

export type TileType = 'floor' | 'wall' | 'border' | 'mike-floor' | 'void';

export interface Tile {
  type: TileType;
  roomId: string | null;    // which room this tile belongs to
  color: string;            // floor color (hex)
}

export interface TileMap {
  width: number;            // total tiles across
  height: number;           // total tiles down
  tiles: Tile[][];          // [row][col]
  rooms: Map<string, { x: number; y: number; w: number; h: number }>; // room bounds in tiles
}

/** Build an open-floor tile map from the AI-generated office layout */
export function buildTileMap(layout: OfficeLayout): TileMap {
  const { rooms, gridCols, gridRows } = layout;

  // Total grid size — rooms sit directly next to each other with 1-tile borders
  const totalW = gridCols * ROOM_WIDTH + (gridCols - 1) * BORDER_THICKNESS + 2; // +2 for outer edges
  const totalH = MIKE_STRIP_HEIGHT + gridRows * ROOM_HEIGHT + (gridRows - 1) * BORDER_THICKNESS + 2;

  // Initialize all tiles as a neutral dark floor (the "hallway")
  const tiles: Tile[][] = Array.from({ length: totalH }, () =>
    Array.from({ length: totalW }, () => ({
      type: 'floor' as TileType,
      roomId: null,
      color: '#1a1a2e', // neutral hallway color
    }))
  );

  // Room bounds lookup
  const roomBounds = new Map<string, { x: number; y: number; w: number; h: number }>();

  // Mike's strip at the top — a distinct manager area
  for (let row = 0; row < MIKE_STRIP_HEIGHT; row++) {
    for (let col = 0; col < totalW; col++) {
      tiles[row][col] = {
        type: 'mike-floor',
        roomId: 'mike',
        color: '#1a2a1e', // dark green tint for Mike's area
      };
    }
  }

  // Place rooms below Mike's strip
  for (const room of rooms) {
    const startX = 1 + room.position.col * (ROOM_WIDTH + BORDER_THICKNESS);
    const startY = MIKE_STRIP_HEIGHT + 1 + room.position.row * (ROOM_HEIGHT + BORDER_THICKNESS);

    roomBounds.set(room.id, { x: startX, y: startY, w: ROOM_WIDTH, h: ROOM_HEIGHT });

    // Fill room tiles with the room's floor color
    for (let row = startY; row < startY + ROOM_HEIGHT; row++) {
      for (let col = startX; col < startX + ROOM_WIDTH; col++) {
        if (row < totalH && col < totalW) {
          tiles[row][col] = {
            type: 'floor',
            roomId: room.id,
            color: room.floorColor,
          };
        }
      }
    }
  }

  // Add thin border lines between rooms (subtle dividers, not walls)
  for (let row = 0; row < totalH; row++) {
    for (let col = 0; col < totalW; col++) {
      const tile = tiles[row][col];
      if (tile.roomId !== null) continue; // skip room tiles and mike tiles
      if (tile.type === 'mike-floor') continue;

      // Check if this neutral tile is between two different rooms
      const neighbors = [
        row > 0 ? tiles[row - 1][col] : null,
        row < totalH - 1 ? tiles[row + 1][col] : null,
        col > 0 ? tiles[row][col - 1] : null,
        col < totalW - 1 ? tiles[row][col + 1] : null,
      ];
      const adjacentRooms = neighbors
        .filter(n => n?.roomId && n.roomId !== 'mike')
        .map(n => n!.roomId);

      if (adjacentRooms.length >= 2) {
        // This tile is between rooms — make it a subtle border
        tiles[row][col] = { type: 'border', roomId: null, color: '#2c2c54' };
      }
    }
  }

  // Outer walls — only on the very edges of the office
  for (let col = 0; col < totalW; col++) {
    tiles[totalH - 1][col] = { type: 'wall', roomId: null, color: '#2c2c54' };
  }
  for (let row = 0; row < totalH; row++) {
    tiles[row][0] = { type: 'wall', roomId: null, color: '#2c2c54' };
    tiles[row][totalW - 1] = { type: 'wall', roomId: null, color: '#2c2c54' };
  }

  return { width: totalW, height: totalH, tiles, rooms: roomBounds };
}

/** Convert tile coordinates to pixel coordinates */
export function tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
  return { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE };
}

/** Convert pixel coordinates to tile coordinates */
export function pixelToTile(pixelX: number, pixelY: number): { col: number; row: number } {
  return {
    col: Math.floor(pixelX / TILE_SIZE),
    row: Math.floor(pixelY / TILE_SIZE),
  };
}

/** Get the center pixel position of a room */
export function getRoomCenter(tileMap: TileMap, roomId: string): { x: number; y: number } | null {
  if (roomId === 'mike') {
    // Mike's area is the top strip
    return {
      x: (tileMap.width / 2) * TILE_SIZE,
      y: (MIKE_STRIP_HEIGHT / 2) * TILE_SIZE,
    };
  }
  const bounds = tileMap.rooms.get(roomId);
  if (!bounds) return null;
  return {
    x: (bounds.x + bounds.w / 2) * TILE_SIZE,
    y: (bounds.y + bounds.h / 2) * TILE_SIZE,
  };
}
