'use client';

import { useEffect, useState } from 'react';

interface ChatBubbleProps {
  text: string;
  color: string;
  visible: boolean;
}

export default function ChatBubble({ text, color, visible }: ChatBubbleProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!visible) { setDisplayText(''); return; }
    setDisplayText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [text, visible]);

  if (!visible) return null;

  return (
    <div
      className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 border-2 max-w-[200px] z-20"
      style={{
        background: 'var(--bg-panel)',
        borderColor: color,
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        color: 'var(--text-primary)',
        lineHeight: '1.4',
      }}
    >
      {/* Triangle pointer */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${color}`,
        }}
      />
      {displayText}
    </div>
  );
}
