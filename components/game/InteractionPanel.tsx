'use client';

import { useCallback } from 'react';
import { isUnlocked, type GameState } from '@/lib/game/xp';
import type { GameContent } from '@/lib/game/types';
import OfficeTour from '@/components/game/modes/OfficeTour';
import CodebaseMap from '@/components/game/modes/CodebaseMap';
import MailRoom from '@/components/game/modes/MailRoom';
import BugHunt from '@/components/game/modes/BugHunt';
import BuildOffice from '@/components/game/modes/BuildOffice';
import BossBattle from '@/components/game/modes/BossBattle';

interface InteractionPanelProps {
  content: Partial<GameContent>;
  gameState: GameState;
  activeMode: string;
  activeCharId: string | null;
  onModeChange: (mode: string) => void;
  onXP: (amount: number) => void;
  onComplete: (mode: string, id: string) => void;
  onChatText: (text: string) => void;
}

const MODES = [
  { id: 'tour', label: 'Tour' },
  { id: 'codemap', label: 'Map' },
  { id: 'mailroom', label: 'Mail Room' },
  { id: 'bughunt', label: 'Bug Hunt' },
  { id: 'build', label: 'Build' },
  { id: 'boss', label: 'Boss' },
];

export default function InteractionPanel({
  content, gameState, activeMode, activeCharId, onModeChange, onXP, onComplete, onChatText,
}: InteractionPanelProps) {
  const characters = content.characters ?? [];

  // Wrap onComplete so each mode only needs to pass its own ID,
  // while GameShell receives both the mode name and the completed item ID
  const makeModeComplete = useCallback(
    (mode: string) => (id: string) => onComplete(mode, id),
    [onComplete]
  );

  // Render the active mode's component with its content slice
  const renderMode = () => {
    switch (activeMode) {
      // ===== OFFICE TOUR =====
      case 'tour': {
        if (!activeCharId) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Click a character in the office to start their tour.
            </div>
          );
        }
        // Find the tour data for the selected character
        const tourData = content.officeTour?.find(t => t.characterId === activeCharId);
        const character = characters.find(c => c.id === activeCharId);
        if (!tourData || !character) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              No tour available for this character yet.
            </div>
          );
        }
        return (
          <OfficeTour
            key={activeCharId}
            tour={tourData}
            character={character}
            onXP={onXP}
            onComplete={makeModeComplete('tour')}
            onChatText={onChatText}
          />
        );
      }

      // ===== CODEBASE MAP =====
      case 'codemap': {
        const folderTree = content.folderTree ?? [];
        const dataFlows = content.dataFlows ?? [];
        if (folderTree.length === 0) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Codebase map is loading...
            </div>
          );
        }
        return (
          <CodebaseMap
            folderTree={folderTree}
            dataFlows={dataFlows}
            characters={characters}
            onChatText={onChatText}
          />
        );
      }

      // ===== MAIL ROOM =====
      case 'mailroom': {
        if (!content.mailRoom || content.mailRoom.length === 0) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Mail Room scenarios are being generated...
            </div>
          );
        }
        return (
          <MailRoom
            scenarios={content.mailRoom}
            characters={characters}
            onXP={onXP}
            onComplete={makeModeComplete('mailroom')}
            onChatText={onChatText}
          />
        );
      }

      // ===== BUG HUNT =====
      case 'bughunt': {
        if (!content.bugHunt || content.bugHunt.length === 0) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Bug Hunt rounds are being generated...
            </div>
          );
        }
        return (
          <BugHunt
            rounds={content.bugHunt}
            characters={characters}
            onXP={onXP}
            onComplete={makeModeComplete('bughunt')}
            onChatText={onChatText}
          />
        );
      }

      // ===== BUILD THE OFFICE =====
      case 'build': {
        if (!content.buildOffice) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Build the Office puzzle is being generated...
            </div>
          );
        }
        return (
          <BuildOffice
            puzzle={content.buildOffice}
            characters={characters}
            onXP={onXP}
            onComplete={() => onComplete('build', 'build')}
            onChatText={onChatText}
          />
        );
      }

      // ===== BOSS BATTLE =====
      case 'boss': {
        if (!content.bossBattle || content.bossBattle.length === 0) {
          return (
            <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Boss Battle is being generated...
            </div>
          );
        }
        return (
          <BossBattle
            battles={content.bossBattle}
            characters={characters}
            onXP={onXP}
            onComplete={makeModeComplete('boss')}
            onChatText={onChatText}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mode tabs */}
      <div className="flex gap-1 p-2 border-b-2 border-[var(--border-pixel)] flex-wrap">
        {MODES.map(mode => {
          const unlocked = isUnlocked(mode.id, gameState);
          const available = mode.id === 'tour' || mode.id === 'codemap'
            || (mode.id === 'mailroom' && content.mailRoom)
            || (mode.id === 'bughunt' && content.bugHunt)
            || (mode.id === 'build' && content.buildOffice)
            || (mode.id === 'boss' && content.bossBattle);

          return (
            <button
              key={mode.id}
              onClick={() => unlocked && available && onModeChange(mode.id)}
              className="px-3 py-1.5 border-2 uppercase"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                letterSpacing: '1px',
                borderColor: activeMode === mode.id ? 'var(--neon-gold)' : !unlocked ? 'var(--border-pixel)' : 'var(--border-bright)',
                color: activeMode === mode.id ? 'var(--neon-gold)' : !unlocked ? 'var(--text-dim)' : 'var(--text-primary)',
                background: activeMode === mode.id ? 'rgba(255,217,61,0.1)' : 'var(--bg-panel)',
                opacity: unlocked && available ? 1 : 0.4,
                cursor: unlocked && available ? 'pointer' : 'not-allowed',
              }}
            >
              {!unlocked && '\u{1F512} '}{mode.label}
              {!available && unlocked && ' ...'}
            </button>
          );
        })}
      </div>

      {/* Mode content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderMode()}
      </div>
    </div>
  );
}
