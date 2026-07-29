'use server';
/**
 * @fileOverview A Genkit flow for generating daily routine suggestions.
 * 
 * - suggestRoutines - A function that suggests a routine based on a goal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RoutineSuggestionsInputSchema = z.object({
  goal: z.string().describe('The user goal for the routine (e.g. "Morning Energy", "Deep Work Focus").'),
});
export type RoutineSuggestionsInput = z.infer<typeof RoutineSuggestionsInputSchema>;

const RoutineItemSchema = z.object({
  title: z.string().describe('Short name of the activity.'),
  description: z.string().describe('Brief instruction.'),
  time: z.string().describe('Recommended time in HH:MM format.'),
  frequency: z.enum(['daily', 'weekly', 'weekdays', 'weekends']),
});

const RoutineSuggestionsOutputSchema = z.object({
  routines: z.array(RoutineItemSchema).describe('A suggested list of 3-5 routine activities.'),
});
export type RoutineSuggestionsOutput = z.infer<typeof RoutineSuggestionsOutputSchema>;

/**
 * Server action to generate routine suggestions using AI.
 */
export async function suggestRoutines(input: RoutineSuggestionsInput): Promise<RoutineSuggestionsOutput> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    console.error('AI_FLOW_ERROR: Missing Gemini API Key for routine generation.');
    throw new Error('MISSING_API_KEY');
  }

  try {
    const result = await routineSuggestionsFlow(input);
    if (!result || !result.routines) {
      throw new Error('AI_INVALID_OUTPUT');
    }
    return result;
  } catch (error: any) {
    console.error('ROUTINE_SUGGESTIONS_FAILED:', error);
    
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    throw new Error('AI_GENERATION_FAILED');
  }
}

const routinePrompt = ai.definePrompt({
  name: 'routinePrompt',
  input: { schema: RoutineSuggestionsInputSchema },
  output: { schema: RoutineSuggestionsOutputSchema },
  config: { 
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.7 
  },
  system: `You are a professional life coach and productivity architect. Based on the user's goal, suggest a concise, high-impact routine of 3 to 5 activities.
    Ensure times are in 24-hour HH:MM format. Keep descriptions action-oriented and brief.`,
  prompt: `Goal: "{{goal}}"\n\nCreate a structured routine for this goal:`,
});

const routineSuggestionsFlow = ai.defineFlow(
  {
    name: 'routineSuggestionsFlow',
    inputSchema: RoutineSuggestionsInputSchema,
    outputSchema: RoutineSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await routinePrompt(input);
    if (!output) throw new Error('No output from model');
    return output;
  }
);
