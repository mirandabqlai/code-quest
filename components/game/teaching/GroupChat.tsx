// components/game/teaching/GroupChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import type { GroupChatMessage, GameCharacter } from '@/lib/game/types-v2';
import { findCharacter, DEFAULT_COLOR } from '@/lib/game/character-utils';
import CharacterAvatar from '@/components/game/ui/CharacterAvatar';

interface GroupChatProps {
  messages: GroupChatMessage[];
  characters: GameCharacter[];
  autoPlay?: boolean;
}

/**
 * iMessage-style chat between characters showing how components communicate.
 * Messages animate in one at a time with typing indicators.
 */
export default function GroupChat({ messages, characters, autoPlay = true }: GroupChatProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoPlay || visibleCount >= messages.length) return;

    const nextMsg = messages[visibleCount];
    const delay = nextMsg?.delay ?? 500;

    // Show typing indicator
    setTyping(true);
    const typingTimer = setTimeout(() => {
      setTyping(false);
      setVisibleCount(c => c + 1);
    }, delay);

    return () => clearTimeout(typingTimer);
  }, [visibleCount, messages, autoPlay]);

  // Scroll to bottom as messages appear
  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount]);

  const getChar = (id: string) => findCharacter(characters, id);

  return (
    <div
      ref={containerRef}
      style={{
        maxWidth: '440px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '8px 0',
      }}
    >
      {messages.slice(0, visibleCount).map((msg, i) => {
        const char = getChar(msg.characterId);
        return (
          <div key={i} className="flex gap-2 items-start" style={{ marginBottom: '10px' }}>
            <CharacterAvatar
              name={char?.name ?? '?'}
              color={char?.color ?? DEFAULT_COLOR}
              size="sm"
            />

            <div>
              {/* Name */}
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: char?.color ?? DEFAULT_COLOR,
                  marginBottom: '3px',
                  textTransform: 'uppercase',
                }}
              >
                {char?.name ?? 'Unknown'}
              </div>

              {/* Bubble */}
              <div
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-pixel)',
                  borderRadius: '0 8px 8px 8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  maxWidth: '340px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {msg.message}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {typing && visibleCount < messages.length && (() => {
        const typingChar = getChar(messages[visibleCount].characterId);
        return (
          <div className="flex gap-2 items-start" style={{ marginBottom: '10px', opacity: 0.6 }}>
            <CharacterAvatar
              name={typingChar?.name ?? '?'}
              color={typingChar?.color ?? DEFAULT_COLOR}
              size="sm"
            />
            <div
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-pixel)',
                borderRadius: '0 8px 8px 8px',
                padding: '8px 12px',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span className="animate-pulse">• • •</span>
            </div>
          </div>
        );
      })()}

      {/* "Click to continue" if not autoplaying */}
      {!autoPlay && visibleCount < messages.length && (
        <button
          onClick={() => setVisibleCount(c => c + 1)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--neon-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          ▶ NEXT MESSAGE
        </button>
      )}
    </div>
  );
}
