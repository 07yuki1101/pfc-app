export type Gender = "male" | "female";
export type Goal = "cut" | "bulk" | "maintain";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  targetWeight: number; // kg
  goal: Goal;
  targetCalories: number;
  targetProtein: number; // g
  targetFat: number; // g
  targetCarb: number; // g
  isPremium: boolean;
  aiUsageToday: number;
  aiUsageDate: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface Food {
  id: string;
  name: string;
  calorie: number; // per 100g or per unit
  protein: number; // g
  fat: number; // g
  carb: number; // g
  unit: string; // "100g" | "個" | "枚" etc.
  servingSize: number; // default serving size
  category: FoodCategory;
  isCustom?: boolean;
  createdBy?: string;
}

export type FoodCategory =
  | "meat"
  | "fish"
  | "dairy"
  | "grain"
  | "vegetable"
  | "fruit"
  | "snack"
  | "supplement"
  | "other";

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  amount: number; // g or units
  calorie: number;
  protein: number;
  fat: number;
  carb: number;
  mealType: MealType;
  loggedAt: Date;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: MealEntry[];
  totalCalorie: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
}

export interface PFCTarget {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface PFCRemaining {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface FoodSuggestion {
  food: Food;
  reason: string;
  amount: number;
}

export interface AIUsageLimit {
  free: number;
  premium: number;
}

export const AI_USAGE_LIMIT: AIUsageLimit = {
  free: 3,
  premium: Infinity,
};
