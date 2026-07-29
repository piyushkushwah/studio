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
    console.error('AI_FLOW_ERROR: Missing Gemini API Key');
    throw new Error('MISSING_API_KEY');
  }

  try {
    const result = await routineSuggestionsFlow(input);
    if (!result || !result.routines) {
      throw new Error('AI produced an invalid response format.');
    }
    return result;
  } catch (error: any) {
    console.error('ROUTINE_SUGGESTIONS_FAILED:', error);
    
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    
    // Bubble up the specific error message to help user/developer debug
    throw new Error(error.message || 'AI_GENERATION_FAILED');
  }
}

const routinePrompt = ai.definePrompt({
  name: 'routinePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: RoutineSuggestionsInputSchema },
  output: { schema: RoutineSuggestionsOutputSchema },
  config: { 
    temperature: 0.7 
  },
  system: `You are a professional life coach and productivity architect. Based on the user's goal, suggest a concise, high-impact routine of 3 to 5 activities.
    
    STRICT FORMATTING RULES:
    1. Times MUST be in 24-hour HH:MM format (e.g., "06:00", "21:30").
    2. Frequencies MUST be one of these exact lowercase strings: "daily", "weekly", "weekdays", "weekends".
    3. Descriptions should be short and actionable.
    4. Return exactly 3-5 items.`,
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
    if (!output) throw new Error('No output from AI model');
    return output;
  }
);
