// components/academy/AcademyShell.tsx
//
// Client component that wraps an active academy module. Manages the flow:
// 1. Mike's intro dialogue → 2. Mini-game → 3. Quiz → 4. XP reward.

'use client';

import { useState } from 'react';
import type { AcademyModule } from '@/lib/academy/types';
import { ACADEMY_PARTS } from '@/lib/academy/types';
import XPBar from '@/components/game/ui/XPBar';
import PixelButton from '@/components/game/ui/PixelButton';
import SmartQuiz from '@/components/game/teaching/SmartQuiz';

// Mini-game components
import TokenTetris from './mini-games/TokenTetris';
import PromptLab from './mini-games/PromptLab';
import ModelMatchmaker from './mini-games/ModelMatchmaker';
import RedFlagSpotter from './mini-games/RedFlagSpotter';
import FileExplorer from './mini-games/FileExplorer';
import WiringPuzzle from './mini-games/WiringPuzzle';
import TimelineBuilder from './mini-games/TimelineBuilder';
import ChatStrategist from './mini-games/ChatStrategist';
import EditorDash from './mini-games/EditorDash';
import AgentSimulator from './mini-games/AgentSimulator';
import ToolboxChallenge from './mini-games/ToolboxChallenge';
import ControlRoom from './mini-games/ControlRoom';
import SkillBuilder from './mini-games/SkillBuilder';
import ServerPlugboard from './mini-games/ServerPlugboard';
import APIPlayground from './mini-games/APIPlayground';
import FactoryFloor from './mini-games/FactoryFloor';
import FinalMission from './mini-games/FinalMission';

type Phase = 'intro' | 'game' | 'quiz' | 'complete';

interface AcademyShellProps {
  module: AcademyModule;
}

