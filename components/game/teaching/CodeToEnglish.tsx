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
 * Row-based layout: each code line sits next to its English explanation.
 * Hover a row to highlight both sides. Lines always stay aligned.
 */
export default function CodeToEnglish({ block, glossary }: CodeToEnglishProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  return (
    <div
      style={{
        marginBottom: '16px',
        background: 'var(--bg-void)',
        border: '1px solid var(--border-pixel)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* File path header */}
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--bg-dark)',
          borderBottom: '1px solid var(--border-pixel)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-code)',
            fontSize: '11px',
            color: 'var(--neon-green)',
          }}
        >
          {block.file}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
          }}
        >
          LINE {block.startLine}
        </span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid var(--border-pixel)',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--neon-gold)',
            borderRight: '1px solid var(--border-pixel)',
          }}
        >
          CODE
        </div>
        <div
          style={{
            padding: '6px 12px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--neon-gold)',
          }}
        >
          PLAIN ENGLISH
        </div>
      </div>

      {/* Row-by-row: code line ↔ English explanation */}
      {block.code.map((codeLine, i) => {
        const englishLine = block.english[i] ?? '';
        const isHovered = hoveredLine === i;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredLine(i)}
            onMouseLeave={() => setHoveredLine(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: i < block.code.length - 1 ? '1px solid rgba(58,58,92,0.3)' : 'none',
              background: isHovered ? 'rgba(78, 205, 196, 0.06)' : 'transparent',
              transition: 'background 0.15s',
              cursor: 'default',
            }}
          >
            {/* Code cell */}
            <div
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: 'var(--text-code)',
                whiteSpace: 'pre',
                overflowX: 'auto',
                borderRight: '1px solid var(--border-pixel)',
                borderLeft: isHovered ? '3px solid var(--neon-blue)' : '3px solid transparent',
              }}
            >
              {codeLine}
            </div>

            {/* English cell */}
            <div
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderWithGlossary(englishLine, glossary)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Parse text and wrap glossary terms with GlossaryTooltip.
 * Terms are marked with [[term]] syntax in the AI-generated English text.
 */
function renderWithGlossary(text: string, glossary: GlossaryTerm[]): React.ReactNode {
  const parts = text.split(/\[\[([^\]]+)\]\]/g);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <GlossaryTooltip key={i} term={part} glossary={glossary}>
          {part}
        </GlossaryTooltip>
      );
    }
    return part;
  });
}
