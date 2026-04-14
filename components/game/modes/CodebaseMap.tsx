'use client';

import { useState, useCallback } from 'react';
import type { FolderNode, DataFlow, GameCharacter } from '@/lib/game/types';
import { useSounds } from '@/components/game/ui/SoundManager';
import PixelButton from '@/components/game/ui/PixelButton';

interface CodebaseMapProps {
  folderTree: FolderNode[];
  dataFlows: DataFlow[];
  characters: GameCharacter[];
  onChatText: (text: string) => void;
}

export default function CodebaseMap({ folderTree, dataFlows, characters, onChatText }: CodebaseMapProps) {
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [activeFlowStep, setActiveFlowStep] = useState<number | null>(null);
  const { play } = useSounds();

  // Helper to find a character by id
  const getChar = useCallback((id: string) => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const handleFolderClick = useCallback((index: number) => {
    setSelectedFolder(index);
    play('click');
    const item = folderTree[index];
    if (item.owner) {
      const ch = getChar(item.owner);
      if (ch) onChatText(`${item.path} — owned by ${ch.name}`);
    }
  }, [folderTree, getChar, play, onChatText]);

  const handleFlowTabClick = useCallback((index: number) => {
    setActiveFlowIndex(index);
    setActiveFlowStep(null);
    play('click');
  }, [play]);

  const handleFlowStepClick = useCallback((stepIndex: number) => {
    setActiveFlowStep(stepIndex);
    const flow = dataFlows[activeFlowIndex];
    if (flow) {
      const step = flow.steps[stepIndex];
      const ch = getChar(step.characterId);
      if (ch) onChatText(`Step ${stepIndex + 1}: ${ch.name} — ${step.action}`);
    }
    play('dialogue');
  }, [activeFlowIndex, dataFlows, getChar, onChatText, play]);

  const selectedItem = selectedFolder !== null ? folderTree[selectedFolder] : null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Two-column layout: folder tree + detail panel */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Folder Tree (left) */}
        <div
          className="flex-1 overflow-y-auto border-2 p-3"
          style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
        >
          <div
            className="mb-2"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '2px' }}
          >
            Project Structure
          </div>
          {folderTree.map((item, idx) => {
            // Build indent string
            const indent = Array(item.indent).fill('│').join('');
            const prefix = item.indent > 0 ? '├─ ' : '';
            const ownerChar = item.owner ? getChar(item.owner) : null;

            if (item.type === 'folder') {
              return (
                <div key={idx} className="py-0.5">
                  <span style={{ color: 'var(--border-bright)', fontFamily: 'var(--font-code)', fontSize: '10px' }}>
                    {indent}
                  </span>
                  <span
                    onClick={() => handleFolderClick(idx)}
                    className="cursor-pointer hover:underline"
                    style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '11px',
                      color: selectedFolder === idx ? 'var(--neon-gold)' : 'var(--neon-blue)',
                      fontWeight: 'bold',
                    }}
                  >
                    {prefix}{item.path}
                  </span>
                  {ownerChar && (
                    <span
                      className="ml-2 px-1.5 py-0.5 border"
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '5px',
                        color: ownerChar.color,
                        borderColor: ownerChar.color,
                        letterSpacing: '1px',
                      }}
                    >
                      {ownerChar.name}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <div key={idx} className="py-0.5">
                <span style={{ color: 'var(--border-bright)', fontFamily: 'var(--font-code)', fontSize: '10px' }}>
                  {indent}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-code)', fontSize: '11px', color: 'var(--text-dim)' }}
                >
                  {prefix}{item.path}
                </span>
                {item.note && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--text-dim)' }}>
                    {' — '}{item.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail Panel (right) */}
        <div
          className="flex-1 overflow-y-auto border-2 p-3"
          style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
        >
          {!selectedItem ? (
            <div
              className="text-center mt-8"
              style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-dim)' }}
            >
              Click a folder to see who owns it
            </div>
          ) : (
            <div>
              <div
                className="mb-3"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '2px' }}
              >
                {selectedItem.owner ? 'Owned By' : selectedItem.path}
              </div>

              {/* Owner character card */}
              {selectedItem.owner && (() => {
                const ch = getChar(selectedItem.owner!);
                if (!ch) return null;
                return (
                  <div
                    className="border-2 p-3 mb-3"
                    style={{ borderColor: ch.color, background: 'var(--bg-panel)' }}
                  >
                    <div
                      style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: ch.color, textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                      {ch.name} {ch.title}
                    </div>
                    <div
                      className="mt-1"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.5' }}
                    >
                      {ch.summary}
                    </div>
                    <div className="mt-2">
                      {ch.files.map((f, i) => (
                        <div
                          key={i}
                          style={{ fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--text-primary)' }}
                        >
                          📄 {f}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Folder description */}
              <div
                style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.6' }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>{selectedItem.path}</strong>
                {selectedItem.description && ` — ${selectedItem.description}`}
              </div>

              {/* Child folders with owners (for shared folders) */}
              {!selectedItem.owner && (() => {
                const children: { item: FolderNode; char: GameCharacter }[] = [];
                for (let i = (selectedFolder ?? 0) + 1; i < folderTree.length; i++) {
                  if (folderTree[i].indent <= selectedItem.indent && i !== selectedFolder) break;
                  if (folderTree[i].owner) {
                    const ch = getChar(folderTree[i].owner!);
                    if (ch) children.push({ item: folderTree[i], char: ch });
                  }
                }
                return children.map((child, i) => (
                  <div
                    key={i}
                    className="border-2 p-2 mt-2"
                    style={{ borderColor: child.char.color, background: 'var(--bg-panel)' }}
                  >
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: child.char.color }}>
                      {child.char.name} → {child.item.path}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-dim)' }}>
                      {child.item.description || ''}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Data Flow tabs + diagram */}
      <div
        className="border-2 p-3"
        style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
      >
        {/* Flow tabs */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {dataFlows.map((flow, i) => (
            <button
              key={flow.id}
              onClick={() => handleFlowTabClick(i)}
              className="px-2 py-1 border-2"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                letterSpacing: '1px',
                borderColor: i === activeFlowIndex ? 'var(--neon-blue)' : 'var(--border-pixel)',
                color: i === activeFlowIndex ? 'var(--neon-blue)' : 'var(--text-dim)',
                background: i === activeFlowIndex ? 'rgba(78,205,196,0.1)' : 'var(--bg-panel)',
                cursor: 'pointer',
              }}
            >
              {flow.label}
            </button>
          ))}
        </div>

        {/* Flow diagram — horizontal node chain */}
        {dataFlows[activeFlowIndex] && (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {dataFlows[activeFlowIndex].steps.map((step, i) => {
                const ch = getChar(step.characterId);
                if (!ch) return null;
                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <span style={{ color: 'var(--neon-gold)', fontSize: '12px' }}>▶</span>
                    )}
                    <div
                      onClick={() => handleFlowStepClick(i)}
                      className="border-2 p-2 text-center cursor-pointer transition-all"
                      style={{
                        borderColor: activeFlowStep === i ? ch.color : 'var(--border-pixel)',
                        background: activeFlowStep === i ? 'rgba(255,255,255,0.05)' : 'var(--bg-panel)',
                        minWidth: '60px',
                      }}
                    >
                      <div style={{ fontSize: '16px' }}>{'🧑‍💻'}</div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: ch.color, textTransform: 'uppercase' }}>
                        {ch.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step label */}
            <div
              className="mt-3"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: activeFlowStep !== null ? 'var(--text-primary)' : 'var(--text-dim)',
                lineHeight: '1.5',
              }}
            >
              {activeFlowStep !== null ? (
                <>
                  <strong style={{ color: getChar(dataFlows[activeFlowIndex].steps[activeFlowStep].characterId)?.color }}>
                    Step {activeFlowStep + 1} — {getChar(dataFlows[activeFlowIndex].steps[activeFlowStep].characterId)?.name}:
                  </strong>{' '}
                  {dataFlows[activeFlowIndex].steps[activeFlowStep].action}
                </>
              ) : (
                'Click a node to see what happens at each step'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
