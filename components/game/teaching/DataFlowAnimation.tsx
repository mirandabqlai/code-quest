// components/game/teaching/DataFlowAnimation.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DataFlowStep, GameCharacter } from '@/lib/game/types-v2';

interface DataFlowAnimationProps {
  steps: DataFlowStep[];
  characters: GameCharacter[];
}

/**
 * Animated diagram showing a request traveling room to room.
 * Click "Start" to watch the packet move step by step.
 */
export default function DataFlowAnimation({ steps, characters }: DataFlowAnimationProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const getCharacter = (id: string) =>
    id === 'mike'
      ? { name: 'Mike', color: '#00ff41', id: 'mike' }
      : characters.find(c => c.id === id);

  const play = useCallback(() => {
    setActiveStep(-1);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = setTimeout(() => {
      setActiveStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [activeStep, playing, steps.length]);

  return (
    <div>
      <div
        className="flex items-center gap-1 flex-wrap justify-center"
        style={{ padding: '12px 0' }}
      >
        {steps.map((step, i) => {
          const char = getCharacter(step.characterId);
          const isActive = i === activeStep;
          const isPast = i < activeStep;

          return (
            <div key={i} className="flex items-center gap-1">
              {/* Node */}
              <div
                style={{
                  padding: '8px 12px',
                  border: `2px solid ${char?.color ?? '#7a7a8e'}`,
                  borderRadius: '3px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  textAlign: 'center',
                  background: isActive ? `${char?.color}22` : 'var(--bg-dark)',
                  color: char?.color ?? '#7a7a8e',
                  boxShadow: isActive ? `0 0 12px ${char?.color}44` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s',
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                {char?.name ?? step.characterId}
                {isActive && (
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      marginTop: '4px',
                      maxWidth: '120px',
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>

              {/* Arrow */}
              {i < steps.length - 1 && (
                <span
                  style={{
                    fontSize: '16px',
                    color: isPast || isActive ? 'var(--neon-green)' : 'var(--text-dim)',
                    opacity: isPast || isActive ? 1 : 0.3,
                    transition: 'all 0.3s',
                  }}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center" style={{ marginTop: '8px' }}>
        <button
          onClick={play}
          disabled={playing}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            padding: '8px 20px',
            background: 'var(--bg-dark)',
            color: playing ? 'var(--text-dim)' : 'var(--neon-green)',
            border: `2px solid ${playing ? 'var(--border-pixel)' : 'var(--neon-green)'}`,
            cursor: playing ? 'default' : 'pointer',
            borderRadius: '2px',
          }}
        >
          {playing ? '● PLAYING...' : '▶ START'}
        </button>
      </div>
    </div>
  );
}
