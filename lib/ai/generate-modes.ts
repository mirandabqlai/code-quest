import Anthropic from '@anthropic-ai/sdk';
import { MODES_PROMPT, buildSnapshotContext, extractJSON, withRetry } from './prompts';
import type { RepoSnapshot } from '@/lib/github/read-repo';

const client = new Anthropic();

export async function generateModes(analysis: object, snapshot: RepoSnapshot) {
  const context = buildSnapshotContext(snapshot);

  const response = await withRetry(() => client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${MODES_PROMPT}\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n\nREPO FILES:\n${context}`,
      },
    ],
  }));

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(extractJSON(text));
}
