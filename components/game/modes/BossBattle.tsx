'use client';

import { useState, useCallback } from 'react';
import type { BossBattle as BossBattleType, BossStage, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import { DragItem, DropZone } from '@/components/game/ui/DragDrop';
import PixelButton from '@/components/game/ui/PixelButton';

interface BossBattleProps {
  battles: BossBattleType[];
  characters: GameCharacter[];
  onXP: (amount: number) => void;
  onComplete: (battleId: string) => void;
  onChatText: (text: string) => void;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function BossBattle({ battles, characters, onXP, onComplete, onChatText }: BossBattleProps) {
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [bossXP, setBossXP] = useState(0);
  const [battleComplete, setBattleComplete] = useState(false);

  // Stage-specific state
  const [selections, setSelections] = useState<number[]>([]);
  const [selectSubmitted, setSelectSubmitted] = useState(false);
  const [orderPlacements, setOrderPlacements] = useState<Record<number, string>>({});
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderResult, setOrderResult] = useState<{ correct: boolean; count: number; total: number } | null>(null);
  const [choiceSelected, setChoiceSelected] = useState<number | null>(null);
  const [promptText, setPromptText] = useState('');
  const [promptResult, setPromptResult] = useState<{ earned: number; labels: string[]; ideal: string } | null>(null);

  const { play } = useSounds();

  const battle = battles[currentBattleIndex];
  const stage: BossStage | undefined = battle?.stages[stageIndex];

  // Helper to find character by id
  const getChar = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  // Reset stage-specific state
  const resetStageState = useCallback(() => {
    setSelections([]);
    setSelectSubmitted(false);
    setOrderPlacements({});
    setOrderSubmitted(false);
    setOrderResult(null);
    setChoiceSelected(null);
    setPromptText('');
    setPromptResult(null);
  }, []);

  const advanceStage = useCallback(() => {
    if (stageIndex + 1 >= battle.stages.length) {
      // Battle complete
      onXP(bossXP);
      onComplete(battle.id);
      setBattleComplete(true);
    } else {
      setStageIndex(prev => prev + 1);
      resetStageState();
    }
  }, [stageIndex, battle, bossXP, onXP, onComplete, resetStageState]);

  // ===== SELECT stage handlers =====
  const handleSelectToggle = useCallback((index: number) => {
    if (selectSubmitted) return;
    setSelections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    play('click');
  }, [selectSubmitted, play]);

  const handleSelectSubmit = useCallback(() => {
    if (!stage || stage.type !== 'select') return;
    setSelectSubmitted(true);

    const totalCorrect = stage.options.filter(o => o.correct).length;
    const userCorrect = selections.filter(i => stage.options[i].correct).length;
    const xpEarned = Math.round((userCorrect / totalCorrect) * 100);
    setBossXP(prev => prev + xpEarned);

    if (userCorrect === totalCorrect) {
      play('correct');
    } else {
      play('wrong');
      // Show explanation for a wrong pick
      const wrongPick = stage.options.find((o, i) => selections.includes(i) && !o.correct);
      if (wrongPick) {
        const ch = getChar(wrongPick.characterId);
        if (ch) onChatText(`${ch.name}: ${wrongPick.explanation}`);
      }
    }
  }, [stage, selections, play, getChar, onChatText]);

  // ===== ORDER stage handlers =====
  const handleOrderDrop = useCallback((itemId: string, zoneId: string) => {
    if (orderSubmitted) return;
    const charId = itemId.replace('boss-order-', '');
    const position = parseInt(zoneId.replace('boss-order-zone-', ''));

    setOrderPlacements(prev => {
      const next = { ...prev };
      // Remove from previous position
      Object.keys(next).forEach(key => {
        if (next[parseInt(key)] === charId) delete next[parseInt(key)];
      });
      next[position] = charId;
      return next;
    });
    play('click');
  }, [orderSubmitted, play]);

  const handleOrderSubmit = useCallback(() => {
    if (!stage || stage.type !== 'order') return;
    setOrderSubmitted(true);

    let correct = 0;
    let allCorrect = true;
    stage.correctOrder.forEach((expectedChar, i) => {
      if (orderPlacements[i] === expectedChar) {
        correct++;
      } else {
        allCorrect = false;
      }
    });

    const xpEarned = allCorrect ? 75 : Math.round((correct / stage.correctOrder.length) * 40);
    setBossXP(prev => prev + xpEarned);
    setOrderResult({ correct: allCorrect, count: correct, total: stage.correctOrder.length });

    if (allCorrect) {
      play('correct');
      if (stage.stopDialogue.length > 0) {
        onChatText(stage.stopDialogue[0]);
      }
    } else {
      play('wrong');
    }
  }, [stage, orderPlacements, play, onChatText]);

  // ===== CHOICE stage handlers =====
  const handleChoice = useCallback((index: number) => {
    if (choiceSelected !== null || !stage || stage.type !== 'choice') return;
    setChoiceSelected(index);

    if (stage.options[index].correct) {
      play('correct');
      setBossXP(prev => prev + 75);
    } else {
      play('wrong');
      setBossXP(prev => prev + 20);
    }
  }, [choiceSelected, stage, play]);

  // ===== PROMPT stage handlers =====
  const handlePromptSubmit = useCallback(() => {
    if (!stage || stage.type !== 'prompt') return;
    const text = promptText.toLowerCase();

    let earned = 0;
    const labels: string[] = [];
    stage.keywords.forEach(kw => {
      if (kw.words.some(w => text.includes(w))) {
        earned += kw.points;
        labels.push('✓ ' + kw.label);
      } else {
        labels.push('✗ ' + kw.label);
      }
    });

    setBossXP(prev => prev + earned);
    setPromptResult({ earned, labels, ideal: stage.idealAnswer });
    play(earned > 100 ? 'correct' : 'click');
  }, [stage, promptText, play]);

  // ===== Battle complete screen =====
  if (battleComplete) {
    return (
      <div className="text-center py-8">
        <div
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'var(--neon-gold)', textTransform: 'uppercase', letterSpacing: '3px' }}
        >
          Boss Defeated!
        </div>
        <div
          className="mt-3"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
        >
          You earned {bossXP} XP planning the &ldquo;{battle.title}&rdquo; feature.
        </div>
        <div className="mt-4">
          <PixelButton onClick={() => {
            if (currentBattleIndex + 1 < battles.length) {
              setCurrentBattleIndex(prev => prev + 1);
              setStageIndex(0);
              setBossXP(0);
              setBattleComplete(false);
              resetStageState();
            }
          }}>
            {currentBattleIndex + 1 < battles.length ? 'Next Battle' : 'All Battles Complete!'}
          </PixelButton>
        </div>
      </div>
    );
  }

  if (!stage) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Battle header */}
      <div>
        <div
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-purple)', textTransform: 'uppercase', letterSpacing: '2px' }}
        >
          Boss Battle — {battle.title}
        </div>
        <div
          className="mt-1"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}
        >
          {battle.brief}
        </div>
      </div>

      {/* Stage progress dots */}
      <div className="flex gap-1.5">
        {battle.stages.map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 border-2"
            style={{
              borderColor: i < stageIndex ? 'var(--neon-green)' : i === stageIndex ? 'var(--neon-gold)' : 'var(--border-pixel)',
              background: i < stageIndex ? 'var(--neon-green)' : i === stageIndex ? 'var(--neon-gold)' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* ===== SELECT stage ===== */}
      {stage.type === 'select' && (
        <div className="flex flex-col gap-3">
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
          >
            {stage.instruction}
          </div>
          <div className="flex flex-col gap-2">
            {stage.options.map((opt, i) => {
              const ch = getChar(opt.characterId);
              if (!ch) return null;

              let bg = 'var(--bg-panel)';
              let border = selections.includes(i) ? ch.color : 'var(--border-pixel)';

              if (selectSubmitted) {
                if (opt.correct) {
                  bg = 'rgba(0,255,65,0.1)';
                  border = 'var(--neon-green)';
                } else if (selections.includes(i) && !opt.correct) {
                  bg = 'rgba(255,107,107,0.1)';
                  border = 'var(--neon-coral)';
                }
              }

              return (
                <div
                  key={i}
                  onClick={() => handleSelectToggle(i)}
                  className="border-2 p-3 cursor-pointer flex items-center gap-3 transition-all"
                  style={{ borderColor: border, background: bg }}
                >
                  <span style={{ fontSize: '18px' }}>{'🧑‍💻'}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: ch.color, textTransform: 'uppercase' }}>
                      {ch.name} ({ch.title})
                    </div>
                    {selectSubmitted && opt.explanation && (
                      <div className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-dim)' }}>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!selectSubmitted ? (
            <PixelButton onClick={handleSelectSubmit}>Submit</PixelButton>
          ) : (
            <PixelButton onClick={advanceStage}>Continue</PixelButton>
          )}
        </div>
      )}

      {/* ===== ORDER stage ===== */}
      {stage.type === 'order' && (
        <div className="flex flex-col gap-3">
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
          >
            {stage.instruction}
          </div>

          {/* Drop zones */}
          <div className="flex gap-2 flex-wrap">
            {stage.correctOrder.map((_, i) => {
              const placedCharId = orderPlacements[i];
              const ch = placedCharId ? getChar(placedCharId) : null;

              return (
                <DropZone
                  key={`boss-order-zone-${i}`}
                  id={`boss-order-zone-${i}`}
                  onDrop={handleOrderDrop}
                  className="border-2 p-3 min-w-[70px] min-h-[60px] flex flex-col items-center justify-center transition-all"
                  activeClass="border-[var(--neon-blue)]"
                >
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)' }}>
                    {ordinal(i + 1)}
                  </div>
                  {ch && (
                    <div className="mt-1 text-center">
                      <span style={{ fontSize: '14px' }}>{'🧑‍💻'}</span>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: ch.color, textTransform: 'uppercase' }}>
                        {ch.name}
                      </div>
                    </div>
                  )}
                </DropZone>
              );
            })}
          </div>

          {/* Draggable cards */}
          <div className="flex gap-2 flex-wrap">
            {stage.correctOrder.map((charId) => {
              const ch = getChar(charId);
              if (!ch) return null;
              const isPlaced = Object.values(orderPlacements).includes(charId);
              return (
                <DragItem
                  key={`boss-order-${charId}`}
                  id={`boss-order-${charId}`}
                  disabled={orderSubmitted}
                  className={`border-2 p-2 flex items-center gap-2 ${isPlaced ? 'opacity-40' : ''}`}
                >
                  <span style={{ fontSize: '14px' }}>{'🧑‍💻'}</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: ch.color, textTransform: 'uppercase' }}>
                    {ch.name}
                  </span>
                </DragItem>
              );
            })}
          </div>

          {/* Submit / result */}
          {!orderSubmitted ? (
            <PixelButton onClick={handleOrderSubmit}>Confirm Order</PixelButton>
          ) : (
            <>
              {orderResult && (
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '8px',
                    color: orderResult.correct ? 'var(--neon-green)' : 'var(--neon-coral)',
                    textTransform: 'uppercase',
                  }}
                >
                  {orderResult.correct ? `CORRECT! +75 XP` : `${orderResult.count}/${orderResult.total} RIGHT`}
                </div>
              )}
              <PixelButton onClick={advanceStage}>Continue</PixelButton>
            </>
          )}
        </div>
      )}

      {/* ===== CHOICE stage ===== */}
      {stage.type === 'choice' && (
        <div className="flex flex-col gap-3">
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
          >
            {stage.instruction}
          </div>
          <div
            className="border-2 p-3"
            style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}
          >
            {stage.question}
          </div>
          <div className="flex flex-col gap-2">
            {stage.options.map((opt, i) => {
              let bg = 'var(--bg-panel)';
              let border = 'var(--border-bright)';

              if (choiceSelected !== null) {
                if (opt.correct) {
                  bg = 'rgba(0,255,65,0.1)';
                  border = 'var(--neon-green)';
                } else if (i === choiceSelected && !opt.correct) {
                  bg = 'rgba(255,107,107,0.1)';
                  border = 'var(--neon-coral)';
                }
              }

              return (
                <div
                  key={i}
                  onClick={() => handleChoice(i)}
                  className="border-2 p-3 cursor-pointer transition-all"
                  style={{ borderColor: border, background: bg, cursor: choiceSelected !== null ? 'default' : 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)' }}>
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>
          {choiceSelected !== null && (
            <>
              <div
                className="border-2 p-3"
                style={{
                  borderColor: stage.options[choiceSelected].correct ? 'var(--neon-green)' : 'var(--neon-coral)',
                  background: 'var(--bg-dark)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                }}
              >
                <strong style={{ color: stage.options[choiceSelected].correct ? 'var(--neon-green)' : 'var(--neon-coral)' }}>
                  {stage.options[choiceSelected].correct ? 'CORRECT!' : 'Not quite.'}
                </strong>{' '}
                {stage.explanation}
              </div>
              <PixelButton onClick={advanceStage}>Continue</PixelButton>
            </>
          )}
        </div>
      )}

      {/* ===== PROMPT stage ===== */}
      {stage.type === 'prompt' && (
        <div className="flex flex-col gap-3">
          <div
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
          >
            {stage.instruction}
          </div>
          <div
            className="border-2 p-3"
            style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}
          >
            {stage.question}
          </div>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Write your prompt here..."
            disabled={promptResult !== null}
            className="border-2 p-3 resize-none"
            rows={4}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              background: 'var(--bg-void)',
              borderColor: 'var(--border-pixel)',
              outline: 'none',
            }}
          />
          {!promptResult ? (
            <PixelButton onClick={handlePromptSubmit}>Submit Prompt</PixelButton>
          ) : (
            <>
              <div
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-gold)', textTransform: 'uppercase' }}
              >
                Prompt Score: +{promptResult.earned} XP
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
                {promptResult.labels.map((label, i) => (
                  <div key={i} style={{ color: label.startsWith('✓') ? 'var(--neon-green)' : 'var(--neon-coral)' }}>
                    {label}
                  </div>
                ))}
              </div>
              <div
                className="border-2 p-3"
                style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
              >
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Ideal Answer
                </div>
                <div className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {promptResult.ideal}
                </div>
              </div>
              <PixelButton onClick={advanceStage}>Continue</PixelButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
