import { Gender, Goal, PFCTarget } from "@/types";

export function calcPFCTarget(params: {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  goal: Goal;
}): PFCTarget {
  const { gender, age, height, weight, targetWeight, goal } = params;

  // Mifflin-St Jeor BMR
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  // Moderate activity (1.55)
  const tdee = bmr * 1.55;

  let calories: number;
  if (goal === "cut") {
    calories = tdee - 500;
  } else if (goal === "bulk") {
    calories = tdee + 300;
  } else {
    calories = tdee;
  }

  calories = Math.round(calories);

  // PFC ratio by goal
  let proteinRatio: number;
  let fatRatio: number;

  if (goal === "cut") {
    proteinRatio = 0.35;
    fatRatio = 0.25;
  } else if (goal === "bulk") {
    proteinRatio = 0.3;
    fatRatio = 0.25;
  } else {
    proteinRatio = 0.3;
    fatRatio = 0.3;
  }

  const carbRatio = 1 - proteinRatio - fatRatio;

  const protein = Math.round((calories * proteinRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);
  const carb = Math.round((calories * carbRatio) / 4);

  return { calories, protein, fat, carb };
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
