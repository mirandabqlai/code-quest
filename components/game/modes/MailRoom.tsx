'use client';

import { useState, useCallback, useMemo } from 'react';
import type { MailScenario, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import { DragItem, DropZone } from '@/components/game/ui/DragDrop';
import PixelButton from '@/components/game/ui/PixelButton';

interface MailRoomProps {
  scenarios: MailScenario[];
  characters: GameCharacter[];
  onXP: (amount: number) => void;
  onComplete: (scenarioId: string) => void;
  onChatText: (text: string) => void;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function MailRoom({ scenarios, characters, onXP, onComplete, onChatText }: MailRoomProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placements, setPlacements] = useState<Record<number, string>>({}); // position -> characterId
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{ type: 'success' | 'failure' | 'incomplete'; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [zoneResults, setZoneResults] = useState<Record<number, 'correct' | 'wrong'>>({});
  const { play } = useSounds();

  const scenario = scenarios[currentIndex];

  // Helper to find character by id
  const getChar = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  // Shuffle cards for this scenario
  const shuffledCards = useMemo(() => {
    const cards = scenario.correctOrder.map((charId, i) => ({
      charId,
      cardIndex: i,
    }));
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, scenario.id]); // Re-shuffle when scenario changes

  const handleDrop = useCallback((itemId: string, zoneId: string) => {
    if (submitted) return;
    const position = parseInt(zoneId.replace('mail-zone-', ''));
    const charId = itemId.replace('mail-card-', '');

    setPlacements(prev => {
      const next = { ...prev };
      // Remove this character from any previous zone
      Object.keys(next).forEach(key => {
        if (next[parseInt(key)] === charId) {
          delete next[parseInt(key)];
        }
      });
      next[position] = charId;
      return next;
    });
    play('click');
  }, [submitted, play]);

  const handleSubmit = useCallback(() => {
    const order = scenario.correctOrder;

    // Check all slots are filled
    const allFilled = order.every((_, i) => placements[i] !== undefined);
    if (!allFilled) {
      setResult({ type: 'incomplete', message: 'FILL ALL SLOTS FIRST!' });
      return;
    }

    // Check correctness
    const results: Record<number, 'correct' | 'wrong'> = {};
    let allCorrect = true;
    let correctCount = 0;

    order.forEach((expectedCharId, i) => {
      if (placements[i] === expectedCharId) {
        results[i] = 'correct';
        correctCount++;
      } else {
        results[i] = 'wrong';
        allCorrect = false;
      }
    });

    setZoneResults(results);

    if (allCorrect) {
      play('correct');
      const xp = attempts === 0 ? 200 : 100;
      onXP(xp);
      setResult({ type: 'success', message: `PERFECT DELIVERY! +${xp} XP` });
      setSubmitted(true);
      onComplete(scenario.id);

      // Show stop dialogue in chat
      if (scenario.stopDialogue.length > 0) {
        onChatText(scenario.stopDialogue[0]);
      }
    } else {
      play('wrong');
      setAttempts(prev => prev + 1);
      setResult({ type: 'failure', message: `${correctCount}/${order.length} CORRECT. TRY AGAIN!` });
    }
  }, [scenario, placements, attempts, play, onXP, onComplete, onChatText]);

  const handleReset = useCallback(() => {
    setPlacements({});
    setResult(null);
    setZoneResults({});
  }, []);

  const handleScenarioChange = useCallback((index: number) => {
    setCurrentIndex(index);
    setPlacements({});
    setAttempts(0);
    setResult(null);
    setSubmitted(false);
    setZoneResults({});
    play('click');
  }, [play]);

  // Which characters are currently placed in a zone (so we can grey them out)
  const placedCharIds = new Set(Object.values(placements));

  return (
    <div className="flex flex-col gap-4">
      {/* Scenario nav */}
      <div className="flex gap-1">
        {scenarios.map((s, i) => (
          <PixelButton
            key={s.id}
            size="sm"
            variant={i === currentIndex ? 'success' : 'default'}
            onClick={() => handleScenarioChange(i)}
          >
            {i + 1}
          </PixelButton>
        ))}
      </div>

      {/* Brief */}
      <div
        className="border-2 p-3"
        style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
      >
        <div
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '2px' }}
        >
          {scenario.title}
        </div>
        <div
          className="mt-2"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.6' }}
        >
          {scenario.brief}
        </div>
      </div>

      {/* Drop zones (timeline) */}
      <div className="flex gap-2 flex-wrap">
        {scenario.correctOrder.map((_, i) => (
          <DropZone
            key={`mail-zone-${i}`}
            id={`mail-zone-${i}`}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center border-2 p-3 min-w-[80px] min-h-[70px] transition-all"
            activeClass="border-[var(--neon-blue)]"
          >
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {ordinal(i + 1)}
            </div>
            {placements[i] && (() => {
              const ch = getChar(placements[i]);
              if (!ch) return null;
              const zoneResult = zoneResults[i];
              return (
                <div
                  className="mt-1 text-center"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: zoneResult === 'correct' ? 'var(--neon-green)' : zoneResult === 'wrong' ? 'var(--neon-coral)' : ch.color,
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{'🧑‍💻'}</div>
                  {ch.name}
                </div>
              );
            })()}
          </DropZone>
        ))}
      </div>

      {/* Draggable character cards */}
      <div className="flex gap-2 flex-wrap">
        {shuffledCards.map((card) => {
          const ch = getChar(card.charId);
          if (!ch) return null;
          const isPlaced = placedCharIds.has(card.charId);
          return (
            <DragItem
              key={`mail-card-${card.charId}`}
              id={`mail-card-${card.charId}`}
              disabled={submitted}
              className={`border-2 p-2 flex items-center gap-2 transition-all ${isPlaced ? 'opacity-40' : ''}`}
            >
              <span style={{ fontSize: '16px' }}>{'🧑‍💻'}</span>
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: ch.color,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {ch.name}
              </span>
            </DragItem>
          );
        })}
      </div>

      {/* Submit / Reset buttons */}
      <div className="flex gap-2 items-center">
        {!submitted && (
          <PixelButton onClick={handleSubmit}>Submit</PixelButton>
        )}
        {result?.type === 'failure' && (
          <PixelButton variant="danger" onClick={handleReset}>Reset</PixelButton>
        )}
      </div>

      {/* Result message */}
      {result && (
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: result.type === 'success' ? 'var(--neon-green)' : 'var(--neon-coral)',
          }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
