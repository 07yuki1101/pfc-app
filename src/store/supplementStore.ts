import { create } from "zustand";
import { Supplement, SupplementLog } from "@/types";

interface SupplementState {
  supplements: Supplement[];
  todayLog: SupplementLog | null;
  setSupplements: (supplements: Supplement[]) => void;
  setTodayLog: (log: SupplementLog) => void;
}

export const useSupplementStore = create<SupplementState>((set) => ({
  supplements: [],
  todayLog: null,
  setSupplements: (supplements) => set({ supplements }),
  setTodayLog: (todayLog) => set({ todayLog }),
}));
