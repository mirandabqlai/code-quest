'use client';

import { useState } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface RepoInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export default function RepoInput({ onSubmit, disabled }: RepoInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/github\.com\/[^/]+\/[^/\s]+/.test(trimmed)) {
      setError("That doesn't look like a GitHub repo URL");
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-lg">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="https://github.com/owner/repo"
          disabled={disabled}
          className="flex-1 bg-[var(--bg-void)] border-2 border-[var(--border-pixel)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon-blue)]"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        <PixelButton onClick={handleSubmit} disabled={disabled}>
          GENERATE
        </PixelButton>
      </div>
      {error && (
        <p className="text-[var(--neon-coral)] text-xs" style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
