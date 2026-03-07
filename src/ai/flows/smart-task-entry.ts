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

const taskPrompt = ai.definePrompt({
  name: 'smartTaskEntryPrompt',
  input: { schema: SmartTaskEntryInputSchema },
  output: { schema: SmartTaskEntryOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are a professional task management assistant. Your goal is to extract a clear task description and an optional due date from natural language input.

Today's date is: {{{currentDate}}}
User Input: {{{naturalLanguageTask}}}

Instructions:
1. Resolve relative time expressions (like "tomorrow", "next Friday", "in 2 days") using the provided current date.
2. If no specific date is mentioned, set dueDate to null.
3. Provide a concise, clear, and professional description for the task.
4. If the input is just a simple task with no time, just return the task description and null for dueDate.`,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async (input) => {
    // Explicitly check for key in server context
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('AI_FLOW_ERROR: No API key found in process.env. (Checked GOOGLE_GENAI_API_KEY and GEMINI_API_KEY)');
      throw new Error('API_KEY_MISSING');
    }

    try {
      const { output } = await taskPrompt(input);

      if (!output) {
        console.error('AI_FLOW_ERROR: Model returned an empty output object.');
        throw new Error('AI_EMPTY_RESPONSE');
      }

      console.log('AI_FLOW_SUCCESS:', output);
      return {
        description: output.description,
        dueDate: output.dueDate || null
      };
    } catch (error: any) {
      console.error('AI_FLOW_EXECUTION_FAILED:', {
        message: error.message,
        stack: error.stack,
        input: input.naturalLanguageTask
      });
      
      // Handle specific Genkit/Gemini error types
      if (error.message?.includes('403') || error.message?.toLowerCase().includes('api key')) {
        throw new Error('API_KEY_INVALID');
      }
      
      if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
        throw new Error('SAFETY_BLOCKED');
      }
      
      throw new Error('AI_PARSE_ERROR');
    }
  }
);
