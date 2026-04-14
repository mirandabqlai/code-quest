'use client';

import { useState, useCallback } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface StrategyOption {
  choice: string;
  score: number;          // 1-5 stars
  explanation: string;
}

interface Scenario {
  task: string;
  options: StrategyOption[];
}

interface ChatStrategistProps {
  scenarios: Scenario[];
  onComplete: () => void;
}

type Phase = 'scenario' | 'result' | 'done';

/**
 * Chat Strategist — Module 8: "AI Chat"
 *
 * Scenario cards come in one at a time. Each scenario has 3-4 strategy
 * options (new chat, continue existing, use project, attach file, etc.).
 * The player picks one and sees a star rating + explanation of how good
 * the choice was. Teaches when to use different chat strategies.
 */
export default function ChatStrategist({ scenarios, onComplete }: ChatStrategistProps) {
  // --- state ---
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('scenario');
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossible, setMaxPossible] = useState(0);
  const [history, setHistory] = useState<{ scenario: string; choice: string; stars: number }[]>([]);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const currentScenario = scenarios[scenarioIdx] ?? null;

  // Strategy icon mapping — visual hint about each strategy type
  const strategyIcons: Record<string, string> = {
    'new chat': '\u{1F4AC}',         // speech bubble
    'continue': '\u{1F501}',         // repeat
    'project': '\u{1F4C2}',          // folder
    'attach file': '\u{1F4CE}',      // paperclip
    'web search': '\u{1F50D}',       // magnifying glass
    'code review': '\u{1F4DD}',      // memo
    'screenshot': '\u{1F4F7}',       // camera
  };

  // Try to match a strategy icon from the choice text
  const getIcon = (choice: string): string => {
    const lower = choice.toLowerCase();
    for (const [key, icon] of Object.entries(strategyIcons)) {
      if (lower.includes(key)) return icon;
    }
    return '\u{2728}'; // sparkle fallback
  };

  // Star color based on score
  const starColor = (stars: number): string =>
    stars >= 4 ? 'var(--neon-green)' : stars >= 3 ? 'var(--neon-gold)' : 'var(--neon-coral)';

  // Star label
  const starLabel = (stars: number): string =>
    stars === 5 ? 'PERFECT!'
    : stars === 4 ? 'GREAT!'
    : stars === 3 ? 'GOOD'
    : stars === 2 ? 'OK'
    : 'NOT IDEAL';

  // --- handlers ---
  const handleChoose = useCallback((optionIdx: number) => {
    if (!currentScenario || phase !== 'scenario') return;

    const option = currentScenario.options[optionIdx];
    setChosenOption(optionIdx);
    setTotalScore(prev => prev + option.score);
    // Track max possible score — the best option in each scenario
    const bestScore = Math.max(...currentScenario.options.map(o => o.score));
    setMaxPossible(prev => prev + bestScore);
    setHistory(prev => [...prev, {
      scenario: currentScenario.task,
      choice: option.choice,
      stars: option.score,
    }]);
    setPhase('result');
  }, [currentScenario, phase]);

  const handleNext = useCallback(() => {
    const nextIdx = scenarioIdx + 1;
    if (nextIdx >= scenarios.length) {
      setPhase('done');
      setTimeout(() => onComplete(), 1500);
    } else {
      setScenarioIdx(nextIdx);
      setChosenOption(null);
      setPhase('scenario');
      setHoveredOption(null);
    }
  }, [scenarioIdx, scenarios.length, onComplete]);

  // Render stars
  const renderStars = (count: number, maxStars: number = 5) => (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '14px',
            color: i < count ? starColor(count) : 'var(--border-pixel)',
            textShadow: i < count ? `0 0 6px ${starColor(count)}` : 'none',
            transition: 'all 0.3s',
            transitionDelay: `${i * 0.1}s`,
          }}
        >
          {i < count ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
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
          Chat Strategist
        </div>
        <div className="flex items-center gap-3">
          {scenarioIdx > 0 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--text-dim)',
              }}
            >
              {scenarioIdx + (phase === 'done' ? 0 : 0)}/{scenarios.length}
            </div>
          )}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
            }}
          >
            {'\u2605'} {totalScore}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 items-center">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < scenarioIdx
                ? history[i]
                  ? starColor(history[i].stars)
                  : 'var(--neon-green)'
                : i === scenarioIdx && phase !== 'done'
                  ? 'var(--neon-gold)'
                  : i === scenarioIdx && phase === 'done'
                    ? history[i]
                      ? starColor(history[i].stars)
                      : 'var(--neon-green)'
                    : 'var(--border-pixel)',
              boxShadow: i <= scenarioIdx ? `0 0 4px var(--neon-green)` : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Scenario phase — show the task and options */}
      {phase === 'scenario' && currentScenario && (
        <>
          {/* Scenario card */}
          <div
            className="border-2 p-3"
            style={{
              borderColor: 'var(--neon-blue)',
              background: 'var(--bg-panel)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-blue)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px',
              }}
            >
              Scenario {scenarioIdx + 1}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}
            >
              {currentScenario.task}
            </div>
          </div>

          {/* Strategy options */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Pick your strategy:
          </div>
          <div className="flex flex-col gap-2">
            {currentScenario.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                onMouseEnter={() => setHoveredOption(i)}
                onMouseLeave={() => setHoveredOption(null)}
                className="border-2 p-3 text-left transition-all"
                style={{
                  borderColor: hoveredOption === i ? 'var(--neon-blue)' : 'var(--border-bright)',
                  background: 'var(--bg-panel)',
                  cursor: 'pointer',
                  boxShadow: hoveredOption === i ? '0 0 8px var(--neon-blue)' : 'none',
                  transform: hoveredOption === i ? 'translateY(-1px)' : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '16px' }}>
                    {getIcon(option.choice)}
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                    }}
                  >
                    {option.choice}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Result phase — show star rating and explanation */}
      {phase === 'result' && currentScenario && chosenOption !== null && (
        <div className="flex flex-col gap-3">
          {/* Chosen option with result */}
          <div
            className="border-2 p-3"
            style={{
              borderColor: starColor(currentScenario.options[chosenOption].score),
              background: 'var(--bg-panel)',
              boxShadow: `0 0 10px ${starColor(currentScenario.options[chosenOption].score)}`,
            }}
          >
            {/* Stars */}
            <div className="flex items-center justify-between mb-2">
              {renderStars(currentScenario.options[chosenOption].score)}
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: starColor(currentScenario.options[chosenOption].score),
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {starLabel(currentScenario.options[chosenOption].score)}
              </div>
            </div>

            {/* Chosen strategy */}
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '14px' }}>
                {getIcon(currentScenario.options[chosenOption].choice)}
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              >
                {currentScenario.options[chosenOption].choice}
              </div>
            </div>

            {/* Explanation */}
            <div
              className="p-2 border mt-1"
              style={{
                borderColor: 'var(--border-pixel)',
                background: 'var(--bg-void)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  lineHeight: '1.5',
                }}
              >
                {currentScenario.options[chosenOption].explanation}
              </div>
            </div>
          </div>

          {/* Show all options with their star ratings (so player learns) */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              All Options:
            </div>
            {currentScenario.options.map((option, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 border"
                style={{
                  borderColor: i === chosenOption ? starColor(option.score) : 'var(--border-pixel)',
                  background: i === chosenOption ? 'var(--bg-panel)' : 'transparent',
                }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '8px',
                        color: s < option.score ? starColor(option.score) : 'var(--border-pixel)',
                      }}
                    >
                      {s < option.score ? '\u2605' : '\u2606'}
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: i === chosenOption ? 'var(--text-primary)' : 'var(--text-dim)',
                    flex: 1,
                  }}
                >
                  {option.choice}
                </span>
                {i === chosenOption && (
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: starColor(option.score),
                      textTransform: 'uppercase',
                    }}
                  >
                    YOUR PICK
                  </span>
                )}
              </div>
            ))}
          </div>

          <PixelButton onClick={handleNext} variant="success">
            {scenarioIdx + 1 >= scenarios.length ? 'See Results' : 'Next Scenario'}
          </PixelButton>
        </div>
      )}

      {/* Done phase — final score summary */}
      {phase === 'done' && (
        <div className="flex flex-col gap-3 items-center py-4">
          {/* Overall score */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: totalScore / maxPossible >= 0.8
                ? 'var(--neon-green)'
                : totalScore / maxPossible >= 0.5
                  ? 'var(--neon-gold)'
                  : 'var(--neon-coral)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: `0 0 12px ${
                totalScore / maxPossible >= 0.8 ? 'var(--neon-green)' : 'var(--neon-gold)'
              }`,
              animation: 'pulse 1.5s infinite',
            }}
          >
            {totalScore / maxPossible >= 0.8
              ? 'Chat Expert!'
              : totalScore / maxPossible >= 0.5
                ? 'Good Strategy!'
                : 'Keep Practicing!'}
          </div>

          {/* Star total */}
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '16px',
              color: 'var(--neon-gold)',
              textShadow: '0 0 12px var(--neon-gold)',
            }}
          >
            {'\u2605'} {totalScore} / {maxPossible}
          </div>

          {/* History recap */}
          <div className="flex flex-col gap-1 w-full mt-2">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Recap
            </div>
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 border"
                style={{
                  borderColor: 'var(--border-pixel)',
                  background: 'var(--bg-void)',
                }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '7px',
                        color: s < entry.stars ? starColor(entry.stars) : 'var(--border-pixel)',
                      }}
                    >
                      {s < entry.stars ? '\u2605' : '\u2606'}
                    </span>
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.choice}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '4px',
            }}
          >
            Module Complete!
          </div>
        </div>
      )}
    </div>
  );
}
