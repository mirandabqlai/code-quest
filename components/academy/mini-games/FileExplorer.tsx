'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface Mission {
  instruction: string;
  targetPath: string;
}

interface FileExplorerProps {
  missions: Mission[];
  fileSystem: FileNode[];
  onComplete: () => void;
}

/**
 * File Explorer — Module 5: "The Terminal"
 *
 * A pixel-art file system where the player navigates via a mini terminal
 * (typing cd, ls, pwd) OR by clicking folders. Each mission asks them
 * to find a specific file or navigate to a folder. A timer adds urgency.
 * Teaches how file systems, paths, and basic terminal commands work.
 */
export default function FileExplorer({ missions, fileSystem, onComplete }: FileExplorerProps) {
  // --- state ---
  const [currentPath, setCurrentPath] = useState<string[]>([]);  // path segments, e.g. ['src', 'lib']
  const [missionIdx, setMissionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{ line: string; type: 'input' | 'output' | 'success' | 'error' }[]>([
    { line: 'Welcome to FileQuest OS v1.0', type: 'output' },
    { line: 'Type "help" for available commands.', type: 'output' },
  ]);
  const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
  const [finished, setFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showClickNav, setShowClickNav] = useState(true);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMission = missions[missionIdx] ?? null;

  // --- timer ---
  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // --- file system helpers ---
  // Given a path array, resolve to the node list at that location
  const resolveDir = useCallback((pathSegments: string[]): FileNode[] | null => {
    let nodes = fileSystem;
    for (const seg of pathSegments) {
      const found = nodes.find(n => n.name === seg && n.type === 'directory');
      if (!found || !found.children) return null;
      nodes = found.children;
    }
    return nodes;
  }, [fileSystem]);

  const getCurrentNodes = useCallback((): FileNode[] => {
    return resolveDir(currentPath) ?? [];
  }, [currentPath, resolveDir]);

  const getPathString = useCallback((): string => {
    return '/' + currentPath.join('/');
  }, [currentPath]);

  // Check if the current path matches the mission target
  const checkMission = useCallback((path: string[]) => {
    if (!currentMission) return;

    const pathStr = '/' + path.join('/');
    // Normalize both paths: strip trailing slashes for comparison
    const normalizedCurrent = pathStr.replace(/\/+$/, '') || '/';
    const normalizedTarget = currentMission.targetPath.replace(/\/+$/, '') || '/';

    if (normalizedCurrent === normalizedTarget) {
      // Mission complete!
      const timeBonus = Math.max(0, 100 - elapsedSeconds * 2); // faster = more bonus
      const points = 150 + timeBonus;
      setScore(prev => prev + points);
      setFlash('green');

      setTerminalHistory(prev => [
        ...prev,
        { line: `\u2714 MISSION COMPLETE! +${points} pts`, type: 'success' },
      ]);

      const nextIdx = missionIdx + 1;
      if (nextIdx >= missions.length) {
        setFinished(true);
        setTimeout(() => onComplete(), 1000);
      } else {
        setMissionIdx(nextIdx);
        setElapsedSeconds(0);
        setTimeout(() => setFlash('none'), 600);
      }
    }
  }, [currentMission, missionIdx, missions.length, elapsedSeconds, onComplete]);

  // --- terminal command execution ---
  const executeCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setTerminalHistory(prev => [...prev, { line: `$ ${trimmed}`, type: 'input' }]);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    switch (cmd) {
      case 'ls': {
        const nodes = getCurrentNodes();
        if (nodes.length === 0) {
          setTerminalHistory(prev => [...prev, { line: '(empty directory)', type: 'output' }]);
        } else {
          const listing = nodes.map(n =>
            n.type === 'directory' ? `\u{1F4C1} ${n.name}/` : `\u{1F4C4} ${n.name}`
          ).join('\n');
          setTerminalHistory(prev => [...prev, { line: listing, type: 'output' }]);
        }
        break;
      }
      case 'cd': {
        if (!arg || arg === '/') {
          setCurrentPath([]);
          setTerminalHistory(prev => [...prev, { line: 'Moved to /', type: 'output' }]);
          checkMission([]);
        } else if (arg === '..') {
          const newPath = currentPath.slice(0, -1);
          setCurrentPath(newPath);
          setTerminalHistory(prev => [...prev, { line: `Moved to /${newPath.join('/')}`, type: 'output' }]);
          checkMission(newPath);
        } else {
          // Could be a multi-segment path like "src/lib"
          const segments = arg.split('/').filter(Boolean);
          let testPath = [...currentPath];
          let valid = true;

          for (const seg of segments) {
            if (seg === '..') {
              testPath = testPath.slice(0, -1);
            } else {
              const nodes = resolveDir(testPath);
              const target = nodes?.find(n => n.name === seg && n.type === 'directory');
              if (!target) {
                valid = false;
                setTerminalHistory(prev => [...prev, {
                  line: `cd: no such directory: ${seg}`,
                  type: 'error',
                }]);
                setFlash('red');
                setTimeout(() => setFlash('none'), 300);
                break;
              }
              testPath = [...testPath, seg];
            }
          }

          if (valid) {
            setCurrentPath(testPath);
            setTerminalHistory(prev => [...prev, {
              line: `Moved to /${testPath.join('/')}`,
              type: 'output',
            }]);
            checkMission(testPath);
          }
        }
        break;
      }
      case 'pwd': {
        setTerminalHistory(prev => [...prev, { line: getPathString(), type: 'output' }]);
        break;
      }
      case 'help': {
        setTerminalHistory(prev => [...prev, {
          line: 'Available commands:\n  ls     - list files in current directory\n  cd     - change directory (cd folder, cd .., cd /)\n  pwd    - print current directory\n  clear  - clear terminal',
          type: 'output',
        }]);
        break;
      }
      case 'clear': {
        setTerminalHistory([]);
        break;
      }
      default: {
        setTerminalHistory(prev => [...prev, {
          line: `command not found: ${cmd}. Type "help" for available commands.`,
          type: 'error',
        }]);
      }
    }
  }, [currentPath, getCurrentNodes, getPathString, resolveDir, checkMission]);

  const handleSubmitCommand = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
    setCommandInput('');
  }, [commandInput, executeCommand]);

  // --- click navigation ---
  const handleClickNode = useCallback((node: FileNode) => {
    if (finished) return;
    if (node.type === 'directory') {
      const newPath = [...currentPath, node.name];
      setCurrentPath(newPath);
      setTerminalHistory(prev => [...prev, {
        line: `$ cd ${node.name}`,
        type: 'input',
      }, {
        line: `Moved to /${newPath.join('/')}`,
        type: 'output',
      }]);
      checkMission(newPath);
    } else {
      // Clicking a file — check if the mission target includes the file name
      const filePath = '/' + [...currentPath, node.name].join('/');
      const normalizedTarget = currentMission?.targetPath.replace(/\/+$/, '') || '';
      if (filePath === normalizedTarget) {
        checkMission([...currentPath, node.name]);
      } else {
        setTerminalHistory(prev => [...prev, {
          line: `Inspecting: ${node.name}`,
          type: 'output',
        }]);
      }
    }
  }, [currentPath, currentMission, checkMission, finished]);

  const handleGoUp = useCallback(() => {
    if (finished || currentPath.length === 0) return;
    const newPath = currentPath.slice(0, -1);
    setCurrentPath(newPath);
    setTerminalHistory(prev => [...prev, {
      line: '$ cd ..',
      type: 'input',
    }, {
      line: `Moved to /${newPath.join('/')}`,
      type: 'output',
    }]);
    checkMission(newPath);
  }, [currentPath, checkMission, finished]);

  // Format time nicely
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nodes = getCurrentNodes();

  // --- render ---
  return (
    <div
      className="flex flex-col gap-3 p-4 border-2 rounded"
      style={{
        borderColor: flash === 'green'
          ? 'var(--neon-green)'
          : flash === 'red'
            ? 'var(--neon-coral)'
            : 'var(--border-pixel)',
        background: 'var(--bg-dark)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-green)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          File Explorer
        </div>
        <div className="flex items-center gap-4">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
            }}
          >
            {'\u{23F1}'} {formatTime(elapsedSeconds)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
            }}
          >
            SCORE: {score}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 items-center">
        {missions.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              background: i < missionIdx
                ? 'var(--neon-green)'
                : i === missionIdx
                  ? 'var(--neon-gold)'
                  : 'var(--border-pixel)',
              boxShadow: i < missionIdx
                ? '0 0 6px var(--neon-green)'
                : i === missionIdx
                  ? '0 0 6px var(--neon-gold)'
                  : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Current mission */}
      {currentMission && !finished && (
        <div
          className="border-2 p-2"
          style={{
            borderColor: 'var(--neon-blue)',
            background: 'var(--bg-panel)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--neon-blue)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            Mission {missionIdx + 1}/{missions.length}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            {currentMission.instruction}
          </div>
        </div>
      )}

      {/* Current path display */}
      <div
        className="flex items-center gap-2 p-2 border"
        style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-void)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          PATH:
        </span>
        <span
          style={{
            fontFamily: 'var(--font-code)',
            fontSize: '11px',
            color: 'var(--neon-green)',
          }}
        >
          {getPathString()}
        </span>
      </div>

      {/* Toggle between click nav and terminal */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowClickNav(true)}
          className="px-2 py-1 border transition-all"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: showClickNav ? 'var(--neon-green)' : 'var(--text-dim)',
            borderColor: showClickNav ? 'var(--neon-green)' : 'var(--border-pixel)',
            background: showClickNav ? 'var(--bg-panel)' : 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
          }}
        >
          {'\u{1F4C1}'} Click Nav
        </button>
        <button
          onClick={() => { setShowClickNav(false); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="px-2 py-1 border transition-all"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: !showClickNav ? 'var(--neon-green)' : 'var(--text-dim)',
            borderColor: !showClickNav ? 'var(--neon-green)' : 'var(--border-pixel)',
            background: !showClickNav ? 'var(--bg-panel)' : 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
          }}
        >
          {'>'}_  Terminal
        </button>
      </div>

      {/* Click-based file browser */}
      {showClickNav && (
        <div
          className="flex flex-col gap-1 p-2 border min-h-[120px]"
          style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-void)' }}
        >
          {/* Go up button */}
          {currentPath.length > 0 && (
            <button
              onClick={handleGoUp}
              disabled={finished}
              className="flex items-center gap-2 px-2 py-1 text-left transition-all hover:-translate-x-0.5"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                color: 'var(--neon-blue)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {'\u{2B06}'} ..
            </button>
          )}

          {nodes.length === 0 && (
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                padding: '8px',
              }}
            >
              (empty directory)
            </div>
          )}

          {/* Sort: directories first, then files */}
          {[...nodes]
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'directory' ? -1 : 1;
            })
            .map((node, i) => (
              <button
                key={i}
                onClick={() => handleClickNode(node)}
                disabled={finished}
                className="flex items-center gap-2 px-2 py-1 text-left transition-all hover:translate-x-1"
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  color: node.type === 'directory' ? 'var(--neon-gold)' : 'var(--text-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '12px' }}>
                  {node.type === 'directory' ? '\u{1F4C1}' : '\u{1F4C4}'}
                </span>
                {node.name}{node.type === 'directory' ? '/' : ''}
              </button>
            ))}
        </div>
      )}

      {/* Terminal interface */}
      {!showClickNav && (
        <div
          className="flex flex-col border"
          style={{
            borderColor: 'var(--neon-green)',
            background: 'var(--bg-void)',
            boxShadow: '0 0 8px rgba(0, 255, 65, 0.15)',
          }}
        >
          {/* Terminal output area */}
          <div
            ref={terminalRef}
            className="p-2 overflow-y-auto"
            style={{ maxHeight: '140px', minHeight: '100px' }}
          >
            {terminalHistory.map((entry, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '10px',
                  color: entry.type === 'input'
                    ? 'var(--neon-green)'
                    : entry.type === 'success'
                      ? 'var(--neon-gold)'
                      : entry.type === 'error'
                        ? 'var(--neon-coral)'
                        : 'var(--text-dim)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.line}
              </div>
            ))}
          </div>

          {/* Command input line */}
          <form
            onSubmit={handleSubmitCommand}
            className="flex items-center gap-1 px-2 py-1 border-t"
            style={{ borderColor: 'var(--border-pixel)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '10px',
                color: 'var(--neon-green)',
              }}
            >
              $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              disabled={finished}
              placeholder="type a command..."
              className="flex-1 bg-transparent outline-none border-none"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '10px',
                color: 'var(--neon-green)',
                caretColor: 'var(--neon-green)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {/* Blinking cursor indicator */}
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '10px',
                color: 'var(--neon-green)',
                animation: 'blink 1s step-start infinite',
              }}
            >
              {'\u2588'}
            </span>
          </form>
        </div>
      )}

      {/* Finished overlay */}
      {finished && (
        <div
          className="text-center p-3"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--neon-gold)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 12px var(--neon-gold)',
            animation: 'pulse 1.5s infinite',
          }}
        >
          All Missions Complete! +{score} XP
        </div>
      )}
    </div>
  );
}
