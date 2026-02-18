import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToAST } from "../services/markdownParser.js";

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

  const ast_response = parseMarkdownToAST(result.response.text());
  return ast_response;
};