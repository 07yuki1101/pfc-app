import { MealType, PFCTarget } from "@/types";

export type ConsultationTypeId =
  | "remaining_meal"
  | "protein"
  | "dinner"
  | "convenience_store"
  | "daily_review";

export interface ConsultationOption {
  id: ConsultationTypeId;
  label: string;
  description: string;
}

export interface ConsultationMeal {
  foodName: string;
  mealType: MealType;
  calorie: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface ConsultationRequestPayload {
  consultationType: ConsultationTypeId;
  currentPfcData: {
    target: PFCTarget;
    remaining: PFCTarget;
  };
  todayMeals: ConsultationMeal[];
}

export interface ConsultationPrompt {
  system: string;
  user: string;
}

export interface ConsultationFoodSuggestion {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface ConsultationResult {
  title: string;
  summary: string;
  foods: ConsultationFoodSuggestion[];
}
