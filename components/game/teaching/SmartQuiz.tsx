// components/game/teaching/SmartQuiz.tsx
'use client';

import { useState } from 'react';
import type { SmartQuiz as SmartQuizType, GameCharacter } from '@/lib/game/types-v2';

interface SmartQuizProps {
  quiz: SmartQuizType;
  characters: GameCharacter[];
  onCorrect?: () => void;
  onWrong?: () => void;
}

/**
 * Application-based quiz component.
 * Tests understanding, not memory. Wrong answers teach too.
 */
export default function SmartQuiz({ quiz, characters, onCorrect, onWrong }: SmartQuizProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const char = characters.find(c => c.id === quiz.characterId);
  const selectedOption = selectedIndex !== null ? quiz.options[selectedIndex] : null;
  const isCorrect = selectedOption?.correct ?? false;

  function handleSelect(index: number) {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);

    if (quiz.options[index].correct) {
      onCorrect?.();
    } else {
      onWrong?.();
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--neon-gold)',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      {/* Asker label */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: char?.color ?? 'var(--neon-gold)',
          marginBottom: '10px',
        }}
      >
        {char?.name ?? 'QUIZ'} ASKS:
      </div>

      {/* Question */}
      <div
        style={{
          fontSize: '14px',
          marginBottom: '14px',
          lineHeight: '1.5',
          fontFamily: 'var(--font-body)',
        }}
      >
        {quiz.question}
      </div>

      {/* Options */}
      {quiz.options.map((option, i) => {
        const isSelected = selectedIndex === i;
        const showCorrect = answered && option.correct;
        const showWrong = answered && isSelected && !option.correct;

        return (
          <div
            key={i}
            onClick={() => handleSelect(i)}
            style={{
              background: 'var(--bg-panel)',
              border: `1px solid ${showCorrect ? 'var(--neon-green)' : showWrong ? 'var(--neon-coral)' : 'var(--border-pixel)'}`,
              borderRadius: '3px',
              padding: '10px 14px',
              marginBottom: '6px',
              cursor: answered ? 'default' : 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: answered && !isSelected && !option.correct ? 0.5 : 1,
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: 'var(--neon-gold)',
                flexShrink: 0,
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span>{option.text}</span>
          </div>
        );
      })}

      {/* Feedback */}
      {answered && selectedOption && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '13px',
            lineHeight: '1.5',
            background: isCorrect
              ? 'rgba(0, 255, 65, 0.08)'
              : 'rgba(255, 107, 107, 0.08)',
            border: `1px solid ${isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)'}`,
            color: isCorrect ? 'var(--neon-green)' : 'var(--neon-coral)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {isCorrect ? '✓ ' : '✗ '}
          {selectedOption.explanation}
        </div>
      )}
    </div>
  );
}
