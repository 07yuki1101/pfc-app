import { Food, FoodSuggestion, PFCTarget } from "@/types";
import { calcFoodNutrition } from "./pfc";

export function getSuggestions(
  remaining: PFCTarget,
  foods: Food[]
): FoodSuggestion[] {
  if (remaining.calories <= 0) return [];

  const scored = foods.map((food) => {
    let score = 0;
    let reason = "";

    const amount = food.servingSize || 1;
    const { calorie, protein: p, fat: f, carb: c } = calcFoodNutrition(food, amount);

    if (remaining.protein > 20 && p > 15) {
      score += 3;
      reason = "タンパク質補給に最適";
    }
    if (remaining.carb > 30 && c > 20) {
      score += 2;
      reason = reason || "炭水化物補給に最適";
    }
    if (remaining.fat < 5 && f < 3) {
      score += 2;
      reason = reason || "低脂質で調整に最適";
    }
    if (remaining.protein < -5) {
      if (p < 5) score += 2;
      reason = reason || "タンパク質控えめ";
    }
    if (remaining.fat < -5) {
      if (f < 3) score += 3;
      reason = reason || "低脂質食品";
    }

    // Prefer foods that fit within remaining calories
    const ratio = calorie / (remaining.calories || 1);
    if (ratio > 0 && ratio <= 0.6) score += 1;

    // コンビニ商品は買ってすぐ食べられる手軽さがあるため、同条件の食材と並んだ際に
    // 埋もれないよう少しだけ優先する（他の栄養条件による加点より小さく保つ）
    if (food.category === "convenience") score += 1;

    return { food, score, reason: reason || "バランスが良い", amount, nutrition: { calorie, protein: p, fat: f, carb: c } };
  });

  const sorted = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  // 同じチェーン（brand）の商品が上位を独占しないよう、1チェーンにつき最大2件までに制限する。
  // 対象外（brandなしの通常食材）は制限しない。
  const MAX_PER_BRAND = 2;
  const brandCount = new Map<string, number>();
  const picked: typeof sorted = [];
  for (const item of sorted) {
    const brand = item.food.brand;
    if (brand) {
      const count = brandCount.get(brand) ?? 0;
      if (count >= MAX_PER_BRAND) continue;
      brandCount.set(brand, count + 1);
    }
    picked.push(item);
    if (picked.length >= 5) break;
  }

  return picked.map(({ food, reason, amount, nutrition }) => ({
    food,
    reason,
    amount,
    nutrition,
  }));
}
