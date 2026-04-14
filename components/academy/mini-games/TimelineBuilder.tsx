'use client';

import { useState, useCallback } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Commit {
  id: string;
  message: string;
  timestamp: number;
}

interface TimelineBuilderProps {
  commits: Commit[];
  correctOrder: string[];  // commit ids in the correct chronological order
  onComplete: () => void;
}

/**
 * Timeline Builder — Module 7: "Git & GitHub"
 *
 * Commit cards sit in a shuffled pool. The player drags/clicks them onto
 * a horizontal timeline in chronological order. A branch visualization
 * lets the player drag a commit off the main line to create a branch,
 * and merge it back. Teaches git concepts: commits, ordering, branches.
 */
export default function TimelineBuilder({ commits, correctOrder, onComplete }: TimelineBuilderProps) {
  // --- state ---
  const [timeline, setTimeline] = useState<string[]>([]);            // commit ids placed on the timeline
  const [branchTimeline, setBranchTimeline] = useState<string[]>([]); // commits placed on a branch
  const [hasBranched, setHasBranched] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  const [finished, setFinished] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<Set<number>>(new Set());

  // Pool: commits not yet placed anywhere
  const placedIds = new Set([...timeline, ...branchTimeline]);
  const pool = commits.filter(c => !placedIds.has(c.id));

  // Lookup helper
  const getCommit = (id: string): Commit | undefined => commits.find(c => c.id === id);

  // --- handlers ---
  const handleAddToTimeline = useCallback((commitId: string) => {
    if (checked || finished) return;
    setTimeline(prev => [...prev, commitId]);
  }, [checked, finished]);

  const handleAddToBranch = useCallback((commitId: string) => {
    if (checked || finished) return;
    if (!hasBranched) setHasBranched(true);
    setBranchTimeline(prev => [...prev, commitId]);
  }, [checked, finished, hasBranched]);

  const handleRemoveFromTimeline = useCallback((idx: number) => {
    if (checked) return;
    setTimeline(prev => prev.filter((_, i) => i !== idx));
  }, [checked]);

  const handleRemoveFromBranch = useCallback((idx: number) => {
    if (checked) return;
    setBranchTimeline(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setHasBranched(false);
      return next;
    });
  }, [checked]);

  const handleMerge = useCallback(() => {
    if (branchTimeline.length === 0) return;
    // Merge branch commits back onto main timeline
    setTimeline(prev => [...prev, ...branchTimeline]);
    setBranchTimeline([]);
    setHasMerged(true);
    setHasBranched(false);
    setFlash('green');
    setTimeout(() => setFlash('none'), 500);
  }, [branchTimeline]);

  const handleCheck = useCallback(() => {
    // Compare the full timeline (main + any remaining branch) against correct order
    const fullTimeline = [...timeline];
    let correct = 0;
    const correctSet = new Set<number>();

    fullTimeline.forEach((id, i) => {
      if (i < correctOrder.length && id === correctOrder[i]) {
        correct++;
        correctSet.add(i);
      }
    });

    setCorrectPositions(correctSet);
    setChecked(true);

    // Score: each correct position = 100pts, bonus for using branch, bonus for merge
    const positionScore = correct * 100;
    const branchBonus = hasMerged ? 150 : 0; // Reward for trying branch + merge
    const perfectBonus = correct === correctOrder.length && fullTimeline.length === correctOrder.length ? 200 : 0;
    const total = positionScore + branchBonus + perfectBonus;
    setScore(total);
    setFlash(correct === correctOrder.length ? 'green' : 'red');

    if (correct === correctOrder.length && fullTimeline.length === correctOrder.length) {
      setFinished(true);
      setTimeout(() => onComplete(), 1200);
    }
  }, [timeline, correctOrder, hasMerged, onComplete]);

  const handleReset = useCallback(() => {
    setTimeline([]);
    setBranchTimeline([]);
    setHasBranched(false);
    setHasMerged(false);
    setChecked(false);
    setScore(0);
    setFlash('none');
    setCorrectPositions(new Set());
  }, []);

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
        transition: 'border-color 0.3s',
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
          Timeline Builder
        </div>
        {checked && (
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
        Place commits in chronological order. Try branching for bonus points!
      </div>

      {/* Commit pool */}
      {pool.length > 0 && (
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
            Commit Pool ({pool.length} remaining)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pool.map(commit => (
              <div
                key={commit.id}
                className="flex flex-col gap-0.5"
              >
                <div
                  className="border-2 px-2 py-1.5"
                  style={{
                    borderColor: 'var(--border-bright)',
                    background: 'var(--bg-panel)',
                    maxWidth: '180px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--neon-gold)',
                      letterSpacing: '1px',
                      marginBottom: '2px',
                    }}
                  >
                    #{commit.id.slice(0, 7)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--text-primary)',
                      lineHeight: '1.3',
                    }}
                  >
                    {commit.message}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAddToTimeline(commit.id)}
                    disabled={checked || finished}
                    className="border px-1.5 py-0.5 transition-all hover:-translate-y-0.5"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--neon-green)',
                      borderColor: 'var(--neon-green)',
                      background: 'var(--bg-void)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    + Main
                  </button>
                  <button
                    onClick={() => handleAddToBranch(commit.id)}
                    disabled={checked || finished}
                    className="border px-1.5 py-0.5 transition-all hover:-translate-y-0.5"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--neon-purple)',
                      borderColor: 'var(--neon-purple)',
                      background: 'var(--bg-void)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    + Branch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main timeline visualization */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--neon-green)',
              boxShadow: '0 0 6px var(--neon-green)',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Main Branch
          </div>
          {hasMerged && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: 'var(--neon-gold)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              (merged!)
            </div>
          )}
        </div>

        {/* The horizontal timeline */}
        <div
          className="relative flex items-center gap-0 p-3 border-2 min-h-[70px] overflow-x-auto"
          style={{
            borderColor: 'var(--border-bright)',
            background: 'var(--bg-void)',
          }}
        >
          {/* Timeline line */}
          <div
            className="absolute left-3 right-3 h-0.5"
            style={{
              background: timeline.length > 0 ? 'var(--neon-green)' : 'var(--border-pixel)',
              top: '50%',
              boxShadow: timeline.length > 0 ? '0 0 4px var(--neon-green)' : 'none',
            }}
          />

          {timeline.length === 0 ? (
            <div
              className="relative z-10"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                opacity: 0.5,
              }}
            >
              Click "+ Main" to add commits here...
            </div>
          ) : (
            timeline.map((id, i) => {
              const commit = getCommit(id);
              if (!commit) return null;

              const isCorrect = correctPositions.has(i);

              return (
                <div
                  key={`${id}-${i}`}
                  className="relative z-10 flex flex-col items-center mx-1"
                  style={{ minWidth: '80px' }}
                >
                  {/* Commit dot */}
                  <div
                    className="w-3 h-3 rounded-full border-2 mb-1"
                    style={{
                      background: checked
                        ? isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)'
                        : 'var(--neon-green)',
                      borderColor: checked
                        ? isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)'
                        : 'var(--neon-green)',
                      boxShadow: checked && isCorrect ? '0 0 8px var(--neon-green)' : 'none',
                    }}
                  />
                  {/* Commit card on the timeline */}
                  <button
                    onClick={() => !checked && handleRemoveFromTimeline(i)}
                    disabled={checked}
                    className="border px-1.5 py-1 transition-all"
                    style={{
                      borderColor: checked
                        ? isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)'
                        : 'var(--border-bright)',
                      background: 'var(--bg-panel)',
                      cursor: checked ? 'default' : 'pointer',
                      boxShadow: checked && isCorrect ? '0 0 6px var(--neon-green)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '4px',
                        color: 'var(--neon-gold)',
                        letterSpacing: '1px',
                      }}
                    >
                      #{id.slice(0, 7)}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '8px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.2',
                        maxWidth: '70px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {commit.message}
                    </div>
                  </button>
                  {/* Position indicator */}
                  {checked && (
                    <div
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '5px',
                        color: isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)',
                        marginTop: '2px',
                      }}
                    >
                      {isCorrect ? '\u2714' : '\u2717'}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Branch timeline (if any commits are branched) */}
      {(hasBranched || branchTimeline.length > 0) && (
        <div className="flex flex-col gap-1 ml-6">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--neon-purple)',
                boxShadow: '0 0 6px var(--neon-purple)',
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Feature Branch
            </div>
          </div>

          {/* Branch "line" connecting to main */}
          <div
            className="relative flex items-center gap-0 p-3 border-2 min-h-[60px] overflow-x-auto"
            style={{
              borderColor: 'var(--neon-purple)',
              borderStyle: 'dashed',
              background: 'var(--bg-void)',
            }}
          >
            {/* Branch line */}
            <div
              className="absolute left-3 right-3 h-0.5"
              style={{
                background: 'var(--neon-purple)',
                top: '50%',
                opacity: 0.5,
              }}
            />

            {branchTimeline.length === 0 ? (
              <div
                className="relative z-10"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: 'var(--text-dim)',
                  opacity: 0.5,
                }}
              >
                Branch is empty. Add commits or merge back to main.
              </div>
            ) : (
              branchTimeline.map((id, i) => {
                const commit = getCommit(id);
                if (!commit) return null;

                return (
                  <div
                    key={`branch-${id}-${i}`}
                    className="relative z-10 flex flex-col items-center mx-1"
                    style={{ minWidth: '80px' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 mb-1"
                      style={{
                        background: 'var(--neon-purple)',
                        borderColor: 'var(--neon-purple)',
                      }}
                    />
                    <button
                      onClick={() => !checked && handleRemoveFromBranch(i)}
                      disabled={checked}
                      className="border px-1.5 py-1 transition-all"
                      style={{
                        borderColor: 'var(--neon-purple)',
                        background: 'var(--bg-panel)',
                        cursor: checked ? 'default' : 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '4px',
                          color: 'var(--neon-gold)',
                          letterSpacing: '1px',
                        }}
                      >
                        #{id.slice(0, 7)}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '8px',
                          color: 'var(--text-primary)',
                          lineHeight: '1.2',
                          maxWidth: '70px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {commit.message}
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Merge button */}
          {branchTimeline.length > 0 && !checked && (
            <div className="flex justify-end">
              <PixelButton onClick={handleMerge} size="sm">
                {'\u{1F500}'} Merge to Main
              </PixelButton>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!checked && (
          <PixelButton
            onClick={handleCheck}
            disabled={timeline.length === 0}
            variant="success"
          >
            Check Order
          </PixelButton>
        )}
        <PixelButton
          onClick={handleReset}
          disabled={timeline.length === 0 && branchTimeline.length === 0}
          variant="danger"
          size="sm"
        >
          Reset
        </PixelButton>
      </div>

      {/* Score summary after check */}
      {checked && !finished && (
        <div className="flex flex-col gap-2">
          <div
            className="p-2 border"
            style={{
              borderColor: 'var(--border-pixel)',
              background: 'var(--bg-panel)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              Results
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
              }}
            >
              {correctPositions.size}/{correctOrder.length} commits in the right position.
              {hasMerged && ' Branch merge bonus applied!'}
            </div>
          </div>
        </div>
      )}

      {/* Finished overlay */}
      {finished && (
        <div
          className="text-center p-3"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 12px var(--neon-gold)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          Git Master! +{score} XP
        </div>
      )}
    </div>
  );
}
