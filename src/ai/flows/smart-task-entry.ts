'use server';
/**
 * @fileOverview A Genkit flow for parsing natural language task descriptions.
 * 
 * - extractTaskDetails - A function that extracts task details using AI.
 * - SmartTaskEntryInput - Input schema for task extraction.
 * - SmartTaskEntryOutput - Output schema for task extraction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  // Explicit check for API key before calling the flow
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error('AI_FLOW_ERROR: Missing API Key in environment.');
    throw new Error('MISSING_API_KEY');
  }

  try {
    return await smartTaskEntryFlow(input);
  } catch (error: any) {
    console.error('AI_FLOW_EXECUTION_FAILED:', error);
    
    const message = error.message || '';
    if (message.includes('429')) throw new Error('QUOTA_EXCEEDED');
    if (message.includes('403') || message.includes('API_KEY_INVALID')) throw new Error('INVALID_API_KEY');
    
    throw new Error('AI_PARSING_FAILED');
  }
}

const taskPrompt = ai.definePrompt({
  name: 'taskPrompt',
  input: { schema: SmartTaskEntryInputSchema },
  output: { schema: SmartTaskEntryOutputSchema },
  config: {
    model: 'googleai/gemini-1.5-flash',
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `
    You are a professional task management assistant. Your goal is to convert messy, natural language user input into a clean task object.

    CONTEXT:
    Today's date is: {{{currentDate}}}

    INPUT:
    "{{{naturalLanguageTask}}}"
    
    INSTRUCTIONS:
    1. Resolve all relative dates (e.g., "tomorrow", "next Wed", "in two days") based on the current date provided.
    2. If no time/date is mentioned, set 'dueDate' to null.
    3. Ensure the description is action-oriented and clear. Remove filler words like "I need to", "Could you", etc.
    4. Provide the output as a clean JSON object matching the schema.
  `,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async (input) => {
    // Ensure we have a reference date for relative parsing
    const contextInput = {
      ...input,
      currentDate: input.currentDate || new Date().toISOString().split('T')[0],
    };

    const { output } = await taskPrompt(contextInput);

    if (!output) {
      throw new Error('AI_EMPTY_RESPONSE');
    }

    return {
      description: output.description,
      dueDate: output.dueDate || null,
    };
  }
);
