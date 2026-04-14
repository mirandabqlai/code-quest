// components/game/teaching/GlossaryTooltip.tsx
'use client';

import { useState } from 'react';
import type { GlossaryTerm } from '@/lib/game/types-v2';

interface GlossaryTooltipProps {
  term: string;
  glossary: GlossaryTerm[];
  children: React.ReactNode;
}

/**
 * Wraps text in a hover tooltip that shows a plain-English definition.
 * Used throughout Story and Code tabs to explain technical terms.
 */
export default function GlossaryTooltip({ term, glossary, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);

  const entry = glossary.find(g =>
    g.term.toLowerCase() === term.toLowerCase()
  );

  if (!entry) return <>{children}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span
        className="cursor-help"
        style={{
          color: 'var(--neon-blue)',
          borderBottom: '1px dashed var(--neon-blue)',
        }}
      >
        {children}
      </span>

      {visible && (
        <span
          className="absolute z-50 pointer-events-none"
          style={{
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-desk)',
            border: '1px solid var(--neon-blue)',
            borderRadius: '3px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            maxWidth: '280px',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
          }}
        >
          {entry.definition}
          {/* Arrow pointing down */}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              border: '5px solid transparent',
              borderTopColor: 'var(--neon-blue)',
            }}
          />
        </span>
      )}
    </span>
  );
}
