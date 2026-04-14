// components/game/OfficeOverview.tsx
'use client';

import type { OfficeLayout, GameCharacter, GameStateV2 } from '@/lib/game/types-v2';
import { getRoomProgress, isRoomMastered, countMasteredRooms } from '@/lib/game/xp';

interface OfficeOverviewProps {
  layout: OfficeLayout;
  characters: GameCharacter[];
  gameState: GameStateV2;
  onRoomClick: (roomId: string) => void;
  roomsLoading?: boolean;
}

/**
 * Right panel when no room is selected.
 * Shows a list of all rooms with mastery status indicators (📖 💻 🎮).
 * The mastery progress bar fills as more rooms are completed.
 */
export default function OfficeOverview({ layout, characters, gameState, onRoomClick, roomsLoading }: OfficeOverviewProps) {
  const mastered = countMasteredRooms(gameState);

  return (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--neon-gold)',
          marginBottom: '4px',
        }}
      >
        THE OFFICE
      </div>

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
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              padding: '6px 16px',
              background: 'var(--bg-dark)',
              color: 'var(--neon-green)',
              border: '2px solid var(--neon-green)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            CHECK AGAIN
          </button>
        </div>
      )}

      <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>
        {roomsLoading
          ? "Mike's tour is ready! Room content is still being generated — it'll appear shortly."
          : 'Click a room to explore. Master 3 rooms to unlock the Boss Battle.'}
      </div>

      {/* Project structure — shows which folders map to which rooms */}
      <div
        style={{
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-pixel)',
          borderRadius: '3px',
          padding: '10px 14px',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-green)', marginBottom: '8px' }}>
          PROJECT STRUCTURE
        </div>
        {layout.rooms.map(room => {
          const char = characters.find(c => c.roomId === room.id);
          return (
            <div
              key={room.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 0',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
              }}
            >
              <span style={{ color: char?.color ?? 'var(--text-dim)', fontSize: '10px' }}>●</span>
              <span style={{ color: 'var(--neon-green)' }}>{room.folder}</span>
              <span style={{ color: 'var(--text-dim)' }}>→</span>
              <span style={{ color: char?.color ?? 'var(--text-primary)' }}>{room.name}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>({char?.name})</span>
            </div>
          );
        })}
      </div>

      {/* Overall mastery progress bar */}
      <div className="flex items-center gap-2 mb-4">
        <div style={{ flex: 1, height: '6px', background: 'var(--bg-desk)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(mastered / layout.rooms.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))',
              borderRadius: '3px',
              transition: 'width 0.5s',
            }}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-green)' }}>
          {mastered}/{layout.rooms.length}
        </span>
      </div>

      {/* Room list — one card per room */}
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
              // Gold border for mastered rooms, character color otherwise
              border: `1px solid ${roomMastered ? 'var(--neon-gold)' : char?.color ?? 'var(--border-pixel)'}`,
              borderRadius: '3px',
              padding: '10px 14px',
              marginBottom: '8px',
              cursor: 'pointer',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              boxShadow: roomMastered ? '0 0 8px rgba(255,217,61,0.2)' : 'none',
              transition: 'transform 0.15s',
            }}
          >
            {/* Character avatar — abbreviated name in their color */}
            <div
              style={{
                width: '32px',
                height: '32px',
                border: `2px solid ${char?.color ?? '#7a7a8e'}`,
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-panel)',
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: char?.color,
              }}
            >
              {(char?.name ?? '?').slice(0, 3).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: char?.color ?? 'var(--text-primary)' }}>
                {room.name}
              </div>
              <div style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--neon-green)' }}>
                {room.folder}
              </div>
            </div>
            {/* Completion icons: dim = not done, full opacity = done */}
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
