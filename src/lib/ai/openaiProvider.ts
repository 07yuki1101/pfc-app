import { ConsultationFoodSuggestion, ConsultationPrompt, ConsultationResult } from "./types";

const OPENAI_MODEL = "gpt-4o-mini";

export async function generateWithOpenAI(
  prompt: ConsultationPrompt
): Promise<ConsultationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`OpenAI ${res.status}: ${errBody?.error?.message ?? "unknown error"}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");

  const parsed = JSON.parse(content);
  const foods: ConsultationFoodSuggestion[] = Array.isArray(parsed.foods)
    ? parsed.foods.map((f: Record<string, unknown>) => ({
        name: String(f.name ?? ""),
        amount: String(f.amount ?? ""),
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        fat: Number(f.fat) || 0,
        carb: Number(f.carb) || 0,
      }))
    : [];

  return {
    title: String(parsed.title ?? ""),
    summary: String(parsed.summary ?? ""),
    foods,
  };
}
