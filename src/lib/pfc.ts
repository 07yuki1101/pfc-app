import { ActivityLevel, Food, Gender, Goal, Pace, PFCTarget } from "@/types";

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string; factor: number }[] = [
  { value: "sedentary", label: "ほぼ座りっぱなし", desc: "デスクワーク中心・運動しない", factor: 1.2 },
  { value: "light", label: "軽め", desc: "立ち仕事や通勤で歩く・運動は週1〜2回", factor: 1.375 },
  { value: "moderate", label: "ふつう", desc: "運動を週3〜4回", factor: 1.55 },
  { value: "active", label: "多め", desc: "運動を週5〜6回・体を使う仕事", factor: 1.725 },
  { value: "very_active", label: "とても多い", desc: "毎日ハードな運動・肉体労働", factor: 1.9 },
];

// Weekly body-weight change as a fraction of current weight
export const PACE_OPTIONS: { value: Pace; label: string; cut: number; bulk: number }[] = [
  { value: "slow", label: "ゆっくり", cut: 0.0025, bulk: 0.001 },
  { value: "normal", label: "ふつう", cut: 0.005, bulk: 0.0025 },
  { value: "fast", label: "速め", cut: 0.0075, bulk: 0.004 },
];

// Energy in 1kg of body fat (approx.)
const KCAL_PER_KG = 7200;

export interface PFCCalcInput {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  goal: Goal;
  activityLevel?: ActivityLevel;
  pace?: Pace;
  bodyFat?: number;
}

export interface PFCCalcDetail extends PFCTarget {
  bmr: number;
  tdee: number;
  // Expected change per week in kg (negative = loss)
  weeklyChangeKg: number;
  usedBodyFat: boolean;
}

export function calcPFCTarget(params: PFCCalcInput): PFCCalcDetail {
  const { gender, age, height, weight, goal } = params;
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === params.activityLevel) ?? ACTIVITY_OPTIONS[2];
  const pace = PACE_OPTIONS.find((p) => p.value === params.pace) ?? PACE_OPTIONS[1];
  const bodyFat = params.bodyFat && params.bodyFat >= 3 && params.bodyFat <= 60 ? params.bodyFat : undefined;

  // BMR: Katch-McArdle when body fat is known (accounts for muscle mass), else Mifflin-St Jeor
  const leanMass = bodyFat !== undefined ? weight * (1 - bodyFat / 100) : undefined;
  const bmr =
    leanMass !== undefined
      ? 370 + 21.6 * leanMass
      : gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * activity.factor;

  let calories = tdee;
  if (goal === "cut") {
    const deficit = Math.min((weight * pace.cut * KCAL_PER_KG) / 7, tdee * 0.25);
    // Never go below BMR (or a safe absolute minimum)
    const floor = Math.max(bmr, gender === "male" ? 1500 : 1200);
    calories = Math.max(tdee - deficit, Math.min(floor, tdee));
  } else if (goal === "bulk") {
    calories = tdee + (weight * pace.bulk * KCAL_PER_KG) / 7;
  }
  calories = Math.round(calories);

  // Protein per kg. For high BMI, use the weight at BMI 25 so protein isn't inflated by fat mass.
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const proteinBaseWeight = bmi > 27 ? 25 * heightM * heightM : weight;
  const proteinPerKg = goal === "cut" ? 2.0 : goal === "bulk" ? 1.8 : 1.6;
  let protein = proteinBaseWeight * proteinPerKg;

  // Fat: 25% of calories, at least 0.6g/kg
  let fat = Math.max((calories * 0.25) / 9, weight * 0.6);

  // Keep protein + fat within the calorie budget, leaving carbs for the rest
  const maxPF = calories * 0.8;
  if (protein * 4 + fat * 9 > maxPF) {
    const scale = maxPF / (protein * 4 + fat * 9);
    protein *= scale;
    fat *= scale;
  }
  const carb = Math.max(0, (calories - protein * 4 - fat * 9) / 4);

  const dailyDelta = calories - tdee;
  return {
    calories,
    protein: Math.round(protein),
    fat: Math.round(fat),
    carb: Math.round(carb),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    weeklyChangeKg: Math.round(((dailyDelta * 7) / KCAL_PER_KG) * 100) / 100,
    usedBodyFat: leanMass !== undefined,
  };
}

// food.calorie/protein/fat/carb are per 100g/ml for "g"/"ml" units,
// or per servingSize (usually 1) for count-based units like "個"/"枚".
export function calcFoodNutrition(
  food: Pick<Food, "unit" | "servingSize" | "calorie" | "protein" | "fat" | "carb">,
  amount: number
) {
  const base = food.unit === "g" || food.unit === "ml" ? 100 : (food.servingSize || 1);
  const ratio = amount / base;
  return {
    calorie: Math.round(food.calorie * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
    carb: Math.round(food.carb * ratio * 10) / 10,
  };
}

export function calcRemaining(
  target: PFCTarget,
  consumed: { totalCalorie: number; totalProtein: number; totalFat: number; totalCarb: number }
): PFCTarget {
  return {
    calories: target.calories - consumed.totalCalorie,
    protein: target.protein - consumed.totalProtein,
    fat: target.fat - consumed.totalFat,
    carb: target.carb - consumed.totalCarb,
  };
}
