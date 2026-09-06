import { round1 } from "@/lib/utils";
import { ConsultationPrompt, ConsultationRequestPayload, ConsultationTypeId } from "./types";

const INSTRUCTIONS: Record<ConsultationTypeId, string> = {
  remaining_meal:
    "今日の残りのカロリー・タンパク質・脂質・炭水化物になるべく近づく食事を提案してください。具体的な食品名と量を示してください。",
  protein:
    "現在不足しているタンパク質量を優先的に補う食事を提案してください。カロリー・脂質・炭水化物の残り許容量を大きく超えない範囲で、具体的な食品名と量を示してください。",
  dinner:
    "これから食べる夕食のメニューを提案してください。残りのPFCに収まるよう、具体的な食品名と量を示してください。",
  convenience_store:
    "コンビニやスーパーで手軽に買える食品の組み合わせで、残りのPFCに近づく提案をしてください。",
  daily_review:
    "今日食べた食事の内容を振り返り、良かった点と改善点を簡潔にコメントしてください。新たな食事の提案は不要です。",
};

const SYSTEM_PROMPT = `あなたは経験豊富なスポーツ栄養士です。ユーザーのPFC（タンパク質・脂質・炭水化物）管理をサポートします。

ルール:
- 医療的な診断や治療の指示は行わない
- 栄養価は食品・商品・量・調理方法によって変わる目安であることを前提に、現実的に食べられる組み合わせを優先する
- PFCの数値を完全一致させることより、実用性を優先する
- 日本語で、簡潔かつ実用的に回答する
- 必ず次のJSON形式のみで出力し、それ以外の文章は含めない:
{"title": "string(20文字以内)", "summary": "string(60〜120文字程度)", "foods": [{"name": "string", "amount": "string", "calories": number, "protein": number, "fat": number, "carb": number}]}
foodsは0〜5件。食事の提案が不要な相談内容では空配列にする。`;

export function buildConsultationPrompt(
  payload: ConsultationRequestPayload
): ConsultationPrompt {
  const { consultationType, currentPfcData, todayMeals } = payload;
  const { target, remaining } = currentPfcData;

  const mealsText =
    todayMeals.length > 0
      ? todayMeals
          .map(
            (m) =>
              `- [${m.mealType}] ${m.foodName} (${m.calorie}kcal, P${m.protein}g F${m.fat}g C${m.carb}g)`
          )
          .join("\n")
      : "（まだ記録なし）";

  const user = `相談内容: ${INSTRUCTIONS[consultationType]}

目標: ${target.calories}kcal / P${target.protein}g F${target.fat}g C${target.carb}g
残り: ${Math.round(remaining.calories)}kcal / P${round1(remaining.protein)}g F${round1(remaining.fat)}g C${round1(remaining.carb)}g

今日食べたもの:
${mealsText}`;

  return { system: SYSTEM_PROMPT, user };
}
