'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface StageOption {
  text: string;
  correct: boolean;
  explanation: string;
}

interface Stage {
  title: string;
  type: string;         // e.g. 'model', 'prompt', 'tools', 'mcp', 'errors'
  options: StageOption[];
}

interface FinalMissionProps {
  stages: Stage[];
  onComplete: () => void;
}

/** Map stage types to icons for visual flair */
const STAGE_ICONS: Record<string, string> = {
  model: '\u{1F916}',
  prompt: '\u{1F4DD}',
  tools: '\u{1F9F0}',
  mcp: '\u{1F50C}',
  errors: '\u{1F6A8}',
};

/** Color per stage type */
const STAGE_COLORS: Record<string, string> = {
  model: 'var(--neon-blue)',
  prompt: 'var(--neon-purple)',
  tools: 'var(--neon-green)',
  mcp: 'var(--neon-coral)',
  errors: 'var(--neon-gold)',
};

type Phase = 'intro' | 'stage' | 'feedback' | 'transition' | 'celebration' | 'done';

/**
 * Final Mission -- Module 17: Graduation
 *
 * A multi-stage boss battle combining all academy concepts. Each stage is
 * a simplified challenge from an earlier module (choose a model, pick the
 * best prompt, select tools, connect an MCP server, spot errors). The
 * player has 3-4 options per stage. A running score accumulates across
 * stages. Big celebration animation at the end.
 */
