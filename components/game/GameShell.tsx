'use client';

import { useState, useCallback } from 'react';
import type { GameContent } from '@/lib/game/types';
import { createInitialState, getLevel, type GameState } from '@/lib/game/xp';
import { SoundProvider, MuteButton } from '@/components/game/ui/SoundManager';
import XPBar from '@/components/game/ui/XPBar';
import OfficeScene from './OfficeScene';
import InteractionPanel from './InteractionPanel';

interface GameShellProps {
  content: Partial<GameContent>;
}

export default function GameShell({ content }: GameShellProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [activeMode, setActiveMode] = useState('tour');
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');

  const characters = content.characters ?? [];
  const folderTree = content.folderTree ?? [];

  const handleXP = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const handleComplete = useCallback((mode: string, id: string) => {
    setGameState(prev => {
      const next = { ...prev };
      switch (mode) {
        case 'tour': next.completedTours = new Set([...prev.completedTours, id]); break;
        case 'mailroom': next.completedMail = new Set([...prev.completedMail, id]); break;
        case 'bughunt': next.completedBugs = new Set([...prev.completedBugs, id]); break;
        case 'build': next.completedBuild = true; break;
        case 'boss': next.completedBoss = new Set([...prev.completedBoss, id]); break;
      }
      return next;
    });
  }, []);

  const handleCharacterClick = useCallback((charId: string) => {
    setActiveCharId(charId);
    setActiveMode('tour');
  }, []);

  return (
    <SoundProvider>
      <div className="flex flex-col h-screen">
        <XPBar xp={gameState.xp} glitchTokens={gameState.glitchTokens} />
        <MuteButton />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Office Scene (~45%) */}
          <div className="w-[45%] min-w-[280px]">
            <OfficeScene
              characters={characters}
              folderTree={folderTree}
              activeCharId={activeCharId}
              chatText={chatText}
              onCharacterClick={handleCharacterClick}
            />
          </div>

          {/* Right: Interaction Panel (~55%) */}
          <div className="flex-1">
            <InteractionPanel
              content={content}
              gameState={gameState}
              activeMode={activeMode}
              activeCharId={activeCharId}
              onModeChange={setActiveMode}
              onXP={handleXP}
              onComplete={handleComplete}
              onChatText={setChatText}
            />
          </div>
        </div>
      </div>
    </SoundProvider>
  );
}
