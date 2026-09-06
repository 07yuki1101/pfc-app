"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/authStore";
import { useMealStore } from "@/store/mealStore";
import { calcRemaining } from "@/lib/pfc";
import { todayString } from "@/lib/utils";
import { ConsultationResult, ConsultationTypeId } from "@/lib/ai/types";

export function useAIConsult() {
  const { profile } = useAuthStore();
  const { todayLog } = useMealStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function consult(consultationType: ConsultationTypeId) {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("ログインが必要です");

      const consumed = todayLog ?? {
        totalCalorie: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarb: 0,
        entries: [],
        date: todayString(),
      };
      const target = {
        calories: profile.targetCalories,
        protein: profile.targetProtein,
        fat: profile.targetFat,
        carb: profile.targetCarb,
      };
      const remaining = calcRemaining(target, consumed);

      const res = await fetch("/api/ai-consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          consultationType,
          currentPfcData: { target, remaining },
          todayMeals: consumed.entries.map((e) => ({
            foodName: e.foodName,
            mealType: e.mealType,
            calorie: e.calorie,
            protein: e.protein,
            fat: e.fat,
            carb: e.carb,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "AIアドバイスの取得に失敗しました");
      }
      const data = (await res.json()) as ConsultationResult;
      setResult(data);
    } catch (e) {
      console.error("AI consult error:", e);
      setError(e instanceof Error ? e.message : "AIアドバイスの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { loading, result, error, consult, reset };
}
