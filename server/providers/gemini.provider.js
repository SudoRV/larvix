import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const callGemini = async (message, res) => {

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const result = await model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ]
  });

  let index=0;
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (!text) continue;
  
    res.write(
      `data: ${JSON.stringify({
        index: index++,
        type: "chunk",
        content: text
      })}\n\n`
    );
  }
  
  // Stream is finished here.
  const full = await result.response;
  
  res.write(
    `data: ${JSON.stringify({
      type: "final",
      content: full.text()
    })}\n\n`
  );
  
  res.write(`data: [DONE]\n\n`);
  res.end();
};