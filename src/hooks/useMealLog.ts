"use client";

import { useEffect, useCallback } from "react";
import { getDailyLog, getFoods, getFavorites } from "@/lib/firebase/firestore";
import { useMealStore } from "@/store/mealStore";
import { useAuthStore } from "@/store/authStore";
import { todayString } from "@/lib/utils";
import { seedFoods } from "@/lib/seedFoods";

export function useMealLog() {
  const { user } = useAuthStore();
  const { setTodayLog, setFoods, setFavorites } = useMealStore();

  const refresh = useCallback(async () => {
    if (!user) return;
    await seedFoods();
    const [log, foods, favs] = await Promise.all([
      getDailyLog(user.uid, todayString()),
      getFoods(user.uid),
      getFavorites(user.uid),
    ]);
    setTodayLog(log);
    setFoods(foods);
    setFavorites(favs);
  }, [user, setTodayLog, setFoods, setFavorites]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refresh };
}
