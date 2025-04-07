import { openai } from "../services/openai";

export const parseUserQuery = async (query: string) => {
  const prompt = `
Return a list of 5 Amazon products based on the query below.
Include only their title and ASIN in a structured JSON array.
Use products available on amazon.com.

User Query: "${query}"

Output format:
[
  { "title": "...", "asin": "..." },
  ...
]
`;

  try {
    console.log("🧠 Sending product search prompt to GPT...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    console.log("📥 GPT raw response:", raw);

    const parsed = JSON.parse(raw);
    return parsed; // ← array of { title, asin }
  } catch (err) {
    console.error("❌ GPT error:", err);
    return [];
  }
};

