
// services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionSchema } from '../types';

/**
 * Initializes the GoogleGenAI client.
 */
const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a batch of math and situation-based questions using the Gemini API.
 */
export const generateGameQuestions = async (count: number, maxNum: number): Promise<Question[]> => {
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

    Return the output in JSON format according to the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                    description: 'Type of question: "arithmetic" or "situation"',
                  },
                  num1: { type: Type.NUMBER },
                  num2: { type: Type.NUMBER },
                  operation: {
                    type: Type.STRING,
                  },
                  answer: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  situationText: { type: Type.STRING }
                },
                required: ['type', 'answer', 'questionText'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedData: QuestionSchema = JSON.parse(jsonStr);

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error("Invalid response format from AI");
    }

    return parsedData.questions;
  } catch (error) {
    console.error('Error generating game questions:', error);
    // Return some basic fallback questions if the API fails
    return [
      { type: 'arithmetic', num1: 5, num2: 5, operation: '+', answer: 10, questionText: '5 + 5 = ?' },
      { type: 'arithmetic', num1: 12, num2: 4, operation: '*', answer: 48, questionText: '12 * 4 = ?' },
      { type: 'situation', situationText: 'John has 10 apples. He gives 3 to Mary.', questionText: 'How many apples does John have left?', answer: 7 }
    ];
  }
};
