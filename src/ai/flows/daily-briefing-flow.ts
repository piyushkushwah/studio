'use server';
/**
 * @fileOverview A Genkit flow for generating a daily productivity briefing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyBriefingInputSchema = z.object({
  userName: z.string(),
  tasks: z.array(z.string()),
  completedCount: z.number(),
  streak: z.number(),
});
export type DailyBriefingInput = z.infer<typeof DailyBriefingInputSchema>;

const DailyBriefingOutputSchema = z.object({
  briefing: z.string().describe('A short, 2-sentence motivational briefing.'),
});
export type DailyBriefingOutput = z.infer<typeof DailyBriefingOutputSchema>;

export async function generateDailyBriefing(input: DailyBriefingInput): Promise<DailyBriefingOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error('MISSING_API_KEY');

  try {
    return await dailyBriefingFlow(input);
  } catch (error: any) {
    console.error('DAILY_BRIEFING_FAILED:', error);
    throw new Error(error.message || 'AI_BRIEFING_FAILED');
  }
}

const briefingPrompt = ai.definePrompt({
  name: 'briefingPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: DailyBriefingInputSchema },
  output: { schema: DailyBriefingOutputSchema },
  config: { temperature: 0.8 },
  system: `You are a high-performance productivity coach. Look at the user's tasks and context, and give them a punchy, 2-sentence morning briefing that inspires focus.`,
  prompt: `
    User: {{userName}}
    Streak: {{streak}} days
    Completed today: {{completedCount}}
    Remaining Tasks: {{#each tasks}}- {{{this}}}{{/each}}
    
    Give me a professional, sharp daily briefing.
  `,
});

const dailyBriefingFlow = ai.defineFlow(
  {
    name: 'dailyBriefingFlow',
    inputSchema: DailyBriefingInputSchema,
    outputSchema: DailyBriefingOutputSchema,
  },
  async (input) => {
    const { output } = await briefingPrompt(input);
    if (!output) throw new Error('No output from model');
    return output;
  }
);
