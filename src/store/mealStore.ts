import { create } from "zustand";
import { DailyLog, Food } from "@/types";

interface MealState {
  // 常に「今日」のログ。日付を跨いだ機能（AIに相談 等）が
  // 表示中の日付に関わらず正しく「今日」を参照できるように独立して保持する。
  todayLog: DailyLog | null;
  // ホーム画面で現在表示中の日付のログ（過去ログ閲覧用）
  viewedLog: DailyLog | null;
  foods: Food[];
  favorites: Food[];
  setTodayLog: (log: DailyLog) => void;
  setViewedLog: (log: DailyLog) => void;
  setFoods: (foods: Food[]) => void;
  setFavorites: (favorites: Food[]) => void;
}

export const useMealStore = create<MealState>((set) => ({
  todayLog: null,
  viewedLog: null,
  foods: [],
  favorites: [],
  setTodayLog: (todayLog) => set({ todayLog }),
  setViewedLog: (viewedLog) => set({ viewedLog }),
  setFoods: (foods) => set({ foods }),
  setFavorites: (favorites) => set({ favorites }),
}));
