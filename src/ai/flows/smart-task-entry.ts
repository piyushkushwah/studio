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

export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  return smartTaskEntryFlow(input);
}

const smartTaskEntryPrompt = ai.definePrompt({
  name: 'smartTaskEntryPrompt',
  input: {schema: SmartTaskEntryInputSchema},
  output: {schema: SmartTaskEntryOutputSchema},
  system: `You are an intelligent assistant designed to parse natural language task descriptions.
Your goal is to extract the main task description and a specific due date.

CRITICAL: You must return ONLY valid JSON. No markdown blocks, no commentary.

Instructions:
1. Extract the core task description.
2. Convert mentioned dates to 'YYYY-MM-DD' format based on the provided currentDate.
3. If no specific date is mentioned, set 'dueDate' to null.
4. Output must be valid JSON matching the schema.`,
  prompt: `Today's date is: {{#if currentDate}}{{currentDate}}{{else}}Not provided{{/if}}
Natural Language Task: {{{naturalLanguageTask}}}`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async input => {
    // Check for API key presence at runtime to provide better errors
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Gemini API Key. Please configure GOOGLE_GENAI_API_KEY in your environment variables.');
    }

    try {
      console.log('Starting AI parsing for:', input.naturalLanguageTask);
      const {output} = await smartTaskEntryPrompt(input);
      
      if (!output) {
        throw new Error('The AI model failed to generate a response.');
      }
      
      console.log('AI parsing successful:', output);
      return output;
    } catch (error: any) {
      console.error('Genkit Smart Task Entry Flow Error:', error);
      // Re-throw with a cleaner message if it's a known service error
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API Key provided. Please check your Gemini API key configuration.');
      }
      throw error;
    }
  }
);
