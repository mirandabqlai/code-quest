// components/academy/AcademyShell.tsx
//
// Client component that wraps an active academy module. Manages the flow:
// 1. Mike's intro dialogue → 2. Mini-game → 3. Quiz → 4. XP reward.
//
// The mini-game area renders a placeholder for now — actual mini-game
// components (TokenTetris, PromptLab, etc.) will be built separately.

'use client';

import { useState } from 'react';
import type { AcademyModule } from '@/lib/academy/types';
import { ACADEMY_PARTS } from '@/lib/academy/types';
import XPBar from '@/components/game/ui/XPBar';
import PixelButton from '@/components/game/ui/PixelButton';
import SmartQuiz from '@/components/game/teaching/SmartQuiz';

// The module flows through these phases in order.
type Phase = 'intro' | 'game' | 'quiz' | 'complete';

interface AcademyShellProps {
  module: AcademyModule;
}

export default function AcademyShell({ module }: AcademyShellProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introIndex, setIntroIndex] = useState(0);

  // XP is tracked locally for now — will be wired to shared state later
  const [xp, setXp] = useState(0);

  const part = ACADEMY_PARTS.find(p => p.number === module.part);

  // Advance through Mike's intro lines one at a time
  function handleIntroNext() {
    if (introIndex < module.mikeIntro.length - 1) {
      setIntroIndex(prev => prev + 1);
    } else {
      setPhase('game');
    }
  }

  // Called when the mini-game is finished (placeholder for now)
  function handleGameComplete() {
    setPhase('quiz');
  }

  // Quiz callbacks
  function handleQuizCorrect() {
    setXp(prev => prev + module.xpReward + 50); // +50 bonus for correct
    setPhase('complete');
  }

  function handleQuizWrong() {
    setXp(prev => prev + module.xpReward);
    setPhase('complete');
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-void)' }}>
      {/* XP bar at top — same as repo game */}
      <XPBar xp={xp} glitchTokens={0} />

      {/* Module header */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-pixel)] bg-[var(--bg-dark)]"
      >
        <span
          className="text-[var(--neon-purple)] uppercase"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', letterSpacing: '2px' }}
        >
          Part {module.part}{part ? ` — ${part.title}` : ''}
        </span>
        <span
          className="text-[var(--text-primary)] uppercase"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', letterSpacing: '1px' }}
        >
          {module.title}
        </span>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">

          {/* ===== PHASE: INTRO ===== */}
          {phase === 'intro' && (
            <div className="space-y-6">
              {/* Mike's portrait placeholder + dialogue */}
              <div
                className="border-2 border-[var(--neon-gold)] bg-[var(--bg-panel)] p-5"
              >
                <div
                  className="text-[var(--neon-gold)] mb-3 uppercase"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', letterSpacing: '2px' }}
                >
                  MIKE — Office Manager
                </div>
                <p
                  className="text-[var(--text-primary)] leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}
                >
                  {module.mikeIntro[introIndex]}
                </p>
                <PixelButton onClick={handleIntroNext}>
                  {introIndex < module.mikeIntro.length - 1 ? 'CONTINUE' : 'START GAME'}
                </PixelButton>
              </div>
            </div>
          )}

          {/* ===== PHASE: MINI-GAME ===== */}
          {phase === 'game' && (
            <div className="space-y-6">
              {/* Placeholder for the actual mini-game component */}
              <div
                className="border-2 border-[var(--border-pixel)] bg-[var(--bg-panel)] p-8 text-center"
              >
                <div
                  className="text-[var(--neon-blue)] uppercase mb-3"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', letterSpacing: '3px' }}
                >
                  {module.miniGame.type}
                </div>
                <div
                  className="text-[var(--neon-coral)] uppercase mb-6"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', letterSpacing: '4px' }}
                >
                  COMING SOON
                </div>
                <p
                  className="text-[var(--text-dim)] text-sm mb-6"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  The {module.miniGame.type.replace(/-/g, ' ')} mini-game will be built
                  as a separate component. For now, skip ahead to the quiz.
                </p>
                <PixelButton onClick={handleGameComplete} variant="success">
                  SKIP TO QUIZ
                </PixelButton>
              </div>
            </div>
          )}

          {/* ===== PHASE: QUIZ ===== */}
          {phase === 'quiz' && (
            <div className="space-y-4">
              <div
                className="text-[var(--text-dim)] uppercase mb-2"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', letterSpacing: '2px' }}
              >
                KNOWLEDGE CHECK
              </div>
              <SmartQuiz
                quiz={module.quiz}
                characters={[
                  {
                    id: 'mike',
                    name: 'MIKE',
                    title: 'Office Manager',
                    color: '#ffd93d',
                    department: 'Management',
                    files: [],
                    summary: 'Your guide through AI Academy',
                    spriteType: 'manager',
                    roomId: 'lobby',
                  },
                ]}
                onCorrect={handleQuizCorrect}
                onWrong={handleQuizWrong}
              />
            </div>
          )}

          {/* ===== PHASE: COMPLETE ===== */}
          {phase === 'complete' && (
            <div className="text-center space-y-6 py-8">
              <div
                className="text-[var(--neon-green)] uppercase"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', letterSpacing: '4px' }}
              >
                MODULE COMPLETE
              </div>
              <div
                className="text-[var(--neon-gold)]"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
              >
                +{module.xpReward} XP
              </div>
              <p
                className="text-[var(--text-dim)] text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                You finished &quot;{module.title}&quot;. Head back to pick your next module.
              </p>
              <a href="/academy">
                <PixelButton>BACK TO MODULES</PixelButton>
              </a>
            </div>
          )}

        </div>
      </div>

      {/* CRT overlay */}
      <div className="crt-overlay" />
    </div>
  );
}
