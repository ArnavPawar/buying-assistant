import { openai } from "../services/openai";

export const parseUserQuery = async (query: string) => {
  const prompt = `
Convert the following product request into structured JSON:
Input: "${query}"
Output format:
{
  "keywords": "...",
  "priceMax": ...,
  "category": "..."
}
`;

  try {
    console.log("🧠 Sending prompt to GPT...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    console.log("📥 GPT raw response:", raw);

    const json = JSON.parse(raw);
    return json;
  } catch (err) {
    console.error("❌ GPT error:", err);
    return { keywords: "", priceMax: 0, category: "" };
  }
};
