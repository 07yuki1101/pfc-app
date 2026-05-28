import { Food, FoodSuggestion, PFCTarget } from "@/types";

export function getSuggestions(
  remaining: PFCTarget,
  foods: Food[]
): FoodSuggestion[] {
  if (remaining.calories <= 0) return [];

  const scored = foods.map((food) => {
    let score = 0;
    let reason = "";

    const scaleFactor = 100 / (food.servingSize || 100);
    const p = food.protein / scaleFactor;
    const f = food.fat / scaleFactor;
    const c = food.carb / scaleFactor;

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
    const ratio = food.calorie / (remaining.calories || 1);
    if (ratio > 0 && ratio <= 0.6) score += 1;

    return { food, score, reason: reason || "バランスが良い" };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ food, reason }) => ({
      food,
      reason,
      amount: food.servingSize,
    }));
}
