import { parseMarkdownToAST } from "../services/markdownParser.js";

export const callOpenAI = async (message) => {
  const normalized = message.toLowerCase().trim();

  if (normalized.includes("backpropagation")) {
    const markdown_response = `
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
`;

    const ast_response = parseMarkdownToAST(markdown_response);
    console.log(ast_response);
    return ast_response;
  }

  const markdown_response = `
## Demo Mode

This demo currently supports only:

- **What is backpropagation?**

Try asking that question.
`;

  const ast_response = parseMarkdownToAST(markdown_response);
  console.log(ast_response);
  return ast_response;

}




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