// components/game/PixelOffice.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { OfficeLayout, GameCharacter } from '@/lib/game/types-v2';
import { GameLoop } from '@/lib/engine/game-loop';
import {
  createCamera, updateCamera, focusOverview, focusRoom, followCharacter,
  screenToWorld, worldToScreen,
} from '@/lib/engine/camera';
import { renderScene } from '@/lib/engine/renderer';
import { TILE_SIZE, ROOM_WIDTH, ROOM_HEIGHT, getRoomCenter } from '@/lib/engine/tile-map';
import {
  createOfficeState, updateCharacters, getRoomAtPosition,
  addMike, moveCharacterToRoom,
} from '@/lib/engine/office-state';
import type { OfficeStateData } from '@/lib/engine/office-state';

interface PixelOfficeProps {
  layout: OfficeLayout;
  characters: GameCharacter[];
  activeRoomId: string | null;
  onRoomClick: (roomId: string) => void;
  tourMode?: boolean;
  tourTargetRoomId?: string;
}

/**
 * Canvas-based pixel art office renderer.
 * Draws the tile map, furniture, and animated characters.
 * Reports room clicks back to parent via onRoomClick.
 */
export default function PixelOffice({
  layout,
  characters,
  activeRoomId,
  onRoomClick,
  tourMode = false,
  tourTargetRoomId,
}: PixelOfficeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OfficeStateData | null>(null);
  const cameraRef = useRef(createCamera());
  const loopRef = useRef<GameLoop | null>(null);

  // Initialize office state once
  useEffect(() => {
    stateRef.current = createOfficeState(layout, characters);

    if (tourMode) {
      // Add Mike for the guided tour
      const firstRoom = layout.rooms[0];
      if (firstRoom) addMike(stateRef.current, firstRoom.id);
    }
  }, [layout, characters, tourMode]);

  // Camera mode based on activeRoomId
  useEffect(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;

    const camera = cameraRef.current;
    const { width, height } = canvas.getBoundingClientRect();

    if (activeRoomId) {
      // Zoom into the selected room
      const center = getRoomCenter(state.tileMap, activeRoomId);
      if (center) {
        focusRoom(
          camera,
          center.x, center.y,
          ROOM_WIDTH * TILE_SIZE, ROOM_HEIGHT * TILE_SIZE,
          width, height
        );
      }
    } else {
      // Show full office
      focusOverview(
        camera,
        state.tileMap.width * TILE_SIZE,
        state.tileMap.height * TILE_SIZE,
        width, height
      );
    }
  }, [activeRoomId]);

  // Move Mike during tour
  useEffect(() => {
    if (tourMode && tourTargetRoomId && stateRef.current?.mikeCharacter) {
      moveCharacterToRoom(stateRef.current, 'mike', tourTargetRoomId);

      // Camera follows Mike
      const center = getRoomCenter(stateRef.current.tileMap, tourTargetRoomId);
      if (center && canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        followCharacter(cameraRef.current, center.x, center.y, width, height);
      }
    }
  }, [tourMode, tourTargetRoomId]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.imageSmoothingEnabled = false; // pixel-perfect rendering
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = new GameLoop({
      update(dt) {
        const state = stateRef.current;
        if (!state) return;
        updateCharacters(state, dt);
        updateCamera(cameraRef.current, dt);
      },
      draw() {
        const state = stateRef.current;
        if (!state) return;

        const allChars = state.mikeCharacter
          ? [...state.characters, state.mikeCharacter]
          : state.characters;

        renderScene(
          ctx,
          state.tileMap,
          cameraRef.current,
          state.furniture,
          allChars,
          canvas.width,
          canvas.height
        );
      },
    });

    // The game loop calls update but we need to call draw from it too
    // Let's fix the loop to call both
    const animLoop = {
      update(dt: number) {
        const state = stateRef.current;
        if (!state) return;
        updateCharacters(state, dt);
        updateCamera(cameraRef.current, dt);

        // Draw after update
        const allChars = state.mikeCharacter
          ? [...state.characters, state.mikeCharacter]
          : state.characters;

        renderScene(
          ctx,
          state.tileMap,
          cameraRef.current,
          state.furniture,
          allChars,
          canvas.width,
          canvas.height
        );
      },
      draw() {}, // handled in update
    };

    const gameLoop = new GameLoop(animLoop);
    loopRef.current = gameLoop;
    gameLoop.start();

    return () => {
      gameLoop.stop();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Click handler — detect which room was clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = (e.clientX - rect.left) * window.devicePixelRatio;
    const screenY = (e.clientY - rect.top) * window.devicePixelRatio;

    const { worldX, worldY } = screenToWorld(
      cameraRef.current,
      screenX, screenY,
      canvas.width, canvas.height
    );

    const roomId = getRoomAtPosition(state, worldX, worldY);
    if (roomId) {
      onRoomClick(roomId);
    }
  }, [onRoomClick]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
  );
}
