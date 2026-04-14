'use client';

import { useState, useCallback } from 'react';
import type { BuildPuzzle, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import { DragItem, DropZone } from '@/components/game/ui/DragDrop';
import PixelButton from '@/components/game/ui/PixelButton';

interface BuildOfficeProps {
  puzzle: BuildPuzzle;
  characters: GameCharacter[];
  onXP: (amount: number) => void;
  onComplete: () => void;
  onChatText: (text: string) => void;
}

export default function BuildOffice({ puzzle, characters, onXP, onComplete, onChatText }: BuildOfficeProps) {
  // placements maps zone ID -> character ID
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [zoneResults, setZoneResults] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [result, setResult] = useState<{ message: string; success: boolean } | null>(null);
  const [checked, setChecked] = useState(false);
  const { play } = useSounds();

  // Helper to find character by id
  const getChar = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const handleDrop = useCallback((itemId: string, zoneId: string) => {
    if (checked) return;
    const charId = itemId.replace('build-tile-', '');
    const zone = zoneId.replace('build-zone-', '');

    setPlacements(prev => {
      const next = { ...prev };
      // Remove this character from any previous zone
      Object.keys(next).forEach(key => {
        if (next[key] === charId) delete next[key];
      });
      next[zone] = charId;
      return next;
    });
    play('click');
  }, [checked, play]);

  const handleCheck = useCallback(() => {
    const results: Record<string, 'correct' | 'wrong'> = {};
    let correct = 0;
    const total = puzzle.zones.length;

    puzzle.zones.forEach(zone => {
      const placedCharId = placements[zone.id];
      if (placedCharId && puzzle.correctPlacements[placedCharId] === zone.id) {
        results[zone.id] = 'correct';
        correct++;
      } else if (placedCharId) {
        results[zone.id] = 'wrong';
      }
    });

    setZoneResults(results);
    setChecked(true);

    if (correct === total) {
      play('correct');
      onXP(300);
      setResult({ message: `PERFECT BLUEPRINT! ${correct}/${total} CORRECT. +300 XP`, success: true });
      onComplete();
    } else {
      play('wrong');
      onXP(correct * 25);
      setResult({ message: `${correct}/${total} CORRECT. +${correct * 25} XP`, success: false });

      // Find a wrong placement and show feedback via chat
      const wrongZoneId = Object.keys(results).find(z => results[z] === 'wrong');
      if (wrongZoneId) {
        const wrongCharId = placements[wrongZoneId];
        if (wrongCharId) {
          const ch = getChar(wrongCharId);
          const correctZoneId = puzzle.correctPlacements[wrongCharId];
          const correctZone = puzzle.zones.find(z => z.id === correctZoneId);
          if (ch && correctZone) {
            onChatText(`${ch.name}: I don't belong here! I should be in ${correctZone.name} because that's where my work happens.`);
          }
        }
      }
    }
  }, [puzzle, placements, play, onXP, onComplete, getChar, onChatText]);

  const handleReset = useCallback(() => {
    setPlacements({});
    setZoneResults({});
    setResult(null);
    setChecked(false);
  }, []);

  // Which characters have been placed
  const placedCharIds = new Set(Object.values(placements));

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}
      >
        Build the Office
      </div>
      <div
        style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}
      >
        Drag each team member to the department where they belong.
      </div>

      {/* Zone grid (2x3) */}
      <div className="grid grid-cols-2 gap-3">
        {puzzle.zones.map(zone => {
          const placedCharId = placements[zone.id];
          const ch = placedCharId ? getChar(placedCharId) : null;
          const zoneResult = zoneResults[zone.id];

          let borderColor = 'var(--border-pixel)';
          if (zoneResult === 'correct') borderColor = 'var(--neon-green)';
          else if (zoneResult === 'wrong') borderColor = 'var(--neon-coral)';

          return (
            <DropZone
              key={zone.id}
              id={`build-zone-${zone.id}`}
              onDrop={handleDrop}
              className="border-2 p-3 min-h-[80px] flex flex-col items-center justify-center text-center transition-all"
              activeClass="border-[var(--neon-blue)]"
            >
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: zoneResult === 'correct' ? 'var(--neon-green)' : zoneResult === 'wrong' ? 'var(--neon-coral)' : 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderColor,
                }}
              >
                {zone.name}
              </div>
              <div
                className="mt-1"
                style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-dim)' }}
              >
                {zone.description}
              </div>
              {ch && (
                <div className="mt-2">
                  <span style={{ fontSize: '20px' }}>{'🧑‍💻'}</span>
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: ch.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ch.name}
                  </div>
                </div>
              )}
            </DropZone>
          );
        })}
      </div>

      {/* Character tiles to drag */}
      <div className="flex gap-2 flex-wrap">
        {characters.map(ch => {
          const isPlaced = placedCharIds.has(ch.id);
          return (
            <DragItem
              key={ch.id}
              id={`build-tile-${ch.id}`}
              disabled={checked}
              className={`border-2 p-2 flex flex-col items-center gap-1 min-w-[60px] transition-all ${isPlaced ? 'opacity-40' : ''}`}
            >
              <span style={{ fontSize: '18px' }}>{'🧑‍💻'}</span>
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
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

      {/* Action buttons */}
      <div className="flex gap-2 items-center">
        {!checked && (
          <PixelButton onClick={handleCheck}>Check Blueprint</PixelButton>
        )}
        {checked && !result?.success && (
          <PixelButton variant="danger" onClick={handleReset}>Try Again</PixelButton>
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
            color: result.success ? 'var(--neon-green)' : 'var(--neon-coral)',
          }}
        >
          {result.message}
        </div>
      )}

      {/* Connections (shown after success) */}
      {result?.success && puzzle.connections.length > 0 && (
        <div
          className="border-2 p-3"
          style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
        >
          <div
            className="mb-2"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Data Connections
          </div>
          {puzzle.connections.map((conn, i) => {
            const fromZone = puzzle.zones.find(z => z.id === conn.from);
            const toZone = puzzle.zones.find(z => z.id === conn.to);
            return (
              <div
                key={i}
                className="py-1"
                style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-primary)' }}
              >
                <span style={{ color: 'var(--neon-blue)' }}>{fromZone?.name}</span>
                {' → '}
                <span style={{ color: 'var(--neon-green)' }}>{toZone?.name}</span>
                <span style={{ color: 'var(--text-dim)' }}> — {conn.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