export default function AcademyShell({ module }: AcademyShellProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [xp, setXp] = useState(0);

  const part = ACADEMY_PARTS.find(p => p.number === module.part);

  function handleIntroNext() {
    if (introIndex < module.mikeIntro.length - 1) {
      setIntroIndex(prev => prev + 1);
    } else {
      setPhase('game');
    }
  }

  function handleGameComplete() {
    setPhase('quiz');
  }

  function handleQuizCorrect() {
    setXp(prev => prev + module.xpReward + 50);
    setPhase('complete');
  }

  function handleQuizWrong() {
    setXp(prev => prev + module.xpReward);
    setPhase('complete');
  }

  /** Render the correct mini-game based on module.miniGame.type */
  function renderMiniGame() {
    const game = module.miniGame;
    const onComplete = handleGameComplete;

    switch (game.type) {
      case 'token-tetris':
        return <TokenTetris tokens={game.tokens} validSentences={game.validSentences} onComplete={onComplete} />;
      case 'prompt-lab':
        return <PromptLab task={game.task} prompts={game.prompts} onComplete={onComplete} />;
      case 'model-matchmaker':
        return <ModelMatchmaker tasks={game.tasks} onComplete={onComplete} />;
      case 'red-flag-spotter':
        return <RedFlagSpotter outputs={game.outputs} timePerOutput={game.timePerOutput} onComplete={onComplete} />;
      case 'file-explorer':
        return <FileExplorer missions={game.missions} fileSystem={game.fileSystem} onComplete={onComplete} />;
      case 'wiring-puzzle':
        return <WiringPuzzle components={game.components} correctWires={game.correctWires} onComplete={onComplete} />;
      case 'timeline-builder':
        return <TimelineBuilder commits={game.commits} correctOrder={game.correctOrder} onComplete={onComplete} />;
      case 'chat-strategist':
        return <ChatStrategist scenarios={game.scenarios} onComplete={onComplete} />;
      case 'editor-dash':
        return <EditorDash snippets={game.snippets} timeLimit={game.timeLimit} onComplete={onComplete} />;
      case 'agent-simulator':
        return <AgentSimulator task={game.task} fileTree={game.fileTree} correctSequence={game.correctSequence} onComplete={onComplete} />;
      case 'toolbox-challenge':
        return <ToolboxChallenge requests={game.requests} tools={game.tools} onComplete={onComplete} />;
      case 'control-room':
        return <ControlRoom scenarios={[{ task: game.agent.task, settings: game.settings }]} onComplete={onComplete} />;
      case 'skill-builder':
        return <SkillBuilder blocks={game.blocks as { id: string; type: 'trigger' | 'input' | 'action' | 'output'; label: string }[]} correctAssembly={game.correctAssembly} onComplete={onComplete} />;
      case 'server-plugboard':
        return <ServerPlugboard services={game.services} testQueries={game.testQueries} onComplete={onComplete} />;
      case 'api-playground':
        return <APIPlayground defaults={game.defaults} experiments={game.experiments} onComplete={onComplete} />;
      case 'factory-floor':
        return <FactoryFloor machines={game.machines} pipelines={game.pipelines} onComplete={onComplete} />;
      case 'final-mission':
        return <FinalMission stages={game.stages} onComplete={onComplete} />;
      default:
        return (
          <div className="text-center p-8">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--neon-coral)' }}>
              UNKNOWN GAME TYPE
            </div>
            <PixelButton onClick={onComplete}>SKIP</PixelButton>
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-void)' }}>
      <XPBar xp={xp} glitchTokens={0} />

      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-pixel)] bg-[var(--bg-dark)]">
        <a
          href="/academy"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--neon-gold)', textDecoration: 'none' }}
        >
          ← BACK
        </a>
        <span
          className="text-[var(--neon-purple)] uppercase"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', letterSpacing: '2px' }}
        >
          Part {module.part}{part ? ` — ${part.title}` : ''}
        </span>
        <span
          className="text-[var(--text-primary)] uppercase"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', letterSpacing: '1px' }}
        >
          {module.title}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">

          {/* INTRO */}
          {phase === 'intro' && (
            <div className="border-2 border-[var(--neon-gold)] bg-[var(--bg-panel)] p-5">
              <div
                className="text-[var(--neon-gold)] mb-3 uppercase"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', letterSpacing: '2px' }}
              >
                MIKE — Office Manager
              </div>
              <p
                className="text-[var(--text-primary)] leading-relaxed mb-4"
                style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}
              >
                {module.mikeIntro[introIndex]}
              </p>
              <PixelButton onClick={handleIntroNext}>
                {introIndex < module.mikeIntro.length - 1 ? 'CONTINUE' : 'START GAME'}
              </PixelButton>
            </div>
          )}

          {/* MINI-GAME */}
          {phase === 'game' && renderMiniGame()}

          {/* QUIZ */}
          {phase === 'quiz' && (
            <div>
              <div
                className="text-[var(--text-dim)] uppercase mb-3"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', letterSpacing: '2px' }}
              >
                KNOWLEDGE CHECK
              </div>
              <SmartQuiz
                quiz={module.quiz}
                characters={[{
                  id: 'mike', name: 'MIKE', title: 'Office Manager',
                  color: '#ffd93d', department: 'Management', files: [],
                  summary: 'Your guide through AI Academy',
                  spriteType: 'manager', roomId: 'lobby',
                }]}
                onCorrect={handleQuizCorrect}
                onWrong={handleQuizWrong}
              />
            </div>
          )}

          {/* COMPLETE */}
          {phase === 'complete' && (
            <div className="text-center py-8">
              <div
                className="text-[var(--neon-green)] uppercase mb-4"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', letterSpacing: '4px' }}
              >
                MODULE COMPLETE
              </div>
              <div
                className="text-[var(--neon-gold)] mb-4"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
              >
                +{module.xpReward} XP
              </div>
              <p
                className="text-[var(--text-dim)] text-sm mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                You finished &quot;{module.title}&quot;. Head back to pick your next module.
              </p>
              <a href="/academy">
                <PixelButton>BACK TO MODULES</PixelButton>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="crt-overlay" />
    </div>
  );
}
