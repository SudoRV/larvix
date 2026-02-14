export const callOpenAI = async (message) => {
  const normalized = message.toLowerCase().trim();

  if (normalized.includes("backpropagation")) {
    return `
## Backpropagation

Backpropagation is a supervised learning algorithm used to train artificial neural networks. It updates the weights of the network by minimizing the loss function using gradient descent and the chain rule of calculus.

---

### 🔹 Forward Pass

For a neuron:

z = w·x + b  
a = f(z)

Where:
- w = weights  
- x = input  
- b = bias  
- f(z) = activation function  
- a = output  

---

### 🔹 Loss Function

For Mean Squared Error (MSE):

L = (1/2)(y - ŷ)^2

Where:
- y = actual value  
- ŷ = predicted value  

---

### 🔹 Backward Pass

Using the chain rule:

∂L/∂w = (∂L/∂a)(∂a/∂z)(∂z/∂w)

For sigmoid activation:

σ'(z) = σ(z)(1 - σ(z))

Error term:

δ = (ŷ - y) × σ'(z)

---

### 🔹 Weight Update Rule

w_new = w_old - η(∂L/∂w)

Where:
- η = learning rate  

---

### 🔹 Summary

Backpropagation:
- Computes prediction error  
- Propagates error backward layer-by-layer  
- Updates weights iteratively  
- Minimizes loss efficiently  

It is the core optimization mechanism behind deep learning.
`;
  }

  return "Sorry, this demo only supports the question about backpropagation.";
};













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