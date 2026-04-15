// components/game/RoomContext.tsx
//
// Left panel when inside a room. Replaces the pixel art canvas with
// useful context: character info, file tree, architecture connections,
// and quick links to related rooms.

'use client';

import type { GameCharacter, OfficeLayout, CharacterContent } from '@/lib/game/types-v2';
import CharacterAvatar from '@/components/game/ui/CharacterAvatar';

interface RoomContextProps {
  room: OfficeLayout['rooms'][0];
  character: GameCharacter;
  content: CharacterContent;
  layout: OfficeLayout;
  characters: GameCharacter[];
  onRoomClick: (roomId: string) => void;
  onBack: () => void;
}

export default function RoomContext({
  room, character, content, layout, characters, onRoomClick, onBack,
}: RoomContextProps) {
  // Find rooms connected to this one
  const connections = layout.connections.filter(
    c => c.from === room.id || c.to === room.id
  );

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-dark)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          padding: '8px 12px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--neon-gold)',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid var(--border-pixel)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        ← BACK TO OFFICE
      </button>

      {/* Character card */}
      <div style={{
        padding: '14px',
        borderBottom: '1px solid var(--border-pixel)',
      }}>
        <div className="flex gap-3 items-center" style={{ marginBottom: '8px' }}>
          <CharacterAvatar name={character.name} color={character.color} size="lg" />
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: character.color }}>
              {character.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
              {character.title}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5', fontFamily: 'var(--font-body)' }}>
          {character.summary}
        </div>
      </div>

      {/* Room info */}
      <div style={{
        padding: '14px',
        borderBottom: '1px solid var(--border-pixel)',
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-green)', marginBottom: '8px' }}>
          {room.name.toUpperCase()} — {room.folder}
        </div>
      </div>

      {/* Files in this room */}
      <div style={{
        padding: '14px',
        borderBottom: '1px solid var(--border-pixel)',
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', marginBottom: '8px' }}>
          FILES ({character.files.length})
        </div>
        {character.files.map(file => (
          <div key={file} style={{
            fontFamily: 'var(--font-code)', fontSize: '11px',
            color: 'var(--neon-green)', padding: '2px 0',
          }}>
            {file}
          </div>
        ))}
      </div>

      {/* Connections to other rooms */}
      {connections.length > 0 && (
        <div style={{ padding: '14px', borderBottom: '1px solid var(--border-pixel)' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', marginBottom: '8px' }}>
            CONNECTS TO
          </div>
          {connections.map((conn, i) => {
            const otherRoomId = conn.from === room.id ? conn.to : conn.from;
            const otherRoom = layout.rooms.find(r => r.id === otherRoomId);
            const otherChar = characters.find(c => c.roomId === otherRoomId);
            const direction = conn.from === room.id ? '→' : '←';

            return (
              <div
                key={i}
                onClick={() => onRoomClick(otherRoomId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 8px', marginBottom: '4px', borderRadius: '3px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  border: `1px solid ${otherChar?.color ?? 'var(--border-pixel)'}22`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: 'var(--neon-gold)', fontSize: '12px' }}>{direction}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: otherChar?.color }}>
                    {otherRoom?.name}
                  </div>
                  {conn.label && (
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                      {conn.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Glossary terms for this room */}
      {content.glossaryTerms.length > 0 && (
        <div style={{ padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', marginBottom: '8px' }}>
            KEY TERMS
          </div>
          {content.glossaryTerms.map(term => (
            <div key={term.id} style={{ marginBottom: '6px' }}>
              <div style={{
                fontFamily: 'var(--font-code)', fontSize: '11px',
                color: 'var(--neon-blue)', marginBottom: '1px',
              }}>
                {term.term}
              </div>
              <div style={{
                fontSize: '11px', color: 'var(--text-dim)',
                fontFamily: 'var(--font-body)', lineHeight: '1.4',
              }}>
                {term.definition}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
