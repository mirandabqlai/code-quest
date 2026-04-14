import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_PROMPT, buildSnapshotContext } from './prompts';
import type { RepoSnapshot } from '@/lib/github/read-repo';

const client = new Anthropic();

export async function analyzeRepo(snapshot: RepoSnapshot) {
  const context = buildSnapshotContext(snapshot);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${ANALYSIS_PROMPT}\n\n${context}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}
