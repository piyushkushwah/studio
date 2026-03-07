'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language task descriptions.
 *
 * - extractTaskDetails - A function that processes natural language input.
 * - SmartTaskEntryInput - The input type.
 * - SmartTaskEntryOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskEntryInputSchema = z.object({
  naturalLanguageTask: z.string().describe('The task described in natural language.'),
  currentDate: z.string().optional().describe('The current date in YYYY-MM-DD format.'),
});
export type SmartTaskEntryInput = z.infer<typeof SmartTaskEntryInputSchema>;

const SmartTaskEntryOutputSchema = z.object({
  description: z.string().describe('The extracted task description.'),
  dueDate: z
    .string()
    .nullable()
    .describe(
      "The extracted due date for the task in YYYY-MM-DD format, or null if not specified."
    ),
});
export type SmartTaskEntryOutput = z.infer<typeof SmartTaskEntryOutputSchema>;

const smartTaskEntryPrompt = ai.definePrompt({
  name: 'smartTaskEntryPrompt',
  input: {schema: SmartTaskEntryInputSchema},
  output: {schema: SmartTaskEntryOutputSchema},
  system: `You are an intelligent task parsing assistant. 
Your goal is to extract a clear task description and a due date from natural language input.
If a relative date is mentioned (like "tomorrow" or "next Friday"), calculate it based on the provided currentDate.
If no date is mentioned, set dueDate to null.`,
  prompt: `Today is: {{#if currentDate}}{{currentDate}}{{else}}Not provided{{/if}}
Task input: {{{naturalLanguageTask}}}`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async input => {
    // Check for API key presence at runtime
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GENKIT_ERROR: Missing Gemini API Key');
      throw new Error('API_KEY_MISSING');
    }

    try {
      console.log('GENKIT: Starting parsing for:', input.naturalLanguageTask);
      const {output} = await smartTaskEntryPrompt(input);
      
      if (!output) {
        throw new Error('MODEL_EMPTY_RESPONSE');
      }
      
      console.log('GENKIT: Parsing success:', output);
      return output;
    } catch (error: any) {
      console.error('GENKIT_FLOW_ERROR:', error);
      
      // Handle safety blocks or other specific Gemini errors
      if (error.message?.includes('SAFETY')) {
        throw new Error('The input was flagged by safety filters.');
      }
      
      throw new Error(error.message || 'Failed to parse task details.');
    }
  }
);

export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  return smartTaskEntryFlow(input);
}
