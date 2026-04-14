// components/game/GameShellV2.tsx
'use client';

import { useState, useCallback } from 'react';
import type { GameContentV2, GameStateV2 } from '@/lib/game/types-v2';
import { createInitialStateV2 } from '@/lib/game/xp';
import PixelOffice from './PixelOffice';
import RoomContext from './RoomContext';
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
  const activeRoomId = gameState.activeRoomId;
  const activeContent = activeRoomId ? content.roomContent[activeRoomId] : null;
  const activeRoom = activeRoomId ? content.office.rooms.find(r => r.id === activeRoomId) : null;
  const activeChar = activeRoomId ? content.characters.find(c => c.roomId === activeRoomId) : null;

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
      <XPBar xp={gameState.xp} glitchTokens={gameState.glitchTokens} />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* === LEFT PANEL === */}
        {showingTour ? (
          // Tour mode: full-width pixel office with overlay
          <div className="relative" style={{ width: '100%' }}>
            <PixelOffice
              layout={content.office}
              characters={content.characters}
              activeRoomId={null}
              onRoomClick={() => {}}
              tourMode={true}
              tourTargetRoomId={tourTargetRoomId ?? undefined}
            />
            <MikeTour
              tour={content.mike}
              characters={content.characters}
              onStepChange={setTourTargetRoomId}
              onComplete={completeTour}
            />
          </div>
        ) : activeContent && activeRoom && activeChar ? (
          // Inside a room: context panel (files, connections, glossary)
          <div style={{
            width: '25%',
            minWidth: '220px',
            maxWidth: '300px',
            borderRight: '2px solid var(--border-pixel)',
          }}>
            <RoomContext
              room={activeRoom}
              character={activeChar}
              content={activeContent}
              layout={content.office}
              characters={content.characters}
              onRoomClick={selectRoom}
              onBack={deselectRoom}
            />
          </div>
        ) : (
          // Office overview: pixel art canvas
          <div className="relative" style={{ width: '45%' }}>
            <PixelOffice
              layout={content.office}
              characters={content.characters}
              activeRoomId={null}
              onRoomClick={selectRoom}
            />
          </div>
        )}

        {/* === RIGHT PANEL === */}
        {!showingTour && (
          <div className="overflow-y-auto flex-1" style={{ background: 'var(--bg-panel)' }}>
            {activeContent ? (
              <RoomHub
                content={activeContent}
                characters={content.characters}
                gameState={gameState}
                onXP={addXP}
                onBack={deselectRoom}
              />
            ) : (
              <OfficeOverview
                layout={content.office}
                characters={content.characters}
                gameState={gameState}
                onRoomClick={selectRoom}
                meta={content.meta}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
