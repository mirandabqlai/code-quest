'use client';

interface ProgressStep {
  key: string;
  label: string;
  done: boolean;
  active: boolean;
}

interface GenerationProgressProps {
  steps: ProgressStep[];
  error?: string;
  gameId?: string;
}

export default function GenerationProgress({ steps, error, gameId }: GenerationProgressProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {steps.map((step) => (
        <div
          key={step.key}
          className="flex items-center gap-3 px-4 py-2 border-2"
          style={{
            borderColor: step.done ? 'var(--neon-green)' : step.active ? 'var(--neon-gold)' : 'var(--border-pixel)',
            background: step.active ? 'rgba(255,217,61,0.05)' : 'var(--bg-panel)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
          }}
        >
          <span>
            {step.done ? '\u2713' : step.active ? '\u25B6' : '\u25CB'}
          </span>
          <span style={{ color: step.done ? 'var(--neon-green)' : step.active ? 'var(--neon-gold)' : 'var(--text-dim)' }}>
            {step.label}
          </span>
        </div>
      ))}
      {error && (
        <div className="px-4 py-3 border-2 border-[var(--neon-coral)] text-[var(--neon-coral)]" style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
