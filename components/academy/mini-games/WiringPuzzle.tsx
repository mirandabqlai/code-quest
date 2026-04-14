'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface ComponentNode {
  id: string;
  name: string;
  type: string;   // e.g. 'frontend', 'api', 'database', 'auth'
}

interface Wire {
  from: string;
  to: string;
  label: string;
}

interface WiringPuzzleProps {
  components: ComponentNode[];
  correctWires: Wire[];
  onComplete: () => void;
}

/** Position of a component box in the puzzle area. */
interface BoxPosition {
  x: number;
  y: number;
}

/**
 * Wiring Puzzle — Module 6: "How Code Is Organized"
 *
 * Components appear as labeled boxes arranged on a canvas. The player
 * draws wires between them to show how data flows through the system.
 * Correct connections glow green, wrong ones spark red.
 * When all correct wires are placed, a data-flow animation plays.
 */
export default function WiringPuzzle({ components, correctWires, onComplete }: WiringPuzzleProps) {
  // --- state ---
  const [placedWires, setPlacedWires] = useState<Wire[]>([]);
  const [wireStart, setWireStart] = useState<string | null>(null);  // id of source component being wired
  const [wireResults, setWireResults] = useState<Record<string, 'correct' | 'wrong'>>({});  // wireKey -> result
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showFlow, setShowFlow] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wireLabel, setWireLabel] = useState('');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Arrange components in a layout. We place them in a grid pattern.
  const positions: Record<string, BoxPosition> = {};
  const cols = Math.min(components.length, 3);
  const rows = Math.ceil(components.length / cols);
  components.forEach((comp, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[comp.id] = {
      x: 30 + col * 160,
      y: 30 + row * 120,
    };
  });

  const canvasWidth = 30 + cols * 160 + 30;
  const canvasHeight = 30 + rows * 120 + 30;

  // Type-based colors for component boxes
  const typeColors: Record<string, string> = {
    frontend: 'var(--neon-blue)',
    api: 'var(--neon-green)',
    database: 'var(--neon-purple)',
    auth: 'var(--neon-coral)',
    storage: 'var(--neon-gold)',
    service: 'var(--neon-green)',
    cache: 'var(--neon-gold)',
  };
  const getTypeColor = (type: string): string =>
    typeColors[type.toLowerCase()] || 'var(--neon-blue)';

  // Wire key for deduplication
  const wireKey = (from: string, to: string): string =>
    [from, to].sort().join('->');

  // --- handlers ---
  const handleComponentClick = useCallback((id: string) => {
    if (checked || finished) return;

    if (!wireStart) {
      // Start a new wire from this component
      setWireStart(id);
    } else if (wireStart === id) {
      // Cancel — clicked the same component
      setWireStart(null);
    } else {
      // Complete the wire — ask for a label
      setPendingTarget(id);
      setWireLabel('');
      setShowLabelModal(true);
    }
  }, [wireStart, checked, finished]);

  const handleConfirmWire = useCallback(() => {
    if (!wireStart || !pendingTarget) return;

    const key = wireKey(wireStart, pendingTarget);
    // Don't add duplicate wires
    const alreadyExists = placedWires.some(
      w => wireKey(w.from, w.to) === key
    );

    if (!alreadyExists) {
      setPlacedWires(prev => [...prev, {
        from: wireStart,
        to: pendingTarget,
        label: wireLabel || 'data',
      }]);
    }

    setWireStart(null);
    setPendingTarget(null);
    setShowLabelModal(false);
    setWireLabel('');
  }, [wireStart, pendingTarget, wireLabel, placedWires]);

  const handleCancelWire = useCallback(() => {
    setWireStart(null);
    setPendingTarget(null);
    setShowLabelModal(false);
    setWireLabel('');
  }, []);

  const handleRemoveWire = useCallback((idx: number) => {
    if (checked) return;
    setPlacedWires(prev => prev.filter((_, i) => i !== idx));
  }, [checked]);

  const handleCheck = useCallback(() => {
    const results: Record<string, 'correct' | 'wrong'> = {};
    let correct = 0;

    placedWires.forEach(pw => {
      const key = wireKey(pw.from, pw.to);
      // A wire is correct if it matches a correct wire (in either direction)
      const match = correctWires.find(
        cw => wireKey(cw.from, cw.to) === key
      );
      if (match) {
        results[key] = 'correct';
        correct++;
      } else {
        results[key] = 'wrong';
      }
    });

    setWireResults(results);
    setChecked(true);

    const points = correct * 100;
    const perfectBonus = correct === correctWires.length && placedWires.length === correctWires.length ? 200 : 0;
    setScore(points + perfectBonus);

    // If all correct wires are placed, show the flow animation
    if (correct === correctWires.length) {
      setTimeout(() => setShowFlow(true), 600);
      setTimeout(() => {
        setFinished(true);
        onComplete();
      }, 2500);
    }
  }, [placedWires, correctWires, onComplete]);

  const handleReset = useCallback(() => {
    setPlacedWires([]);
    setWireResults({});
    setChecked(false);
    setScore(0);
    setShowFlow(false);
    setWireStart(null);
  }, []);

  // Get the center position of a component box for wire drawing
  const getBoxCenter = (id: string): { x: number; y: number } => {
    const pos = positions[id];
    if (!pos) return { x: 0, y: 0 };
    return { x: pos.x + 55, y: pos.y + 30 };
  };

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
            color: 'var(--neon-purple)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Wiring Puzzle
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
        {wireStart
          ? `Click a second component to connect from ${components.find(c => c.id === wireStart)?.name}`
          : 'Click a component to start a wire, then click another to connect them'}
      </div>

      {/* Puzzle canvas */}
      <div
        ref={canvasRef}
        className="relative border-2 overflow-hidden"
        style={{
          borderColor: 'var(--border-bright)',
          background: 'var(--bg-void)',
          width: '100%',
          height: `${canvasHeight}px`,
          minHeight: '200px',
        }}
      >
        {/* Grid dots background — pixel art feel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--border-pixel) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.3,
          }}
        />

        {/* SVG layer for wires */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          style={{ zIndex: 1 }}
        >
          {placedWires.map((wire, i) => {
            const from = getBoxCenter(wire.from);
            const to = getBoxCenter(wire.to);
            const key = wireKey(wire.from, wire.to);
            const result = wireResults[key];
            const color = !checked
              ? 'var(--neon-blue)'
              : result === 'correct'
                ? 'var(--neon-green)'
                : 'var(--neon-coral)';

            // Midpoint for the label
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;

            return (
              <g key={i}>
                {/* Wire line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={showFlow && result === 'correct' ? '6 4' : 'none'}
                  style={{
                    filter: result === 'correct' ? `drop-shadow(0 0 4px ${color})` : 'none',
                    // Animate dash offset for flow animation
                    animation: showFlow && result === 'correct' ? 'dash-flow 1s linear infinite' : 'none',
                  }}
                />
                {/* Arrow head */}
                <circle
                  cx={to.x}
                  cy={to.y}
                  r={4}
                  fill={color}
                  style={{
                    filter: result === 'correct' ? `drop-shadow(0 0 4px ${color})` : 'none',
                  }}
                />
                {/* Wire label */}
                <text
                  x={mx}
                  y={my - 6}
                  textAnchor="middle"
                  fill={color}
                  fontSize="8"
                  fontFamily="var(--font-pixel)"
                  style={{ textTransform: 'uppercase' }}
                >
                  {wire.label}
                </text>
                {/* Data packet animation */}
                {showFlow && result === 'correct' && (
                  <circle
                    r={3}
                    fill="var(--neon-gold)"
                    style={{ filter: 'drop-shadow(0 0 6px var(--neon-gold))' }}
                  >
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path={`M${from.x},${from.y} L${to.x},${to.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Component boxes */}
        {components.map(comp => {
          const pos = positions[comp.id];
          const color = getTypeColor(comp.type);
          const isSelected = wireStart === comp.id;

          return (
            <button
              key={comp.id}
              onClick={() => handleComponentClick(comp.id)}
              className="absolute border-2 p-2 transition-all"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: '110px',
                borderColor: isSelected ? 'var(--neon-gold)' : color,
                background: 'var(--bg-panel)',
                boxShadow: isSelected
                  ? '0 0 12px var(--neon-gold)'
                  : showFlow
                    ? `0 0 8px ${color}`
                    : 'none',
                cursor: checked ? 'default' : 'pointer',
                zIndex: 2,
                animation: isSelected ? 'pulse 1s infinite' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textAlign: 'center',
                }}
              >
                {comp.name}
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {comp.type}
              </div>
            </button>
          );
        })}
      </div>

      {/* Wire label modal */}
      {showLabelModal && (
        <div
          className="flex items-center gap-2 p-2 border-2"
          style={{
            borderColor: 'var(--neon-gold)',
            background: 'var(--bg-panel)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
            }}
          >
            Wire Label:
          </span>
          <input
            type="text"
            value={wireLabel}
            onChange={e => setWireLabel(e.target.value)}
            placeholder="e.g. API call, query, auth..."
            className="flex-1 bg-transparent outline-none border px-2 py-1"
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: '10px',
              color: 'var(--neon-green)',
              borderColor: 'var(--border-pixel)',
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirmWire(); }}
            autoFocus
          />
          <PixelButton onClick={handleConfirmWire} variant="success" size="sm">
            OK
          </PixelButton>
          <PixelButton onClick={handleCancelWire} variant="danger" size="sm">
            X
          </PixelButton>
        </div>
      )}

      {/* Placed wires list */}
      {placedWires.length > 0 && (
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
            Connections ({placedWires.length})
          </div>
          {placedWires.map((wire, i) => {
            const key = wireKey(wire.from, wire.to);
            const result = wireResults[key];
            const fromName = components.find(c => c.id === wire.from)?.name || wire.from;
            const toName = components.find(c => c.id === wire.to)?.name || wire.to;

            return (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1 border"
                style={{
                  borderColor: checked
                    ? result === 'correct' ? 'var(--neon-green)' : 'var(--neon-coral)'
                    : 'var(--border-pixel)',
                  background: 'var(--bg-void)',
                  boxShadow: checked && result === 'correct' ? '0 0 6px var(--neon-green)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--neon-blue)',
                  }}
                >
                  {fromName}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--text-dim)',
                  }}
                >
                  {'\u2192'} [{wire.label}] {'\u2192'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--neon-blue)',
                  }}
                >
                  {toName}
                </span>
                {checked && result && (
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '6px',
                      color: result === 'correct' ? 'var(--neon-green)' : 'var(--neon-coral)',
                      marginLeft: 'auto',
                    }}
                  >
                    {result === 'correct' ? '\u2714' : '\u2717'}
                  </span>
                )}
                {!checked && (
                  <button
                    onClick={() => handleRemoveWire(i)}
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '6px',
                      color: 'var(--neon-coral)',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      marginLeft: 'auto',
                    }}
                  >
                    {'\u2717'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!checked && (
          <PixelButton
            onClick={handleCheck}
            disabled={placedWires.length === 0}
            variant="success"
          >
            Check Wiring
          </PixelButton>
        )}
        {checked && !finished && (
          <PixelButton onClick={handleReset} variant="danger">
            Try Again
          </PixelButton>
        )}
      </div>

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
          System Wired! +{score} XP
        </div>
      )}

      {/* Inline keyframes for wire flow animation */}
      <style>{`
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
}