export default function FinalMission({ stages, onComplete }: FinalMissionProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stageIdx, setStageIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [stageResults, setStageResults] = useState<('correct' | 'wrong')[]>([]);
  const [combo, setCombo] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);

  // Celebration state
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);
  const [titleGlitch, setTitleGlitch] = useState(false);
  const glitchRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStage = stages[stageIdx] ?? null;
  const stageColor = currentStage ? (STAGE_COLORS[currentStage.type] || 'var(--neon-blue)') : 'var(--neon-blue)';
  const stageIcon = currentStage ? (STAGE_ICONS[currentStage.type] || '\u{2B50}') : '\u{2B50}';

  // Calculate total possible score on mount
  useEffect(() => {
    setTotalPossible(stages.length * 100);
  }, [stages.length]);

  // Celebration particles
  const spawnParticles = useCallback(() => {
    const colors = ['var(--neon-green)', 'var(--neon-gold)', 'var(--neon-purple)', 'var(--neon-blue)', 'var(--neon-coral)'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  // Title glitch effect during celebration
  useEffect(() => {
    if (phase === 'celebration') {
      glitchRef.current = setInterval(() => {
        setTitleGlitch(true);
        setTimeout(() => setTitleGlitch(false), 150);
      }, 2000);
    }
    return () => {
      if (glitchRef.current) clearInterval(glitchRef.current);
    };
  }, [phase]);

  // --- handlers ---
  const handleStartMission = useCallback(() => {
    setPhase('stage');
  }, []);

  const handleChoose = useCallback((optionIdx: number) => {
    if (phase !== 'stage' || !currentStage) return;

    setChosen(optionIdx);
    const option = currentStage.options[optionIdx];
    const isCorrect = option.correct;

    if (isCorrect) {
      const comboBonus = combo * 20;
      setScore(s => s + 100 + comboBonus);
      setCombo(c => c + 1);
      setStageResults(prev => [...prev, 'correct']);
    } else {
      setCombo(0);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
      setStageResults(prev => [...prev, 'wrong']);
    }

    setPhase('feedback');
  }, [phase, currentStage, combo]);

  const handleNextStage = useCallback(() => {
    const nextIdx = stageIdx + 1;

    if (nextIdx >= stages.length) {
      // All stages done -- celebration!
      spawnParticles();
      setPhase('celebration');
      setTimeout(() => {
        setPhase('done');
        setTimeout(() => onComplete(), 800);
      }, 4000);
    } else {
      // Brief transition animation between stages
      setPhase('transition');
      setChosen(null);
      setTimeout(() => {
        setStageIdx(nextIdx);
        setPhase('stage');
      }, 800);
    }
  }, [stageIdx, stages.length, onComplete, spawnParticles]);

  // Score percentage for end screen
  const scorePercent = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
  const grade =
    scorePercent >= 90 ? 'S'
    : scorePercent >= 70 ? 'A'
    : scorePercent >= 50 ? 'B'
    : scorePercent >= 30 ? 'C'
    : 'D';
  const gradeColor =
    grade === 'S' ? 'var(--neon-gold)'
    : grade === 'A' ? 'var(--neon-green)'
    : grade === 'B' ? 'var(--neon-blue)'
    : 'var(--neon-coral)';

  // --- render ---
  return (
    <div
      className="flex flex-col gap-4 p-4 border-2 rounded relative overflow-hidden"
      style={{
        borderColor: phase === 'celebration'
          ? 'var(--neon-gold)'
          : shakeWrong
            ? 'var(--neon-coral)'
            : 'var(--border-pixel)',
        background: 'var(--bg-dark)',
        transition: 'border-color 0.3s',
        animation: shakeWrong ? 'glitch 0.3s linear' : undefined,
        minHeight: '320px',
      }}
    >
      {/* Celebration particles overlay */}
      {phase === 'celebration' && particles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '6px',
            height: '6px',
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `float-up 2s ${p.delay}s ease-out forwards`,
            zIndex: 10,
          }}
        />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: phase === 'intro' ? '12px' : '10px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: phase === 'intro' || phase === 'celebration'
              ? '0 0 12px var(--neon-gold)'
              : 'none',
            animation: titleGlitch ? 'glitch 0.15s linear' : undefined,
            transition: 'font-size 0.3s',
          }}
        >
          {phase === 'intro' ? 'The Final Mission' : 'Final Mission'}
        </div>
        {phase !== 'intro' && phase !== 'done' && (
          <div className="flex items-center gap-3">
            {combo > 1 && (
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: 'var(--neon-purple)',
                  animation: 'idle-bob 0.8s ease-in-out infinite',
                }}
              >
                {combo}x COMBO
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
        )}
      </div>

      {/* === INTRO PHASE === */}
      {phase === 'intro' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div
            style={{
              fontSize: '48px',
              animation: 'idle-bob 2s ease-in-out infinite',
            }}
          >
            {'\u{1F3AE}'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center',
              textShadow: '0 0 8px var(--neon-gold)',
            }}
          >
            Ship an AI Feature for a Real App
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: '1.6',
              maxWidth: '400px',
            }}
          >
            Everything you have learned comes together now. Choose the right model,
            craft the prompt, pick your tools, connect services, and catch the errors.
            {stages.length} stages stand between you and graduation.
          </div>

          {/* Stage preview */}
          <div className="flex gap-2 mt-2">
            {stages.map((stage, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 border px-2 py-1.5"
                style={{
                  borderColor: STAGE_COLORS[stage.type] || 'var(--border-pixel)',
                  background: 'var(--bg-panel)',
                }}
              >
                <div style={{ fontSize: '16px' }}>
                  {STAGE_ICONS[stage.type] || '\u{2B50}'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '4px',
                    color: STAGE_COLORS[stage.type] || 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textAlign: 'center',
                    maxWidth: '50px',
                  }}
                >
                  {stage.title}
                </div>
              </div>
            ))}
          </div>

          <PixelButton onClick={handleStartMission} variant="success">
            Begin Mission
          </PixelButton>
        </div>
      )}

      {/* === STAGE PROGRESS BAR === */}
      {phase !== 'intro' && phase !== 'done' && (
        <div className="flex gap-1 items-center">
          {stages.map((stage, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-0.5"
            >
              <div
                className="w-full h-2 rounded-sm"
                style={{
                  background: i < stageIdx
                    ? stageResults[i] === 'correct'
                      ? 'var(--neon-green)'
                      : 'var(--neon-coral)'
                    : i === stageIdx
                      ? 'var(--neon-gold)'
                      : 'var(--border-pixel)',
                  boxShadow: i === stageIdx
                    ? '0 0 6px var(--neon-gold)'
                    : i < stageIdx && stageResults[i] === 'correct'
                      ? '0 0 4px var(--neon-green)'
                      : 'none',
                  transition: 'all 0.3s',
                }}
              />
              <div
                style={{
                  fontSize: '8px',
                  opacity: i <= stageIdx ? 1 : 0.3,
                }}
              >
                {STAGE_ICONS[stage.type] || '\u{2B50}'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === STAGE PHASE === */}
      {phase === 'stage' && currentStage && (
        <div className="flex flex-col gap-3">
          {/* Stage header */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center border-2"
              style={{
                width: '36px',
                height: '36px',
                borderColor: stageColor,
                background: 'var(--bg-panel)',
                boxShadow: `0 0 8px ${stageColor}`,
                fontSize: '18px',
              }}
            >
              {stageIcon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Stage {stageIdx + 1} of {stages.length}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: stageColor,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {currentStage.title}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {currentStage.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                className="border-2 p-3 text-left cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--border-bright)',
                  background: 'var(--bg-panel)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = stageColor;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${stageColor}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center border"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderColor: stageColor,
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: stageColor,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                    }}
                  >
                    {option.text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === FEEDBACK PHASE === */}
      {phase === 'feedback' && currentStage && chosen !== null && (
        <div className="flex flex-col gap-3">
          {/* Result banner */}
          <div
            className="border-2 p-3"
            style={{
              borderColor: currentStage.options[chosen].correct
                ? 'var(--neon-green)'
                : 'var(--neon-coral)',
              background: currentStage.options[chosen].correct
                ? 'rgba(0, 255, 65, 0.08)'
                : 'rgba(255, 107, 107, 0.08)',
              boxShadow: `0 0 10px ${currentStage.options[chosen].correct ? 'var(--neon-green)' : 'var(--neon-coral)'}`,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: currentStage.options[chosen].correct ? 'var(--neon-green)' : 'var(--neon-coral)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '6px',
              }}
            >
              {currentStage.options[chosen].correct ? '\u2714 Correct!' : '\u2717 Not quite!'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
                marginBottom: '6px',
              }}
            >
              You chose: {currentStage.options[chosen].text}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-dim)',
                lineHeight: '1.5',
              }}
            >
              {currentStage.options[chosen].explanation}
            </div>
          </div>

          {/* Show all options with correct highlighted */}
          <div className="flex flex-col gap-1">
            {currentStage.options.map((option, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: option.correct
                    ? 'var(--neon-green)'
                    : i === chosen
                      ? 'var(--neon-coral)'
                      : 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: option.correct || i === chosen ? 1 : 0.5,
                }}
              >
                <span>
                  {option.correct ? '\u2714' : i === chosen ? '\u2717' : '\u25CB'}
                </span>
                {String.fromCharCode(65 + i)}: {option.text}
              </div>
            ))}
          </div>

          {/* Score update */}
          {currentStage.options[chosen].correct && combo > 1 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center',
                animation: 'idle-bob 0.8s ease-in-out infinite',
              }}
            >
              +{100 + (combo - 1) * 20} pts ({combo}x combo!)
            </div>
          )}

          <PixelButton
            onClick={handleNextStage}
            variant={stageIdx + 1 >= stages.length ? 'success' : 'default'}
          >
            {stageIdx + 1 >= stages.length ? 'See Results' : 'Next Stage'}
          </PixelButton>
        </div>
      )}

      {/* === TRANSITION PHASE === */}
      {phase === 'transition' && (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div
            style={{
              fontSize: '32px',
              animation: 'idle-bob 0.6s ease-in-out infinite',
            }}
          >
            {STAGE_ICONS[stages[stageIdx + 1]?.type] || '\u{2B50}'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              animation: 'pulse 0.8s infinite',
            }}
          >
            Stage {stageIdx + 2}
          </div>
        </div>
      )}

      {/* === CELEBRATION PHASE === */}
      {phase === 'celebration' && (
        <div className="flex flex-col items-center justify-center gap-4 py-6 relative z-20">
          <div
            style={{
              fontSize: '48px',
              animation: 'idle-bob 1s ease-in-out infinite',
            }}
          >
            {'\u{1F393}'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              color: 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textShadow: '0 0 20px var(--neon-gold), 0 0 40px rgba(255,217,61,0.4)',
              animation: titleGlitch ? 'glitch 0.15s linear' : 'pulse 1.5s infinite',
              textAlign: 'center',
            }}
          >
            Graduated!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'center',
            }}
          >
            You completed all {stages.length} stages
          </div>

          {/* Grade display */}
          <div
            className="flex items-center justify-center border-2"
            style={{
              width: '60px',
              height: '60px',
              borderColor: gradeColor,
              background: 'var(--bg-panel)',
              boxShadow: `0 0 20px ${gradeColor}`,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '28px',
                color: gradeColor,
                textShadow: `0 0 12px ${gradeColor}`,
              }}
            >
              {grade}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '18px',
              color: 'var(--neon-gold)',
              textShadow: '0 0 16px var(--neon-gold)',
            }}
          >
            {score} / {totalPossible}
          </div>

          {/* Stage breakdown */}
          <div className="flex gap-3">
            {stageResults.map((result, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
              >
                <div
                  style={{
                    fontSize: '14px',
                    opacity: result === 'correct' ? 1 : 0.5,
                  }}
                >
                  {STAGE_ICONS[stages[i].type] || '\u{2B50}'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: result === 'correct' ? 'var(--neon-green)' : 'var(--neon-coral)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {result === 'correct' ? '\u2714' : '\u2717'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === DONE PHASE === */}
      {phase === 'done' && (
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
            AI Academy Graduate!
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
            Academy Complete!
          </div>
        </div>
      )}
    </div>
  );
}
