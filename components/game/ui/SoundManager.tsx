'use client';

import { createContext, useContext, useCallback, useRef, useState } from 'react';

interface SoundContextType {
  play: (sound: 'correct' | 'wrong' | 'xp' | 'levelUp' | 'click' | 'dialogue') => void;
  muted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType>({
  play: () => {},
  muted: false,
  toggleMute: () => {},
});

export function useSounds() {
  return useContext(SoundContext);
}

function beep(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'square') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((sound: string) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      switch (sound) {
        case 'correct':
          beep(ctx, 523, 0.1); setTimeout(() => beep(ctx, 659, 0.1), 100); setTimeout(() => beep(ctx, 784, 0.15), 200);
          break;
        case 'wrong':
          beep(ctx, 200, 0.3, 'sawtooth');
          break;
        case 'xp':
          beep(ctx, 880, 0.05); setTimeout(() => beep(ctx, 1100, 0.05), 60);
          break;
        case 'levelUp':
          [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(ctx, f, 0.15), i * 120));
          break;
        case 'click':
          beep(ctx, 440, 0.05);
          break;
        case 'dialogue':
          beep(ctx, 600 + Math.random() * 200, 0.03);
          break;
      }
    } catch {}
  }, [muted, getCtx]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return (
    <SoundContext.Provider value={{ play, muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function MuteButton() {
  const { muted, toggleMute } = useSounds();
  return (
    <button
      onClick={toggleMute}
      className="fixed top-2 right-3 z-[200] text-[var(--text-dim)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-sm"
      style={{ fontFamily: 'var(--font-pixel)' }}
      title="Toggle sound"
    >
      {muted ? '\u{1F507}' : '\u{1F50A}'}
    </button>
  );
}
