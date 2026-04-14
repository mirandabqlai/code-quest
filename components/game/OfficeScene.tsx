'use client';

import type { GameCharacter, FolderNode } from '@/lib/game/types';
import { SPRITE_CONFIGS } from '@/lib/game/sprites';
import FolderOverlay from './FolderOverlay';
import ChatBubble from './ChatBubble';

interface OfficeSceneProps {
  characters: GameCharacter[];
  folderTree: FolderNode[];
  activeCharId: string | null;
  chatText: string;
  onCharacterClick: (charId: string) => void;
}

/**
 * Left panel of the game — split into two stacked sections:
 *   Top  (~40%): Always-visible project folder tree ("map")
 *   Bottom (~60%): Pixel-art office floor with CSS furniture + characters at desks
 *
 * The office floor draws desks, monitors, filing cabinets, and bookshelves
 * using pure CSS (colored divs with borders). Each character sits at a desk.
 * Clicking a character selects them and opens their tour in the right panel.
 */
export default function OfficeScene({
  characters, folderTree, activeCharId, chatText, onCharacterClick,
}: OfficeSceneProps) {
  return (
    <div className="flex flex-col h-full border-r-2 border-[var(--border-pixel)]">
      {/* ===== TOP: Folder tree — always visible, scrollable ===== */}
      <div
        className="border-b-2 border-[var(--border-pixel)]"
        style={{ height: '40%', minHeight: 120 }}
      >
        <FolderOverlay folderTree={folderTree} characters={characters} />
      </div>

      {/* ===== BOTTOM: Office scene with furniture + characters ===== */}
      <div className="relative flex-1 overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
        {/* Floor grid — subtle tile pattern */}
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--border-pixel) 0px, var(--border-pixel) 1px, transparent 1px, transparent 40px),' +
            'repeating-linear-gradient(90deg, var(--border-pixel) 0px, var(--border-pixel) 1px, transparent 1px, transparent 40px)',
        }} />

        {/* "Office Floor" label */}
        <div
          className="absolute top-2 left-3 z-10 uppercase tracking-[2px]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)' }}
        >
          Office Floor
        </div>

        {/* Furniture + characters — rendered as "desks" in rows */}
        <div className="absolute inset-0 pt-5 px-3 overflow-y-auto">
          <OfficeFloor
            characters={characters}
            activeCharId={activeCharId}
            chatText={chatText}
            onCharacterClick={onCharacterClick}
          />
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// OfficeFloor — draws rows of desks with furniture and character sprites
// ===========================================================================

interface OfficeFloorProps {
  characters: GameCharacter[];
  activeCharId: string | null;
  chatText: string;
  onCharacterClick: (charId: string) => void;
}

/**
 * Renders the office as rows (like floors in a building).
 * Each row has 1-3 desks, each with a character sitting at it.
 * Furniture decorations are placed based on character spriteType:
 *   - archivist → filing cabinet
 *   - engineer/manager → extra monitor
 *   - cartographer → bookshelf
 *   - others → generic desk items
 */
