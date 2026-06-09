import { GoogleGenAI } from "@google/genai";
import config from "../configs/dotenv";

class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

let ai: GoogleGenAI | null = null;

if (config.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
}

export const generateRecommendationRerank = async (
  prompt: string,
  schema: any,
): Promise<string> => {
  if (!ai || !config.GEMINI_API_KEY) {
    throw new GeminiError("Gemini API key is not configured");
  }

  console.log('::::::Gemini prompt::::::', prompt);

  let timerId: NodeJS.Timeout | null = null;
  try {
    const promise = ai.models.generateContent({
      model: config.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    
    const timeout = new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new GeminiError("Gemini request timed out")),
        15000,
      );
    });

    const response = await Promise.race([promise, timeout]);
    if (!response || !response.text) {
      throw new GeminiError("Empty response from Gemini");
    }

    console.log('::::::Gemini response::::::', response.text);

    return response.text;
  } catch (error: any) {
    if (error instanceof GeminiError) {
      throw error;
    }
    throw new GeminiError(`Gemini error: ${error.message}`);
  } finally {
    if (timerId) {
      clearTimeout(timerId);
    }
  }
};
