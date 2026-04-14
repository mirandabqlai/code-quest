import Anthropic from '@anthropic-ai/sdk';
import { ADVANCED_PROMPT, extractJSON, withRetry } from './prompts';

const client = new Anthropic();

export async function generateAdvanced(analysis: object) {
  const response = await withRetry(() => client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${ADVANCED_PROMPT}\n\nANALYSIS:\n${JSON.stringify(analysis, null, 2)}`,
      },
    ],
  }));

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(extractJSON(text));
}
