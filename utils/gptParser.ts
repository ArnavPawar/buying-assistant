import { openai } from "../services/openai";

export const parseUserQuery = async (query: string) => {
  const prompt = `
  Return a list of 5 Amazon products based on the user query below.
  Only include products available on amazon.com.
  For each product, return:
  - Title
  - Direct Amazon URL (not an ASIN)
  
  Use this format:
  [
    { "title": "...", "link": "https://www.amazon.com/..." },
    ...
  ]
  
  Only output valid JSON. No explanations or extra text.
  
  User Query: "${query}"
  `;
  

  try {
    console.log("🧠 Sending product search prompt to GPT...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    console.log("📥 GPT raw response:", raw);

    // ✅ Try to slice to the last closing bracket to remove extra text
    const trimmed = raw.slice(0, raw.lastIndexOf("]") + 1);

    // ✅ Try parsing
    const parsed = JSON.parse(trimmed);
    return parsed;
  } catch (err) {
    console.error("❌ GPT error:", err);
    return [];
  }
};
