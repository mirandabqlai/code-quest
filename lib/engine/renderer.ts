// lib/engine/renderer.ts
//
// Draws the entire office scene to a Canvas 2D context.
// Uses Z-sorting: all drawable objects are collected, sorted by Y, drawn back-to-front.

import type { SpriteFrame, FurnitureItem, EngineCharacter } from '@/lib/game/types-v2';
import type { TileMap, TileType } from './tile-map';
import type { Camera } from './camera';
import { TILE_SIZE } from './tile-map';
import { worldToScreen } from './camera';

export interface Drawable {
  y: number;     // world Y for sorting
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/** Draw the full office scene */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  tileMap: TileMap,
  camera: Camera,
  furniture: FurnitureItem[],
  characters: EngineCharacter[],
  canvasWidth: number,
  canvasHeight: number
): void {
  // Clear
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();

  // Apply camera transform
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // 1. Draw tiles (floor, walls)
  drawTiles(ctx, tileMap, camera, canvasWidth, canvasHeight);

  // 2. Collect drawables and Z-sort
  const drawables: Drawable[] = [];

  for (const item of furniture) {
    const worldY = item.y * TILE_SIZE + item.sprite.height;
    drawables.push({
      y: worldY,
      draw: (c) => drawSprite(c, item.sprite, item.x * TILE_SIZE, item.y * TILE_SIZE),
    });
  }

  for (const char of characters) {
    drawables.push({
      y: char.y + 16, // sort by feet position
      draw: (c) => drawCharacter(c, char),
    });
  }

  // Sort by Y (back to front)
  drawables.sort((a, b) => a.y - b.y);

  // Draw all
  for (const d of drawables) {
    d.draw(ctx);
  }

  ctx.restore();

  // 3. Draw scanlines overlay (screen-space, after camera transform)
  drawScanlines(ctx, canvasWidth, canvasHeight);
}

/** Draw floor and wall tiles */
function drawTiles(
  ctx: CanvasRenderingContext2D,
  tileMap: TileMap,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Only draw tiles visible on screen (culling for performance)
  const margin = TILE_SIZE * 2;
  const halfW = (canvasWidth / 2) / camera.zoom + margin;
  const halfH = (canvasHeight / 2) / camera.zoom + margin;

  const startCol = Math.max(0, Math.floor((camera.x - halfW) / TILE_SIZE));
  const endCol = Math.min(tileMap.width, Math.ceil((camera.x + halfW) / TILE_SIZE));
  const startRow = Math.max(0, Math.floor((camera.y - halfH) / TILE_SIZE));
  const endRow = Math.min(tileMap.height, Math.ceil((camera.y + halfH) / TILE_SIZE));

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const tile = tileMap.tiles[row][col];
      if (tile.type === 'void') continue;

      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile.type === 'wall') {
        ctx.fillStyle = '#2c2c54';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Wall top highlight
        ctx.fillStyle = '#3a3a5c';
        ctx.fillRect(x, y, TILE_SIZE, 2);
      } else {
        // Floor — checkered pattern
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? tile.color : darken(tile.color, 15);
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

/** Draw a sprite (furniture or static element) */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteFrame,
  x: number,
  y: number
): void {
  const { data, width, height } = sprite;
  for (let row = 0; row < height && row < data.length; row++) {
    for (let col = 0; col < width && col < data[row].length; col++) {
      const color = data[row][col];
      if (color === '') continue; // transparent
      ctx.fillStyle = color;
      ctx.fillRect(x + col, y + row, 1, 1);
    }
  }
}

/** Draw an animated character */
function drawCharacter(ctx: CanvasRenderingContext2D, char: EngineCharacter): void {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(char.x - 4, char.y + 12, 12, 3);

  // Get current animation frame.
  // CharacterSpriteSet doesn't have a 'talk' key (it maps to idle visually),
  // so we cast to a partial lookup and fall back to idle.down.
  const stateFrames = (char.spriteSet as unknown as Record<string, Record<string, SpriteFrame[]>>)[char.state];
  const dirFrames = stateFrames?.[char.direction] ?? char.spriteSet.idle.down;
  const frameIndex = Math.floor(char.frame) % dirFrames.length;
  const frame = dirFrames[frameIndex];

  if (frame) {
    drawSprite(ctx, frame, char.x - Math.floor(frame.width / 2), char.y - Math.floor(frame.height / 2));
  }
}

/** CRT scanline overlay */
function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

/** Darken a hex color by a percentage */
function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * percent / 100));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * percent / 100));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
