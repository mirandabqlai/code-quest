'use client';

import { isUnlocked, type GameState } from '@/lib/game/xp';
import type { GameContent } from '@/lib/game/types';

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
        <div className="text-center text-[var(--text-dim)] mt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          {activeMode === 'tour' && !activeCharId && 'Click a character in the office to start their tour.'}
          {activeMode === 'codemap' && 'Explore the project structure and see who owns what.'}
          {activeMode === 'mailroom' && 'Drag characters into the correct order for each data flow.'}
          {activeMode === 'bughunt' && 'Find the bug! Compare the original code to the clone.'}
          {activeMode === 'build' && 'Drag each team member to their department.'}
          {activeMode === 'boss' && 'The Product Manager has a feature request. Plan it.'}
        </div>
        {/* Individual mode components will be rendered here in subsequent steps */}
      </div>
    </div>
  );
}
