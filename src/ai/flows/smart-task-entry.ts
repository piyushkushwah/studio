'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language task descriptions and extracting task details.
 *
 * - extractTaskDetails - A function that processes natural language input to extract task description and due date.
 * - SmartTaskEntryInput - The input type for the extractTaskDetails function.
 * - SmartTaskEntryOutput - The return type for the extractTaskDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskEntryInputSchema = z
  .object({
    naturalLanguageTask: z.string().describe('The task described in natural language.'),
  })
  .describe('Input for the Smart Task Entry flow, containing a natural language task description.');
export type SmartTaskEntryInput = z.infer<typeof SmartTaskEntryInputSchema>;

const SmartTaskEntryOutputSchema = z
  .object({
    description: z.string().describe('The extracted task description.'),
    dueDate: z
      .string()
      .nullable()
      .describe(
        'The extracted due date for the task in YYYY-MM-DD format, or null if no due date is specified.'
      ),
  })
  .describe('Output from the Smart Task Entry flow, containing the extracted task details.');
export type SmartTaskEntryOutput = z.infer<typeof SmartTaskEntryOutputSchema>;

export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  return smartTaskEntryFlow(input);
}

const smartTaskEntryPrompt = ai.definePrompt({
  name: 'smartTaskEntryPrompt',
  input: {schema: SmartTaskEntryInputSchema},
  output: {schema: SmartTaskEntryOutputSchema},
  system: `You are an intelligent assistant designed to parse natural language task descriptions.
Your goal is to extract the main task description and, if present, a specific due date.

Today's date is: {{currentDate}}

Instructions:
1. Extract the core task description from the input.
2. If a specific date or time is mentioned that indicates a due date, convert it to a 'YYYY-MM-DD' format based on the current date.
3. If no explicit due date is mentioned, or if it's too vague to determine a specific date (e.g., 'soon', 'later today'), set the 'dueDate' field to null.
4. Ensure the output is valid JSON according to the provided schema.`,
  prompt: `Natural Language Task: {{{naturalLanguageTask}}}`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async input => {
    const currentDate = new Date().toISOString().split('T')[0];
    try {
      const {output} = await smartTaskEntryPrompt({...input, currentDate});
      if (!output) {
        throw new Error('No output returned from AI model');
      }
      return output;
    } catch (error) {
      console.error('Genkit flow error:', error);
      throw error;
    }
  }
);
