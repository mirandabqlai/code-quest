'use client';

import { useState, useCallback } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface ActionStep {
  tool: string;       // e.g. "Read", "Edit", "Bash"
  target: string;     // e.g. "src/App.tsx", "npm test"
  reason: string;     // explanation shown after
}

interface AgentSimulatorProps {
  task: string;
  fileTree: string[];
  correctSequence: ActionStep[];
  onComplete: () => void;
}

type StepStatus = 'pending' | 'correct' | 'wrong';

interface PlayerStep {
  tool: string;
  target: string;
  status: StepStatus;
  feedback: string;
}

/**
 * Agent Simulator — Module 10: "AI Coding Agents"
 *
 * The player IS the AI agent. A user task is shown (e.g. "Add dark
 * mode toggle"). The player sees a file tree and must pick actions
 * in the correct sequence: which file to Read first, then what to
 * Edit, then what to Run. Correct order = green checkmarks. Wrong
 * order = crash feedback explaining what an agent would do.
 */
export default function AgentSimulator({ task, fileTree, correctSequence, onComplete }: AgentSimulatorProps) {
  // --- state ---
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [playerSteps, setPlayerSteps] = useState<PlayerStep[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showCrash, setShowCrash] = useState(false);
  const [crashMessage, setCrashMessage] = useState('');

  // Available tools the agent can use
  const tools = ['Read', 'Edit', 'Bash', 'Grep', 'Write'];

  const isComplete = currentStepIdx >= correctSequence.length;

  // --- handlers ---
  const handleSubmitAction = useCallback(() => {
    if (!selectedTool || !selectedTarget || finished) return;

    const expected = correctSequence[currentStepIdx];
    const isCorrectTool = selectedTool === expected.tool;
    const isCorrectTarget = selectedTarget === expected.target;
    const isCorrect = isCorrectTool && isCorrectTarget;

    if (isCorrect) {
      // Correct step!
      const points = 100;
      setScore(prev => prev + points);
      setPlayerSteps(prev => [...prev, {
        tool: selectedTool,
        target: selectedTarget,
        status: 'correct',
        feedback: expected.reason,
      }]);
      setShowCrash(false);

      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);

      if (nextIdx >= correctSequence.length) {
        // All steps done!
        setFinished(true);
        setTimeout(() => onComplete(), 1500);
      }
    } else {
      // Wrong step — show crash feedback
      let feedback = '';
      if (!isCorrectTool) {
        feedback = `Wrong tool! The agent would use "${expected.tool}" here. ${expected.reason}`;
      } else {
        feedback = `Right tool, wrong target! The agent would target "${expected.target}". ${expected.reason}`;
      }

      setPlayerSteps(prev => [...prev, {
        tool: selectedTool,
        target: selectedTarget,
        status: 'wrong',
        feedback,
      }]);

      setCrashMessage(feedback);
      setShowCrash(true);

      // Hide crash after a few seconds and let them try again
      setTimeout(() => setShowCrash(false), 3000);
    }

    // Reset selections for next action
    setSelectedTool(null);
    setSelectedTarget(null);
  }, [selectedTool, selectedTarget, finished, correctSequence, currentStepIdx, onComplete]);

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{
        borderColor: showCrash ? 'var(--neon-coral)' : 'var(--border-pixel)',
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
          Agent Simulator
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

      {/* Task description */}
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
          User Request
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

      {/* Progress steps */}
      <div className="flex gap-2 items-center">
        {correctSequence.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < currentStepIdx
                ? 'var(--neon-green)'
                : i === currentStepIdx
                  ? 'var(--neon-gold)'
                  : 'var(--border-pixel)',
              boxShadow: i < currentStepIdx
                ? '0 0 6px var(--neon-green)'
                : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {!finished && (
        <div className="flex gap-3" style={{ minHeight: '200px' }}>
          {/* Left: File tree */}
          <div className="flex flex-col gap-1 flex-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-gold)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              File Tree
            </div>
            <div
              className="border p-2 overflow-y-auto"
              style={{
                borderColor: 'var(--border-pixel)',
                background: 'var(--bg-void)',
                maxHeight: '220px',
              }}
            >
              {fileTree.map((file, i) => {
                const isSelected = selectedTarget === file;
                const isDir = file.endsWith('/');
                // Indent based on depth (count slashes)
                const depth = (file.match(/\//g) || []).length;
                const indent = depth * 12;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTarget(file)}
                    className="flex items-center gap-1 w-full text-left py-0.5 transition-all"
                    style={{
                      paddingLeft: `${indent + 4}px`,
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: isSelected
                        ? 'var(--neon-green)'
                        : isDir
                          ? 'var(--neon-gold)'
                          : 'var(--text-primary)',
                      background: isSelected ? 'rgba(0, 255, 65, 0.1)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>
                      {isDir ? '\u{1F4C1}' : '\u{1F4C4}'}
                    </span>
                    {file.split('/').pop() || file}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Tool picker + action area */}
          <div className="flex flex-col gap-2 flex-1">
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
              Step {currentStepIdx + 1}: Pick Tool + Target
            </div>

            {/* Tool buttons */}
            <div className="flex flex-wrap gap-1.5">
              {tools.map(tool => {
                const isActive = selectedTool === tool;
                const toolColors: Record<string, string> = {
                  Read: 'var(--neon-blue)',
                  Edit: 'var(--neon-gold)',
                  Bash: 'var(--neon-green)',
                  Grep: 'var(--neon-purple)',
                  Write: 'var(--neon-coral)',
                };
                const color = toolColors[tool] || 'var(--text-primary)';

                return (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    className="border-2 px-3 py-1.5 cursor-pointer transition-all"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: isActive ? 'var(--bg-dark)' : color,
                      borderColor: isActive ? color : 'var(--border-bright)',
                      background: isActive ? color : 'var(--bg-panel)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>

            {/* Selected action preview */}
            <div
              className="border p-2 min-h-[48px]"
              style={{
                borderColor: selectedTool && selectedTarget
                  ? 'var(--neon-green)'
                  : 'var(--border-pixel)',
                background: 'var(--bg-panel)',
              }}
            >
              {selectedTool && selectedTarget ? (
                <div
                  style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    color: 'var(--neon-green)',
                    lineHeight: '1.5',
                  }}
                >
                  <span style={{ color: 'var(--neon-gold)' }}>{selectedTool}</span>
                  {' \u2192 '}
                  <span>{selectedTarget}</span>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {!selectedTool ? 'Pick a tool above...' : 'Pick a file from the tree...'}
                </div>
              )}
            </div>

            {/* Execute button */}
            <PixelButton
              onClick={handleSubmitAction}
              disabled={!selectedTool || !selectedTarget}
              variant="success"
              size="sm"
            >
              Execute Action
            </PixelButton>
          </div>
        </div>
      )}

      {/* Crash animation */}
      {showCrash && (
        <div
          className="border-2 p-3"
          style={{
            borderColor: 'var(--neon-coral)',
            background: 'rgba(255, 107, 107, 0.08)',
            boxShadow: '0 0 12px rgba(255, 107, 107, 0.3)',
            animation: 'glitch 0.3s linear',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-coral)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '6px',
            }}
          >
            Agent Crashed!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            {crashMessage}
          </div>
        </div>
      )}

      {/* Completed steps log */}
      {playerSteps.length > 0 && (
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
            Action Log
          </div>
          {playerSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-1 border-l-2"
              style={{
                borderColor: step.status === 'correct' ? 'var(--neon-green)' : 'var(--neon-coral)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: step.status === 'correct' ? 'var(--neon-green)' : 'var(--neon-coral)',
                }}
              >
                {step.status === 'correct' ? '\u2714' : '\u2717'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                }}
              >
                {step.tool} &rarr; {step.target}
              </span>
            </div>
          ))}
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
            Task Complete!
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
            You think like an AI agent!
          </div>
        </div>
      )}
    </div>
  );
}
