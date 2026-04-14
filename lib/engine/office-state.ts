// lib/engine/office-state.ts
//
// Central state manager for the pixel office. Holds the tile map,
// furniture positions, and character states. Updated every frame.

import type {
  OfficeLayout, GameCharacter, EngineCharacter,
  FurnitureItem, AnimationState, Direction,
} from '@/lib/game/types-v2';
import type { TileMap } from './tile-map';
import { buildTileMap, getRoomCenter, TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT } from './tile-map';
import { getFurnitureForRoom } from './sprites/furniture-sprites';
import { buildCharacterSpriteSet } from './sprites/character-sprites';

export interface OfficeStateData {
  tileMap: TileMap;
  furniture: FurnitureItem[];
  characters: EngineCharacter[];
  mikeCharacter: EngineCharacter | null;
}

/** Build the initial office state from AI-generated layout + characters */
export function createOfficeState(
  layout: OfficeLayout,
  characters: GameCharacter[]
): OfficeStateData {
  const tileMap = buildTileMap(layout);
  const furniture: FurnitureItem[] = [];
  const engineChars: EngineCharacter[] = [];

  // Place Mike's desk in the manager strip at the top
  const mikeCenter = getRoomCenter(tileMap, 'mike');
  if (mikeCenter) {
    const mikeTileX = Math.floor(mikeCenter.x / TILE_SIZE) - 2;
    const mikeTileY = 0;
    const mikeDeskFurniture = getFurnitureForRoom('reception', mikeTileX, mikeTileY);
    furniture.push(...mikeDeskFurniture);
  }

  for (const room of layout.rooms) {
    const bounds = tileMap.rooms.get(room.id);
    if (!bounds) continue;

    // Add furniture for this room type
    const roomFurniture = getFurnitureForRoom(room.type, bounds.x, bounds.y);
    furniture.push(...roomFurniture);

    // Place the character at their desk (center-ish of room)
    const character = characters.find(c => c.roomId === room.id);
    if (character) {
      const centerX = (bounds.x + Math.floor(bounds.w / 2)) * TILE_SIZE;
      const centerY = (bounds.y + Math.floor(bounds.h / 2) + 1) * TILE_SIZE;

      engineChars.push({
        id: character.id,
        x: centerX,
        y: centerY,
        targetX: centerX,
        targetY: centerY,
        direction: 'down',
        state: 'sit',
        frame: 0,
        spriteSet: buildCharacterSpriteSet(character.color),
        color: character.color,
        speed: 60, // pixels per second
      });
    }
  }

  return { tileMap, furniture, characters: engineChars, mikeCharacter: null };
}

/** Update all character animations. Called every frame. */
export function updateCharacters(state: OfficeStateData, dt: number): void {
  for (const char of state.characters) {
    // Advance animation frame
    char.frame += dt * 4; // 4 frames per second for animations

    // Move toward target
    if (char.state === 'walk') {
      const dx = char.targetX - char.x;
      const dy = char.targetY - char.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        // Arrived
        char.x = char.targetX;
        char.y = char.targetY;
        char.state = 'idle';
      } else {
        const step = char.speed * dt;
        char.x += (dx / dist) * step;
        char.y += (dy / dist) * step;
        // Face direction of movement
        if (Math.abs(dx) > Math.abs(dy)) {
          char.direction = dx > 0 ? 'right' : 'left';
        } else {
          char.direction = dy > 0 ? 'down' : 'up';
        }
      }
    }
  }

  // Update Mike if present
  if (state.mikeCharacter) {
    const mike = state.mikeCharacter;
    mike.frame += dt * 4;
    if (mike.state === 'walk') {
      const dx = mike.targetX - mike.x;
      const dy = mike.targetY - mike.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        mike.x = mike.targetX;
        mike.y = mike.targetY;
        mike.state = 'talk';
      } else {
        const step = mike.speed * dt;
        mike.x += (dx / dist) * step;
        mike.y += (dy / dist) * step;
        mike.direction = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      }
    }
  }
}

/** Set a character to walk to a room */
export function moveCharacterToRoom(
  state: OfficeStateData,
  characterId: string,
  roomId: string
): void {
  const char = state.characters.find(c => c.id === characterId)
    ?? (state.mikeCharacter?.id === characterId ? state.mikeCharacter : null);
  if (!char) return;

  const center = getRoomCenter(state.tileMap, roomId);
  if (!center) return;

  char.targetX = center.x;
  char.targetY = center.y;
  char.state = 'walk';
}

/** Set a character's animation state directly */
export function setCharacterState(
  state: OfficeStateData,
  characterId: string,
  animState: AnimationState
): void {
  const char = state.characters.find(c => c.id === characterId)
    ?? (state.mikeCharacter?.id === characterId ? state.mikeCharacter : null);
  if (char) {
    char.state = animState;
    char.frame = 0;
  }
}

/** Add Mike to the office (for the guided tour) */
export function addMike(state: OfficeStateData, startRoomId: string): void {
  const center = getRoomCenter(state.tileMap, startRoomId);
  if (!center) return;

  state.mikeCharacter = {
    id: 'mike',
    x: center.x,
    y: center.y - 20,
    targetX: center.x,
    targetY: center.y - 20,
    direction: 'down',
    state: 'talk',
    frame: 0,
    spriteSet: buildCharacterSpriteSet('#00ff41'), // Mike is neon green
    color: '#00ff41',
    speed: 50,
  };
}

/** Get which room a screen click hit (returns room ID or null) */
export function getRoomAtPosition(
  state: OfficeStateData,
  worldX: number,
  worldY: number
): string | null {
  const col = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor(worldY / TILE_SIZE);

  if (row < 0 || row >= state.tileMap.height || col < 0 || col >= state.tileMap.width) {
    return null;
  }

  return state.tileMap.tiles[row][col].roomId;
}
