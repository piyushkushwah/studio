'use server';
/**
 * @fileOverview A Genkit flow for breaking down complex tasks into sub-tasks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskBreakdownInputSchema = z.object({
  taskDescription: z.string().describe('The broad task to break down.'),
});
export type TaskBreakdownInput = z.infer<typeof TaskBreakdownInputSchema>;

const TaskBreakdownOutputSchema = z.object({
  subtasks: z.array(z.string()).describe('A list of 3-5 specific, actionable steps.'),
});
export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownOutputSchema>;

export async function breakdownTask(input: TaskBreakdownInput): Promise<TaskBreakdownOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error('MISSING_API_KEY');

  try {
    return await taskBreakdownFlow(input);
  } catch (error: any) {
    console.error('TASK_BREAKDOWN_FAILED:', error);
    throw new Error(error.message || 'AI_DECOMPOSITION_FAILED');
  }
}

const breakdownPrompt = ai.definePrompt({
  name: 'breakdownPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: TaskBreakdownInputSchema },
  output: { schema: TaskBreakdownOutputSchema },
  config: { temperature: 0.5 },
  system: `You are an expert project manager. Break down the provided task into exactly 3 to 5 clear, actionable sub-steps. Keep each step concise and action-oriented.`,
  prompt: `Task: "{{taskDescription}}"\n\nSuggest sub-steps:`,
});

const taskBreakdownFlow = ai.defineFlow(
  {
    name: 'taskBreakdownFlow',
    inputSchema: TaskBreakdownInputSchema,
    outputSchema: TaskBreakdownOutputSchema,
  },
  async (input) => {
    const { output } = await breakdownPrompt(input);
    if (!output) throw new Error('No output from model');
    return output;
  }
);
