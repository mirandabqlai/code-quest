// components/game/GameShellV2.tsx
//
// Top-level game container for v2. Replaces GameShell for v2 game content.
// Manages game state (XP, active room, tour progress) and orchestrates
// the three main views: Mike's tour → office overview → room deep-dive.

'use client';

import { useState, useCallback } from 'react';
import type { GameContentV2, GameStateV2 } from '@/lib/game/types-v2';
import { createInitialStateV2, getLevelInfo } from '@/lib/game/xp';
import PixelOffice from './PixelOffice';
import RoomHub from './RoomHub';
import OfficeOverview from './OfficeOverview';
import MikeTour from './MikeTour';
import XPBar from './ui/XPBar';

interface GameShellV2Props {
  content: GameContentV2;
}

export default function GameShellV2({ content }: GameShellV2Props) {
  const [gameState, setGameState] = useState<GameStateV2>(createInitialStateV2);
  const [tourTargetRoomId, setTourTargetRoomId] = useState<string | null>(null);

  const addXP = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    setGameState(prev => ({ ...prev, activeRoomId: roomId, activeTab: 'story' as const }));
  }, []);

  const deselectRoom = useCallback(() => {
    setGameState(prev => ({ ...prev, activeRoomId: null, activeTab: null }));
  }, []);

  const completeTour = useCallback(() => {
    setGameState(prev => ({ ...prev, mikeTourComplete: true }));
  }, []);

  const showingTour = !gameState.mikeTourComplete;
  const activeContent = gameState.activeRoomId
    ? content.roomContent[gameState.activeRoomId]
    : null;

  // No auto-reload — if rooms are empty, OfficeOverview shows a "Check Again" button.

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        background: 'var(--bg-void)',
        color: 'var(--text-primary)',
      }}
    >
      {/* XP Bar — XPBar calls getLevelInfo internally, so we only pass xp + tokens */}
      <XPBar
        xp={gameState.xp}
        glitchTokens={gameState.glitchTokens}
      />

      {/* Main content: office on the left, interaction panel on the right */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Pixel art office canvas */}
        <div
          className="relative"
          style={{
            // During tour, office takes full width. Otherwise, it shrinks
            // to make room for the interaction panel on the right.
            width: showingTour ? '100%' : gameState.activeRoomId ? '40%' : '45%',
            transition: 'width 0.3s',
          }}
        >
          <PixelOffice
            layout={content.office}
            characters={content.characters}
            activeRoomId={gameState.activeRoomId}
            onRoomClick={gameState.mikeTourComplete ? selectRoom : () => {}}
            tourMode={showingTour}
            tourTargetRoomId={tourTargetRoomId ?? undefined}
          />

          {/* Mike's tour overlay — sits on top of the office canvas */}
          {showingTour && (
            <MikeTour
              tour={content.mike}
              characters={content.characters}
              onStepChange={setTourTargetRoomId}
              onComplete={completeTour}
            />
          )}
        </div>

        {/* Right: Interaction panel — hidden during Mike's tour */}
        {!showingTour && (
          <div
            className="overflow-y-auto"
            style={{
              width: gameState.activeRoomId ? '60%' : '55%',
              borderLeft: '2px solid var(--border-pixel)',
              background: 'var(--bg-panel)',
              transition: 'width 0.3s',
            }}
          >
            {activeContent ? (
              // Room deep-dive: Story, Code, Challenges tabs
              <RoomHub
                content={activeContent}
                characters={content.characters}
                gameState={gameState}
                onXP={addXP}
                onBack={deselectRoom}
              />
            ) : (
              // No room selected: show all rooms with mastery status
              <OfficeOverview
                layout={content.office}
                characters={content.characters}
                gameState={gameState}
                onRoomClick={selectRoom}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
