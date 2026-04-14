// components/game/OfficeOverview.tsx
'use client';

import type { OfficeLayout, GameCharacter, GameStateV2, GameContentV2 } from '@/lib/game/types-v2';
import { getRoomProgress, isRoomMastered, countMasteredRooms } from '@/lib/game/xp';

interface OfficeOverviewProps {
  layout: OfficeLayout;
  characters: GameCharacter[];
  gameState: GameStateV2;
  onRoomClick: (roomId: string) => void;
  roomsLoading?: boolean;
  meta?: GameContentV2['meta'];
}

export default function OfficeOverview({ layout, characters, gameState, onRoomClick, roomsLoading, meta }: OfficeOverviewProps) {
  const mastered = countMasteredRooms(gameState);

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>

      {/* Loading banner */}
      {roomsLoading && (
        <div style={{
          background: 'rgba(0,255,65,0.08)',
          border: '1px solid var(--neon-green)',
          borderRadius: '3px',
          padding: '10px 14px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-green)', marginBottom: '8px' }}>
            ROOM CONTENT IS STILL GENERATING...
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: 'var(--font-pixel)', fontSize: '7px', padding: '6px 16px',
              background: 'var(--bg-dark)', color: 'var(--neon-green)',
              border: '2px solid var(--neon-green)', borderRadius: '2px', cursor: 'pointer',
            }}
          >
            CHECK AGAIN
          </button>
        </div>
      )}

      {/* === SECTION 1: What is this project? === */}
      <div style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--neon-gold)',
        borderRadius: '4px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--neon-gold)', marginBottom: '6px' }}>
          {meta?.repoName ?? 'PROJECT'}
        </div>
        {meta?.repoDescription && (
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', fontFamily: 'var(--font-body)', marginBottom: '8px' }}>
            {meta.repoDescription}
          </div>
        )}
        {meta?.techStack && meta.techStack.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {meta.techStack.map(tech => (
              <span key={tech} style={{
                fontSize: '10px', fontFamily: 'var(--font-code)',
                padding: '2px 6px', background: 'var(--bg-panel)',
                border: '1px solid var(--border-pixel)', borderRadius: '2px',
                color: 'var(--neon-blue)',
              }}>
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* === SECTION 2: Architecture map — which folders matter === */}
      <div style={{
        background: 'var(--bg-dark)',
        border: '1px solid var(--border-pixel)',
        borderRadius: '4px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-green)', marginBottom: '10px' }}>
          ARCHITECTURE — THE FILES THAT MATTER
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px', fontFamily: 'var(--font-body)' }}>
          This project has {layout.rooms.length} key areas. Everything else is config or boilerplate — you can ignore it.
        </div>

        {layout.rooms.map(room => {
          const char = characters.find(c => c.roomId === room.id);
          return (
            <div
              key={room.id}
              onClick={() => onRoomClick(room.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '8px', marginBottom: '4px', borderRadius: '3px',
                cursor: 'pointer', transition: 'background 0.15s',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{
                color: char?.color ?? 'var(--text-dim)',
                fontSize: '14px', lineHeight: '1', marginTop: '2px',
              }}>●</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--neon-green)' }}>
                    {room.folder}
                  </span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: char?.color }}>
                    {room.name}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                  {char?.summary ?? `${char?.name} works here`}
                </div>
              </div>
            </div>
          );
        })}

        {/* Connections — how data flows between areas */}
        {layout.connections.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-pixel)' }}>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', marginBottom: '6px' }}>
              HOW THEY CONNECT
            </div>
            {layout.connections.map((conn, i) => {
              const fromRoom = layout.rooms.find(r => r.id === conn.from);
              const toRoom = layout.rooms.find(r => r.id === conn.to);
              const fromChar = characters.find(c => c.roomId === conn.from);
              const toChar = characters.find(c => c.roomId === conn.to);
              return (
                <div key={i} style={{
                  fontSize: '11px', fontFamily: 'var(--font-body)',
                  color: 'var(--text-dim)', padding: '2px 0',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span style={{ color: fromChar?.color }}>{fromRoom?.name}</span>
                  <span style={{ color: 'var(--neon-gold)' }}>→</span>
                  <span style={{ color: toChar?.color }}>{toRoom?.name}</span>
                  {conn.label && <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>({conn.label})</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === SECTION 3: Rooms to explore === */}
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--neon-gold)', marginBottom: '8px' }}>
        EXPLORE ROOMS ({mastered}/{layout.rooms.length} MASTERED)
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div style={{ flex: 1, height: '4px', background: 'var(--bg-desk)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${(mastered / layout.rooms.length) * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))',
            borderRadius: '2px', transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {layout.rooms.map(room => {
        const char = characters.find(c => c.roomId === room.id);
        const progress = getRoomProgress(gameState, room.id);
        const roomMastered = isRoomMastered(progress);

        return (
          <div
            key={room.id}
            onClick={() => onRoomClick(room.id)}
            style={{
              background: 'var(--bg-dark)',
              border: `1px solid ${roomMastered ? 'var(--neon-gold)' : char?.color ?? 'var(--border-pixel)'}`,
              borderRadius: '3px', padding: '10px 14px', marginBottom: '6px',
              cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center',
              boxShadow: roomMastered ? '0 0 8px rgba(255,217,61,0.2)' : 'none',
              transition: 'transform 0.1s',
            }}
          >
            <div style={{
              width: '28px', height: '28px',
              border: `2px solid ${char?.color ?? '#7a7a8e'}`, borderRadius: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-panel)',
              fontFamily: 'var(--font-pixel)', fontSize: '6px', color: char?.color,
            }}>
              {(char?.name ?? '?').slice(0, 3).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: char?.color }}>
                {room.name}
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--neon-green)' }}>
                {room.folder}
              </div>
            </div>
            <div className="flex gap-1">
              <span style={{ fontSize: '10px', opacity: progress.storyComplete ? 1 : 0.3 }}>📖</span>
              <span style={{ fontSize: '10px', opacity: progress.codeComplete ? 1 : 0.3 }}>💻</span>
              <span style={{ fontSize: '10px', opacity: progress.challengesComplete.bossComplete ? 1 : 0.3 }}>🎮</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
