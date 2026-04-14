'use client';

import { useState, useCallback } from 'react';
import type { BugRound, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import PixelButton from '@/components/game/ui/PixelButton';

interface BugHuntProps {
  rounds: BugRound[];
  characters: GameCharacter[];
  onXP: (amount: number) => void;
  onComplete: (roundId: string) => void;
  onChatText: (text: string) => void;
}

export default function BugHunt({ rounds, characters, onXP, onComplete, onChatText }: BugHuntProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [bugFound, setBugFound] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState<Set<number>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintLines, setHintLines] = useState<Set<number>>(new Set());
  const { play } = useSounds();

  const round = rounds[currentRoundIndex];

  // Helper to find character by id
  const getChar = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const handleLineClick = useCallback((lineIndex: number) => {
    if (bugFound || lives <= 0) return;

    if (lineIndex === round.bugLine) {
      // Correct - found the bug!
      setBugFound(true);
      play('correct');
      const xp = 150 + (hintsUsed === 0 ? 50 : 0);
      onXP(xp);
      onComplete(round.id);

      // Show explanation via chat
      const explainer = getChar(round.explainerCharId);
      if (explainer) {
        onChatText(`${explainer.name}: ${round.explanation}`);
      }
    } else {
      // Wrong guess
      play('wrong');
      setWrongGuesses(prev => new Set([...prev, lineIndex]));
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          // Out of lives - reveal the bug
          setBugFound(true);
          onXP(50); // consolation XP
          const explainer = getChar(round.explainerCharId);
          if (explainer) {
            onChatText(`${explainer.name}: You ran out of lives! ${round.explanation}`);
          }
        }
        return newLives;
      });

      // Clear wrong highlight after a moment (using a timeout for shake effect)
      setTimeout(() => {
        setWrongGuesses(prev => {
          const next = new Set(prev);
          next.delete(lineIndex);
          return next;
        });
      }, 600);
    }
  }, [bugFound, lives, round, play, hintsUsed, onXP, onComplete, getChar, onChatText]);

  const handleNextRound = useCallback(() => {
    if (currentRoundIndex + 1 >= rounds.length) return;
    setCurrentRoundIndex(prev => prev + 1);
    setLives(3);
    setBugFound(false);
    setWrongGuesses(new Set());
    setHintsUsed(0);
    setHintLines(new Set());
    play('click');
  }, [currentRoundIndex, rounds.length, play]);

  const handleHint = useCallback(() => {
    // Highlight lines near the bug
    setHintsUsed(prev => prev + 1);
    const nearLines = [round.bugLine - 1, round.bugLine, round.bugLine + 1]
      .filter(i => i >= 0 && i < round.bugged.length);
    setHintLines(new Set(nearLines));
    play('click');

    // Clear hint highlights after 3 seconds
    setTimeout(() => {
      setHintLines(new Set());
    }, 3000);
  }, [round, play]);

  if (!round) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-coral)', textTransform: 'uppercase', letterSpacing: '2px' }}
          >
            Bug Hunt
          </div>
          <div
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Round {currentRoundIndex + 1}/{rounds.length} — {round.title}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Difficulty badge */}
          <span
            className="px-2 py-1 border"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: round.difficulty === 'Hard' ? 'var(--neon-coral)' : round.difficulty === 'Medium' ? 'var(--neon-gold)' : 'var(--neon-green)',
              borderColor: round.difficulty === 'Hard' ? 'var(--neon-coral)' : round.difficulty === 'Medium' ? 'var(--neon-gold)' : 'var(--neon-green)',
            }}
          >
            {round.difficulty}
          </span>
          {/* Lives */}
          <span
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-coral)' }}
          >
            {'♥'.repeat(Math.max(0, lives))}
            {'♡'.repeat(Math.max(0, 3 - lives))}
          </span>
        </div>
      </div>

      {/* File name */}
      <div
        style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--text-dim)' }}
      >
        📄 {round.file}
      </div>

      {/* Side-by-side code panels */}
      <div className="flex gap-2">
        {/* Original code (left) */}
        <div className="flex-1 border-2 overflow-auto" style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-void)' }}>
          <div
            className="px-2 py-1 border-b"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--neon-green)', borderColor: 'var(--border-pixel)', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Original
          </div>
          <div className="p-2">
            {round.original.map((line, i) => (
              <div key={i} className="flex" style={{ lineHeight: '1.6' }}>
                <span
                  className="select-none text-right pr-2 min-w-[28px]"
                  style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--text-dim)' }}
                >
                  {i}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--text-code)', whiteSpace: 'pre' }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bugged code (right) — clickable lines */}
        <div className="flex-1 border-2 overflow-auto" style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-void)' }}>
          <div
            className="px-2 py-1 border-b"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--neon-coral)', borderColor: 'var(--border-pixel)', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Clone (find the bug!)
          </div>
          <div className="p-2">
            {round.bugged.map((line, i) => {
              const isFound = bugFound && i === round.bugLine;
              const isWrongGuess = wrongGuesses.has(i);
              const isHinted = hintLines.has(i);

              let bg = 'transparent';
              if (isFound) bg = 'rgba(0,255,65,0.2)';
              else if (isWrongGuess) bg = 'rgba(255,107,107,0.2)';
              else if (isHinted) bg = 'rgba(168,85,247,0.1)';

              return (
                <div
                  key={i}
                  className="flex cursor-pointer hover:bg-white/5 transition-all"
                  style={{
                    lineHeight: '1.6',
                    background: bg,
                    animation: isWrongGuess ? 'shake 0.3s steps(4)' : undefined,
                  }}
                  onClick={() => handleLineClick(i)}
                >
                  <span
                    className="select-none text-right pr-2 min-w-[28px]"
                    style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--text-dim)' }}
                  >
                    {i}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: isFound ? 'var(--neon-green)' : 'var(--text-code)',
                      whiteSpace: 'pre',
                      fontWeight: isFound ? 'bold' : 'normal',
                    }}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bug found explanation */}
      {bugFound && (
        <div
          className="border-2 p-3"
          style={{
            borderColor: lives > 0 ? 'var(--neon-green)' : 'var(--neon-coral)',
            background: 'var(--bg-dark)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: lives > 0 ? 'var(--neon-green)' : 'var(--neon-coral)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {lives > 0 ? 'Bug Found!' : 'Out of Lives!'}
          </div>
          <div
            className="mt-2"
            style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6' }}
          >
            {round.explanation}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!bugFound && (
          <PixelButton size="sm" onClick={handleHint}>
            🔮 Hint
          </PixelButton>
        )}
        {bugFound && currentRoundIndex + 1 < rounds.length && (
          <PixelButton onClick={handleNextRound}>
            Next Round
          </PixelButton>
        )}
        {bugFound && currentRoundIndex + 1 >= rounds.length && (
          <div
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-green)', textTransform: 'uppercase' }}
          >
            All rounds complete!
          </div>
        )}
      </div>
    </div>
  );
}
