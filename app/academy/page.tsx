// app/academy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MODULES, getModulesByPart } from '@/lib/academy/modules';
import { ACADEMY_PARTS } from '@/lib/academy/types';

// Map mini-game types to short labels for the card badges
const GAME_TYPE_LABELS: Record<string, string> = {
  'token-tetris': 'Token Tetris',
  'prompt-lab': 'Prompt Lab',
  'model-matchmaker': 'Model Matchmaker',
  'red-flag-spotter': 'Red Flag Spotter',
  'file-explorer': 'File Explorer',
  'wiring-puzzle': 'Wiring Puzzle',
  'timeline-builder': 'Timeline Builder',
  'chat-strategist': 'Chat Strategist',
  'editor-dash': 'Editor Dash',
  'agent-simulator': 'Agent Simulator',
  'toolbox-challenge': 'Toolbox Challenge',
  'control-room': 'Control Room',
  'skill-builder': 'Skill Builder',
  'server-plugboard': 'Server Plugboard',
  'api-playground': 'API Playground',
  'factory-floor': 'Factory Floor',
  'final-mission': 'Final Mission',
};

export default function AcademyPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('code-quest-academy');
      if (saved) {
        const progress = JSON.parse(saved);
        setCompleted(progress.completedModules ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <main
      className="min-h-screen p-6 overflow-y-auto"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="text-[var(--text-dim)] hover:text-[var(--neon-blue)] text-xs mb-4 inline-block"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', letterSpacing: '2px' }}
        >
          &larr; BACK TO HOME
        </Link>
        <h1
          className="text-xl text-[var(--neon-gold)] tracking-widest uppercase mb-2"
          style={{ fontFamily: 'var(--font-pixel)' }}
        >
          AI ACADEMY
        </h1>
        <p
          className="text-[var(--text-dim)] text-sm max-w-xl"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          17 mini-games that teach everything a non-technical person needs to know
          about AI — from &quot;what is an LLM&quot; to &quot;how to build an AI app.&quot;
          Each module takes about 7-8 minutes.
        </p>
      </div>

      {/* Module grid grouped by Part */}
      <div className="max-w-4xl mx-auto space-y-10">
        {ACADEMY_PARTS.map((part) => {
          const partModules = getModulesByPart(part.number);
          return (
            <section key={part.number}>
              {/* Part header */}
              <div className="flex items-baseline gap-3 mb-4">
                <span
                  className="text-[var(--neon-purple)] uppercase"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', letterSpacing: '2px' }}
                >
                  Part {part.number}
                </span>
                <span
                  className="text-[var(--text-primary)] uppercase"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', letterSpacing: '1px' }}
                >
                  {part.title}
                </span>
                <span
                  className="text-[var(--text-dim)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}
                >
                  {part.durationLabel}
                </span>
              </div>

              {/* Module cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {partModules.map((mod) => (
                  <Link
                    key={mod.id}
                    href={`/academy/${mod.id}`}
                    className="group block border-2 border-[var(--border-pixel)] bg-[var(--bg-panel)] p-4 transition-all duration-100 hover:border-[var(--neon-green)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--neon-green)]"
                  >
                    {/* Module number + duration + completion */}
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="text-[var(--neon-gold)]"
                        style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}
                      >
                        {completed.includes(mod.id) ? '✓ ' : ''}MODULE {mod.moduleNumber}
                      </span>
                      <span
                        className="text-[var(--text-dim)]"
                        style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}
                      >
                        {mod.durationMinutes} MIN
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-[var(--text-primary)] group-hover:text-[var(--neon-green)] mb-1 transition-colors"
                      style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', letterSpacing: '1px' }}
                    >
                      {mod.title}
                    </h3>

                    {/* Subtitle */}
                    <p
                      className="text-[var(--text-dim)] text-xs leading-relaxed mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {mod.subtitle}
                    </p>

                    {/* Game type badge */}
                    <span
                      className="inline-block border border-[var(--neon-blue)] text-[var(--neon-blue)] px-2 py-0.5"
                      style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', letterSpacing: '1px' }}
                    >
                      {GAME_TYPE_LABELS[mod.miniGame.type] ?? mod.miniGame.type}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer spacing so scroll doesn't cut off */}
      <div className="h-12" />

      {/* CRT overlay for consistent pixel-art feel */}
      <div className="crt-overlay" />
    </main>
  );
}
