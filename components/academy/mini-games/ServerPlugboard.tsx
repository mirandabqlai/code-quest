'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Service {
  id: string;
  name: string;
}

interface TestQuery {
  question: string;
  requiredService: string;
}

interface ServerPlugboardProps {
  services: Service[];
  testQueries: TestQuery[];
  onComplete: () => void;
}

/** Which service icon to show for each service id */
const SERVICE_ICONS: Record<string, string> = {
  database: '\u{1F5C4}',
  github: '\u{1F419}',
  slack: '\u{1F4AC}',
  email: '\u{2709}',
  calendar: '\u{1F4C5}',
};

/** Colors for cable connections — one per service slot */
const CABLE_COLORS = [
  'var(--neon-green)',
  'var(--neon-coral)',
  'var(--neon-blue)',
  'var(--neon-purple)',
  'var(--neon-gold)',
];

type Phase = 'connect' | 'test' | 'done';

/**
 * Server Plugboard -- Module 14: MCP (Model Context Protocol)
 *
 * A central AI brain sits in the middle of the screen. External services
 * (Database, GitHub, Slack, etc.) are arranged around it. The player drags
 * "cables" from each service to the brain to establish MCP connections.
 * Once connected, test queries appear and the player sees which ones
 * succeed (because the right service is plugged in) or fail.
 */
