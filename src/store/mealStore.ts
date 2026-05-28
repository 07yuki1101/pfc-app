import { create } from "zustand";
import { DailyLog, Food } from "@/types";

interface MealState {
  todayLog: DailyLog | null;
  foods: Food[];
  favorites: Food[];
  setTodayLog: (log: DailyLog) => void;
  setFoods: (foods: Food[]) => void;
  setFavorites: (favorites: Food[]) => void;
}

export const useMealStore = create<MealState>((set) => ({
  todayLog: null,
  foods: [],
  favorites: [],
  setTodayLog: (todayLog) => set({ todayLog }),
  setFoods: (foods) => set({ foods }),
  setFavorites: (favorites) => set({ favorites }),
}));
