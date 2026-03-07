'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language task descriptions.
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
Extract a clear task description and a due date (YYYY-MM-DD).
- Use the provided currentDate to resolve relative dates like "tomorrow" or "next Friday".
- If no date is found, set dueDate to null.
- Be concise. Return only the extracted data.`,
  prompt: `Today's Date: {{#if currentDate}}{{currentDate}}{{else}}Not provided{{/if}}
Task to parse: {{{naturalLanguageTask}}}`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async input => {
    // Ensure API Key is available
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    if (input.naturalLanguageTask.trim().length < 3) {
      throw new Error('INPUT_TOO_SHORT');
    }

    try {
      const {output} = await smartTaskEntryPrompt(input);
      if (!output) throw new Error('MODEL_PARSE_ERROR');
      return output;
    } catch (error: any) {
      console.error('Genkit Flow Error:', error);
      if (error.message?.includes('SAFETY')) {
        throw new Error('SAFETY_BLOCKED');
      }
      throw error;
    }
  }
);

export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  return smartTaskEntryFlow(input);
}
