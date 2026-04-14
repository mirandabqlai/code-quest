'use client';

import { useState, useCallback, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Block {
  id: string;
  type: 'trigger' | 'input' | 'action' | 'output';
  label: string;
}

interface SkillBuilderProps {
  blocks: Block[];
  correctAssembly: string[];   // ordered list of block IDs
  onComplete: () => void;
}

/**
 * SkillBuilder — Module 13: "Skills & Plugins"
 *
 * Building blocks appear on the left: Trigger, Input, Action, and
 * Output blocks. The player drags (or clicks) them into a "skill
 * assembly" area on the right in the correct order. When assembled
 * correctly, the skill "runs" with a success animation. Each block
 * type has a distinct color so the player can see the pipeline shape.
 */
export default function SkillBuilder({ blocks, correctAssembly, onComplete }: SkillBuilderProps) {
  // --- state ---
  const [assembly, setAssembly] = useState<string[]>([]);  // block IDs in order
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  const [runAnimation, setRunAnimation] = useState(false);
  const [runStep, setRunStep] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Block type colors and icons
  const typeStyles: Record<Block['type'], { color: string; icon: string; label: string }> = {
    trigger: { color: 'var(--neon-coral)', icon: '\u{26A1}', label: 'TRIGGER' },
    input: { color: 'var(--neon-blue)', icon: '\u{1F4E5}', label: 'INPUT' },
    action: { color: 'var(--neon-gold)', icon: '\u{2699}\u{FE0F}', label: 'ACTION' },
    output: { color: 'var(--neon-green)', icon: '\u{1F4E4}', label: 'OUTPUT' },
  };

  // Blocks not yet placed in the assembly
  const availableBlocks = blocks.filter(b => !assembly.includes(b.id));

  // Get a block object by ID
  const getBlock = (id: string): Block | undefined => blocks.find(b => b.id === id);

  // --- handlers ---
  const handleAddBlock = useCallback((blockId: string) => {
    if (finished || runAnimation) return;
    setAssembly(prev => [...prev, blockId]);
  }, [finished, runAnimation]);

  const handleRemoveBlock = useCallback((index: number) => {
    if (finished || runAnimation) return;
    setAssembly(prev => prev.filter((_, i) => i !== index));
  }, [finished, runAnimation]);

  const handleClearAssembly = useCallback(() => {
    if (finished || runAnimation) return;
    setAssembly([]);
    setFlash('none');
  }, [finished, runAnimation]);

  const handleRunSkill = useCallback(() => {
    if (finished || runAnimation) return;

    setAttempts(prev => prev + 1);

    // Check if the assembly matches the correct order
    const isCorrect =
      assembly.length === correctAssembly.length &&
      assembly.every((id, i) => id === correctAssembly[i]);

    if (isCorrect) {
      // Success! Run the animation
      setRunAnimation(true);
      setRunStep(0);

      let step = 0;
      runIntervalRef.current = setInterval(() => {
        step++;
        if (step >= assembly.length) {
          // Animation complete
          if (runIntervalRef.current) clearInterval(runIntervalRef.current);
          setRunStep(-1);
          setFlash('green');

          // Score: base 200, bonus for fewer attempts
          const attemptBonus = Math.max(0, 100 - (attempts * 25));
          const points = 200 + attemptBonus;
          setScore(points);
          setFinished(true);
          setTimeout(() => onComplete(), 1500);
        } else {
          setRunStep(step);
        }
      }, 500);
    } else {
      // Wrong assembly
      setFlash('red');
      setTimeout(() => setFlash('none'), 500);

      // After 3 wrong attempts, show a hint
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  }, [finished, runAnimation, assembly, correctAssembly, attempts, onComplete]);

  // Build a hint: show the correct type order
  const hintText = correctAssembly.map(id => {
    const block = getBlock(id);
    return block ? typeStyles[block.type].label : '?';
  }).join(' \u2192 ');

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
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Skill Builder
        </div>
        {attempts > 0 && (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
            }}
          >
            Attempts: {attempts}
          </div>
        )}
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
        Assemble blocks in the right order to build a skill
      </div>

      {/* Type legend */}
      <div className="flex gap-3">
        {(Object.keys(typeStyles) as Block['type'][]).map(type => {
          const style = typeStyles[type];
          return (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-sm"
                style={{
                  background: style.color,
                  boxShadow: `0 0 4px ${style.color}`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  color: style.color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {style.label}
              </span>
            </div>
          );
        })}
      </div>

      {!finished && (
        <div className="flex gap-3" style={{ minHeight: '200px' }}>
          {/* Left: Available blocks */}
          <div className="flex flex-col gap-1 flex-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-coral)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Available Blocks
            </div>

            {availableBlocks.length === 0 ? (
              <div
                className="p-3 text-center border"
                style={{
                  borderColor: 'var(--border-pixel)',
                  background: 'var(--bg-void)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: 'var(--text-dim)',
                }}
              >
                All blocks placed!
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {availableBlocks.map(block => {
                  const style = typeStyles[block.type];
                  return (
                    <button
                      key={block.id}
                      onClick={() => handleAddBlock(block.id)}
                      disabled={runAnimation}
                      className="flex items-center gap-2 border-2 p-2 cursor-pointer transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: style.color,
                        background: 'var(--bg-panel)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${style.color}`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{style.icon}</span>
                      <div className="flex flex-col items-start">
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '5px',
                            color: style.color,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        >
                          {style.label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {block.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Assembly area */}
          <div className="flex flex-col gap-1 flex-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-green)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Skill Assembly
            </div>

            <div
              className="flex flex-col gap-1 p-2 border-2 min-h-[160px]"
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
              {assembly.length === 0 ? (
                <div
                  className="flex-1 flex items-center justify-center"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--text-dim)',
                    opacity: 0.5,
                  }}
                >
                  Click blocks to add them here...
                </div>
              ) : (
                assembly.map((blockId, i) => {
                  const block = getBlock(blockId);
                  if (!block) return null;
                  const style = typeStyles[block.type];
                  const isRunning = runAnimation && runStep === i;
                  const hasRun = runAnimation && runStep > i;

                  return (
                    <div key={`${blockId}-${i}`} className="flex flex-col gap-0.5">
                      <div
                        className="flex items-center gap-2 border p-1.5 transition-all"
                        style={{
                          borderColor: isRunning
                            ? style.color
                            : hasRun
                              ? 'var(--neon-green)'
                              : 'var(--border-pixel)',
                          background: isRunning
                            ? `${style.color}22`
                            : 'var(--bg-panel)',
                          boxShadow: isRunning
                            ? `0 0 12px ${style.color}`
                            : 'none',
                          animation: isRunning ? 'pulse 0.5s infinite' : undefined,
                        }}
                      >
                        <span style={{ fontSize: '12px' }}>{style.icon}</span>
                        <div className="flex-1">
                          <span
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '5px',
                              color: style.color,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                          >
                            {style.label}
                          </span>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '10px',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {block.label}
                          </div>
                        </div>
                        {/* Status indicator */}
                        {hasRun && (
                          <span style={{ color: 'var(--neon-green)', fontSize: '10px' }}>
                            {'\u2714'}
                          </span>
                        )}
                        {isRunning && (
                          <span
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '5px',
                              color: style.color,
                              animation: 'blink 0.5s step-end infinite',
                            }}
                          >
                            RUN
                          </span>
                        )}
                        {/* Remove button (only when not running) */}
                        {!runAnimation && (
                          <button
                            onClick={() => handleRemoveBlock(i)}
                            className="px-1 cursor-pointer"
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '8px',
                              color: 'var(--neon-coral)',
                              background: 'none',
                              border: 'none',
                            }}
                          >
                            {'\u2715'}
                          </button>
                        )}
                      </div>

                      {/* Connector arrow between blocks */}
                      {i < assembly.length - 1 && (
                        <div
                          className="text-center"
                          style={{
                            fontSize: '10px',
                            color: hasRun ? 'var(--neon-green)' : 'var(--text-dim)',
                            lineHeight: '1',
                          }}
                        >
                          {'\u25BC'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hint (shows after multiple failed attempts) */}
      {showHint && !finished && (
        <div
          className="border p-2"
          style={{
            borderColor: 'var(--neon-gold)',
            background: 'rgba(255, 217, 61, 0.06)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            Hint: Expected block types in order
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-primary)',
            }}
          >
            {hintText}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!finished && !runAnimation && (
        <div className="flex gap-2">
          <PixelButton
            onClick={handleRunSkill}
            disabled={assembly.length === 0}
            variant="success"
          >
            Run Skill
          </PixelButton>
          <PixelButton
            onClick={handleClearAssembly}
            disabled={assembly.length === 0}
            variant="danger"
            size="sm"
          >
            Clear
          </PixelButton>
        </div>
      )}

      {/* Finished overlay */}
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
            Skill Assembled!
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
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {attempts <= 1 ? 'Perfect Assembly!' : `Completed in ${attempts} attempts`}
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
