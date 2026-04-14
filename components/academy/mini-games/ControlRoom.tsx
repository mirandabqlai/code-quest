'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Setting {
  name: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface Scenario {
  task: string;
  settings: Setting[];
}

interface ControlRoomProps {
  scenarios: Scenario[];
  onComplete: () => void;
}

type AgentStatus = 'idle' | 'running' | 'success' | 'too-permissive' | 'too-restrictive';

/**
 * ControlRoom — Module 12: "The Harness"
 *
 * A dashboard with dials and switches for agent settings. The player
 * configures: model picker, temperature, permission toggles (Read,
 * Edit, Bash — each set to auto or ask). Then the agent "runs" the
 * task. Too permissive = agent does something wrong. Too restrictive
 * = agent keeps asking and times out. Find the sweet spot.
 */
export default function ControlRoom({ scenarios, onComplete }: ControlRoomProps) {
  // --- state ---
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [score, setScore] = useState(0);
  const [runProgress, setRunProgress] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentScenario = scenarios[scenarioIdx] ?? null;

  // Initialize selections when scenario changes
  useEffect(() => {
    if (!currentScenario) return;
    const defaults: Record<string, string> = {};
    currentScenario.settings.forEach(s => {
      // Start with the first option (not necessarily correct)
      defaults[s.name] = s.options[0];
    });
    setSelections(defaults);
    setAgentStatus('idle');
    setRunProgress(0);
    setFeedback(null);
    setShowExplanations(false);
  }, [scenarioIdx, currentScenario]);

  // --- handlers ---
  const handleSettingChange = useCallback((name: string, value: string) => {
    if (agentStatus !== 'idle') return;
    setSelections(prev => ({ ...prev, [name]: value }));
  }, [agentStatus]);

  const handleRunAgent = useCallback(() => {
    if (!currentScenario || agentStatus !== 'idle') return;

    // Check how many settings are correct
    let correctCount = 0;
    currentScenario.settings.forEach(s => {
      if (selections[s.name] === s.correct) correctCount++;
    });

    const totalSettings = currentScenario.settings.length;
    const accuracy = correctCount / totalSettings;

    setAgentStatus('running');
    setRunProgress(0);

    // Simulate agent running with a progress bar
    let progress = 0;
    runIntervalRef.current = setInterval(() => {
      progress += 2;
      setRunProgress(progress);

      if (progress >= 100) {
        if (runIntervalRef.current) clearInterval(runIntervalRef.current);

        // Determine outcome based on accuracy
        if (accuracy >= 0.8) {
          // Good config!
          setAgentStatus('success');
          const points = Math.round(accuracy * 150);
          setScore(prev => prev + points);
          setFeedback(`Agent completed the task successfully! +${points} pts`);
        } else if (accuracy >= 0.4) {
          // Mediocre — figure out what went wrong
          const wrongSettings = currentScenario.settings.filter(
            s => selections[s.name] !== s.correct
          );
          // Determine if too permissive or too restrictive
          const hasPermissive = wrongSettings.some(s =>
            s.correct === 'ask' && selections[s.name] === 'auto'
          );
          if (hasPermissive) {
            setAgentStatus('too-permissive');
            setFeedback('The agent had too much freedom and made a mistake! Some permissions should be more restrictive.');
          } else {
            setAgentStatus('too-restrictive');
            setFeedback('The agent kept asking for permission and timed out! Some settings are too locked down.');
          }
          // Partial credit
          const points = Math.round(accuracy * 50);
          setScore(prev => prev + points);
        } else {
          // Bad config
          const hasPermissive = currentScenario.settings.some(
            s => s.correct === 'ask' && selections[s.name] === 'auto'
          );
          if (hasPermissive) {
            setAgentStatus('too-permissive');
            setFeedback('Danger! The agent ran wild with too many permissions and broke things.');
          } else {
            setAgentStatus('too-restrictive');
            setFeedback('The agent was locked down so tight it could barely move. Task timed out.');
          }
        }
      }
    }, 30);
  }, [currentScenario, agentStatus, selections]);

  const handleNextScenario = useCallback(() => {
    const nextIdx = scenarioIdx + 1;
    if (nextIdx >= scenarios.length) {
      setFinished(true);
      setTimeout(() => onComplete(), 1500);
    } else {
      setScenarioIdx(nextIdx);
    }
  }, [scenarioIdx, scenarios.length, onComplete]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    };
  }, []);

  // --- status colors ---
  const statusColor = (s: AgentStatus): string => {
    switch (s) {
      case 'success': return 'var(--neon-green)';
      case 'too-permissive': return 'var(--neon-coral)';
      case 'too-restrictive': return 'var(--neon-gold)';
      case 'running': return 'var(--neon-blue)';
      default: return 'var(--text-dim)';
    }
  };

  const statusLabel = (s: AgentStatus): string => {
    switch (s) {
      case 'success': return 'SUCCESS';
      case 'too-permissive': return 'OVERLOAD — TOO PERMISSIVE';
      case 'too-restrictive': return 'TIMEOUT — TOO RESTRICTIVE';
      case 'running': return 'RUNNING...';
      default: return 'READY';
    }
  };

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{
        borderColor: agentStatus === 'success'
          ? 'var(--neon-green)'
          : agentStatus === 'too-permissive'
            ? 'var(--neon-coral)'
            : agentStatus === 'too-restrictive'
              ? 'var(--neon-gold)'
              : 'var(--border-pixel)',
        background: 'var(--bg-dark)',
        transition: 'border-color 0.3s',
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
          Control Room
        </div>
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

      {/* Scenario progress */}
      <div className="flex gap-2 items-center">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < scenarioIdx
                ? 'var(--neon-green)'
                : i === scenarioIdx
                  ? 'var(--neon-gold)'
                  : 'var(--border-pixel)',
              boxShadow: i < scenarioIdx
                ? '0 0 6px var(--neon-green)'
                : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {!finished && currentScenario && (
        <>
          {/* Task display */}
          <div
            className="border-2 p-3"
            style={{
              borderColor: 'var(--neon-purple)',
              background: 'var(--bg-panel)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Scenario {scenarioIdx + 1}/{scenarios.length}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}
            >
              &ldquo;{currentScenario.task}&rdquo;
            </div>
          </div>

          {/* Settings panel — the "dials and switches" */}
          <div className="flex flex-col gap-3">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Configure Agent Settings
            </div>

            {currentScenario.settings.map((setting) => (
              <div
                key={setting.name}
                className="flex items-center justify-between p-2 border"
                style={{
                  borderColor: agentStatus !== 'idle' && showExplanations
                    ? selections[setting.name] === setting.correct
                      ? 'var(--neon-green)'
                      : 'var(--neon-coral)'
                    : 'var(--border-pixel)',
                  background: 'var(--bg-panel)',
                  transition: 'border-color 0.3s',
                }}
              >
                {/* Setting label */}
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color: 'var(--neon-blue)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    minWidth: '80px',
                  }}
                >
                  {setting.name}
                </div>

                {/* Option buttons — like toggle switches */}
                <div className="flex gap-1">
                  {setting.options.map(option => {
                    const isSelected = selections[setting.name] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSettingChange(setting.name, option)}
                        disabled={agentStatus !== 'idle'}
                        className="border px-2 py-1 cursor-pointer transition-all"
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '6px',
                          color: isSelected ? 'var(--bg-dark)' : 'var(--text-dim)',
                          borderColor: isSelected ? 'var(--neon-green)' : 'var(--border-pixel)',
                          background: isSelected ? 'var(--neon-green)' : 'transparent',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Agent status panel */}
          <div
            className="border-2 p-3"
            style={{
              borderColor: statusColor(agentStatus),
              background: 'var(--bg-void)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: statusColor(agentStatus),
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                Agent Status: {statusLabel(agentStatus)}
              </div>
              {/* Status indicator light */}
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: statusColor(agentStatus),
                  boxShadow: `0 0 8px ${statusColor(agentStatus)}`,
                  animation: agentStatus === 'running' ? 'blink 0.5s step-end infinite' : undefined,
                }}
              />
            </div>

            {/* Progress bar during running */}
            {agentStatus === 'running' && (
              <div className="h-3 rounded" style={{ background: 'var(--bg-dark)' }}>
                <div
                  className="h-full rounded"
                  style={{
                    width: `${runProgress}%`,
                    background: 'var(--neon-blue)',
                    boxShadow: '0 0 8px var(--neon-blue)',
                    transition: 'width 30ms linear',
                  }}
                />
              </div>
            )}

            {/* Feedback message */}
            {feedback && (
              <div
                className="mt-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                }}
              >
                {feedback}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {agentStatus === 'idle' && (
              <PixelButton onClick={handleRunAgent} variant="success">
                Run Agent
              </PixelButton>
            )}
            {agentStatus !== 'idle' && agentStatus !== 'running' && !showExplanations && (
              <PixelButton onClick={() => setShowExplanations(true)}>
                Show Analysis
              </PixelButton>
            )}
            {showExplanations && (
              <PixelButton onClick={handleNextScenario} variant="success">
                {scenarioIdx + 1 >= scenarios.length ? 'Finish' : 'Next Scenario'}
              </PixelButton>
            )}
          </div>

          {/* Explanations for each setting */}
          {showExplanations && (
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
                Setting Analysis
              </div>
              {currentScenario.settings.map(setting => {
                const isCorrect = selections[setting.name] === setting.correct;
                return (
                  <div
                    key={setting.name}
                    className="flex items-start gap-2 p-2 border-l-2"
                    style={{
                      borderColor: isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '8px',
                        color: isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)',
                      }}
                    >
                      {isCorrect ? '\u2714' : '\u2717'}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '6px',
                          color: 'var(--neon-blue)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        {setting.name}: {isCorrect ? 'Correct' : `Should be "${setting.correct}"`}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '10px',
                          color: 'var(--text-dim)',
                          lineHeight: '1.5',
                        }}
                      >
                        {setting.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
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
            Control Room Mastered!
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
            Module Complete!
          </div>
        </div>
      )}
    </div>
  );
}
