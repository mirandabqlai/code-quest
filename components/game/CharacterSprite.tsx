'use client';

import { useState } from 'react';
import type { GameCharacter } from '@/lib/game/types';
import { SPRITE_CONFIGS } from '@/lib/game/sprites';

interface CharacterSpriteProps {
  character: GameCharacter;
  x: number;
  y: number;
  speaking?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SCALE = { sm: 3, md: 4, lg: 5 };

export default function CharacterSprite({
  character, x, y, speaking, selected, onClick, size = 'md',
}: CharacterSpriteProps) {
  const config = SPRITE_CONFIGS[character.spriteType] ?? SPRITE_CONFIGS.engineer;
  const scale = SCALE[size];
  const spriteSize = 8 * scale;

  return (
    <div
      className="absolute cursor-pointer transition-all duration-500"
      style={{
        left: x,
        top: y,
        transitionTimingFunction: 'steps(8)',
        zIndex: selected ? 10 : 1,
      }}
      onClick={onClick}
    >
      {/* Character body — emoji fallback for now, sprite sheets in future */}
      <div
        className={`flex items-center justify-center border-2 ${selected ? 'animate-[idle-bob_0.6s_steps(4)_infinite]' : ''}`}
        style={{
          width: spriteSize,
          height: spriteSize,
          borderColor: selected ? character.color : 'var(--border-pixel)',
          background: 'var(--bg-desk)',
          fontSize: spriteSize * 0.5,
          boxShadow: selected ? `0 0 8px ${character.color}40` : 'none',
        }}
      >
        {config.accessory}
      </div>

      {/* Name tag */}
      <div
        className="text-center mt-1 whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '5px',
          letterSpacing: '1px',
          color: character.color,
          textTransform: 'uppercase' as const,
        }}
      >
        {character.name}
      </div>

      {/* File path label */}
      <div
        className="text-center opacity-60"
        style={{
          fontFamily: 'var(--font-code)',
          fontSize: '7px',
          color: 'var(--text-code)',
        }}
      >
        {character.files[0]?.split('/').slice(0, 2).join('/') ?? ''}
      </div>
    </div>
  );
}
