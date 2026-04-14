// components/game/room-tabs/StoryTab.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter } from '@/lib/game/types-v2';
import GroupChat from '@/components/game/teaching/GroupChat';
import DataFlowAnimation from '@/components/game/teaching/DataFlowAnimation';
import CodeToEnglish from '@/components/game/teaching/CodeToEnglish';
import PixelButton from '@/components/game/ui/PixelButton';

interface StoryTabProps {
  content: CharacterContent;
  characters: GameCharacter[];
  onComplete: () => void;
}

export default function StoryTab({ content, characters, onComplete }: StoryTabProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = content.storyDialogue;
  const currentStep = steps[stepIndex];
  const character = characters.find(c => c.id === content.characterId);
  const isLast = stepIndex >= steps.length - 1;

  function advance() {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex(i => i + 1);
    }
  }

  if (!currentStep) return null;

  return (
    <div>
      {/* Progress dots — one dot per step, filled up to current */}
      <div className="flex gap-1 mb-4 justify-center">
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: i <= stepIndex ? (character?.color ?? 'var(--neon-gold)') : 'var(--border-pixel)',
            }}
          />
        ))}
      </div>

      {/* Step content — rendered based on dialogue step type */}
      {currentStep.type === 'talk' && (
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
              padding: '10px 14px',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-body)',
            }}
          >
            {currentStep.text}
          </div>
        </div>
      )}

      {currentStep.type === 'code' && (
        <CodeToEnglish block={currentStep.block} glossary={content.glossaryTerms} />
      )}

      {currentStep.type === 'chat' && (
        <GroupChat messages={currentStep.messages} characters={characters} />
      )}

      {currentStep.type === 'flow' && (
        <DataFlowAnimation steps={currentStep.flow} characters={characters} />
      )}

      {/* Continue / complete button */}
      <div className="text-center mt-4">
        <PixelButton onClick={advance}>
          {isLast ? 'COMPLETE STORY ✓' : 'CONTINUE →'}
        </PixelButton>
      </div>
    </div>
  );
}
