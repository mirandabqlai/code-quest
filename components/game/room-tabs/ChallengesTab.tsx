// components/game/room-tabs/ChallengesTab.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter, RoomProgress } from '@/lib/game/types-v2';
import SmartQuiz from '@/components/game/teaching/SmartQuiz';
import PixelButton from '@/components/game/ui/PixelButton';

interface ChallengesTabProps {
  content: CharacterContent;
  characters: GameCharacter[];
  progress: RoomProgress;
  onXP: (amount: number) => void;
}

type ChallengeView = 'menu' | 'quiz' | 'mailsort' | 'bughunt' | 'boss';

export default function ChallengesTab({ content, characters, progress, onXP }: ChallengesTabProps) {
  const [view, setView] = useState<ChallengeView>('menu');
  const [quizIndex, setQuizIndex] = useState(0);

  const character = characters.find(c => c.id === content.characterId);

  // Mission board — the default view listing all 4 challenge types
  if (view === 'menu') {
    const missions = [
      {
        id: 'quiz',
        icon: '❓',
        name: 'QUIZ TIME',
        desc: `${content.quizzes.length} questions about this room`,
        xp: content.quizzes.length * 25,
        color: '#a855f7',
        done: progress.challengesComplete.quizzes.size >= content.quizzes.length,
        onClick: () => { setQuizIndex(0); setView('quiz'); },
      },
      {
        id: 'mailsort',
        icon: '📬',
        name: 'SORT THE MAIL',
        desc: `Put the request steps in order`,
        xp: content.mailSort.length * 100,
        color: '#ff9f43',
        done: progress.challengesComplete.mailSort.size >= content.mailSort.length,
        onClick: () => setView('mailsort'),
      },
      {
        id: 'bughunt',
        icon: '🐛',
        name: 'FIND THE BUG',
        desc: `Spot what changed in the code`,
        xp: content.bugHunt.length * 150,
        color: '#ff6b6b',
        done: progress.challengesComplete.bugHunt.size >= content.bugHunt.length,
        onClick: () => setView('bughunt'),
      },
      {
        id: 'boss',
        icon: '⚔️',
        name: 'BOSS CHALLENGE',
        desc: content.bossChallenge?.title ?? 'Complete other challenges first',
        xp: 200,
        color: '#4ecdc4',
        done: progress.challengesComplete.bossComplete,
        // Locked until the player has answered at least 1 quiz correctly
        locked: !progress.challengesComplete.quizzes.size,
        onClick: () => setView('boss'),
      },
    ];

    return (
      <div>
        {/* Character intro bubble */}
        <div className="flex gap-3 items-start mb-4">
          <div
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${character?.color ?? '#7a7a8e'}`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontFamily: 'var(--font-pixel)',
              color: character?.color,
              background: 'var(--bg-dark)',
              flexShrink: 0,
            }}
          >
            {(character?.name ?? '?').slice(0, 3).toUpperCase()}
          </div>
          <div
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '0 8px 8px 8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
            }}
          >
            Pick any mission — or do them all to master my room!
          </div>
        </div>

        {/* Mission cards */}
        {missions.map(m => (
          <div
            key={m.id}
            onClick={m.locked ? undefined : m.onClick}
            style={{
              background: 'var(--bg-dark)',
              border: `1px solid ${m.color}`,
              borderRadius: '3px',
              padding: '10px',
              marginBottom: '8px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              cursor: m.locked ? 'not-allowed' : 'pointer',
              opacity: m.locked ? 0.4 : m.done ? 0.6 : 1,
              transition: 'transform 0.15s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: m.color,
                  marginBottom: '3px',
                }}
              >
                {m.name} {m.done && '✓'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{m.desc}</div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: 'var(--neon-green)',
              }}
            >
              +{m.xp} XP
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Quiz view — steps through each quiz in sequence
  if (view === 'quiz') {
    const quiz = content.quizzes[quizIndex];
    if (!quiz) {
      return (
        <div className="text-center">
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-green)', marginBottom: '12px' }}>
            ALL QUIZZES COMPLETE ✓
          </div>
          <PixelButton onClick={() => setView('menu')}>← BACK TO MISSIONS</PixelButton>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--text-dim)' }}>
            QUIZ {quizIndex + 1}/{content.quizzes.length}
          </span>
          <button
            onClick={() => setView('menu')}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← MISSIONS
          </button>
        </div>
        <SmartQuiz
          quiz={quiz}
          characters={characters}
          onCorrect={() => {
            progress.challengesComplete.quizzes.add(quizIndex);
            onXP(25);
            // Brief pause so player sees the success state before advancing
            setTimeout(() => setQuizIndex(i => i + 1), 1500);
          }}
          onWrong={() => {
            // Still advance after a moment — no blocking on wrong answers
            setTimeout(() => setQuizIndex(i => i + 1), 2000);
          }}
        />
      </div>
    );
  }

  // TODO: mailsort, bughunt, boss views — reuse existing MailRoom, BugHunt, BossBattle
  // components with minor adaptations. For now, show placeholder.
  return (
    <div className="text-center">
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-gold)', marginBottom: '12px' }}>
        {view.toUpperCase()} — COMING SOON
      </div>
      <PixelButton onClick={() => setView('menu')}>← BACK TO MISSIONS</PixelButton>
    </div>
  );
}
