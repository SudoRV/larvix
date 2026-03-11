import { parseMarkdownToAST } from "../../larvix/src/scripts/markdownParser.js";

export const callOpenAI = async (message, res) => {

  const markdown_response = `
# 🧠 AI Response: Context & Artifact Awareness

When processing structured input, an AI system typically extracts:

- **Context**
- **Artifacts**
- **Intent**
- **Code blocks**

---

## 🔹 One-Line Example

\`\`\`js
const context = input.split("Context:")[1];
\`\`\`

---

## 🔹 Two-Line Example

\`\`\`js
const parts = input.split("Summary:");
const summary = parts[1];
\`\`\`

---

## 🔹 Multi-Line Example

\`\`\`js
function analyzeInput(input) {
  return {
    hasContext: input.includes("Context:"),
    hasSummary: input.includes("Summary:"),
    hasCode: input.includes("\`\`\`"),
  };
}
\`\`\`

---

## ✅ Processing Strategy

1. Detect structural markers
2. Extract code blocks
3. Preserve important keywords
4. Return structured output

This demonstrates how an AI might reason about context and artifacts without implementing a full parser.
`;

  // split into chunks (simulate AI token streaming)
  const chunks = markdown_response.split(" ");

  let index=0;
  for (let i = 0; i < chunks.length; i++) {
    res.write(
      `data: ${JSON.stringify({
        index: index++,
        type: "chunk",
        content: chunks[i]
      })}\n\n`
    );
    await new Promise(r => setTimeout(r, 25)); // simulate streaming delay
  }

  // Stream is finished here.
  const full = markdown_response;
  
  res.write(
    `data: ${JSON.stringify({
      type: "final",
      content: full
    })}\n\n`
  );
  
  res.write(`data: [DONE]\n\n`);
  res.end();
};




























const data = `
## Backpropagation (Backprop)

Backpropagation is a supervised learning algorithm used to train artificial neural networks. It minimizes the loss function by adjusting network weights using **gradient descent** and the **chain rule of calculus**.

---

### 🔹 Step 1: Forward Pass

Each neuron computes:

\`\`\`
z = w·x + b
a = f(z)
\`\`\`

Where:
- **w** = weights  
- **x** = input  
- **b** = bias  
- **f(z)** = activation function  
- **a** = output  

---

### 🔹 Step 2: Loss Function

For Mean Squared Error (MSE):

\`\`\`
L = (1/2)(y - ŷ)^2
\`\`\`

Where:
- **y** = actual value  
- **ŷ** = predicted value  

---

### 🔹 Step 3: Backward Pass

Using the chain rule:

\`\`\`
∂L/∂w = (∂L/∂a)(∂a/∂z)(∂z/∂w)
\`\`\`

For sigmoid activation:

\`\`\`
σ'(z) = σ(z)(1 - σ(z))
\`\`\`

Error term:

\`\`\`
δ = (ŷ - y) × σ'(z)
\`\`\`

---

### 🔹 Step 4: Weight Update

Weights are updated using gradient descent:

\`\`\`
w_new = w_old - η(∂L/∂w)
\`\`\`

Where:
- **η** = learning rate  

---

### 🔹 Summary

Backpropagation:
- Computes prediction error  
- Propagates error backward through layers  
- Updates weights iteratively  
- Reduces loss efficiently  

It is the fundamental optimization algorithm behind deep learning.
`



// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export const callOpenAI = async (message) => {
//   const response = await client.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "user", content: message }
//     ]
//   });

//   return response.choices[0].message.content;
// };