// services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionSchema } from '../types'; // Updated import to use 'Question'

/**
 * Initializes the GoogleGenAI client.
 * The API key is assumed to be available from `process.env.API_KEY`.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    console.error('API_KEY environment variable is not set.');
    // In a real application, you might want to throw an error or handle this more gracefully.
    throw new Error('Google Gemini API Key is missing.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a batch of math and situation-based questions using the Gemini API.
 *
 * @param count The number of questions to generate.
 * @param maxNum The maximum number value for the operands in arithmetic questions.
 * @returns A promise that resolves to an array of Question objects.
 */
export const generateGameQuestions = async (count: number, maxNum: number): Promise<Question[]> => { // Renamed function
  try {
    const ai = getGeminiClient();
    const prompt = `Generate ${count} diverse math problems for a math game. Include a mix of arithmetic problems (addition, subtraction, multiplication, division) and situation-based word problems.
    For arithmetic problems:
    - Provide two numbers (num1, num2), the operation ('+', '-', '*', '/'), the correct numerical answer, and the full question text (e.g., "10 + 5 = ?").
    - Ensure division problems have integer results and positive operands.
    - Numbers should be between 1 and ${maxNum}.
    - Set 'type' to 'arithmetic'.

    For situation-based word problems:
    - Provide a 'situationText' describing the scenario.
    - Provide a 'questionText' that is the specific question derived from the situation (e.g., "How much money does Ali have left?").
    - Provide the correct numerical 'answer'.
    - Set 'type' to 'situation'.

    Example situation problem:
    situationText: "Ali buys RM2 candy. He has RM10 in hand."
    questionText: "How much money does he have left after buying the candy?"
    answer: 8

    Return the output in JSON format according to the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    enum: ['arithmetic', 'situation'],
                    description: 'Type of question'
                  },
                  // Arithmetic properties (optional for situation)
                  num1: { type: Type.NUMBER, description: 'First number (for arithmetic)', optional: true },
                  num2: { type: Type.NUMBER, description: 'Second number (for arithmetic)', optional: true },
                  operation: {
                    type: Type.STRING,
                    enum: ['+', '-', '*', '/'],
                    description: 'Arithmetic operation (for arithmetic)',
                    optional: true
                  },
                  // Common properties
                  answer: { type: Type.NUMBER, description: 'Correct numerical answer' },
                  questionText: { type: Type.STRING, description: 'The specific question to be solved' },
                  // Situation properties (optional for arithmetic)
                  situationText: { type: Type.STRING, description: 'Descriptive text for situation problems', optional: true }
                },
                required: ['type', 'answer', 'questionText'], // 'type', 'answer', 'questionText' are always required
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedData: QuestionSchema = JSON.parse(jsonStr);

    return parsedData.questions;
  } catch (error) {
    console.error('Error generating game questions with Gemini API:', error);
    // Fallback or error handling logic
    return []; // Return an empty array on error
  }
};