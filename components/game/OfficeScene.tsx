'use client';

import { useState } from 'react';
import type { GameCharacter, FolderNode } from '@/lib/game/types';
import CharacterSprite from './CharacterSprite';
import ChatBubble from './ChatBubble';
import FolderOverlay from './FolderOverlay';

interface OfficeSceneProps {
  characters: GameCharacter[];
  folderTree: FolderNode[];
  activeCharId: string | null;
  chatText: string;
  onCharacterClick: (charId: string) => void;
}

export default function OfficeScene({
  characters, folderTree, activeCharId, chatText, onCharacterClick,
}: OfficeSceneProps) {
  const [showFolders, setShowFolders] = useState(false);

  // Layout characters in a grid within the office
  const positions = characters.map((_, i) => {
    const cols = Math.min(characters.length, 3);
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: 20 + col * 120,
      y: 40 + row * 130,
    };
  });

  return (
    <div
      className="relative h-full border-r-2 border-[var(--border-pixel)] overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Office floor/background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, var(--border-pixel) 0px, var(--border-pixel) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--border-pixel) 0px, var(--border-pixel) 1px, transparent 1px, transparent 40px)',
      }} />

      {/* Title */}
      <div
        className="absolute top-2 left-3 z-10 uppercase tracking-[2px]"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-dim)' }}
      >
        Office Floor
      </div>

      {/* Folder toggle */}
      <button
        onClick={() => setShowFolders(!showFolders)}
        className="absolute top-2 right-3 z-10 px-2 py-1 border text-[6px] uppercase tracking-[1px] cursor-pointer"
        style={{
          fontFamily: 'var(--font-pixel)',
          background: showFolders ? 'rgba(255,217,61,0.1)' : 'var(--bg-panel)',
          borderColor: showFolders ? 'var(--neon-gold)' : 'var(--border-pixel)',
          color: showFolders ? 'var(--neon-gold)' : 'var(--text-dim)',
        }}
      >
        {showFolders ? 'HIDE' : 'SHOW'} FILES
      </button>

      {/* Folder overlay */}
      <FolderOverlay folderTree={folderTree} characters={characters} visible={showFolders} />

      {/* Characters */}
      {!showFolders && characters.map((char, i) => (
        <div key={char.id} className="relative">
          <CharacterSprite
            character={char}
            x={positions[i].x}
            y={positions[i].y}
            selected={activeCharId === char.id}
            speaking={activeCharId === char.id && !!chatText}
            onClick={() => onCharacterClick(char.id)}
          />
          {activeCharId === char.id && chatText && (
            <div className="absolute" style={{ left: positions[i].x, top: positions[i].y }}>
              <ChatBubble
                text={chatText.slice(0, 60) + (chatText.length > 60 ? '...' : '')}
                color={char.color}
                visible={true}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
