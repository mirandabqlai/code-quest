// lib/ai/generate-mike-tour.ts

import Anthropic from '@anthropic-ai/sdk';
import { MIKE_TOUR_PROMPT, extractJSON, withRetry } from './prompts-v2';
import type { MikeTour } from '@/lib/game/types-v2';

const client = new Anthropic();

export async function generateMikeTour(analysisJSON: string): Promise<MikeTour> {
  return withRetry(async () => {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${MIKE_TOUR_PROMPT}\n\n---\n\nANALYSIS:\n${analysisJSON}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(extractJSON(text)) as MikeTour;
  });
}
