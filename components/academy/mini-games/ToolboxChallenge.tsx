'use client';

import { useState, useCallback } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface ToolRequest {
  description: string;
  correctTool: string;
  explanation: string;
}

interface ToolboxChallengeProps {
  requests: ToolRequest[];
  tools: string[];
  onComplete: () => void;
}

interface RequestResult {
  requestIdx: number;
  chosenTool: string;
  wasCorrect: boolean;
}

/**
 * Toolbox Challenge — Module 11: "Tool Calling"
 *
 * Requests come in one at a time ("What's in server.js?", "Change
 * port to 8080"). A toolbox at the bottom shows available tools:
 * Read, Edit, Write, Bash, Grep, Glob. The player picks the right
 * tool for each request. A combo counter rewards consecutive correct
 * picks. Wrong tool = funny failure animation + explanation.
 */
export default function ToolboxChallenge({ requests, tools, onComplete }: ToolboxChallengeProps) {
  // --- state ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [failAnimation, setFailAnimation] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentRequest = requests[currentIdx] ?? null;

  // Funny failure messages when the wrong tool is picked
  const failMessages = [
    'That tool just stared blankly at the request...',
    'BZZZT! Wrong socket, wrong wrench!',
    'The tool tried its best... and failed spectacularly.',
    'Oops! That tool is great, but not for THIS job.',
    'Error 418: Tool is a teapot. Wrong one!',
    'The tool looked confused and walked away.',
  ];

  // Tool icon mapping for visual flair
  const toolIcons: Record<string, string> = {
    Read: '\u{1F4D6}',
    Edit: '\u{270F}\u{FE0F}',
    Write: '\u{1F4DD}',
    Bash: '\u{1F4BB}',
    Grep: '\u{1F50D}',
    Glob: '\u{1F30D}',
  };

  // Tool colors for distinct visual identity
  const toolColors: Record<string, string> = {
    Read: 'var(--neon-blue)',
    Edit: 'var(--neon-gold)',
    Write: 'var(--neon-green)',
    Bash: 'var(--neon-coral)',
    Grep: 'var(--neon-purple)',
    Glob: 'var(--neon-blue)',
  };

  // --- handlers ---
  const handlePickTool = useCallback((tool: string) => {
    if (finished || !currentRequest) return;

    const isCorrect = tool === currentRequest.correctTool;

    if (isCorrect) {
      const comboBonus = combo * 20;
      const points = 100 + comboBonus;
      setScore(prev => prev + points);
      setCombo(prev => {
        const newCombo = prev + 1;
        setBestCombo(best => Math.max(best, newCombo));
        return newCombo;
      });
      setFlash('green');
      setShowExplanation(null);
    } else {
      setCombo(0);
      setFlash('red');
      setFailAnimation(true);
      setShowExplanation(
        `${failMessages[currentIdx % failMessages.length]} ${currentRequest.explanation}`
      );
      setTimeout(() => setFailAnimation(false), 600);
    }

    setResults(prev => [...prev, {
      requestIdx: currentIdx,
      chosenTool: tool,
      wasCorrect: isCorrect,
    }]);

    // Advance after a brief pause
    setTimeout(() => {
      setFlash('none');

      const nextIdx = currentIdx + 1;
      if (nextIdx >= requests.length) {
        setFinished(true);
        setTimeout(() => onComplete(), 1500);
      } else {
        setCurrentIdx(nextIdx);
        setShowExplanation(null);
      }
    }, isCorrect ? 400 : 1800);
  }, [finished, currentRequest, combo, currentIdx, requests.length, onComplete, failMessages]);

  // --- stats ---
  const correctCount = results.filter(r => r.wasCorrect).length;

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{
        borderColor: flash === 'green'
          ? 'var(--neon-green)'
          : flash === 'red'
            ? 'var(--neon-coral)'
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
            color: 'var(--neon-purple)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Toolbox Challenge
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: 'var(--neon-gold)',
                textShadow: '0 0 8px var(--neon-gold)',
                animation: 'idle-bob 0.6s ease-in-out infinite',
              }}
            >
              {combo}x COMBO!
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

      {/* Progress bar */}
      <div className="flex gap-2 items-center">
        {requests.map((_, i) => (
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

      {/* Current request */}
      {!finished && currentRequest && (
        <div
          className="border-2 p-3"
          style={{
            borderColor: 'var(--neon-blue)',
            background: 'var(--bg-panel)',
            animation: failAnimation ? 'glitch 0.3s linear' : undefined,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--neon-blue)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            Incoming Request {currentIdx + 1}/{requests.length}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
            }}
          >
            &ldquo;{currentRequest.description}&rdquo;
          </div>
        </div>
      )}

      {/* Explanation popup (on wrong answer) */}
      {showExplanation && (
        <div
          className="border-2 p-2"
          style={{
            borderColor: 'var(--neon-coral)',
            background: 'rgba(255, 107, 107, 0.08)',
            boxShadow: '0 0 10px rgba(255, 107, 107, 0.2)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            {showExplanation}
          </div>
          <div
            className="mt-1"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Correct tool: {currentRequest?.correctTool}
          </div>
        </div>
      )}

      {/* Toolbox */}
      {!finished && (
        <div>
          <div
            className="mb-2"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Pick the right tool:
          </div>
          <div className="flex flex-wrap gap-2">
            {tools.map(tool => {
              const color = toolColors[tool] || 'var(--text-primary)';
              const icon = toolIcons[tool] || '\u{1F527}';

              return (
                <button
                  key={tool}
                  onClick={() => handlePickTool(tool)}
                  disabled={!!showExplanation}
                  className="flex flex-col items-center gap-1 border-2 px-4 py-2 cursor-pointer transition-all hover:-translate-y-1"
                  style={{
                    borderColor: 'var(--border-bright)',
                    background: 'var(--bg-panel)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${color}`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {tool}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Over screen */}
      {finished && (
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
            {correctCount >= requests.length * 0.8
              ? 'Tool Master!'
              : correctCount >= requests.length * 0.5
                ? 'Handy Worker!'
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
              Correct: {correctCount}/{requests.length}
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
              Best Combo: {bestCombo}x
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
