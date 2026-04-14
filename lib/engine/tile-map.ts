// lib/engine/tile-map.ts
//
// The tile map defines the office grid. Each room occupies a rectangular
// area of tiles. Walls separate rooms, doorways connect them.

import type { OfficeLayout, Room, Connection } from '@/lib/game/types-v2';

export const TILE_SIZE = 16;      // pixels per tile
export const ROOM_WIDTH = 12;     // tiles per room (horizontal)
export const ROOM_HEIGHT = 10;    // tiles per room (vertical)
export const WALL_THICKNESS = 1;  // tiles for walls between rooms
export const DOORWAY_WIDTH = 2;   // tiles wide for doorway openings

export type TileType = 'floor' | 'wall' | 'doorway' | 'void';

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

/** Build a tile map from the AI-generated office layout */
export function buildTileMap(layout: OfficeLayout): TileMap {
  const { rooms, connections, gridCols, gridRows } = layout;

  // Total grid size in tiles, including walls between rooms
  const totalW = gridCols * ROOM_WIDTH + (gridCols + 1) * WALL_THICKNESS;
  const totalH = gridRows * ROOM_HEIGHT + (gridRows + 1) * WALL_THICKNESS;

  // Initialize all tiles as void
  const tiles: Tile[][] = Array.from({ length: totalH }, () =>
    Array.from({ length: totalW }, () => ({
      type: 'void' as TileType,
      roomId: null,
      color: '#0f0f23',
    }))
  );

  // Room bounds lookup
  const roomBounds = new Map<string, { x: number; y: number; w: number; h: number }>();

  // Place rooms
  for (const room of rooms) {
    const startX = WALL_THICKNESS + room.position.col * (ROOM_WIDTH + WALL_THICKNESS);
    const startY = WALL_THICKNESS + room.position.row * (ROOM_HEIGHT + WALL_THICKNESS);

    roomBounds.set(room.id, { x: startX, y: startY, w: ROOM_WIDTH, h: ROOM_HEIGHT });

    // Fill room tiles with floor
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

  // Place walls around rooms (tiles between rooms that aren't void)
  for (let row = 0; row < totalH; row++) {
    for (let col = 0; col < totalW; col++) {
      if (tiles[row][col].type === 'void') {
        // Check if adjacent to any floor tile
        const neighbors = [
          row > 0 ? tiles[row - 1][col] : null,
          row < totalH - 1 ? tiles[row + 1][col] : null,
          col > 0 ? tiles[row][col - 1] : null,
          col < totalW - 1 ? tiles[row][col + 1] : null,
        ];
        const hasFloorNeighbor = neighbors.some(n => n?.type === 'floor');
        if (hasFloorNeighbor) {
          tiles[row][col] = { type: 'wall', roomId: null, color: '#2c2c54' };
        }
      }
    }
  }

  // Carve doorways for connections
  for (const conn of connections) {
    const boundsA = roomBounds.get(conn.from);
    const boundsB = roomBounds.get(conn.to);
    if (!boundsA || !boundsB) continue;

    carveDoorway(tiles, boundsA, boundsB, conn);
  }

  return { width: totalW, height: totalH, tiles, rooms: roomBounds };
}

/** Carve a doorway between two adjacent rooms */
function carveDoorway(
  tiles: Tile[][],
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  conn: Connection
): void {
  // Determine if rooms are horizontally or vertically adjacent
  const isHorizontal = a.y === b.y; // same row
  const isVertical = a.x === b.x;   // same column

  if (isHorizontal) {
    // Doorway in the wall between left and right rooms
    const leftRoom = a.x < b.x ? a : b;
    const rightRoom = a.x < b.x ? b : a;
    const wallCol = leftRoom.x + leftRoom.w; // the wall column
    const doorY = leftRoom.y + Math.floor(leftRoom.h / 2) - Math.floor(DOORWAY_WIDTH / 2);

    for (let i = 0; i < DOORWAY_WIDTH; i++) {
      const row = doorY + i;
      // The wall might be multiple tiles thick
      for (let col = wallCol; col < rightRoom.x; col++) {
        if (row >= 0 && row < tiles.length && col >= 0 && col < tiles[0].length) {
          tiles[row][col] = {
            type: 'doorway',
            roomId: null,
            color: '#1a1a2e', // darker floor for doorways
          };
        }
      }
    }
  } else if (isVertical) {
    // Doorway in the wall between top and bottom rooms
    const topRoom = a.y < b.y ? a : b;
    const bottomRoom = a.y < b.y ? b : a;
    const wallRow = topRoom.y + topRoom.h;
    const doorX = topRoom.x + Math.floor(topRoom.w / 2) - Math.floor(DOORWAY_WIDTH / 2);

    for (let i = 0; i < DOORWAY_WIDTH; i++) {
      const col = doorX + i;
      for (let row = wallRow; row < bottomRoom.y; row++) {
        if (row >= 0 && row < tiles.length && col >= 0 && col < tiles[0].length) {
          tiles[row][col] = {
            type: 'doorway',
            roomId: null,
            color: '#1a1a2e',
          };
        }
      }
    }
  }
  // If rooms are diagonal, skip doorway (AI should avoid this)
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
  const bounds = tileMap.rooms.get(roomId);
  if (!bounds) return null;
  return {
    x: (bounds.x + bounds.w / 2) * TILE_SIZE,
    y: (bounds.y + bounds.h / 2) * TILE_SIZE,
  };
}