export default function ServerPlugboard({ services, testQueries, onComplete }: ServerPlugboardProps) {
  const [phase, setPhase] = useState<Phase>('connect');
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [currentQuery, setCurrentQuery] = useState(0);
  const [queryResults, setQueryResults] = useState<('pass' | 'fail' | null)[]>([]);
  const [score, setScore] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [combo, setCombo] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const serviceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialise query results to null (unanswered)
  useEffect(() => {
    setQueryResults(new Array(testQueries.length).fill(null));
  }, [testQueries.length]);

  // --- cable drag handlers ---
  const handleServiceMouseDown = useCallback((serviceId: string) => {
    if (phase !== 'connect' || connected.has(serviceId)) return;
    setDragging(serviceId);
  }, [phase, connected]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (!dragging || !brainRef.current || !containerRef.current) {
      setDragging(null);
      setDragPos(null);
      return;
    }

    // Check if the cursor is over the brain
    const brainRect = brainRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = dragPos;

    if (pos) {
      const absX = pos.x + containerRect.left;
      const absY = pos.y + containerRect.top;

      if (
        absX >= brainRect.left &&
        absX <= brainRect.right &&
        absY >= brainRect.top &&
        absY <= brainRect.bottom
      ) {
        // Connected!
        setConnected(prev => new Set(prev).add(dragging));
      }
    }

    setDragging(null);
    setDragPos(null);
  }, [dragging, dragPos]);

  // Touch handlers for mobile
  const handleServiceTouchStart = useCallback((serviceId: string, e: React.TouchEvent) => {
    if (phase !== 'connect' || connected.has(serviceId)) return;
    e.preventDefault();
    setDragging(serviceId);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
  }, [phase, connected]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || !containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
  }, [dragging]);

  const handleTouchEnd = useCallback(() => {
    // Re-use mouse-up logic — the dragging / dragPos state is already set
    handleMouseUp();
  }, [handleMouseUp]);

  // Move to test phase once all services are connected
  const handleStartTesting = useCallback(() => {
    setPhase('test');
  }, []);

  // --- test query logic ---
  const handleTestQuery = useCallback(() => {
    if (currentQuery >= testQueries.length) return;
    const query = testQueries[currentQuery];
    const isConnected = connected.has(query.requiredService);

    setStreaming(true);
    setStreamText('');

    const responseText = isConnected
      ? `Connected to ${query.requiredService}. Fetching data... Done! Here is the answer to "${query.question}"`
      : `ERROR: Service "${query.requiredService}" not connected. Cannot access data.`;

    // Stream the response character by character
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      setStreamText(responseText.slice(0, charIdx));
      if (charIdx >= responseText.length) {
        clearInterval(interval);
        setStreaming(false);

        // Record result
        const result = isConnected ? 'pass' : 'fail';
        setQueryResults(prev => {
          const next = [...prev];
          next[currentQuery] = result;
          return next;
        });

        if (isConnected) {
          const comboBonus = combo * 25;
          setScore(s => s + 100 + comboBonus);
          setCombo(c => c + 1);
        } else {
          setCombo(0);
        }

        // Advance or finish
        const nextIdx = currentQuery + 1;
        if (nextIdx >= testQueries.length) {
          setTimeout(() => {
            setPhase('done');
            setTimeout(() => onComplete(), 1200);
          }, 800);
        } else {
          setTimeout(() => setCurrentQuery(nextIdx), 600);
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [currentQuery, testQueries, connected, combo, onComplete]);

  // --- cable line helper: get center positions for SVG lines ---
  const getCableEndpoints = useCallback((serviceId: string): { sx: number; sy: number; bx: number; by: number } | null => {
    const sEl = serviceRefs.current[serviceId];
    const bEl = brainRef.current;
    const cEl = containerRef.current;
    if (!sEl || !bEl || !cEl) return null;

    const cRect = cEl.getBoundingClientRect();
    const sRect = sEl.getBoundingClientRect();
    const bRect = bEl.getBoundingClientRect();

    return {
      sx: sRect.left + sRect.width / 2 - cRect.left,
      sy: sRect.top + sRect.height / 2 - cRect.top,
      bx: bRect.left + bRect.width / 2 - cRect.left,
      by: bRect.top + bRect.height / 2 - cRect.top,
    };
  }, []);

  // Force re-render for cable positions after mount
  const [, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allConnected = connected.size >= services.length;
  const passCount = queryResults.filter(r => r === 'pass').length;

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
          Server Plugboard
        </div>
        {score > 0 && (
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

      {/* Instructions */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {phase === 'connect'
          ? 'Drag cables from each service to the AI brain to connect them'
          : phase === 'test'
            ? 'Test queries to see if your connections work'
            : 'Module complete!'}
      </div>

      {/* Plugboard area */}
      {phase === 'connect' && (
        <div
          ref={containerRef}
          className="relative border-2 p-4"
          style={{
            borderColor: 'var(--border-bright)',
            background: 'var(--bg-panel)',
            minHeight: '280px',
            cursor: dragging ? 'crosshair' : 'default',
            touchAction: 'none',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* SVG overlay for cable lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {/* Completed cables */}
            {services.map((s, i) => {
              if (!connected.has(s.id)) return null;
              const pts = getCableEndpoints(s.id);
              if (!pts) return null;
              return (
                <line
                  key={s.id}
                  x1={pts.sx} y1={pts.sy}
                  x2={pts.bx} y2={pts.by}
                  stroke={CABLE_COLORS[i % CABLE_COLORS.length]}
                  strokeWidth={3}
                  strokeDasharray="6 3"
                  style={{
                    filter: `drop-shadow(0 0 4px ${CABLE_COLORS[i % CABLE_COLORS.length]})`,
                  }}
                />
              );
            })}

            {/* Active dragging cable */}
            {dragging && dragPos && (() => {
              const sEl = serviceRefs.current[dragging];
              const cEl = containerRef.current;
              if (!sEl || !cEl) return null;
              const cRect = cEl.getBoundingClientRect();
              const sRect = sEl.getBoundingClientRect();
              const sx = sRect.left + sRect.width / 2 - cRect.left;
              const sy = sRect.top + sRect.height / 2 - cRect.top;
              const idx = services.findIndex(s => s.id === dragging);
              return (
                <line
                  x1={sx} y1={sy}
                  x2={dragPos.x} y2={dragPos.y}
                  stroke={CABLE_COLORS[idx % CABLE_COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />
              );
            })()}
          </svg>

          {/* AI Brain (center) */}
          <div
            ref={brainRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ zIndex: 2 }}
          >
            <div
              className="flex items-center justify-center border-2 rounded-full"
              style={{
                width: '64px',
                height: '64px',
                borderColor: allConnected ? 'var(--neon-green)' : 'var(--neon-purple)',
                background: 'var(--bg-dark)',
                boxShadow: allConnected
                  ? '0 0 20px var(--neon-green), 0 0 40px rgba(0,255,65,0.2)'
                  : '0 0 12px var(--neon-purple)',
                fontSize: '28px',
                animation: 'idle-bob 2s ease-in-out infinite',
                transition: 'all 0.5s',
              }}
            >
              {'\u{1F9E0}'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: allConnected ? 'var(--neon-green)' : 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              AI Brain
            </div>
          </div>

          {/* Services arranged around the edges */}
          {services.map((service, i) => {
            const isConnected = connected.has(service.id);
            const isDragging = dragging === service.id;
            // Position services around the brain in a circle-ish layout
            const positions = [
              { top: '8px', left: '8px' },        // top-left
              { top: '8px', right: '8px' },        // top-right
              { bottom: '8px', left: '8px' },      // bottom-left
              { bottom: '8px', right: '8px' },     // bottom-right
              { top: '50%', left: '8px', transform: 'translateY(-50%)' },  // mid-left
            ];
            const pos = positions[i % positions.length];

            return (
              <div
                key={service.id}
                ref={el => { serviceRefs.current[service.id] = el; }}
                className="absolute flex flex-col items-center gap-1 cursor-pointer select-none"
                style={{
                  ...pos,
                  zIndex: 3,
                  touchAction: 'none',
                }}
                onMouseDown={() => handleServiceMouseDown(service.id)}
                onTouchStart={(e) => handleServiceTouchStart(service.id, e)}
              >
                <div
                  className="flex items-center justify-center border-2"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderColor: isConnected
                      ? CABLE_COLORS[i % CABLE_COLORS.length]
                      : isDragging
                        ? 'var(--neon-gold)'
                        : 'var(--border-bright)',
                    background: 'var(--bg-dark)',
                    boxShadow: isConnected
                      ? `0 0 10px ${CABLE_COLORS[i % CABLE_COLORS.length]}`
                      : isDragging
                        ? '0 0 8px var(--neon-gold)'
                        : 'none',
                    fontSize: '22px',
                    transition: 'all 0.3s',
                    opacity: isConnected ? 1 : 0.8,
                  }}
                >
                  {SERVICE_ICONS[service.id] || '\u{1F50C}'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: isConnected
                      ? CABLE_COLORS[i % CABLE_COLORS.length]
                      : 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textAlign: 'center',
                  }}
                >
                  {service.name}
                </div>
                {isConnected && (
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: 'var(--neon-green)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {'\u2714'} MCP
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Connection progress */}
      {phase === 'connect' && (
        <div className="flex gap-2 items-center">
          {services.map((s, i) => (
            <div
              key={s.id}
              className="h-2 flex-1 rounded-sm"
              style={{
                background: connected.has(s.id)
                  ? CABLE_COLORS[i % CABLE_COLORS.length]
                  : 'var(--border-pixel)',
                boxShadow: connected.has(s.id)
                  ? `0 0 6px ${CABLE_COLORS[i % CABLE_COLORS.length]}`
                  : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Start Testing button */}
      {phase === 'connect' && connected.size > 0 && (
        <PixelButton
          onClick={handleStartTesting}
          variant={allConnected ? 'success' : 'default'}
        >
          {allConnected
            ? 'All Connected! Run Tests'
            : `Test with ${connected.size}/${services.length} connections`}
        </PixelButton>
      )}

      {/* Test query phase */}
      {phase === 'test' && (
        <div className="flex flex-col gap-3">
          {/* Progress */}
          <div className="flex gap-2 items-center">
            {testQueries.map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-sm"
                style={{
                  background: queryResults[i] === 'pass'
                    ? 'var(--neon-green)'
                    : queryResults[i] === 'fail'
                      ? 'var(--neon-coral)'
                      : i === currentQuery
                        ? 'var(--neon-gold)'
                        : 'var(--border-pixel)',
                  boxShadow: queryResults[i] === 'pass'
                    ? '0 0 6px var(--neon-green)'
                    : queryResults[i] === 'fail'
                      ? '0 0 6px var(--neon-coral)'
                      : 'none',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {/* Current query */}
          {currentQuery < testQueries.length && (
            <>
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
                  Test Query {currentQuery + 1}/{testQueries.length}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                  }}
                >
                  &ldquo;{testQueries[currentQuery].question}&rdquo;
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Requires: {testQueries[currentQuery].requiredService}
                  {connected.has(testQueries[currentQuery].requiredService)
                    ? ' \u2714 Connected'
                    : ' \u2717 Not connected'}
                </div>
              </div>

              {/* Response stream */}
              {streamText && (
                <div
                  className="border p-2"
                  style={{
                    borderColor: streaming
                      ? 'var(--neon-gold)'
                      : queryResults[currentQuery] === 'pass'
                        ? 'var(--neon-green)'
                        : 'var(--neon-coral)',
                    background: 'var(--bg-void)',
                    boxShadow: !streaming && queryResults[currentQuery] === 'pass'
                      ? '0 0 8px var(--neon-green)'
                      : !streaming && queryResults[currentQuery] === 'fail'
                        ? '0 0 8px var(--neon-coral)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: queryResults[currentQuery] === 'fail'
                        ? 'var(--neon-coral)'
                        : 'var(--neon-green)',
                      lineHeight: '1.5',
                    }}
                  >
                    {streamText}
                    {streaming && (
                      <span style={{ animation: 'blink 0.6s step-end infinite' }}>{'\u2588'}</span>
                    )}
                  </div>
                </div>
              )}

              {!streaming && queryResults[currentQuery] === null && (
                <PixelButton onClick={handleTestQuery} variant="success">
                  Send Query
                </PixelButton>
              )}
            </>
          )}
        </div>
      )}

      {/* Done phase */}
      {phase === 'done' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: passCount === testQueries.length ? 'var(--neon-green)' : 'var(--neon-gold)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: `0 0 12px ${passCount === testQueries.length ? 'var(--neon-green)' : 'var(--neon-gold)'}`,
              animation: 'pulse 1.5s infinite',
            }}
          >
            {passCount === testQueries.length ? 'All Systems Online!' : 'Partially Connected'}
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
          <div className="flex gap-4">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-green)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Passed: {passCount}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-coral)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Failed: {testQueries.length - passCount}
            </div>
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
