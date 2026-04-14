'use client';

import { useState, useCallback, useMemo } from 'react';
import { DragItem, DropZone } from '@/components/game/ui/DragDrop';
import PixelButton from '@/components/game/ui/PixelButton';

interface TaskCard {
  description: string;
  validModels: string[];   // any of these are acceptable
  bestModel: string;       // ideal match — gives bonus points
  explanation: string;
}

interface ModelMatchmakerProps {
  tasks: TaskCard[];
  onComplete: () => void;
}

interface MatchResult {
  taskIdx: number;
  model: string;
  quality: 'best' | 'valid' | 'wrong';
}

/**
 * Model Matchmaker — Module 3: "The AI Landscape"
 *
 * Task cards on the left, model slots on the right.
 * Player drags each task to the model they think fits best.
 * Green glow = best match, blue glow = valid, red shake = wrong.
 * Each result shows an explanation so the player learns why.
 */
export default function ModelMatchmaker({ tasks, onComplete }: ModelMatchmakerProps) {
  const [matches, setMatches] = useState<Record<number, string>>({});  // taskIdx -> model name
  const [results, setResults] = useState<MatchResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [shakeTask, setShakeTask] = useState<number | null>(null);

  // Extract unique model names from all tasks
  const allModels = useMemo(() => {
    const modelSet = new Set<string>();
    tasks.forEach(t => {
      t.validModels.forEach(m => modelSet.add(m));
      modelSet.add(t.bestModel);
    });
    return Array.from(modelSet).sort();
  }, [tasks]);

  // Model colors for visual variety
  const modelColors: Record<string, string> = {
    'Claude Opus': 'var(--neon-purple)',
    'Claude Sonnet': 'var(--neon-purple)',
    'Claude Haiku': 'var(--neon-purple)',
    'GPT-4': 'var(--neon-green)',
    'GPT-4o': 'var(--neon-green)',
    'Gemini': 'var(--neon-blue)',
    'Gemini Pro': 'var(--neon-blue)',
    'Llama': 'var(--neon-coral)',
    'Llama 3': 'var(--neon-coral)',
    'DALL-E': 'var(--neon-gold)',
    'Midjourney': 'var(--neon-gold)',
    'Stable Diffusion': 'var(--neon-gold)',
  };
  const getModelColor = (model: string): string =>
    modelColors[model] || 'var(--neon-blue)';

  // --- handlers ---
  const handleDrop = useCallback((itemId: string, zoneId: string) => {
    if (submitted) return;
    const taskIdx = parseInt(itemId.replace('task-', ''));
    const model = zoneId.replace('model-', '');

    setMatches(prev => {
      const next = { ...prev };
      // Remove this task from any previous model
      Object.keys(next).forEach(key => {
        if (parseInt(key) === taskIdx) delete next[parseInt(key)];
      });
      next[taskIdx] = model;
      return next;
    });
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    const newResults: MatchResult[] = [];
    let totalScore = 0;

    tasks.forEach((task, i) => {
      const chosenModel = matches[i];
      if (!chosenModel) return;

      if (chosenModel === task.bestModel) {
        newResults.push({ taskIdx: i, model: chosenModel, quality: 'best' });
        totalScore += 100;
      } else if (task.validModels.includes(chosenModel)) {
        newResults.push({ taskIdx: i, model: chosenModel, quality: 'valid' });
        totalScore += 50;
      } else {
        newResults.push({ taskIdx: i, model: chosenModel, quality: 'wrong' });
        // Shake animation for wrong answers
        setShakeTask(i);
        setTimeout(() => setShakeTask(null), 500);
      }
    });

    setResults(newResults);
    setScore(totalScore);
    setSubmitted(true);

    // If all tasks have been matched (even if some are wrong), game is over
    if (Object.keys(matches).length >= tasks.length) {
      setTimeout(() => onComplete(), 1500);
    }
  }, [tasks, matches, onComplete]);

  const handleReset = useCallback(() => {
    setMatches({});
    setResults([]);
    setSubmitted(false);
    setScore(0);
    setShowExplanation(null);
  }, []);

  const getResultForTask = (idx: number): MatchResult | undefined =>
    results.find(r => r.taskIdx === idx);

  const resultBorderColor = (r?: MatchResult): string => {
    if (!r) return 'var(--border-pixel)';
    if (r.quality === 'best') return 'var(--neon-green)';
    if (r.quality === 'valid') return 'var(--neon-blue)';
    return 'var(--neon-coral)';
  };

  const allMatched = Object.keys(matches).length >= tasks.length;

  // --- render ---
  return (
    <div
      className="flex flex-col gap-4 p-4 border-2 rounded"
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
          Model Matchmaker
        </div>
        {submitted && (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
            }}
          >
            SCORE: {score}
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
        Drag each task to the best AI model
      </div>

      <div className="flex gap-4" style={{ minHeight: '260px' }}>
        {/* Left column — Task cards */}
        <div className="flex flex-col gap-2 flex-1">
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
            Tasks
          </div>
          {tasks.map((task, i) => {
            const result = getResultForTask(i);
            const isPlaced = matches[i] !== undefined;

            return (
              <div key={i} className="flex flex-col gap-1">
                <DragItem
                  id={`task-${i}`}
                  disabled={submitted}
                  className="border-2 p-2 transition-all"
                >
                  <div
                    style={{
                      borderColor: submitted ? resultBorderColor(result) : 'var(--border-bright)',
                      boxShadow: submitted && result
                        ? `0 0 8px ${resultBorderColor(result)}`
                        : 'none',
                      opacity: isPlaced && !submitted ? 0.5 : 1,
                      animation: shakeTask === i
                        ? 'glitch 0.3s linear'
                        : undefined,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.4',
                      }}
                    >
                      {task.description}
                    </div>
                    {isPlaced && (
                      <div
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '5px',
                          color: getModelColor(matches[i]),
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        &rarr; {matches[i]}
                        {submitted && result && (
                          <span style={{ marginLeft: '6px' }}>
                            {result.quality === 'best' ? '\u2605 BEST' : result.quality === 'valid' ? '\u2713 OK' : '\u2717 WRONG'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </DragItem>

                {/* Explanation (shown after submission) */}
                {submitted && showExplanation === i && (
                  <div
                    className="p-2 border ml-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--text-dim)',
                      lineHeight: '1.5',
                      borderColor: 'var(--border-pixel)',
                      background: 'var(--bg-void)',
                    }}
                  >
                    <span style={{ color: 'var(--neon-green)' }}>Best: {task.bestModel}</span>
                    {' \u2014 '}
                    {task.explanation}
                  </div>
                )}
                {submitted && (
                  <button
                    onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--neon-blue)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      marginLeft: '8px',
                    }}
                  >
                    {showExplanation === i ? '\u25BC hide' : '\u25B6 why?'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column — Model drop zones */}
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
            Models
          </div>
          {allModels.map(model => {
            // Count how many tasks are assigned to this model
            const assignedTasks = Object.entries(matches)
              .filter(([, m]) => m === model)
              .map(([idx]) => parseInt(idx));

            return (
              <DropZone
                key={model}
                id={`model-${model}`}
                onDrop={handleDrop}
                className="border-2 p-2 min-h-[40px] transition-all"
                activeClass="border-[var(--neon-green)]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: getModelColor(model),
                      boxShadow: `0 0 6px ${getModelColor(model)}`,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: getModelColor(model),
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {model}
                  </div>
                </div>
                {assignedTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assignedTasks.map(idx => (
                      <div
                        key={idx}
                        className="px-1 py-0.5 border"
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '5px',
                          color: 'var(--text-dim)',
                          borderColor: 'var(--border-pixel)',
                          background: 'var(--bg-void)',
                        }}
                      >
                        Task {idx + 1}
                      </div>
                    ))}
                  </div>
                )}
              </DropZone>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!submitted && (
          <PixelButton
            onClick={handleSubmit}
            disabled={!allMatched}
            variant="success"
          >
            {allMatched ? 'Check Matches' : `Match All Tasks (${Object.keys(matches).length}/${tasks.length})`}
          </PixelButton>
        )}
        {submitted && (
          <PixelButton onClick={handleReset} variant="danger">
            Try Again
          </PixelButton>
        )}
      </div>

      {/* Score summary */}
      {submitted && (
        <div
          className="text-center p-3"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: score >= tasks.length * 80 ? 'var(--neon-green)' : 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: `0 0 12px ${score >= tasks.length * 80 ? 'var(--neon-green)' : 'var(--neon-gold)'}`,
            animation: 'pulse 1.5s infinite',
          }}
        >
          {score >= tasks.length * 80
            ? 'AI Expert!'
            : score >= tasks.length * 40
              ? 'Good Matching!'
              : 'Keep Learning!'}
          {' '}{score} pts
        </div>
      )}
    </div>
  );
}
