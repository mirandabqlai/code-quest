// components/game/MikeTour.tsx
'use client';

import { useState } from 'react';
import type { MikeTour as MikeTourType, GameCharacter } from '@/lib/game/types-v2';
import GroupChat from '@/components/game/teaching/GroupChat';
import DataFlowAnimation from '@/components/game/teaching/DataFlowAnimation';
import PixelButton from '@/components/game/ui/PixelButton';

interface MikeTourProps {
  tour: MikeTourType;
  characters: GameCharacter[];
  onStepChange: (roomId: string | null) => void;
  onComplete: () => void;
}

type TourPhase = 'welcome' | 'rooms' | 'trace' | 'chat' | 'flow' | 'done';

/**
 * Mike's guided tour overlay.
 * Shows dialogue at the bottom of the screen while the PixelOffice
 * animates Mike walking between rooms.
 */
export default function MikeTour({ tour, characters, onStepChange, onComplete }: MikeTourProps) {
  const [phase, setPhase] = useState<TourPhase>('welcome');
  const [stepIndex, setStepIndex] = useState(0);

  // Welcome phase
  if (phase === 'welcome') {
    const msg = tour.welcomeDialogue[stepIndex];
    const isLast = stepIndex >= tour.welcomeDialogue.length - 1;

    return (
      <TourOverlay>
        <MikeDialogue text={msg ?? ''} />
        <PixelButton
          onClick={() => {
            if (isLast) {
              setPhase('rooms');
              setStepIndex(0);
              // Move to first room
              if (tour.roomIntros[0]) {
                onStepChange(tour.roomIntros[0].roomId);
              }
            } else {
              setStepIndex(i => i + 1);
            }
          }}
        >
          {isLast ? "LET'S GO! →" : 'CONTINUE →'}
        </PixelButton>
      </TourOverlay>
    );
  }

  // Room introductions
  if (phase === 'rooms') {
    const intro = tour.roomIntros[stepIndex];
    const isLast = stepIndex >= tour.roomIntros.length - 1;

    if (!intro) {
      setPhase('trace');
      setStepIndex(0);
      return null;
    }

    return (
      <TourOverlay>
        <MikeDialogue text={intro.intro} />
        <ProgressDots current={stepIndex} total={tour.roomIntros.length} />
        <PixelButton
          onClick={() => {
            if (isLast) {
              setPhase('trace');
              setStepIndex(0);
            } else {
              setStepIndex(i => i + 1);
              const next = tour.roomIntros[stepIndex + 1];
              if (next) onStepChange(next.roomId);
            }
          }}
        >
          {isLast ? 'NOW WATCH THIS →' : 'NEXT ROOM →'}
        </PixelButton>
      </TourOverlay>
    );
  }

  // Traced action — show group chat
  if (phase === 'trace' || phase === 'chat') {
    return (
      <TourOverlay>
        <MikeDialogue text={tour.tracedAction.title} />
        <GroupChat
          messages={tour.tracedAction.groupChat}
          characters={characters}
          autoPlay={true}
        />
        <PixelButton onClick={() => setPhase('flow')}>
          SEE THE FLOW →
        </PixelButton>
      </TourOverlay>
    );
  }

  // Data flow animation
  if (phase === 'flow') {
    return (
      <TourOverlay>
        <DataFlowAnimation steps={tour.tracedAction.dataFlow} characters={characters} />
        <PixelButton onClick={() => setPhase('done')}>
          GOT IT! →
        </PixelButton>
      </TourOverlay>
    );
  }

  // Done
  return (
    <TourOverlay>
      <MikeDialogue text="You're ready to explore on your own! Click any room to go deeper." />
      <PixelButton onClick={onComplete}>
        START EXPLORING ✓
      </PixelButton>
    </TourOverlay>
  );
}

// ===== Sub-components =====

function TourOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(15,15,35,0.95) 30%)',
        padding: '40px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

function MikeDialogue({ text }: { text: string }) {
  return (
    <div
      style={{
        maxWidth: '600px',
        width: '100%',
        background: 'var(--bg-dark)',
        border: '2px solid var(--neon-green)',
        borderRadius: '4px',
        padding: '14px 18px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '2px solid var(--neon-green)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--neon-green)',
          background: 'var(--bg-panel)',
          flexShrink: 0,
        }}
      >
        MIKE
      </div>
      <div style={{ fontSize: '14px', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}>
        {text}
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: i <= current ? 'var(--neon-green)' : 'var(--border-pixel)',
          }}
        />
      ))}
    </div>
  );
}
