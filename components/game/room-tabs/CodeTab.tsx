// components/game/room-tabs/CodeTab.tsx
'use client';

import { useState } from 'react';
import type { CodeToEnglishBlock, GlossaryTerm } from '@/lib/game/types-v2';
import CodeToEnglish from '@/components/game/teaching/CodeToEnglish';
import PixelButton from '@/components/game/ui/PixelButton';

interface CodeTabProps {
  codeBlocks: CodeToEnglishBlock[];
  glossary: GlossaryTerm[];
  onComplete: () => void;
}

export default function CodeTab({ codeBlocks, glossary, onComplete }: CodeTabProps) {
  const [blockIndex, setBlockIndex] = useState(0);
  const currentBlock = codeBlocks[blockIndex];
  const isLast = blockIndex >= codeBlocks.length - 1;

  if (!currentBlock) return <div style={{ color: 'var(--text-dim)' }}>No code to explore in this room.</div>;

  return (
    <div>
      {/* File tab selector — click any file name to jump to it */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {codeBlocks.map((block, i) => (
          <button
            key={i}
            onClick={() => setBlockIndex(i)}
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: '10px',
              padding: '4px 8px',
              background: i === blockIndex ? 'var(--bg-panel)' : 'var(--bg-dark)',
              color: i === blockIndex ? 'var(--neon-green)' : 'var(--text-dim)',
              border: `1px solid ${i === blockIndex ? 'var(--neon-green)' : 'var(--border-pixel)'}`,
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            {block.file.split('/').pop()}
          </button>
        ))}
      </div>

      {/* Code-to-English block for the selected file */}
      <CodeToEnglish block={currentBlock} glossary={glossary} />

      {/* Prev/next navigation */}
      <div className="flex justify-between mt-4">
        <PixelButton
          onClick={() => setBlockIndex(i => i - 1)}
          disabled={blockIndex === 0}
        >
          ← PREV FILE
        </PixelButton>
        <PixelButton
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setBlockIndex(i => i + 1);
            }
          }}
        >
          {isLast ? 'ALL FILES READ ✓' : 'NEXT FILE →'}
        </PixelButton>
      </div>
    </div>
  );
}
