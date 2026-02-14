import { callOpenAI } from "../providers/openai.provider.js";
import { callGemini } from "../providers/gemini.provider.js";
//import { callClaude } from "../providers/claude.provider.js";

export const handleAIRequest = async (api, message) => {

  switch (api) {
    case "chatgpt":
      return await callOpenAI(message);

    case "gemini":
      return await callGemini(message);

    //case "claude":
      //return await callClaude(message);

    default:
      throw new Error("Unsupported AI provider");
  }
};