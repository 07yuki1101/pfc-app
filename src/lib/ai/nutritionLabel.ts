// Reads a photographed nutrition facts label (栄養成分表示) and extracts PFC values.

const OPENAI_MODEL = "gpt-4o-mini";

export interface NutritionLabelResult {
  name: string;
  basis: string; // e.g. "1袋(45g)あたり", "100gあたり"
  calorie: number;
  protein: number;
  fat: number;
  carb: number;
}

const SYSTEM_PROMPT = `あなたは食品パッケージの「栄養成分表示」を読み取るアシスタントです。
画像から次の値を読み取り、JSONのみで返してください。
{
  "found": 栄養成分表示が読み取れたら true、読み取れなければ false,
  "name": 商品名（画像から分かれば。分からなければ空文字）,
  "basis": 表示の基準（例: "1袋(45g)あたり", "100gあたり", "1本あたり"）,
  "calorie": エネルギー(kcal),
  "protein": たんぱく質(g),
  "fat": 脂質(g),
  "carb": 炭水化物(g)
}
ルール:
- 数値は表示どおりに転記し、推測や換算はしない
- 炭水化物が「糖質」と「食物繊維」に分かれていて炭水化物の記載がない場合は、その合計を carb にする
- kJ表記しかない場合は kcal に換算（÷4.184、小数第1位まで）
- 読み取れない項目は 0`;

export async function readNutritionLabel(imageDataUrl: string): Promise<NutritionLabelResult | null> {
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
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "この栄養成分表示を読み取ってください。" },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 300,
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
  if (!parsed.found) return null;

  return {
    name: String(parsed.name ?? ""),
    basis: String(parsed.basis ?? ""),
    calorie: Number(parsed.calorie) || 0,
    protein: Number(parsed.protein) || 0,
    fat: Number(parsed.fat) || 0,
    carb: Number(parsed.carb) || 0,
  };
}
