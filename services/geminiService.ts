// services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import { MathQuestion, MathQuestionSchema } from '../types';

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
 * Generates a batch of math questions using the Gemini API.
 *
 * @param count The number of questions to generate.
 * @param maxNum The maximum number value for the operands in the questions.
 * @returns A promise that resolves to an array of MathQuestion objects.
 */
export const generateMathQuestions = async (count: number, maxNum: number): Promise<MathQuestion[]> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Generate ${count} arithmetic problems (addition, subtraction, multiplication, and division) for a math game. Ensure division problems have integer results and positive operands.
    For each problem, provide two numbers (num1, num2), the operation ('+', '-', '*', '/'), the correct answer, and the full question text.
    Numbers should be between 1 and ${maxNum}.
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
                  num1: { type: Type.NUMBER, description: 'First number' },
                  num2: { type: Type.NUMBER, description: 'Second number' },
                  operation: {
                    type: Type.STRING,
                    enum: ['+', '-', '*', '/'],
                    description: 'Arithmetic operation'
                  },
                  answer: { type: Type.NUMBER, description: 'Correct answer' },
                  questionText: { type: Type.STRING, description: 'The full question as a string, e.g., "10 + 5 = ?"' }
                },
                required: ['num1', 'num2', 'operation', 'answer', 'questionText'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedData: MathQuestionSchema = JSON.parse(jsonStr);

    return parsedData.questions;
  } catch (error) {
    console.error('Error generating math questions with Gemini API:', error);
    // Fallback or error handling logic
    return []; // Return an empty array on error
  }
};
