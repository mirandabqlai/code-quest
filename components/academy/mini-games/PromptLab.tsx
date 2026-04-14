'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface PromptOption {
  text: string;
  quality: number;       // 0-100
  explanation: string;
}

interface PromptLabProps {
  task: string;
  prompts: PromptOption[];
  onComplete: () => void;
}

/** Phases the mini-game moves through. */
type Phase = 'choose' | 'thinking' | 'result' | 'sliders' | 'done';

/**
 * Prompt Lab — Module 2: "Talking to AI"
 *
 * The player sees a task and three prompt cards (bad / ok / great).
 * After choosing one, an animated "AI thinking" sequence plays.
 * Then sliders for Specificity, Context, and Examples let the player
 * tweak their prompt quality. The final score determines XP.
 */
export default function PromptLab({ task, prompts, onComplete }: PromptLabProps) {
  const [phase, setPhase] = useState<Phase>('choose');
  const [chosen, setChosen] = useState<number | null>(null);
  const [thinkingDots, setThinkingDots] = useState('');
  const [thinkingStep, setThinkingStep] = useState(0);

  // Slider values — each 0-100
  const [specificity, setSpecificity] = useState(50);
  const [context, setContext] = useState(50);
  const [examples, setExamples] = useState(50);
  const [finalScore, setFinalScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const thinkingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sort prompts by quality so we can label them bad / ok / great
  const sortedPrompts = [...prompts].sort((a, b) => a.quality - b.quality);

  // Quality label for a prompt based on its quality value
  const qualityLabel = (q: number): string =>
    q >= 70 ? 'GREAT' : q >= 40 ? 'OK' : 'WEAK';
  const qualityColor = (q: number): string =>
    q >= 70 ? 'var(--neon-green)' : q >= 40 ? 'var(--neon-gold)' : 'var(--neon-coral)';

  // "AI thinking" steps — these simulate the model reasoning
  const thinkingSteps = [
    'Parsing prompt...',
    'Loading context window...',
    'Tokenizing input...',
    'Running attention layers...',
    'Generating response...',
  ];

  // --- thinking animation ---
  useEffect(() => {
    if (phase !== 'thinking') return;

    let dotCount = 0;
    let stepIdx = 0;

    thinkingInterval.current = setInterval(() => {
      dotCount++;
      if (dotCount % 4 === 0) {
        stepIdx++;
        if (stepIdx >= thinkingSteps.length) {
          // Done thinking — move to result
          if (thinkingInterval.current) clearInterval(thinkingInterval.current);
          setPhase('result');
          return;
        }
        setThinkingStep(stepIdx);
      }
      setThinkingDots('.'.repeat((dotCount % 3) + 1));
    }, 300);

    return () => {
      if (thinkingInterval.current) clearInterval(thinkingInterval.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // --- handlers ---
  const handleChoose = useCallback((index: number) => {
    setChosen(index);
    setThinkingStep(0);
    setThinkingDots('');
    setPhase('thinking');
  }, []);

  const handleContinueToSliders = useCallback(() => {
    setPhase('sliders');
  }, []);

  const handleSubmitSliders = useCallback(() => {
    if (chosen === null) return;
    const baseQuality = prompts[chosen].quality;
    // Sliders add up to 30 bonus points (10 each at max)
    const sliderBonus = Math.round(
      (specificity / 100) * 10 +
      (context / 100) * 10 +
      (examples / 100) * 10
    );
    const total = Math.min(baseQuality + sliderBonus, 100);
    setFinalScore(total);
    setPhase('done');
    setTimeout(() => onComplete(), 1200);
  }, [chosen, prompts, specificity, context, examples, onComplete]);

  // --- render helpers ---
  const renderChoosePhase = () => (
    <>
      {/* Task description */}
      <div
        className="border-2 p-3"
        style={{ borderColor: 'var(--neon-blue)', background: 'var(--bg-panel)' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}
        >
          Your Task
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
          }}
        >
          &ldquo;{task}&rdquo;
        </div>
      </div>

      {/* Prompt cards */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Pick a prompt:
      </div>
      <div className="flex flex-col gap-2">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleChoose(i)}
            className="border-2 p-3 text-left cursor-pointer transition-all hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--border-bright)',
              background: 'var(--bg-panel)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = qualityColor(p.quality);
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 8px ${qualityColor(p.quality)}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
              }}
            >
              &ldquo;{p.text}&rdquo;
            </div>
          </button>
        ))}
      </div>
    </>
  );

  const renderThinkingPhase = () => (
    <div
      className="flex flex-col items-center justify-center gap-4 py-8"
      style={{ minHeight: '180px' }}
    >
      {/* Brain / processor icon */}
      <div
        style={{
          fontSize: '32px',
          animation: 'idle-bob 1s ease-in-out infinite',
        }}
      >
        {'\u{1F9E0}'}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--neon-green)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        AI Processing{thinkingDots}
      </div>
      {/* Step progress */}
      <div className="flex flex-col gap-1 w-full max-w-xs">
        {thinkingSteps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: i < thinkingStep
                ? 'var(--neon-green)'
                : i === thinkingStep
                  ? 'var(--neon-gold)'
                  : 'var(--text-dim)',
              opacity: i <= thinkingStep ? 1 : 0.3,
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            <span>{i < thinkingStep ? '\u2714' : i === thinkingStep ? '\u25B6' : '\u25CB'}</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );

  const renderResultPhase = () => {
    if (chosen === null) return null;
    const p = prompts[chosen];
    return (
      <div className="flex flex-col gap-3">
        <div
          className="border-2 p-3"
          style={{
            borderColor: qualityColor(p.quality),
            background: 'var(--bg-panel)',
            boxShadow: `0 0 10px ${qualityColor(p.quality)}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: qualityColor(p.quality),
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {qualityLabel(p.quality)} Prompt
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: qualityColor(p.quality),
              }}
            >
              {p.quality}/100
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            &ldquo;{p.text}&rdquo;
          </div>
        </div>

        {/* Explanation toggle */}
        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="text-left"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--neon-blue)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          {showExplanation ? '\u25BC' : '\u25B6'} Why?
        </button>
        {showExplanation && (
          <div
            className="p-2 border"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-dim)',
              lineHeight: '1.5',
              borderColor: 'var(--border-pixel)',
              background: 'var(--bg-void)',
            }}
          >
            {p.explanation}
          </div>
        )}

        <PixelButton onClick={handleContinueToSliders}>
          Tune the Prompt
        </PixelButton>
      </div>
    );
  };

  const renderSlidersPhase = () => {
    // Combined quality preview
    if (chosen === null) return null;
    const baseQuality = prompts[chosen].quality;
    const sliderBonus = Math.round(
      (specificity / 100) * 10 +
      (context / 100) * 10 +
      (examples / 100) * 10
    );
    const preview = Math.min(baseQuality + sliderBonus, 100);

    return (
      <div className="flex flex-col gap-4">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Adjust sliders to improve your prompt:
        </div>

        {/* Sliders */}
        {[
          { label: 'Specificity', value: specificity, setter: setSpecificity, color: 'var(--neon-green)' },
          { label: 'Context', value: context, setter: setContext, color: 'var(--neon-blue)' },
          { label: 'Examples', value: examples, setter: setExamples, color: 'var(--neon-purple)' },
        ].map(({ label, value, setter, color }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: 'var(--text-dim)',
                }}
              >
                {value}%
              </div>
            </div>
            <div className="relative h-4 rounded" style={{ background: 'var(--bg-void)' }}>
              <div
                className="absolute top-0 left-0 h-full rounded"
                style={{
                  width: `${value}%`,
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                  transition: 'width 0.15s',
                }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={e => setter(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: '100%' }}
              />
            </div>
          </div>
        ))}

        {/* Quality preview */}
        <div
          className="flex items-center justify-between p-2 border-2"
          style={{
            borderColor: qualityColor(preview),
            background: 'var(--bg-panel)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Final Quality
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: qualityColor(preview),
              textShadow: `0 0 8px ${qualityColor(preview)}`,
            }}
          >
            {preview}/100
          </div>
        </div>

        <PixelButton onClick={handleSubmitSliders} variant="success">
          Submit Prompt
        </PixelButton>
      </div>
    );
  };

  const renderDonePhase = () => (
    <div
      className="flex flex-col items-center gap-3 py-6"
    >
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: finalScore >= 70 ? 'var(--neon-green)' : finalScore >= 40 ? 'var(--neon-gold)' : 'var(--neon-coral)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: `0 0 12px ${finalScore >= 70 ? 'var(--neon-green)' : 'var(--neon-gold)'}`,
          animation: 'pulse 1.5s infinite',
        }}
      >
        {finalScore >= 70 ? 'Excellent Prompt!' : finalScore >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '18px',
          color: 'var(--neon-gold)',
          textShadow: '0 0 16px var(--neon-gold)',
        }}
      >
        {finalScore}/100
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
  );

  // --- main render ---
  return (
    <div
      className="flex flex-col gap-4 p-4 border-2 rounded"
      style={{
        borderColor: 'var(--border-pixel)',
        background: 'var(--bg-dark)',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--neon-purple)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Prompt Lab
      </div>

      {phase === 'choose' && renderChoosePhase()}
      {phase === 'thinking' && renderThinkingPhase()}
      {phase === 'result' && renderResultPhase()}
      {phase === 'sliders' && renderSlidersPhase()}
      {phase === 'done' && renderDonePhase()}
    </div>
  );
}
