import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGemini = async (message) => {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ]
  });

  return result.response.text();
};