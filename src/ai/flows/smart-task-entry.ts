'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language task descriptions.
 *
 * - extractTaskDetails - A function that handles parsing a natural language string into a task object.
 * - SmartTaskEntryInput - The input type for the extraction.
 * - SmartTaskEntryOutput - The return type for the extraction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskEntryInputSchema = z.object({
  naturalLanguageTask: z.string().describe('The task described in natural language.'),
  currentDate: z.string().optional().describe('The current date in YYYY-MM-DD format.'),
});
export type SmartTaskEntryInput = z.infer<typeof SmartTaskEntryInputSchema>;

const SmartTaskEntryOutputSchema = z.object({
  description: z.string().describe('The extracted clear task description.'),
  dueDate: z
    .string()
    .nullable()
    .describe("The extracted due date in YYYY-MM-DD format, or null if no date is mentioned."),
});
export type SmartTaskEntryOutput = z.infer<typeof SmartTaskEntryOutputSchema>;

/**
 * Server action to extract task details from natural language.
 */
export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  return smartTaskEntryFlow(input);
}

const taskPrompt = ai.definePrompt({
  name: 'smartTaskEntryPrompt',
  input: { schema: SmartTaskEntryInputSchema },
  output: { schema: SmartTaskEntryOutputSchema },
  prompt: `You are a task management assistant. Your goal is to extract a clear task description and an optional due date from natural language input.

Today's date is: {{{currentDate}}}
User Input: {{{naturalLanguageTask}}}

Instructions:
1. Resolve relative time expressions (like "tomorrow", "next Friday") using the provided current date.
2. If no date is mentioned, set dueDate to null.
3. Provide a concise, clear description for the task.`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async (input) => {
    // Check for API key availability explicitly
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GENKIT_ERROR: API key is missing from environment variables.');
      throw new Error('API_KEY_MISSING');
    }

    try {
      const { output } = await taskPrompt(input);

      if (!output) {
        throw new Error('AI_EMPTY_RESPONSE');
      }

      return output;
    } catch (error: any) {
      console.error('Genkit Flow execution failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('blocked') || error.status === 'SAFETY' || error.message?.includes('SAFETY')) {
        throw new Error('SAFETY_BLOCKED');
      }
      
      if (error.message?.includes('403') || error.message?.includes('API key') || error.message?.includes('invalid')) {
        throw new Error('API_KEY_INVALID');
      }
      
      throw new Error(error.message || 'AI_PARSE_ERROR');
    }
  }
);
