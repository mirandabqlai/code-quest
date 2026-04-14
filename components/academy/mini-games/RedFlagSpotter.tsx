'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface AIOutput {
  text: string;
  isRedFlag: boolean;
  explanation: string;
}

interface RedFlagSpotterProps {
  outputs: AIOutput[];
  timePerOutput: number;   // seconds each output stays on screen
  onComplete: () => void;
}

interface FeedItem {
  output: AIOutput;
  index: number;
  status: 'active' | 'flagged' | 'missed' | 'safe';
  flaggedCorrectly?: boolean;
}

/**
 * Red Flag Spotter — Module 4: "Safety & When AI Fails"
 *
 * AI outputs scroll up from the bottom in a social-media-style feed.
 * Some are correct, some are hallucinated or dangerous. The player
 * clicks bad ones to flag them (they turn red with an explanation).
 * If a bad output scrolls past unflagged, the player loses points.
 * A timer bar shows how long until the current output expires.
 */
export default function RedFlagSpotter({ outputs, timePerOutput, onComplete }: RedFlagSpotterProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerOutput);
  const [gameOver, setGameOver] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [flashRed, setFlashRed] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Stats for end screen
  const correctFlags = feedItems.filter(f => f.status === 'flagged' && f.flaggedCorrectly).length;
  const missedFlags = feedItems.filter(f => f.status === 'missed').length;
  const wrongFlags = feedItems.filter(f => f.status === 'flagged' && !f.flaggedCorrectly).length;

  // --- timer logic ---
  useEffect(() => {
    if (gameOver || currentIdx >= outputs.length) return;

    // Add the current output to the feed
    setFeedItems(prev => {
      // Only add if not already present
      if (prev.some(f => f.index === currentIdx)) return prev;
      return [
        ...prev,
        {
          output: outputs[currentIdx],
          index: currentIdx,
          status: 'active',
        },
      ];
    });

    setTimeLeft(timePerOutput);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 0.1;
        if (next <= 0) {
          // Time's up for this output — advance
          if (timerRef.current) clearInterval(timerRef.current);
          advanceOutput(currentIdx);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, gameOver]);

  // Auto-scroll feed to show newest items
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feedItems]);

  const advanceOutput = useCallback((idx: number) => {
    // Mark the output as missed or safe (if it was active)
    setFeedItems(prev =>
      prev.map(f => {
        if (f.index === idx && f.status === 'active') {
          if (f.output.isRedFlag) {
            // Player missed a bad output — lose points
            setScore(s => Math.max(0, s - 50));
            setStreak(0);
            setFlashRed(true);
            setTimeout(() => setFlashRed(false), 300);
            return { ...f, status: 'missed' as const };
          } else {
            // Safe output passed without being flagged — that's correct
            return { ...f, status: 'safe' as const };
          }
        }
        return f;
      })
    );

    const nextIdx = idx + 1;
    if (nextIdx >= outputs.length) {
      setGameOver(true);
      setTimeout(() => onComplete(), 1500);
    } else {
      setCurrentIdx(nextIdx);
    }
  }, [outputs.length, onComplete]);

  const handleFlag = useCallback((itemIndex: number) => {
    if (gameOver) return;

    setFeedItems(prev =>
      prev.map(f => {
        if (f.index === itemIndex && f.status === 'active') {
          const correct = f.output.isRedFlag;

          if (correct) {
            // Correctly flagged a red flag!
            const streakBonus = streak * 10;
            setScore(s => s + 100 + streakBonus);
            setStreak(s => s + 1);
            setFlashGreen(true);
            setTimeout(() => setFlashGreen(false), 300);
          } else {
            // Wrongly flagged a safe output
            setScore(s => Math.max(0, s - 25));
            setStreak(0);
            setFlashRed(true);
            setTimeout(() => setFlashRed(false), 300);
          }

          // Show explanation briefly
          setShowExplanation(itemIndex);
          setTimeout(() => setShowExplanation(null), 3000);

          // If this was the active output, advance after a short delay
          if (itemIndex === currentIdx) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeout(() => {
              const nextIdx = itemIndex + 1;
              if (nextIdx >= outputs.length) {
                setGameOver(true);
                setTimeout(() => onComplete(), 1500);
              } else {
                setCurrentIdx(nextIdx);
              }
            }, 600);
          }

          return { ...f, status: 'flagged' as const, flaggedCorrectly: correct };
        }
        return f;
      })
    );
  }, [gameOver, streak, currentIdx, outputs.length, onComplete]);

  // --- timer bar width ---
  const timerPercent = (timeLeft / timePerOutput) * 100;
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
        borderColor: flashRed
          ? 'var(--neon-coral)'
          : flashGreen
            ? 'var(--neon-green)'
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
            color: 'var(--neon-coral)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Red Flag Spotter
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
      {!gameOver && (
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

      {/* Progress indicator */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Output {Math.min(currentIdx + 1, outputs.length)} of {outputs.length}
        {' \u2014 '}Click the bad AI outputs to flag them!
      </div>

      {/* Feed — scrollable container */}
      <div
        ref={feedRef}
        className="flex flex-col gap-2 overflow-y-auto pr-1"
        style={{
          maxHeight: '300px',
          minHeight: '200px',
        }}
      >
        {feedItems.map(item => {
          const isActive = item.status === 'active';
          const isFlagged = item.status === 'flagged';
          const isMissed = item.status === 'missed';
          const isSafe = item.status === 'safe';

          let borderColor = 'var(--border-pixel)';
          let bgColor = 'var(--bg-panel)';
          let statusIcon = '';

          if (isFlagged && item.flaggedCorrectly) {
            borderColor = 'var(--neon-green)';
            bgColor = 'rgba(0, 255, 65, 0.08)';
            statusIcon = '\u2714 CAUGHT';
          } else if (isFlagged && !item.flaggedCorrectly) {
            borderColor = 'var(--neon-coral)';
            bgColor = 'rgba(255, 107, 107, 0.08)';
            statusIcon = '\u2717 FALSE ALARM';
          } else if (isMissed) {
            borderColor = 'var(--neon-coral)';
            bgColor = 'rgba(255, 107, 107, 0.05)';
            statusIcon = '\u26A0 MISSED';
          } else if (isSafe) {
            borderColor = 'var(--border-pixel)';
            bgColor = 'var(--bg-panel)';
            statusIcon = '\u2713 SAFE';
          } else if (isActive) {
            borderColor = 'var(--neon-gold)';
          }

          return (
            <div key={item.index} className="flex flex-col gap-1">
              <button
                onClick={() => isActive && handleFlag(item.index)}
                disabled={!isActive}
                className="border-2 p-3 text-left transition-all w-full"
                style={{
                  borderColor,
                  background: bgColor,
                  cursor: isActive ? 'pointer' : 'default',
                  boxShadow: isActive
                    ? '0 0 6px var(--neon-gold)'
                    : isFlagged && item.flaggedCorrectly
                      ? '0 0 8px var(--neon-green)'
                      : 'none',
                  opacity: (isSafe || (isMissed && !showExplanation)) ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                      flex: 1,
                    }}
                  >
                    {item.output.text}
                  </div>
                  {!isActive && (
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '5px',
                        color: isFlagged && item.flaggedCorrectly
                          ? 'var(--neon-green)'
                          : (isFlagged && !item.flaggedCorrectly) || isMissed
                            ? 'var(--neon-coral)'
                            : 'var(--text-dim)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusIcon}
                    </div>
                  )}
                  {isActive && (
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: 'var(--neon-coral)',
                        animation: 'blink 1s step-end infinite',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      [FLAG?]
                    </div>
                  )}
                </div>
              </button>

              {/* Explanation popover */}
              {(showExplanation === item.index || (isMissed && item.output.isRedFlag)) && (
                <div
                  className="p-2 border ml-4"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    lineHeight: '1.5',
                    borderColor: item.output.isRedFlag ? 'var(--neon-coral)' : 'var(--neon-green)',
                    background: 'var(--bg-void)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: item.output.isRedFlag ? 'var(--neon-coral)' : 'var(--neon-green)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {item.output.isRedFlag ? 'RED FLAG: ' : 'SAFE: '}
                  </span>
                  {item.output.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Over screen */}
      {gameOver && (
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
            Scan Complete!
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
              Caught: {correctFlags}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-coral)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Missed: {missedFlags}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-gold)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              False Alarms: {wrongFlags}
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
