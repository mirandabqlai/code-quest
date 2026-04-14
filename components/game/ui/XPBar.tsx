'use client';

import { getLevelInfo } from '@/lib/game/xp';

interface XPBarProps {
  xp: number;
  glitchTokens: number;
}

export default function XPBar({ xp, glitchTokens }: XPBarProps) {
  const info = getLevelInfo(xp);

  return (
    <div
      className="flex items-center gap-3 px-4 h-11 border-b-2 border-[var(--border-pixel)] bg-[var(--bg-panel)] sticky top-0 z-50"
      style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', letterSpacing: '1px' }}
    >
      <span className="text-[var(--text-dim)] uppercase whitespace-nowrap min-w-[140px]">
        LVL {info.level} — {info.name}
      </span>
      <div className="flex-1 h-3 bg-[var(--bg-void)] border-2 border-[var(--border-pixel)] max-w-[300px]">
        <div
          className="h-full bg-[var(--neon-gold)] transition-[width] duration-500"
          style={{ width: `${info.progress}%`, transitionTimingFunction: 'steps(10)' }}
        />
      </div>
      <span className="text-[var(--neon-gold)] whitespace-nowrap">
        {xp} / {info.nextXp} XP
      </span>
      <span className="text-[var(--neon-purple)] whitespace-nowrap">
        {glitchTokens} TOKENS
      </span>
    </div>
  );
}