function OfficeFloor({ characters, activeCharId, chatText, onCharacterClick }: OfficeFloorProps) {
  // Arrange characters into rows of up to 3
  const rows: GameCharacter[][] = [];
  for (let i = 0; i < characters.length; i += 3) {
    rows.push(characters.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-end gap-3 px-1 py-2 border-b"
          style={{ borderColor: 'var(--border-pixel)' }}
        >
          {/* Row label */}
          <div
            className="shrink-0"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '5px',
              color: 'var(--text-dim)',
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {rowIdx + 1}F
          </div>

          {/* Desks in this row */}
          <div className="flex gap-4 flex-1 flex-wrap">
            {row.map(char => {
              const isActive = activeCharId === char.id;
              const isSpeaking = isActive && !!chatText;
              return (
                <DeskUnit
                  key={char.id}
                  character={char}
                  active={isActive}
                  speaking={isSpeaking}
                  chatText={chatText}
                  onClick={() => onCharacterClick(char.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// DeskUnit — a single desk + character + furniture detail
// ===========================================================================

interface DeskUnitProps {
  character: GameCharacter;
  active: boolean;
  speaking: boolean;
  chatText: string;
  onClick: () => void;
}

/**
 * One "workstation": a desk surface with a monitor on top,
 * the character emoji sitting in front of it, and a role-specific
 * furniture piece beside them.
 *
 * All furniture is CSS — colored rectangles with borders, no images.
 */
function DeskUnit({ character, active, speaking, chatText, onClick }: DeskUnitProps) {
  const config = SPRITE_CONFIGS[character.spriteType] ?? SPRITE_CONFIGS.engineer;

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      style={{ width: 90 }}
      onClick={onClick}
    >
      {/* Chat bubble — shown above the desk when character is speaking */}
      {speaking && (
        <div className="relative mb-1" style={{ width: '100%' }}>
          <ChatBubble
            text={chatText.slice(0, 60) + (chatText.length > 60 ? '...' : '')}
            color={character.color}
            visible={true}
          />
        </div>
      )}

      {/* === Desk surface with monitor === */}
      <div className="relative w-full" style={{ height: 28 }}>
        {/* Monitor screen */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-3"
          style={{
            width: 24,
            height: 16,
            background: active ? `${character.color}22` : 'var(--bg-void)',
            border: `2px solid ${active ? character.color : 'var(--border-pixel)'}`,
            borderRadius: 1,
          }}
        >
          {/* Screen glow lines */}
          <div className="w-full h-full overflow-hidden opacity-40" style={{ padding: 2 }}>
            <div style={{
              width: '100%', height: 1,
              background: active ? character.color : 'var(--neon-green)',
              marginTop: 2,
            }} />
            <div style={{
              width: '60%', height: 1,
              background: active ? character.color : 'var(--neon-green)',
              marginTop: 2,
            }} />
          </div>
        </div>
        {/* Monitor stand */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 13,
            width: 4,
            height: 6,
            background: 'var(--border-pixel)',
          }}
        />
        {/* Desk surface */}
        <div
          className="absolute bottom-0 w-full"
          style={{
            height: 10,
            background: 'var(--bg-desk)',
            border: '2px solid var(--border-pixel)',
            borderRadius: 1,
          }}
        />
        {/* Role-specific furniture (small detail beside the desk) */}
        <FurnitureDetail spriteType={character.spriteType} color={character.color} />
      </div>

      {/* === Character sitting at the desk === */}
      <div
        className={`
          flex items-center justify-center border-2 mt-1
          ${active ? 'animate-[pulse_2s_infinite]' : ''}
          group-hover:animate-[idle-bob_0.6s_steps(4)_infinite]
        `}
        style={{
          width: 32,
          height: 32,
          borderColor: active ? character.color : 'var(--border-pixel)',
          background: 'var(--bg-desk)',
          fontSize: 16,
          boxShadow: active ? `0 0 12px ${character.color}60` : 'none',
          transition: 'border-color 0.1s steps(1), box-shadow 0.1s steps(1)',
        }}
      >
        {config.accessory}
      </div>

      {/* Character name */}
      <div
        className="text-center mt-1 whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '5px',
          letterSpacing: '1px',
          color: active ? character.color : 'var(--text-dim)',
          textTransform: 'uppercase' as const,
        }}
      >
        {character.name}
      </div>

      {/* File path — what this character "owns" */}
      <div
        className="text-center opacity-60"
        style={{
          fontFamily: 'var(--font-code)',
          fontSize: '7px',
          color: 'var(--text-code)',
        }}
      >
        {character.files[0]?.split('/').slice(0, 2).join('/') ?? ''}
      </div>
    </div>
  );
}

// ===========================================================================
// FurnitureDetail — small CSS decoration next to each desk
// ===========================================================================

interface FurnitureDetailProps {
  spriteType: string;
  color: string;
}

/**
 * Draws a tiny piece of furniture next to the desk, based on the character's role.
 * Everything is pure CSS — small colored rectangles with borders.
 *
 *   archivist     → filing cabinet (tall narrow box with drawer lines)
 *   engineer      → server rack (box with blinking light)
 *   cartographer  → bookshelf (stacked colored bars)
 *   manager       → clipboard on wall (small rectangle)
 *   scorekeeper   → chart on wall (bar graph shape)
 *   receptionist  → bell on desk (small dome)
 *   translator    → globe stand (circle)
 *   strategist    → shield on wall (diamond shape)
 */
function FurnitureDetail({ spriteType, color }: FurnitureDetailProps) {
  const pos = 'absolute right-0 top-0';

  switch (spriteType) {
    // Filing cabinet — tall narrow box with horizontal "drawer" lines
    case 'archivist':
      return (
        <div className={pos} style={{
          width: 12, height: 22, top: -14,
          background: 'var(--bg-panel)',
          border: `1px solid ${color}`,
        }}>
          <div style={{ borderBottom: `1px solid ${color}`, height: '33%' }} />
          <div style={{ borderBottom: `1px solid ${color}`, height: '33%' }} />
        </div>
      );

    // Server rack — box with small "LED" dot
    case 'engineer':
      return (
        <div className={pos} style={{
          width: 10, height: 18, top: -10,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-pixel)',
        }}>
          <div style={{
            width: 3, height: 3, borderRadius: '50%',
            background: 'var(--neon-green)',
            margin: '3px auto',
          }} />
          <div style={{
            width: 6, height: 1,
            background: 'var(--border-pixel)',
            margin: '2px auto',
          }} />
        </div>
      );

    // Bookshelf — stacked colored bars
    case 'cartographer':
      return (
        <div className={pos} style={{
          width: 14, height: 20, top: -12,
          display: 'flex', flexDirection: 'column', gap: 1,
          padding: 1,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-pixel)',
        }}>
          <div style={{ height: 4, background: 'var(--neon-coral)', opacity: 0.6 }} />
          <div style={{ height: 4, background: 'var(--neon-blue)', opacity: 0.6 }} />
          <div style={{ height: 4, background: 'var(--neon-gold)', opacity: 0.6 }} />
          <div style={{ height: 4, background: 'var(--neon-purple)', opacity: 0.6 }} />
        </div>
      );

    // Clipboard on wall
    case 'manager':
      return (
        <div className={pos} style={{
          width: 8, height: 12, top: -12,
          background: 'var(--bg-panel)',
          border: `1px solid ${color}`,
          borderRadius: 1,
        }}>
          <div style={{
            width: 4, height: 1,
            background: color,
            margin: '2px auto',
          }} />
          <div style={{
            width: 5, height: 1,
            background: 'var(--border-pixel)',
            margin: '2px auto',
          }} />
          <div style={{
            width: 3, height: 1,
            background: 'var(--border-pixel)',
            margin: '1px auto',
          }} />
        </div>
      );

    // Bar chart on wall
    case 'scorekeeper':
      return (
        <div className={pos} style={{
          width: 14, height: 14, top: -12,
          display: 'flex', alignItems: 'flex-end', gap: 1,
          padding: '1px 2px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-pixel)',
        }}>
          <div style={{ width: 3, height: 4, background: color, opacity: 0.7 }} />
          <div style={{ width: 3, height: 8, background: color, opacity: 0.7 }} />
          <div style={{ width: 3, height: 6, background: color, opacity: 0.7 }} />
        </div>
      );

    // Small bell dome
    case 'receptionist':
      return (
        <div className={pos} style={{
          width: 10, height: 8, top: -2, right: 4,
          borderRadius: '5px 5px 0 0',
          background: color,
          opacity: 0.5,
        }} />
      );

    // Globe on stand
    case 'translator':
      return (
        <div className={pos} style={{
          top: -12, right: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            border: `1px solid ${color}`,
            background: 'var(--bg-panel)',
          }} />
          <div style={{ width: 2, height: 4, background: 'var(--border-pixel)' }} />
        </div>
      );

    // Shield shape (diamond rotated)
    case 'strategist':
      return (
        <div className={pos} style={{
          width: 10, height: 10, top: -12,
          background: color,
          opacity: 0.4,
          transform: 'rotate(45deg)',
          border: '1px solid var(--border-pixel)',
        }} />
      );

    default:
      return null;
  }
}
