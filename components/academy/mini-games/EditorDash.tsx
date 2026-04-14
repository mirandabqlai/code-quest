'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Snippet {
  code: string;
  suggestion: string;
  correct: boolean;  // true = Accept is right, false = Reject is right
}

interface EditorDashProps {
  snippets: Snippet[];
  timeLimit: number;       // seconds for the entire game
  onComplete: () => void;
}

type Decision = 'accept' | 'reject' | 'chat';

interface RoundResult {
  snippetIdx: number;
  decision: Decision;
  wasCorrect: boolean;
  reactionMs: number;    // how fast the player decided
}

/**
 * Editor Dash — Module 9: "AI in Your Editor"
 *
 * A simplified code editor where AI autocomplete suggestions appear.
 * The player must quickly decide: Accept (Tab), Reject (Esc), or
 * Open Chat (?). Speed matters — faster correct decisions earn more
 * points. Good suggestions should be accepted, bad ones rejected.
 * Ambiguous ones can go to chat for partial credit.
 */
export default function EditorDash({ snippets, timeLimit, onComplete }: EditorDashProps) {
  // --- state ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameOver, setGameOver] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [flash, setFlash] = useState<'none' | 'green' | 'red' | 'blue'>('none');
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [cursorVisible, setCursorVisible] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cursorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSnippet = snippets[currentIdx] ?? null;
  const isFinished = gameOver || currentIdx >= snippets.length;

  // --- cursor blink ---
  useEffect(() => {
    cursorRef.current = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => {
      if (cursorRef.current) clearInterval(cursorRef.current);
    };
  }, []);

  // --- countdown timer ---
  useEffect(() => {
    if (isFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameOver(true);
          setTimeout(() => onComplete(), 1500);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, onComplete]);

  // --- show suggestion with a brief typing delay ---
  useEffect(() => {
    if (isFinished) return;
    setShowSuggestion(false);
    const delay = setTimeout(() => {
      setShowSuggestion(true);
      setRoundStartTime(Date.now());
    }, 600); // simulate the AI "thinking" before suggesting
    return () => clearTimeout(delay);
  }, [currentIdx, isFinished]);

  // --- keyboard controls ---
  useEffect(() => {
    if (isFinished || !showSuggestion) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleDecision('accept');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleDecision('reject');
      } else if (e.key === '?') {
        e.preventDefault();
        handleDecision('chat');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, showSuggestion, currentIdx]);

  // --- decision handler ---
  const handleDecision = useCallback((decision: Decision) => {
    if (isFinished || !currentSnippet || !showSuggestion) return;

    const reactionMs = Date.now() - roundStartTime;

    // Scoring logic:
    // - correct accept/reject: 100 pts base + speed bonus (up to 50 for sub-1s)
    // - chat on ambiguous: 50 pts (partial credit, always "ok")
    // - wrong: 0 pts, break streak
    let wasCorrect = false;
    let points = 0;

    if (decision === 'chat') {
      // Chat is always partial credit — you're asking for help, which is fine
      wasCorrect = true;
      points = 50;
      setFlash('blue');
    } else if (
      (decision === 'accept' && currentSnippet.correct) ||
      (decision === 'reject' && !currentSnippet.correct)
    ) {
      // Correct decision!
      wasCorrect = true;
      const speedBonus = Math.max(0, Math.round(50 - (reactionMs / 40)));
      const streakBonus = streak * 15;
      points = 100 + speedBonus + streakBonus;
      setFlash('green');
    } else {
      // Wrong decision
      wasCorrect = false;
      points = 0;
      setFlash('red');
    }

    setScore(prev => prev + points);

    if (wasCorrect) {
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setResults(prev => [...prev, {
      snippetIdx: currentIdx,
      decision,
      wasCorrect,
      reactionMs,
    }]);

    // Advance to next snippet after a brief pause
    setTimeout(() => {
      setFlash('none');
      const nextIdx = currentIdx + 1;
      if (nextIdx >= snippets.length) {
        setGameOver(true);
        setTimeout(() => onComplete(), 1200);
      } else {
        setCurrentIdx(nextIdx);
      }
    }, 400);
  }, [isFinished, currentSnippet, showSuggestion, roundStartTime, streak, currentIdx, snippets.length, onComplete]);

  // --- stats ---
  const correctCount = results.filter(r => r.wasCorrect).length;
  const avgReaction = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.reactionMs, 0) / results.length)
    : 0;

  // --- timer display ---
  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerColor = timerPercent > 50
    ? 'var(--neon-green)'
    : timerPercent > 25
      ? 'var(--neon-gold)'
      : 'var(--neon-coral)';

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{
        borderColor: flash === 'green'
          ? 'var(--neon-green)'
          : flash === 'red'
            ? 'var(--neon-coral)'
            : flash === 'blue'
              ? 'var(--neon-blue)'
              : 'var(--border-pixel)',
        background: 'var(--bg-dark)',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-green)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Editor Dash
        </div>
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-purple)',
                animation: 'idle-bob 0.8s ease-in-out infinite',
              }}
            >
              {streak}x STREAK
            </div>
          )}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
            }}
          >
            {score} PTS
          </div>
        </div>
      </div>

      {/* Timer bar */}
      {!isFinished && (
        <div className="relative h-2 rounded" style={{ background: 'var(--bg-void)' }}>
          <div
            className="h-full rounded"
            style={{
              width: `${timerPercent}%`,
              background: timerColor,
              boxShadow: `0 0 6px ${timerColor}`,
              transition: 'width 0.1s linear, background 0.3s',
            }}
          />
        </div>
      )}

      {/* Progress */}
      <div className="flex gap-2 items-center">
        {snippets.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < currentIdx
                ? results[i]?.wasCorrect
                  ? 'var(--neon-green)'
                  : 'var(--neon-coral)'
                : i === currentIdx
                  ? 'var(--neon-gold)'
                  : 'var(--border-pixel)',
              boxShadow: i < currentIdx && results[i]?.wasCorrect
                ? '0 0 6px var(--neon-green)'
                : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Code editor area */}
      {!isFinished && currentSnippet && (
        <div
          className="border-2 rounded overflow-hidden"
          style={{
            borderColor: 'var(--border-bright)',
            background: 'var(--bg-void)',
          }}
        >
          {/* Editor title bar */}
          <div
            className="flex items-center gap-2 px-3 py-1 border-b"
            style={{
              borderColor: 'var(--border-pixel)',
              background: 'var(--bg-panel)',
            }}
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-coral)' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-gold)' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-green)' }} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              editor.ts
            </div>
          </div>

          {/* Code content */}
          <div className="p-3" style={{ minHeight: '80px' }}>
            {/* Existing code */}
            <div
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
              }}
            >
              {currentSnippet.code}
              <span
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  color: 'var(--neon-green)',
                }}
              >
                {'\u2588'}
              </span>
            </div>

            {/* AI suggestion ghost text */}
            {showSuggestion && (
              <div
                className="mt-1 p-2 border-l-2"
                style={{
                  borderColor: 'var(--neon-purple)',
                  background: 'rgba(168, 85, 247, 0.08)',
                  animation: 'idle-bob 2s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: 'var(--neon-purple)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                  }}
                >
                  AI Suggests:
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '12px',
                    color: 'var(--neon-purple)',
                    opacity: 0.7,
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {currentSnippet.suggestion}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision buttons — only visible when suggestion is showing */}
      {!isFinished && showSuggestion && (
        <div className="flex flex-col gap-2">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Quick! Accept, reject, or ask for help?
          </div>
          <div className="flex gap-2">
            <PixelButton onClick={() => handleDecision('accept')} variant="success" size="sm">
              Tab Accept
            </PixelButton>
            <PixelButton onClick={() => handleDecision('reject')} variant="danger" size="sm">
              Esc Reject
            </PixelButton>
            <PixelButton onClick={() => handleDecision('chat')} size="sm">
              ? Chat
            </PixelButton>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '5px',
              color: 'var(--text-dim)',
              letterSpacing: '1px',
            }}
          >
            Keyboard: Tab = Accept, Esc = Reject, ? = Chat
          </div>
        </div>
      )}

      {/* Waiting for suggestion indicator */}
      {!isFinished && !showSuggestion && (
        <div
          className="text-center py-2"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--neon-purple)',
            animation: 'blink 1s step-end infinite',
          }}
        >
          AI is typing...
        </div>
      )}

      {/* Game Over screen */}
      {isFinished && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '0 0 12px var(--neon-gold)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            {correctCount >= snippets.length * 0.8
              ? 'Editor Pro!'
              : correctCount >= snippets.length * 0.5
                ? 'Good Instincts!'
                : 'Keep Practicing!'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '18px',
              color: 'var(--neon-gold)',
              textShadow: '0 0 16px var(--neon-gold)',
            }}
          >
            {score} PTS
          </div>
          <div className="flex gap-4">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-green)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Correct: {correctCount}/{snippets.length}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-blue)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Best Streak: {bestStreak}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Avg Speed: {avgReaction}ms
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Module Complete!
          </div>
        </div>
      )}
    </div>
  );
}
