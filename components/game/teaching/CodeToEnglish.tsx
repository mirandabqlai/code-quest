// components/game/teaching/CodeToEnglish.tsx
'use client';

import { useState } from 'react';
import type { CodeToEnglishBlock, GlossaryTerm } from '@/lib/game/types-v2';
import GlossaryTooltip from './GlossaryTooltip';

interface CodeToEnglishProps {
  block: CodeToEnglishBlock;
  glossary: GlossaryTerm[];
}

/**
 * Side-by-side view: real code on the left, plain English on the right.
 * Hover a line on either side to highlight the matching line.
 */
export default function CodeToEnglish({ block, glossary }: CodeToEnglishProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* File path label */}
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--text-dim)',
          marginBottom: '6px',
          letterSpacing: '1px',
        }}
      >
        {block.file}:{block.startLine}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '120px' }}>
        {/* Code side */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-gold)',
              marginBottom: '6px',
            }}
          >
            CODE
          </div>
          <div
            style={{
              background: 'var(--bg-void)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '3px',
              padding: '10px',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              lineHeight: '1.8',
              color: 'var(--text-code)',
              overflowX: 'auto',
            }}
          >
            {block.code.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredLine(i)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{
                  padding: '1px 4px',
                  background: hoveredLine === i
                    ? 'rgba(78, 205, 196, 0.1)'
                    : 'transparent',
                  borderLeft: hoveredLine === i
                    ? '2px solid var(--neon-blue)'
                    : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'pre',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* English side */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--neon-gold)',
              marginBottom: '6px',
            }}
          >
            PLAIN ENGLISH
          </div>
          <div
            style={{
              fontSize: '13px',
              lineHeight: '1.8',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              background: 'var(--bg-void)',
              border: '1px solid var(--border-pixel)',
              borderRadius: '3px',
              padding: '10px',
            }}
          >
            {block.english.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredLine(i)}
                onMouseLeave={() => setHoveredLine(null)}
                style={{
                  padding: '2px 8px',
                  borderLeft: hoveredLine === i
                    ? '2px solid var(--neon-blue)'
                    : '2px solid transparent',
                  background: hoveredLine === i
                    ? 'rgba(78, 205, 196, 0.06)'
                    : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {renderWithGlossary(line, glossary)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Parse text and wrap glossary terms with GlossaryTooltip.
 * Terms are marked with [[term]] syntax in the AI-generated English text.
 */
function renderWithGlossary(text: string, glossary: GlossaryTerm[]): React.ReactNode {
  // Split on [[term]] markers
  const parts = text.split(/\[\[([^\]]+)\]\]/g);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // This is a glossary term
      return (
        <GlossaryTooltip key={i} term={part} glossary={glossary}>
          {part}
        </GlossaryTooltip>
      );
    }
    return part;
  });
}
