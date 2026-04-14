import Anthropic from '@anthropic-ai/sdk';
import { TOUR_PROMPT, buildSnapshotContext } from './prompts';
import type { RepoSnapshot } from '@/lib/github/read-repo';

const client = new Anthropic();

export async function generateTour(analysis: object, snapshot: RepoSnapshot) {
  const context = buildSnapshotContext(snapshot);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${TOUR_PROMPT}\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}\n\nREPO FILES:\n${context}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}
