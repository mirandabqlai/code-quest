'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RepoInput from '@/components/landing/RepoInput';
import GenerationProgress from '@/components/landing/GenerationProgress';

const INITIAL_STEPS = [
  { key: 'reading', label: 'Reading repository', done: false, active: false },
  { key: 'analyzing', label: 'Designing office layout', done: false, active: false },
  { key: 'generating_tour', label: "Mike is preparing your tour", done: false, active: false },
  { key: 'generating_room', label: 'Building room content', done: false, active: false },
];

export default function LandingPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async (repoUrl: string) => {
    setGenerating(true);
    setError('');
    setSteps(INITIAL_STEPS);

    let gameIdRef = '';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      // Check for cached result (non-streaming response)
      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.cached && data.gameId) {
          router.push(`/g/${data.gameId}`);
          return;
        }
        if (data.error) {
          setError(data.error);
          setGenerating(false);
          return;
        }
      }

      // SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ') && eventType) {
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(line.slice(6));
            } catch {
              eventType = '';
              continue; // Skip malformed JSON lines
            }

            if (eventType === 'status') {
              const step = data.step as string;
              setSteps(prev => prev.map(s => {
                // Mark previous step done when a new step starts
                // Also handle 'reading_done' → marks 'reading' as done
                const isDone = s.done
                  || (step === 'reading_done' && s.key === 'reading')
                  || (s.active && s.key !== step);
                return {
                  ...s,
                  active: s.key === step,
                  done: isDone,
                };
              }));
            } else if (eventType === 'tour_ready') {
              // Save gameId but DON'T redirect yet — wait for all rooms
              gameIdRef = data.gameId as string;
              setSteps(prev => prev.map(s => s.key === 'generating_tour' ? { ...s, done: true, active: false } : s));
            } else if (eventType === 'complete') {
              // All content ready — NOW redirect
              const gid = (data.gameId as string) || gameIdRef;
              if (gid) { router.push(`/g/${gid}`); return; }
            } else if (eventType === 'error') {
              setError(data.message as string);
              setGenerating(false);
              return;
            }

            eventType = '';
          }
        }
      }

      // Stream ended — if we got a gameId but missed the 'complete' event, redirect anyway
      if (gameIdRef) {
        router.push(`/g/${gameIdRef}`);
        return;
      }
    } catch {
      // If we already have a gameId, redirect instead of showing error
      if (gameIdRef) {
        router.push(`/g/${gameIdRef}`);
        return;
      }
      setError('Connection lost. Try again.');
      setGenerating(false);
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6 p-4">
      <h1
        className="text-2xl text-[var(--neon-gold)] tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-pixel)' }}
      >
        CODE QUEST
      </h1>
      <p
        className="text-[10px] text-[var(--neon-blue)] tracking-[6px] uppercase"
        style={{ fontFamily: 'var(--font-pixel)' }}
      >
        Turn any codebase into a game
      </p>

      {!generating ? (
        <>
          <p className="text-[var(--text-dim)] text-center max-w-md text-sm">
            Paste a GitHub repo URL. Get a retro pixel-art arcade game that
            teaches how the code works — no coding knowledge required.
          </p>
          <RepoInput onSubmit={handleGenerate} />

          {/* Divider between repo flow and Academy */}
          <div className="flex items-center gap-3 w-full max-w-lg mt-2">
            <div className="flex-1 h-px bg-[var(--border-pixel)]" />
            <span
              className="text-[var(--text-dim)] uppercase"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', letterSpacing: '2px' }}
            >
              OR
            </span>
            <div className="flex-1 h-px bg-[var(--border-pixel)]" />
          </div>

          {/* AI Academy entry point */}
          <button
            onClick={() => router.push('/academy')}
            className="
              uppercase tracking-[3px] text-[var(--neon-purple)]
              bg-[var(--bg-panel)] border-[3px] border-[var(--neon-purple)] cursor-pointer
              px-6 py-3 transition-all duration-100
              hover:bg-[var(--border-pixel)] hover:-translate-x-0.5 hover:-translate-y-0.5
              hover:shadow-[2px_2px_0_var(--neon-purple)]
              active:translate-x-0 active:translate-y-0 active:shadow-none
            "
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
          >
            AI ACADEMY
          </button>
          <p
            className="text-[var(--text-dim)] text-center text-xs -mt-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Learn AI fundamentals through 17 mini-games (~2 hours)
          </p>
        </>
      ) : (
        <GenerationProgress steps={steps} error={error} />
      )}
    </main>
  );
}
