// lib/engine/sprites/sprite-data.ts
//
// SpriteData is a 2D array of hex color strings.
// '' = transparent pixel, '#RRGGBB' = opaque pixel.
// This matches the pixel-agents format.

import type { SpriteData, SpriteFrame } from '@/lib/game/types-v2';

/** Create a SpriteFrame from raw pixel data */
export function createFrame(data: SpriteData): SpriteFrame {
  return {
    data,
    width: data[0]?.length ?? 0,
    height: data.length,
  };
}

/** Flip a sprite horizontally (for left-facing variants) */
export function flipHorizontal(frame: SpriteFrame): SpriteFrame {
  const flipped: SpriteData = frame.data.map(row => [...row].reverse());
  return { data: flipped, width: frame.width, height: frame.height };
}

/** Recolor a sprite — replace all instances of one color with another */
export function recolorSprite(frame: SpriteFrame, colorMap: Record<string, string>): SpriteFrame {
  const recolored: SpriteData = frame.data.map(row =>
    row.map(pixel => colorMap[pixel] ?? pixel)
  );
  return { data: recolored, width: frame.width, height: frame.height };
}

/**
 * Palette-swap a sprite by shifting hue.
 * Takes a base sprite with placeholder clothing color and replaces it
 * with the character's assigned color.
 */
export function paletteSwap(
  frame: SpriteFrame,
  baseClothingColor: string,
  targetColor: string
): SpriteFrame {
  // Convert the base clothing color and any shades of it
  const baseR = parseInt(baseClothingColor.slice(1, 3), 16);
  const baseG = parseInt(baseClothingColor.slice(3, 5), 16);
  const baseB = parseInt(baseClothingColor.slice(5, 7), 16);

  const targetR = parseInt(targetColor.slice(1, 3), 16);
  const targetG = parseInt(targetColor.slice(3, 5), 16);
  const targetB = parseInt(targetColor.slice(5, 7), 16);

  const recolored: SpriteData = frame.data.map(row =>
    row.map(pixel => {
      if (pixel === '' || pixel === baseClothingColor) {
        return pixel === '' ? '' : targetColor;
      }
      // Check if it's a shade of the base color (darker/lighter variant)
      const pr = parseInt(pixel.slice(1, 3), 16);
      const pg = parseInt(pixel.slice(3, 5), 16);
      const pb = parseInt(pixel.slice(5, 7), 16);

      // If the ratio between channels matches the base, it's a shade
      const diffR = pr - baseR;
      const diffG = pg - baseG;
      const diffB = pb - baseB;

      if (Math.abs(diffR - diffG) < 20 && Math.abs(diffG - diffB) < 20) {
        // It's a shade — apply same offset to target
        const nr = Math.max(0, Math.min(255, targetR + diffR));
        const ng = Math.max(0, Math.min(255, targetG + diffG));
        const nb = Math.max(0, Math.min(255, targetB + diffB));
        return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
      }

      return pixel;
    })
  );

  return { data: recolored, width: frame.width, height: frame.height };
}

// Canvas cache for rendered sprites (avoids re-drawing pixel-by-pixel each frame)
const spriteCanvasCache = new Map<string, HTMLCanvasElement>();

/** Render a sprite to an offscreen canvas and cache it */
export function getSpriteCanvas(frame: SpriteFrame, scale: number, cacheKey: string): HTMLCanvasElement {
  const key = `${cacheKey}_${scale}`;
  const cached = spriteCanvasCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = frame.width * scale;
  canvas.height = frame.height * scale;
  const ctx = canvas.getContext('2d')!;

  for (let row = 0; row < frame.height && row < frame.data.length; row++) {
    for (let col = 0; col < frame.width && col < frame.data[row].length; col++) {
      const color = frame.data[row][col];
      if (color === '') continue;
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
  }

  spriteCanvasCache.set(key, canvas);
  return canvas;
}

/** Clear the sprite canvas cache (call on cleanup) */
export function clearSpriteCache(): void {
  spriteCanvasCache.clear();
}
