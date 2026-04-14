'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TourData, TourStep, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import PixelButton from '@/components/game/ui/PixelButton';

interface OfficeTourProps {
  tour: TourData;
  character: GameCharacter;
  onXP: (amount: number) => void;
  onComplete: (charId: string) => void;
  onChatText: (text: string) => void;
}

export default function OfficeTour({ tour, character, onXP, onComplete, onChatText }: OfficeTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { play } = useSounds();
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step: TourStep | undefined = tour.steps[stepIndex];

  // Reset state when step changes
  useEffect(() => {
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setDisplayedText('');
    setIsTyping(true);
  }, [stepIndex]);

  // Typewriter effect for talk and code steps
  useEffect(() => {
    if (!step) return;
    const text = step.type === 'talk' ? step.text
      : step.type === 'code' ? 'Take a look at this code:'
      : step.type === 'quiz' ? step.question
      : '';

    if (!text) { setIsTyping(false); return; }

    let i = 0;
    setDisplayedText('');
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      play('dialogue');
      if (i >= text.length) {
        clearInterval(typewriterRef.current!);
        setIsTyping(false);
      }
    }, 25);

    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [stepIndex, step, play]);

  // Update chat bubble text when typing
  useEffect(() => {
    if (step?.type === 'talk') {
      onChatText(displayedText);
    }
  }, [displayedText, step, onChatText]);

  const advanceStep = useCallback(() => {
    play('click');
    if (stepIndex + 1 >= tour.steps.length) {
      // Tour complete for this character
      onXP(50);
      onComplete(character.id);
      onChatText('Thanks for the tour!');
    } else {
      setStepIndex(prev => prev + 1);
    }
  }, [stepIndex, tour.steps.length, play, onXP, onComplete, character.id, onChatText]);

  const handleQuizAnswer = useCallback((index: number) => {
    if (quizAnswered || step?.type !== 'quiz') return;
    setSelectedAnswer(index);
    setQuizAnswered(true);

    if (index === step.correct) {
      play('correct');
      onXP(25);
    } else {
      play('wrong');
    }
  }, [quizAnswered, step, play, onXP]);

  // Handle tour completion (no more steps)
  if (!step) {
    return (
      <div className="text-center py-8">
        <div
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-green)' }}
        >
          TOUR COMPLETE!
        </div>
        <div
          className="mt-2"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}
        >
          You finished {character.name}&apos;s tour. +50 XP
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Character header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 border-2 flex items-center justify-center text-lg"
          style={{ borderColor: character.color, background: 'var(--bg-dark)', imageRendering: 'pixelated' }}
        >
          {/* Character icon placeholder */}
          <span style={{ fontSize: '20px' }}>{'🧑‍💻'}</span>
        </div>
        <div>
          <div
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: character.color, textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {character.name} {character.title}
          </div>
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-dim)' }}
          >
            Step {stepIndex + 1} of {tour.steps.length}
          </div>
        </div>
      </div>

      {/* Dialogue box */}
      <div
        className="border-2 p-4 cursor-pointer"
        style={{ borderColor: character.color, background: 'var(--bg-dark)' }}
        onClick={step.type !== 'quiz' ? advanceStep : undefined}
      >
        {/* Typewriter text */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
            minHeight: '20px',
          }}
        >
          {displayedText}
          {isTyping && (
            <span style={{ animation: 'blink 0.5s steps(1) infinite' }}>▌</span>
          )}
        </div>

        {/* Code block (for 'code' steps) */}
        {step.type === 'code' && !isTyping && (
          <>
            <pre
              className="mt-3 p-3 overflow-x-auto border"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                color: 'var(--text-code)',
                background: 'var(--bg-void)',
                borderColor: 'var(--border-pixel)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              {step.code}
            </pre>
            <div
              className="mt-2"
              style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--neon-blue)', lineHeight: '1.5' }}
            >
              💬 {step.english}
            </div>
          </>
        )}

        {/* Quiz options (for 'quiz' steps) */}
        {step.type === 'quiz' && !isTyping && (
          <div className="mt-3 flex flex-col gap-2">
            {step.options.map((option, i) => {
              let borderColor = 'var(--border-bright)';
              let textColor = 'var(--text-primary)';
              let bg = 'var(--bg-panel)';

              if (quizAnswered) {
                if (i === step.correct) {
                  borderColor = 'var(--neon-green)';
                  textColor = 'var(--neon-green)';
                  bg = 'rgba(0,255,65,0.1)';
                } else if (i === selectedAnswer) {
                  borderColor = 'var(--neon-coral)';
                  textColor = 'var(--neon-coral)';
                  bg = 'rgba(255,107,107,0.1)';
                }
              }

              return (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleQuizAnswer(i); }}
                  disabled={quizAnswered}
                  className="text-left p-3 border-2 transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    borderColor,
                    color: textColor,
                    background: bg,
                    cursor: quizAnswered ? 'default' : 'pointer',
                    opacity: quizAnswered && i !== step.correct && i !== selectedAnswer ? 0.4 : 1,
                  }}
                >
                  {option}
                </button>
              );
            })}

            {/* Feedback after answering */}
            {quizAnswered && (
              <div className="mt-2">
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    color: selectedAnswer === step.correct ? 'var(--neon-green)' : 'var(--neon-coral)',
                  }}
                >
                  {selectedAnswer === step.correct ? '✓ ' + step.explainRight : '✗ ' + step.explainWrong}
                </div>
                <div className="mt-3">
                  <PixelButton size="sm" onClick={advanceStep}>
                    Continue
                  </PixelButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Click to continue hint for talk/code steps */}
        {step.type !== 'quiz' && !isTyping && (
          <div
            className="mt-3 text-right"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              letterSpacing: '1px',
              animation: 'blink 1.2s steps(1) infinite',
            }}
          >
            CLICK TO CONTINUE ▶
          </div>
        )}
      </div>
    </div>
  );
}
