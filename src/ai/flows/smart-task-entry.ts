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
  description: z.string().describe('The action-oriented task description.'),
  dueDate: z
    .string()
    .nullable()
    .describe("The extracted due date in YYYY-MM-DD format, or null if not specified."),
});
export type SmartTaskEntryOutput = z.infer<typeof SmartTaskEntryOutputSchema>;

/**
 * Server action to extract task details from natural language.
 */
export async function extractTaskDetails(input: SmartTaskEntryInput): Promise<SmartTaskEntryOutput> {
  // Check for API key in environment
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  
  if (!apiKey) {
    console.error('AI_FLOW_ERROR: Missing Gemini API Key.');
    throw new Error('MISSING_API_KEY');
  }

  try {
    return await smartTaskEntryFlow(input);
  } catch (error: any) {
    console.error('AI_FLOW_EXECUTION_FAILED:', error);
    
    // Check for specific error codes from the Gemini API
    const errorMsg = error.message?.toLowerCase() || '';
    if (errorMsg.includes('429') || errorMsg.includes('quota')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (errorMsg.includes('403') || errorMsg.includes('invalid api key')) {
      throw new Error('INVALID_API_KEY');
    }
    
    throw new Error('AI_PARSING_FAILED');
  }
}

const taskPrompt = ai.definePrompt({
  name: 'taskPrompt',
  input: { schema: SmartTaskEntryInputSchema },
  output: { schema: SmartTaskEntryOutputSchema },
  config: {
    model: 'googleai/gemini-1.5-flash',
  },
  system: `You are a professional productivity assistant. Your goal is to extract structured task data from messy natural language input.
    
    RULES:
    1. Resolve relative dates (e.g., 'tomorrow', 'next Friday', 'in 3 days') based on the provided currentDate.
    2. If no date is mentioned, return null for dueDate.
    3. Keep descriptions action-oriented and remove filler words like 'I need to' or 'remind me to'.
    4. Ensure the output is valid JSON according to the schema.`,
  prompt: `
    Current Date: {{currentDate}}
    User Input: "{{naturalLanguageTask}}"
    
    Extract the action and resolve the due date.
  `,
});

const smartTaskEntryFlow = ai.defineFlow(
  {
    name: 'smartTaskEntryFlow',
    inputSchema: SmartTaskEntryInputSchema,
    outputSchema: SmartTaskEntryOutputSchema,
  },
  async (input) => {
    // Default to today if no date provided to help AI resolve relative terms
    const currentDate = input.currentDate || new Date().toISOString().split('T')[0];
    
    const { output } = await taskPrompt({
      ...input,
      currentDate,
    });

    if (!output) {
      throw new Error('No output from model');
    }

    return {
      description: output.description,
      dueDate: output.dueDate || null,
    };
  }
);
