// components/game/RoomHub.tsx
'use client';

import { useState } from 'react';
import type { CharacterContent, GameCharacter, GameStateV2 } from '@/lib/game/types-v2';
import StoryTab from './room-tabs/StoryTab';
import CodeTab from './room-tabs/CodeTab';
import ChallengesTab from './room-tabs/ChallengesTab';
import { getRoomProgress } from '@/lib/game/xp';

interface RoomHubProps {
  content: CharacterContent;
  characters: GameCharacter[];
  gameState: GameStateV2;
  onXP: (amount: number) => void;
  onBack: () => void;
}

type TabId = 'story' | 'code' | 'challenges';

export default function RoomHub({ content, characters, gameState, onXP, onBack }: RoomHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>('story');
  const character = characters.find(c => c.id === content.characterId);
  const progress = getRoomProgress(gameState, content.roomId);

  const tabs: { id: TabId; label: string; icon: string; done: boolean }[] = [
    { id: 'story', label: 'STORY', icon: '📖', done: progress.storyComplete },
    { id: 'code', label: 'CODE', icon: '💻', done: progress.codeComplete },
    { id: 'challenges', label: 'CHALLENGES', icon: '🎮', done: progress.challengesComplete.bossComplete },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button + room name */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '2px solid var(--border-pixel)' }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--neon-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← BACK
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: character?.color ?? 'var(--text-primary)',
            }}
          >
            {character?.name}&apos;s Room
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            {content.roomId}
          </div>
        </div>
      </div>

      {/* Tabs — Story / Code / Challenges */}
      <div className="flex" style={{ borderBottom: '2px solid var(--border-pixel)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              padding: '10px 14px',
              border: '1px solid var(--border-pixel)',
              // Active tab visually merges with panel below by removing its bottom border
              borderBottom: activeTab === tab.id ? '2px solid var(--bg-panel)' : 'none',
              background: activeTab === tab.id ? 'var(--bg-panel)' : 'var(--bg-dark)',
              color: activeTab === tab.id ? 'var(--neon-gold)' : 'var(--text-dim)',
              cursor: 'pointer',
              marginBottom: activeTab === tab.id ? '-2px' : '0',
            }}
          >
            {tab.icon} {tab.label} {tab.done && '✓'}
          </button>
        ))}
      </div>

      {/* Tab content area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
        {activeTab === 'story' && (
          <StoryTab
            content={content}
            characters={characters}
            onComplete={() => {
              progress.storyComplete = true;
              onXP(50);
            }}
          />
        )}
        {activeTab === 'code' && (
          <CodeTab
            codeBlocks={content.codeBlocks}
            glossary={content.glossaryTerms}
            onComplete={() => {
              progress.codeComplete = true;
              onXP(50);
            }}
          />
        )}
        {activeTab === 'challenges' && (
          <ChallengesTab
            content={content}
            characters={characters}
            progress={progress}
            onXP={onXP}
          />
        )}
      </div>
    </div>
  );
}
