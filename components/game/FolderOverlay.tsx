'use client';

import type { FolderNode, GameCharacter } from '@/lib/game/types';

interface FolderOverlayProps {
  folderTree: FolderNode[];
  characters: GameCharacter[];
}

/**
 * Always-visible folder tree panel showing the project structure.
 * Each file/folder is color-coded by its owner character.
 * Displayed in the top ~40% of the left panel as a "project map".
 */
export default function FolderOverlay({ folderTree, characters }: FolderOverlayProps) {
  // Build a lookup: character id -> character object
  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

  return (
    <div
      className="h-full overflow-y-auto p-3"
      style={{
        background: 'var(--bg-void)',
        fontFamily: 'var(--font-code)',
        fontSize: '9px',
        lineHeight: '1.7',
      }}
    >
      {/* Section label */}
      <div
        className="uppercase tracking-[2px] mb-2 pb-1"
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--neon-gold)',
          borderBottom: '1px solid var(--border-pixel)',
        }}
      >
        Project Map
      </div>

      {/* Folder tree entries */}
      {folderTree.slice(0, 40).map((node, i) => {
        const indent = node.indent * 16;
        const owner = node.owner ? charMap[node.owner] : null;
        return (
          <div key={i} style={{ paddingLeft: indent }} className="flex items-center gap-1">
            {/* File/folder icon + name */}
            <span style={{ color: node.type === 'folder' ? 'var(--neon-gold)' : 'var(--text-dim)' }}>
              {node.type === 'folder' ? '📂 ' : '  '}{node.path}
            </span>
            {/* Owner tag — color-coded to the character who "owns" this path */}
            {owner && (
              <span
                className="px-1 border text-[5px] uppercase ml-1"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  color: owner.color,
                  borderColor: owner.color,
                  letterSpacing: '1px',
                }}
              >
                {owner.name}
              </span>
            )}
          </div>
        );
      })}

      {/* Show count if tree was truncated */}
      {folderTree.length > 40 && (
        <div className="mt-2 opacity-50" style={{ fontSize: '8px', color: 'var(--text-dim)' }}>
          ... and {folderTree.length - 40} more
        </div>
      )}
    </div>
  );
}
