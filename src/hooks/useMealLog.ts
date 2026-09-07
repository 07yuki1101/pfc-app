"use client";

import { useEffect, useCallback } from "react";
import { getDailyLog, getFoods, getFavorites } from "@/lib/firebase/firestore";
import { useMealStore } from "@/store/mealStore";
import { useAuthStore } from "@/store/authStore";
import { todayString } from "@/lib/utils";

/**
 * 表示対象日付（省略時は今日）のログを取得する。
 * AIに相談などの「今日」を前提とした機能が常に正しく動くよう、
 * 表示対象日付が今日以外のときは today のログも別途取得して保持する。
 */
export function useMealLog(date?: string) {
  const { user } = useAuthStore();
  const { setTodayLog, setViewedLog, setFoods, setFavorites } = useMealStore();
  const viewedDate = date ?? todayString();

  const refresh = useCallback(async () => {
    if (!user) return;
    const today = todayString();
    const isToday = viewedDate === today;

    const [viewedLog, foods, favs, todayLog] = await Promise.all([
      getDailyLog(user.uid, viewedDate),
      getFoods(user.uid),
      getFavorites(user.uid),
      isToday ? Promise.resolve(null) : getDailyLog(user.uid, today),
    ]);

    setViewedLog(viewedLog);
    setTodayLog(isToday ? viewedLog : todayLog!);
    setFoods(foods);
    setFavorites(favs);
  }, [user, viewedDate, setTodayLog, setViewedLog, setFoods, setFavorites]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refresh };
}
