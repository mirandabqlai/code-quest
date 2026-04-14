'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import PixelButton from '@/components/game/ui/PixelButton';

interface Message {
  role: string;
  content: string;
}

interface Experiment {
  change: string;
  effect: string;
}

interface APIPlaygroundProps {
  defaults: {
    model: string;
    messages: Message[];
  };
  experiments: Experiment[];
  onComplete: () => void;
}

/** Available models the player can pick from */
const MODELS = ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414', 'claude-opus-4-20250514', 'gpt-4o'];

type Phase = 'build' | 'streaming' | 'response' | 'experiment' | 'done';

/**
 * API Playground -- Module 15: The AI API
 *
 * A visual API request builder. The player assembles a request from blocks:
 * model selector, system message, user message, and parameters (max_tokens,
 * temperature). After hitting "Send", the response streams in character by
 * character. Then experiments prompt the player to modify settings and
 * observe how the output changes.
 */
export default function APIPlayground({ defaults, experiments, onComplete }: APIPlaygroundProps) {
  const [phase, setPhase] = useState<Phase>('build');

  // Request fields the player can modify
  const [model, setModel] = useState(defaults.model);
  const [systemMsg, setSystemMsg] = useState(
    defaults.messages.find(m => m.role === 'system')?.content ?? ''
  );
  const [userMsg, setUserMsg] = useState(
    defaults.messages.find(m => m.role === 'user')?.content ?? ''
  );
  const [maxTokens, setMaxTokens] = useState(256);
  const [temperature, setTemperature] = useState(0.7);

  // Response state
  const [streamText, setStreamText] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Experiment state
  const [experimentIdx, setExperimentIdx] = useState(0);
  const [sendCount, setSendCount] = useState(0);
  const [showExperiment, setShowExperiment] = useState(false);
  const [score, setScore] = useState(0);
  const [experimentsDone, setExperimentsDone] = useState<Set<number>>(new Set());

  // Generate a simulated response based on current settings
  const generateResponse = useCallback((): string => {
    const modelShort = model.includes('opus') ? 'Opus' : model.includes('haiku') ? 'Haiku' : model.includes('sonnet') ? 'Sonnet' : 'GPT-4o';
    const tempLabel = temperature < 0.3 ? 'precise' : temperature > 0.8 ? 'creative' : 'balanced';

    // Base response varies with model and temperature for educational effect
    const responses: Record<string, Record<string, string>> = {
      precise: {
        default: `[${modelShort} | temp=${temperature}] Here is a structured, factual response to your query. The system context "${systemMsg.slice(0, 30)}..." guides my tone. With low temperature, I stick closely to the most probable tokens, producing consistent and predictable output.`,
      },
      creative: {
        default: `[${modelShort} | temp=${temperature}] What a fascinating question! Let me explore this from an unexpected angle... The system message "${systemMsg.slice(0, 30)}..." shapes my personality here. Higher temperature means I sample from less probable tokens, making my output more varied and surprising!`,
      },
      balanced: {
        default: `[${modelShort} | temp=${temperature}] Based on the system context "${systemMsg.slice(0, 30)}...", here is my response. At moderate temperature, I balance predictability with occasional creative choices. The ${modelShort} model brings its own strengths to this task.`,
      },
    };

    let text = responses[tempLabel]?.default ?? responses.balanced.default;

    // Truncate based on max_tokens (simulate token ~ 4 chars)
    const charLimit = maxTokens * 4;
    if (text.length > charLimit) {
      text = text.slice(0, charLimit) + '...';
    }

    return text;
  }, [model, systemMsg, temperature, maxTokens]);

  // Stream response character by character
  const handleSend = useCallback(() => {
    const response = generateResponse();
    setFullResponse(response);
    setStreamText('');
    setPhase('streaming');
    setSendCount(prev => prev + 1);

    let charIdx = 0;
    streamRef.current = setInterval(() => {
      charIdx++;
      setStreamText(response.slice(0, charIdx));
      if (charIdx >= response.length) {
        if (streamRef.current) clearInterval(streamRef.current);
        setPhase('response');

        // After first send, nudge the player toward experiments
        if (sendCount === 0 && experiments.length > 0) {
          setTimeout(() => setShowExperiment(true), 500);
        }
      }
    }, 18);
  }, [generateResponse, sendCount, experiments.length]);

  // Clean up streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) clearInterval(streamRef.current);
    };
  }, []);

  const handleModifyAndResend = useCallback(() => {
    setPhase('build');
    setStreamText('');
    setFullResponse('');
  }, []);

  const handleCompleteExperiment = useCallback(() => {
    setExperimentsDone(prev => new Set(prev).add(experimentIdx));
    setScore(s => s + 100);

    const nextIdx = experimentIdx + 1;
    if (nextIdx >= experiments.length) {
      setPhase('done');
      setTimeout(() => onComplete(), 1200);
    } else {
      setExperimentIdx(nextIdx);
      setPhase('build');
      setStreamText('');
      setFullResponse('');
    }
  }, [experimentIdx, experiments.length, onComplete]);

  // --- JSON preview of the request ---
  const requestPreview = JSON.stringify(
    {
      model,
      max_tokens: maxTokens,
      messages: [
        ...(systemMsg ? [{ role: 'system', content: systemMsg }] : []),
        { role: 'user', content: userMsg },
      ],
      temperature,
    },
    null,
    2
  );

  // --- render ---
  return (
    <div
      className="flex flex-col gap-4 p-4 border-2 rounded"
      style={{ borderColor: 'var(--border-pixel)', background: 'var(--bg-dark)' }}
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
          API Playground
        </div>
        {score > 0 && (
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--neon-gold)',
            }}
          >
            {score} PTS
          </div>
        )}
      </div>

      {/* Experiment hint (if active) */}
      {showExperiment && experimentIdx < experiments.length && phase !== 'done' && (
        <div
          className="border-2 p-2"
          style={{
            borderColor: 'var(--neon-purple)',
            background: 'rgba(168, 85, 247, 0.08)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--neon-purple)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px',
            }}
          >
            Experiment {experimentIdx + 1}/{experiments.length}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
            }}
          >
            Try this: {experiments[experimentIdx].change}
          </div>
          <div
            className="mt-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-dim)',
              lineHeight: '1.4',
            }}
          >
            Expected effect: {experiments[experimentIdx].effect}
          </div>
        </div>
      )}

      {/* Request builder */}
      {(phase === 'build' || phase === 'response') && (
        <div className="flex flex-col gap-3">
          {/* Model selector */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-blue)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Model
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MODELS.map(m => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className="border-2 px-2 py-1 transition-all"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: model === m ? 'var(--neon-green)' : 'var(--text-dim)',
                    borderColor: model === m ? 'var(--neon-green)' : 'var(--border-pixel)',
                    background: model === m ? 'rgba(0,255,65,0.08)' : 'var(--bg-void)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {m.replace('claude-', '').replace('openai-', '')}
                </button>
              ))}
            </div>
          </div>

          {/* System message */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-purple)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              System Message
            </div>
            <textarea
              value={systemMsg}
              onChange={e => setSystemMsg(e.target.value)}
              rows={2}
              className="w-full p-2 border resize-none outline-none"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '10px',
                color: 'var(--neon-purple)',
                borderColor: 'var(--border-pixel)',
                background: 'var(--bg-void)',
                caretColor: 'var(--neon-purple)',
              }}
              placeholder="You are a helpful assistant..."
            />
          </div>

          {/* User message */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--neon-blue)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              User Message
            </div>
            <textarea
              value={userMsg}
              onChange={e => setUserMsg(e.target.value)}
              rows={2}
              className="w-full p-2 border resize-none outline-none"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '10px',
                color: 'var(--neon-blue)',
                borderColor: 'var(--border-pixel)',
                background: 'var(--bg-void)',
                caretColor: 'var(--neon-blue)',
              }}
              placeholder="Explain how transformers work..."
            />
          </div>

          {/* Parameters */}
          <div className="flex gap-4">
            {/* Max Tokens slider */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between">
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--neon-gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  max_tokens
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--text-dim)',
                  }}
                >
                  {maxTokens}
                </div>
              </div>
              <div className="relative h-4 rounded" style={{ background: 'var(--bg-void)' }}>
                <div
                  className="absolute top-0 left-0 h-full rounded"
                  style={{
                    width: `${(maxTokens / 1024) * 100}%`,
                    background: 'var(--neon-gold)',
                    boxShadow: '0 0 6px var(--neon-gold)',
                    transition: 'width 0.15s',
                  }}
                />
                <input
                  type="range"
                  min={32}
                  max={1024}
                  step={32}
                  value={maxTokens}
                  onChange={e => setMaxTokens(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{ height: '100%' }}
                />
              </div>
            </div>

            {/* Temperature slider */}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between">
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--neon-coral)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  temperature
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '6px',
                    color: 'var(--text-dim)',
                  }}
                >
                  {temperature.toFixed(1)}
                </div>
              </div>
              <div className="relative h-4 rounded" style={{ background: 'var(--bg-void)' }}>
                <div
                  className="absolute top-0 left-0 h-full rounded"
                  style={{
                    width: `${temperature * 100}%`,
                    background: 'var(--neon-coral)',
                    boxShadow: '0 0 6px var(--neon-coral)',
                    transition: 'width 0.15s',
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={e => setTemperature(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{ height: '100%' }}
                />
              </div>
              <div className="flex justify-between">
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--text-dim)' }}>
                  PRECISE
                </div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: 'var(--text-dim)' }}>
                  CREATIVE
                </div>
              </div>
            </div>
          </div>

          {/* JSON preview */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Request Preview
            </div>
            <pre
              className="p-2 border overflow-x-auto"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '8px',
                color: 'var(--text-code)',
                borderColor: 'var(--border-pixel)',
                background: 'var(--bg-void)',
                lineHeight: '1.5',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {requestPreview}
            </pre>
          </div>
        </div>
      )}

      {/* Send button */}
      {phase === 'build' && (
        <PixelButton
          onClick={handleSend}
          disabled={!userMsg.trim()}
          variant="success"
        >
          {'\u25B6'} Send Request
        </PixelButton>
      )}

      {/* Streaming / Response area */}
      {(phase === 'streaming' || phase === 'response') && (
        <div className="flex flex-col gap-2">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: phase === 'streaming' ? 'var(--neon-gold)' : 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {phase === 'streaming' ? 'Streaming Response...' : 'Response Complete'}
          </div>

          <div
            className="border-2 p-3"
            style={{
              borderColor: phase === 'streaming' ? 'var(--neon-gold)' : 'var(--neon-green)',
              background: 'var(--bg-panel)',
              boxShadow: phase === 'response' ? '0 0 8px var(--neon-green)' : 'none',
              minHeight: '60px',
              maxHeight: '160px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}
            >
              {streamText}
              {phase === 'streaming' && (
                <span style={{ color: 'var(--neon-green)', animation: 'blink 0.6s step-end infinite' }}>
                  {'\u2588'}
                </span>
              )}
            </div>
          </div>

          {/* Token usage indicator */}
          {phase === 'response' && (
            <div className="flex gap-4">
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Input tokens: ~{Math.ceil((systemMsg.length + userMsg.length) / 4)}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Output tokens: ~{Math.ceil(fullResponse.length / 4)}
              </div>
            </div>
          )}

          {/* Action buttons in response phase */}
          {phase === 'response' && (
            <div className="flex gap-2">
              <PixelButton onClick={handleModifyAndResend}>
                Modify &amp; Resend
              </PixelButton>
              {showExperiment && experimentIdx < experiments.length && (
                <PixelButton onClick={handleCompleteExperiment} variant="success">
                  Complete Experiment
                </PixelButton>
              )}
            </div>
          )}
        </div>
      )}

      {/* Done phase */}
      {phase === 'done' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: 'var(--neon-green)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textShadow: '0 0 12px var(--neon-green)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            API Master!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '18px',
              color: 'var(--neon-gold)',
              textShadow: '0 0 16px var(--neon-gold)',
            }}
          >
            {score} PTS
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {sendCount} requests sent {'\u2022'} {experimentsDone.size} experiments completed
          </div>
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Module Complete!
          </div>
        </div>
      )}
    </div>
  );
}
