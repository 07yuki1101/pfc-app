import { PFCTarget, DailyLog, UserProfile } from "@/types";

export async function getAIAdvice(params: {
  profile: UserProfile;
  remaining: PFCTarget;
  dailyLog: DailyLog;
}): Promise<string> {
  const { profile, remaining, dailyLog } = params;

  const prompt = `
あなたはプロのフィットネス栄養士です。以下のユーザー情報をもとにアドバイスをしてください。

ユーザー情報:
- 目標: ${profile.goal === "cut" ? "減量" : profile.goal === "bulk" ? "増量" : "維持"}
- 目標カロリー: ${profile.targetCalories}kcal
- 目標P/F/C: ${profile.targetProtein}g / ${profile.targetFat}g / ${profile.targetCarb}g

今日の残りPFC:
- カロリー: ${remaining.calories}kcal
- タンパク質: ${remaining.protein}g
- 脂質: ${remaining.fat}g
- 炭水化物: ${remaining.carb}g

今日食べたもの:
${dailyLog.entries.map((e) => `- ${e.foodName} (P:${e.protein}g F:${e.fat}g C:${e.carb}g)`).join("\n") || "まだ記録なし"}

今日あと何を食べれば良いか、具体的なコンビニ食品も含めて3〜5つ提案してください。
日本語で、簡潔に200文字以内で回答してください。
`;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error("Gemini API error:", res.status, errBody);
    throw new Error(`Gemini ${res.status}: ${errBody?.error?.message ?? "unknown"}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "アドバイスを取得できませんでした";
}
