import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getOpenAIAPIResponse = async (message) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    return response.text;
  } catch (error) {
    console.log(error);
    return "Error generating response";
  }
};

export default getOpenAIAPIResponse;
