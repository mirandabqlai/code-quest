'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Machine {
  id: string;
  name: string;
}

interface Pipeline {
  name: string;
  correctOrder: string[];
  description: string;
}

interface FactoryFloorProps {
  machines: Machine[];
  pipelines: Pipeline[];
  onComplete: () => void;
}

/** Icons for known machine types */
const MACHINE_ICONS: Record<string, string> = {
  'retrieve-docs': '\u{1F4DA}',
  'chunk-text': '\u{2702}',
  'embed': '\u{1F9F2}',
  'vector-search': '\u{1F50E}',
  'send-to-llm': '\u{1F9E0}',
  'format-output': '\u{1F4CB}',
};

type Phase = 'build' | 'running' | 'result' | 'next' | 'done';

/**
 * Factory Floor -- Module 16: AI Patterns
 *
 * A conveyor belt runs left to right. Machine blocks sit in a dock at the top.
 * The player drags them onto the belt to build a pipeline. When they run it,
 * products (data) travel along the belt through each machine. If the order
 * is correct, the product emerges at the end. If wrong, there is a jam
 * with a shake animation. The player builds different pipelines for
 * different AI patterns (RAG, chain-of-thought, agent loop).
 */
export default function FactoryFloor({ machines, pipelines, onComplete }: FactoryFloorProps) {
  const [phase, setPhase] = useState<Phase>('build');
  const [pipelineIdx, setPipelineIdx] = useState(0);
  const [belt, setBelt] = useState<string[]>([]);        // machine ids on the belt, in order
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [runProgress, setRunProgress] = useState(-1);    // which belt position the product is at
  const [runSuccess, setRunSuccess] = useState<boolean | null>(null);
  const [shaking, setShaking] = useState(false);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');

  const runRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPipeline = pipelines[pipelineIdx] ?? null;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (runRef.current) clearInterval(runRef.current);
    };
  }, []);

  // --- handlers ---

  /** Add a machine to the end of the belt */
  const addToBelt = useCallback((machineId: string) => {
    if (phase !== 'build') return;
    setBelt(prev => [...prev, machineId]);
  }, [phase]);

  /** Remove the last machine from the belt */
  const removeFromBelt = useCallback(() => {
    if (phase !== 'build') return;
    setBelt(prev => prev.slice(0, -1));
  }, [phase]);

  /** Clear the entire belt */
  const clearBelt = useCallback(() => {
    if (phase !== 'build') return;
    setBelt([]);
  }, [phase]);

  /** Run the pipeline: animate a product moving through the belt */
  const handleRun = useCallback(() => {
    if (!currentPipeline || belt.length === 0) return;

    setPhase('running');
    setRunProgress(-1);
    setRunSuccess(null);

    // Check if the belt matches the correct order
    const isCorrect =
      belt.length === currentPipeline.correctOrder.length &&
      belt.every((id, i) => id === currentPipeline.correctOrder[i]);

    // Find where it goes wrong (if it does)
    let failAt = -1;
    if (!isCorrect) {
      for (let i = 0; i < belt.length; i++) {
        if (i >= currentPipeline.correctOrder.length || belt[i] !== currentPipeline.correctOrder[i]) {
          failAt = i;
          break;
        }
      }
      // If belt is too short but otherwise correct so far, fail at the end
      if (failAt === -1) failAt = belt.length - 1;
    }

    let pos = -1;
    runRef.current = setInterval(() => {
      pos++;

      // If wrong and we reached the failure point, jam!
      if (!isCorrect && pos === failAt) {
        if (runRef.current) clearInterval(runRef.current);
        setRunProgress(pos);
        setShaking(true);
        setFlash('red');
        setRunSuccess(false);
        setStreak(0);
        setTimeout(() => {
          setShaking(false);
          setFlash('none');
          setPhase('result');
        }, 800);
        return;
      }

      // If we've passed all machines, success!
      if (pos >= belt.length) {
        if (runRef.current) clearInterval(runRef.current);
        setRunProgress(pos);
        setFlash('green');
        setRunSuccess(true);
        const streakBonus = streak * 25;
        setScore(s => s + 150 + streakBonus);
        setStreak(s => s + 1);
        setTimeout(() => {
          setFlash('none');
          setPhase('result');
        }, 600);
        return;
      }

      setRunProgress(pos);
    }, 500);
  }, [currentPipeline, belt, streak]);

  /** Move to the next pipeline challenge */
  const handleNext = useCallback(() => {
    const nextIdx = pipelineIdx + 1;
    if (nextIdx >= pipelines.length) {
      setPhase('done');
      setTimeout(() => onComplete(), 1200);
    } else {
      setPipelineIdx(nextIdx);
      setBelt([]);
      setRunProgress(-1);
      setRunSuccess(null);
      setPhase('build');
    }
  }, [pipelineIdx, pipelines.length, onComplete]);

  /** Retry the current pipeline */
  const handleRetry = useCallback(() => {
    setBelt([]);
    setRunProgress(-1);
    setRunSuccess(null);
    setPhase('build');
  }, []);

  // Machine lookup helper
  const getMachine = (id: string): Machine | undefined =>
    machines.find(m => m.id === id);

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
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Factory Floor
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

      {/* Pipeline progress */}
      <div className="flex gap-2 items-center">
        {pipelines.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < pipelineIdx
                ? 'var(--neon-green)'
                : i === pipelineIdx
                  ? 'var(--neon-gold)'
                  : 'var(--border-pixel)',
              boxShadow: i < pipelineIdx
                ? '0 0 6px var(--neon-green)'
                : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Current pipeline challenge */}
      {currentPipeline && phase !== 'done' && (
        <div
          className="border-2 p-2"
          style={{
            borderColor: 'var(--neon-blue)',
            background: 'var(--bg-panel)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-blue)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            Pattern: {currentPipeline.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            {currentPipeline.description}
          </div>
        </div>
      )}

      {/* Machine dock -- available machines to place */}
      {phase === 'build' && (
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
            Machine Dock {'\u2014'} click to place on belt
          </div>
          <div className="flex flex-wrap gap-1.5">
            {machines.map(machine => (
              <button
                key={machine.id}
                onClick={() => addToBelt(machine.id)}
                className="border-2 px-2 py-1.5 cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: 'var(--neon-green)',
                  borderColor: 'var(--border-bright)',
                  background: 'var(--bg-panel)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                <span style={{ fontSize: '14px', marginRight: '4px' }}>
                  {MACHINE_ICONS[machine.id] || '\u{2699}'}
                </span>
                {machine.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conveyor belt */}
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
          Conveyor Belt {'\u2192'}
        </div>
        <div
          className="flex items-center gap-0 p-2 border-2 overflow-x-auto"
          style={{
            borderColor: 'var(--border-bright)',
            background: 'var(--bg-void)',
            minHeight: '70px',
            animation: shaking ? 'glitch 0.3s linear' : undefined,
          }}
        >
          {/* Input hopper */}
          <div
            className="flex flex-col items-center px-2"
            style={{ minWidth: '40px' }}
          >
            <div style={{ fontSize: '18px' }}>{'\u{1F4E5}'}</div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '4px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
              }}
            >
              IN
            </div>
          </div>

          {belt.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                opacity: 0.5,
              }}
            >
              Place machines here...
            </div>
          ) : (
            belt.map((machineId, i) => {
              const machine = getMachine(machineId);
              const isProductHere = phase === 'running' && runProgress === i;
              const isProcessed = phase === 'running' && runProgress > i;
              const isFailed = !runSuccess && runSuccess !== null && runProgress === i && phase === 'result';

              return (
                <div key={`${machineId}-${i}`} className="flex items-center">
                  {/* Arrow connector */}
                  {i > 0 && (
                    <div
                      style={{
                        color: isProcessed
                          ? 'var(--neon-green)'
                          : 'var(--text-dim)',
                        fontSize: '12px',
                        padding: '0 2px',
                        transition: 'color 0.3s',
                      }}
                    >
                      {'\u2192'}
                    </div>
                  )}

                  {/* Machine block */}
                  <div
                    className="flex flex-col items-center border-2 px-2 py-1.5 relative"
                    style={{
                      borderColor: isFailed
                        ? 'var(--neon-coral)'
                        : isProductHere
                          ? 'var(--neon-gold)'
                          : isProcessed
                            ? 'var(--neon-green)'
                            : 'var(--border-bright)',
                      background: isFailed
                        ? 'rgba(255, 107, 107, 0.1)'
                        : isProductHere
                          ? 'rgba(255, 217, 61, 0.1)'
                          : isProcessed
                            ? 'rgba(0, 255, 65, 0.05)'
                            : 'var(--bg-panel)',
                      boxShadow: isProductHere
                        ? '0 0 12px var(--neon-gold)'
                        : isFailed
                          ? '0 0 10px var(--neon-coral)'
                          : 'none',
                      transition: 'all 0.3s',
                      minWidth: '56px',
                    }}
                  >
                    <div style={{ fontSize: '16px' }}>
                      {MACHINE_ICONS[machineId] || '\u{2699}'}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '4px',
                        color: isFailed
                          ? 'var(--neon-coral)'
                          : isProcessed
                            ? 'var(--neon-green)'
                            : 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textAlign: 'center',
                        maxWidth: '60px',
                      }}
                    >
                      {machine?.name ?? machineId}
                    </div>

                    {/* Product indicator */}
                    {isProductHere && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        style={{
                          fontSize: '12px',
                          animation: 'idle-bob 0.5s ease-in-out infinite',
                        }}
                      >
                        {'\u{1F4E6}'}
                      </div>
                    )}

                    {/* Jam indicator */}
                    {isFailed && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        style={{
                          fontSize: '12px',
                          animation: 'glitch 0.4s linear infinite',
                        }}
                      >
                        {'\u{1F4A5}'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Output chute */}
          <div className="flex items-center">
            {belt.length > 0 && (
              <div
                style={{
                  color: runSuccess ? 'var(--neon-green)' : 'var(--text-dim)',
                  fontSize: '12px',
                  padding: '0 2px',
                }}
              >
                {'\u2192'}
              </div>
            )}
            <div
              className="flex flex-col items-center px-2"
              style={{ minWidth: '40px' }}
            >
              <div style={{ fontSize: '18px' }}>
                {runSuccess ? '\u{2705}' : '\u{1F4E4}'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '4px',
                  color: runSuccess ? 'var(--neon-green)' : 'var(--text-dim)',
                  textTransform: 'uppercase',
                }}
              >
                OUT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {phase === 'build' && (
        <div className="flex gap-2">
          <PixelButton
            onClick={handleRun}
            disabled={belt.length === 0}
            variant="success"
          >
            {'\u25B6'} Run Pipeline
          </PixelButton>
          <PixelButton
            onClick={removeFromBelt}
            disabled={belt.length === 0}
            size="sm"
          >
            Undo
          </PixelButton>
          <PixelButton
            onClick={clearBelt}
            disabled={belt.length === 0}
            variant="danger"
            size="sm"
          >
            Clear
          </PixelButton>
        </div>
      )}

      {/* Result display */}
      {phase === 'result' && (
        <div className="flex flex-col gap-3">
          <div
            className="border-2 p-3"
            style={{
              borderColor: runSuccess ? 'var(--neon-green)' : 'var(--neon-coral)',
              background: 'var(--bg-panel)',
              boxShadow: `0 0 8px ${runSuccess ? 'var(--neon-green)' : 'var(--neon-coral)'}`,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: runSuccess ? 'var(--neon-green)' : 'var(--neon-coral)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '6px',
              }}
            >
              {runSuccess ? '\u2714 Pipeline Success!' : '\u2717 Pipeline Jam!'}
            </div>
            {!runSuccess && currentPipeline && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ color: 'var(--neon-green)', marginBottom: '4px' }}>
                  Correct order: {currentPipeline.correctOrder.map(id => getMachine(id)?.name ?? id).join(' \u2192 ')}
                </div>
                Your order: {belt.map(id => getMachine(id)?.name ?? id).join(' \u2192 ')}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {runSuccess ? (
              <PixelButton onClick={handleNext} variant="success">
                {pipelineIdx + 1 >= pipelines.length ? 'Finish!' : 'Next Pattern'}
              </PixelButton>
            ) : (
              <PixelButton onClick={handleRetry} variant="danger">
                Try Again
              </PixelButton>
            )}
          </div>
        </div>
      )}

      {/* Running indicator */}
      {phase === 'running' && (
        <div
          className="text-center"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            animation: 'idle-bob 0.8s ease-in-out infinite',
          }}
        >
          Processing...
        </div>
      )}

      {/* Done phase */}
      {phase === 'done' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '0 0 12px var(--neon-green)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            Pipeline Engineer!
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
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {pipelines.length} patterns mastered
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
