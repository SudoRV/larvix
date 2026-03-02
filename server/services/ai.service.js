import { callOpenAI } from "../providers/openai.provider.js";
import { callGemini } from "../providers/gemini.provider.js";
//import { callClaude } from "../providers/claude.provider.js";

export const handleAIRequest = async (api, message, res) => {

  switch (api) {
    case "chatgpt":
      return await callOpenAI(message, res);

    case "gemini":
      return await callGemini(message, res);

    case "claude":
      return await callClaude(message, res);

    default:
      throw new Error("Unsupported AI provider");
  }
};