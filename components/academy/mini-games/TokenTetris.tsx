'use client';

import { useState, useCallback, useMemo } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface TokenTetrisProps {
  tokens: string[];
  validSentences: string[];
  onComplete: () => void;
}

/** How many sentences the player must form to win. */
const WIN_COUNT = 3;

/**
 * Token Tetris — Module 1: "What is AI?"
 *
 * Tokens (word pieces) sit in a pool at the top. The player drags them into
 * ordered slots to form valid sentences. A prediction meter shows how
 * confident the "AI" is about the next token as the sentence grows.
 * Completing a sentence awards points and triggers a green flash.
 */
export default function TokenTetris({ tokens, validSentences, onComplete }: TokenTetrisProps) {
  // --- state ---
  const [slots, setSlots] = useState<string[]>([]);           // tokens placed so far
  const [score, setScore] = useState(0);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  const [finished, setFinished] = useState(false);

  // Tokens that haven't been placed in the current attempt
  const availableTokens = useMemo(() => {
    const used = new Set(slots);
    // If a token appears multiple times in the pool we only remove one per placement.
    // We track by index to handle duplicates.
    const remaining: { token: string; idx: number }[] = [];
    const usedIndices = new Set<number>();

    // For each slot entry, find the first matching unused index
    const tempSlots = [...slots];
    tokens.forEach((t, i) => {
      const matchIdx = tempSlots.indexOf(t);
      if (matchIdx !== -1) {
        usedIndices.add(i);
        tempSlots[matchIdx] = '__used__';
      }
    });

    tokens.forEach((t, i) => {
      if (!usedIndices.has(i)) {
        remaining.push({ token: t, idx: i });
      }
    });

    return remaining;
  }, [tokens, slots]);

  // --- prediction meter ---
  // Check which valid sentences START with the current slot sequence.
  const currentText = slots.join(' ').toLowerCase();
  const matchingSentences = validSentences.filter(s =>
    s.toLowerCase().startsWith(currentText)
  );
  // Confidence: what fraction of valid sentences still match?
  const predictionConfidence = slots.length === 0
    ? 0
    : Math.round((matchingSentences.length / validSentences.length) * 100);

  // Determine prediction label based on confidence
  const predictionLabel = slots.length === 0
    ? 'WAITING...'
    : matchingSentences.length === 0
      ? 'NO MATCH'
      : predictionConfidence >= 80
        ? 'HIGH CONFIDENCE'
        : predictionConfidence >= 40
          ? 'LIKELY'
          : 'EXPLORING...';

  const predictionColor = matchingSentences.length === 0
    ? 'var(--neon-coral)'
    : predictionConfidence >= 60
      ? 'var(--neon-green)'
      : 'var(--neon-gold)';

  // --- handlers ---
  const addToken = useCallback((token: string) => {
    if (finished) return;
    setSlots(prev => [...prev, token]);
  }, [finished]);

  const removeLastToken = useCallback(() => {
    setSlots(prev => prev.slice(0, -1));
  }, []);

  const clearSlots = useCallback(() => {
    setSlots([]);
    setFlash('none');
  }, []);

  const submitSentence = useCallback(() => {
    const attempt = slots.join(' ');
    const isValid = validSentences.some(
      s => s.toLowerCase() === attempt.toLowerCase()
    );

    if (isValid && !completedSentences.includes(attempt.toLowerCase())) {
      // Correct!
      const points = 100 + (slots.length * 10); // longer sentences = more points
      setScore(prev => prev + points);
      setCompletedSentences(prev => [...prev, attempt.toLowerCase()]);
      setFlash('green');
      setSlots([]);

      const newCount = completedSentences.length + 1;
      if (newCount >= WIN_COUNT || newCount >= validSentences.length) {
        setFinished(true);
        // Small delay so the player sees the green flash before completion fires
        setTimeout(() => onComplete(), 800);
      } else {
        setTimeout(() => setFlash('none'), 600);
      }
    } else {
      // Wrong
      setFlash('red');
      setTimeout(() => setFlash('none'), 400);
    }
  }, [slots, validSentences, completedSentences, onComplete]);

  // --- render ---
  return (
    <div
      className="flex flex-col gap-4 p-4 border-2 rounded"
      style={{
        borderColor: flash === 'green'
          ? 'var(--neon-green)'
          : flash === 'red'
            ? 'var(--neon-coral)'
            : 'var(--border-pixel)',
        background: 'var(--bg-dark)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-blue)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Token Tetris
        </div>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--neon-gold)',
          }}
        >
          SCORE: {score}
        </div>
      </div>

      {/* Progress bar — how many sentences completed */}
      <div className="flex gap-2 items-center">
        {Array.from({ length: Math.min(WIN_COUNT, validSentences.length) }).map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < completedSentences.length
                ? 'var(--neon-green)'
                : 'var(--border-pixel)',
              boxShadow: i < completedSentences.length
                ? '0 0 6px var(--neon-green)'
                : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Prediction Meter */}
      <div
        className="flex items-center gap-3 p-2 border"
        style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-panel)' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          AI Prediction:
        </div>
        <div className="flex-1 h-3 rounded-sm" style={{ background: 'var(--bg-void)' }}>
          <div
            className="h-full rounded-sm"
            style={{
              width: `${Math.max(predictionConfidence, 4)}%`,
              background: predictionColor,
              boxShadow: `0 0 8px ${predictionColor}`,
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '5px',
            color: predictionColor,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          {predictionLabel}
        </div>
      </div>

      {/* Token pool */}
      <div>
        <div
          className="mb-1"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Token Pool
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableTokens.map(({ token, idx }) => (
            <button
              key={idx}
              onClick={() => addToken(token)}
              disabled={finished}
              className="border-2 px-2 py-1 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-green)',
                borderColor: 'var(--border-bright)',
                background: 'var(--bg-panel)',
              }}
            >
              {token}
            </button>
          ))}
          {availableTokens.length === 0 && slots.length > 0 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
              }}
            >
              ALL TOKENS PLACED
            </div>
          )}
        </div>
      </div>

      {/* Sentence builder — the "slots" area */}
      <div>
        <div
          className="mb-1"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Your Sentence
        </div>
        <div
          className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border-2 rounded"
          style={{
            borderColor: flash === 'green'
              ? 'var(--neon-green)'
              : flash === 'red'
                ? 'var(--neon-coral)'
                : 'var(--border-bright)',
            background: 'var(--bg-void)',
            boxShadow: flash === 'green'
              ? '0 0 12px var(--neon-green)'
              : flash === 'red'
                ? '0 0 12px var(--neon-coral)'
                : 'none',
            transition: 'all 0.2s',
          }}
        >
          {slots.length === 0 ? (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                opacity: 0.5,
              }}
            >
              Click tokens above to build a sentence...
            </div>
          ) : (
            slots.map((token, i) => (
              <span
                key={i}
                className="border px-1.5 py-0.5"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--neon-blue)',
                  background: 'var(--bg-panel)',
                  animation: 'idle-bob 2s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {token}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <PixelButton onClick={submitSentence} disabled={slots.length === 0 || finished} variant="success">
          Submit
        </PixelButton>
        <PixelButton onClick={removeLastToken} disabled={slots.length === 0 || finished} size="sm">
          Undo
        </PixelButton>
        <PixelButton onClick={clearSlots} disabled={slots.length === 0 || finished} variant="danger" size="sm">
          Clear
        </PixelButton>
      </div>

      {/* Completed sentences list */}
      {completedSentences.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Completed
          </div>
          {completedSentences.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--neon-green)',
              }}
            >
              <span style={{ fontSize: '10px' }}>&#x2714;</span>
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Finished overlay */}
      {finished && (
        <div
          className="text-center p-3"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 12px var(--neon-gold)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          Module Complete! +{score} XP
        </div>
      )}
    </div>
  );
}
