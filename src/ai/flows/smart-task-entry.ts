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

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async (input) => {
    // Double check API key availability in the server context
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    try {
      const { output } = await ai.generate({
        system: `You are a task management assistant. Your goal is to extract a clear task description and an optional due date from natural language input.
- Today's date is ${input.currentDate || 'not provided'}.
- Use this date to resolve relative time expressions like "tomorrow", "next Monday", etc.
- If no specific date or relative time is mentioned, set dueDate to null.
- Return ONLY the JSON object.`,
        prompt: input.naturalLanguageTask,
        output: {
          schema: SmartTaskEntryOutputSchema,
        },
        config: {
          temperature: 0.1, // Low temperature for more consistent extraction
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        },
      });

      if (!output) {
        throw new Error('AI_EMPTY_RESPONSE');
      }

      return output;
    } catch (error: any) {
      console.error('Genkit Flow Error:', error);
      
      // Map common errors to user-friendly codes
      if (error.message?.includes('SAFETY')) {
        throw new Error('SAFETY_BLOCKED');
      }
      if (error.message?.includes('403') || error.message?.includes('API key')) {
        throw new Error('API_KEY_INVALID');
      }
      
      throw new Error(error.message || 'AI_PARSE_ERROR');
    }
  }
);
