import { openai } from "../services/openai";

export const parseUserQuery = async (query: string) => {
  // 🧪 MOCK MODE – Free testing without using GPT tokens
  console.log("🧪 [Mock GPT] called with query:", query);

  return {
    message: `Here are 5 great picks based on your search: "${query}". Let me know if you'd like to refine it!`,
    products: [
      "Wireless mouse",
      "Bluetooth headphones",
      "Laptop stand",
      "Webcam with microphone",
      "USB-C hub"
    ]
  };
};

// import { openai } from "../services/openai";

// export const parseUserQuery = async (query: string) => {
//   const prompt = `
//   You are a helpful shopping assistant.

//   When given a user's query, respond in this JSON format:
//   {
//     "message": "Friendly explanation for why you picked these items.",
//     "products": [
//       "Product 1",
//       "Product 2",
//       ...
//     ]
//   }

//   User query: "${query}"
//   Only return valid JSON. Only 5 items for the response.
//   `;

//   try {
//     console.log("🧠 Sending product search prompt to GPT...");

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini-2024-07-18",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 100,
//       temperature: 0.4,
//     });

//     const raw = response.choices[0]?.message?.content ?? "{}";
//     console.log("📥 GPT raw response:", raw);

//     const trimmed = raw.slice(0, raw.lastIndexOf("}") + 1);
//     const parsed = JSON.parse(trimmed);
//     return parsed;
//   } catch (err) {
//     console.error("❌ GPT error:", err);
//     return [];
//   }
// };