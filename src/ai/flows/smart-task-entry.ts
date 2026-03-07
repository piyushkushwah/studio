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
  description: z.string().describe('The extracted clear task description.'),
  dueDate: z
    .string()
    .nullable()
    .optional()
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
    // Explicitly check for key in server context to provide better error messages
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    
    if (!apiKey) {
      console.error('AI_FLOW_ERROR: No API key found. Please set GEMINI_API_KEY or GOOGLE_GENAI_API_KEY.');
      throw new Error('MISSING_API_KEY');
    }

    try {
      const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `You are a task management assistant. Extract a clear task description and an optional due date from the user's input.
        Today's date is: ${input.currentDate || new Date().toISOString().split('T')[0]}
        User Input: ${input.naturalLanguageTask}
        
        Instructions:
        1. Resolve relative dates like "tomorrow" or "next Friday" based on today's date.
        2. If no date is mentioned, set dueDate to null.
        3. Keep the description professional and concise.`,
        output: { schema: SmartTaskEntryOutputSchema },
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        },
      });

      const output = response.output;

      if (!output) {
        throw new Error('EMPTY_AI_RESPONSE');
      }

      return {
        description: output.description,
        dueDate: output.dueDate || null
      };
    } catch (error: any) {
      console.error('AI_FLOW_EXECUTION_FAILED:', error);
      
      // Pass meaningful errors back to the client
      if (error.message?.includes('403') || error.message?.includes('API_KEY')) {
        throw new Error('INVALID_API_KEY');
      }
      
      throw new Error('AI_GENERATION_FAILED');
    }
  }
);
