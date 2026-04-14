'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RepoInput from '@/components/landing/RepoInput';
import GenerationProgress from '@/components/landing/GenerationProgress';

const INITIAL_STEPS = [
  { key: 'reading', label: 'Reading repository', done: false, active: false },
  { key: 'analyzing', label: 'Analyzing architecture', done: false, active: false },
  { key: 'generating_tour', label: 'Writing dialogues', done: false, active: false },
  { key: 'generating_modes', label: 'Creating challenges', done: false, active: false },
  { key: 'generating_advanced', label: 'Building boss battles', done: false, active: false },
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
            const data = JSON.parse(line.slice(6));

            if (eventType === 'status') {
              setSteps(prev => prev.map(s => ({
                ...s,
                active: s.key === data.step,
                done: s.done || (s.active && s.key !== data.step),
              })));
            } else if (eventType === 'tour_ready') {
              // Redirect to game — user can start playing
              setSteps(prev => prev.map(s => s.key === 'generating_tour' ? { ...s, done: true, active: false } : s));
              router.push(`/g/${data.gameId}`);
              return;
            } else if (eventType === 'error') {
              setError(data.message);
              setGenerating(false);
              return;
            }

            eventType = '';
          }
        }
      }
    } catch {
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
        </>
      ) : (
        <GenerationProgress steps={steps} error={error} />
      )}
    </main>
  );
}
