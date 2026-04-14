'use client';

import type { FolderNode, GameCharacter } from '@/lib/game/types';

interface FolderOverlayProps {
  folderTree: FolderNode[];
  characters: GameCharacter[];
  visible: boolean;
}

export default function FolderOverlay({ folderTree, characters, visible }: FolderOverlayProps) {
  if (!visible) return null;

  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));

  return (
    <div
      className="absolute inset-0 bg-[var(--bg-void)] bg-opacity-80 overflow-y-auto p-3 z-5"
      style={{ fontFamily: 'var(--font-code)', fontSize: '9px', lineHeight: '1.7' }}
    >
      {folderTree.slice(0, 40).map((node, i) => {
        const indent = node.indent * 16;
        const owner = node.owner ? charMap[node.owner] : null;
        return (
          <div key={i} style={{ paddingLeft: indent }} className="flex items-center gap-1">
            <span style={{ color: node.type === 'folder' ? 'var(--neon-gold)' : 'var(--text-dim)' }}>
              {node.indent > 0 ? '\u251C\u2500 ' : ''}{node.path}
            </span>
            {owner && (
              <span
                className="px-1 border text-[5px] uppercase"
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
    </div>
  );
}
