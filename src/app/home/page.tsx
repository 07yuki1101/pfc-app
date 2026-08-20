"use client";

import { useAuthStore } from "@/store/authStore";
import { useMealStore } from "@/store/mealStore";
import { useMealLog } from "@/hooks/useMealLog";
import { calcRemaining } from "@/lib/pfc";
import { getSuggestions } from "@/lib/suggestion";
import { PFCBars } from "@/components/ui/PFCBar";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { deleteMealEntry } from "@/lib/firebase/firestore";
import { todayString } from "@/lib/utils";
import { MealEntry } from "@/types";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function HomePage() {
  const { profile } = useAuthStore();
  const { todayLog, foods } = useMealStore();
  const { refresh } = useMealLog();

  if (!profile) return null;

  const consumed = todayLog ?? {
    totalCalorie: 0, totalProtein: 0, totalFat: 0, totalCarb: 0, entries: [], date: todayString(),
  };

  const target = {
    calories: profile.targetCalories,
    protein: profile.targetProtein,
    fat: profile.targetFat,
    carb: profile.targetCarb,
  };

  const remaining = calcRemaining(target, consumed);
  const suggestions = getSuggestions(remaining, foods);

  const caloriePercent = Math.min(
    Math.round((consumed.totalCalorie / target.calories) * 100),
    100
  );

  const today = format(new Date(), "M月d日 (EEE)", { locale: ja });

  async function handleDeleteEntry(entry: MealEntry) {
    try {
      await deleteMealEntry(profile!.uid, todayString(), entry.id);
      await refresh();
      toast.success("削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-6">
          <p className="text-zinc-500 text-sm">{today}</p>
        </div>

        {/* Calorie Ring */}
        <Card className="mb-4">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="#10b981" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - caloriePercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-zinc-100">{caloriePercent}%</span>
                <span className="text-xs text-zinc-500">摂取</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">今日のカロリー</span>
              </div>
              <div className="text-3xl font-bold text-zinc-100">
                {Math.round(consumed.totalCalorie)}
                <span className="text-base text-zinc-500 font-normal ml-1">kcal</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1">
                目標 {target.calories} kcal
                <span className={`ml-2 font-medium ${remaining.calories >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ({remaining.calories >= 0 ? `残り${Math.round(remaining.calories)}` : `+${Math.abs(Math.round(remaining.calories))}`} kcal)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <PFCBars consumed={consumed} target={target} />
          </div>
        </Card>

        {/* Suggestions */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-zinc-100">次に食べるべきもの</h2>
            <span className="text-xs text-zinc-600">固定ロジック</span>
          </div>
          {suggestions.length === 0 ? (
            <p className="text-zinc-500 text-sm">目標達成済み！🎉 素晴らしいです！</p>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.map(({ food, reason, amount }) => (
                <div key={food.id} className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-zinc-100 font-medium text-sm">{food.name}</p>
                    <p className="text-zinc-500 text-xs">{reason} · {amount}{food.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm font-semibold">
                      P {food.protein}g
                    </p>
                    <p className="text-zinc-500 text-xs">{food.calorie}kcal</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Meals */}
        <Card>
          <h2 className="font-bold text-zinc-100 mb-3">今日の食事</h2>
          {consumed.entries.length === 0 ? (
            <p className="text-zinc-500 text-sm">まだ記録がありません</p>
          ) : (
            <div className="flex flex-col gap-4">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => {
                const typeEntries = consumed.entries.filter((e) => e.mealType === type);
                if (typeEntries.length === 0) return null;
                const typeLabel: Record<string, string> = {
                  breakfast: "🌅 朝食",
                  lunch: "☀️ 昼食",
                  dinner: "🌙 夕食",
                  snack: "🍎 間食",
                };
                const typeTotal = typeEntries.reduce((s, e) => s + e.calorie, 0);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-zinc-300">{typeLabel[type]}</span>
                      <span className="text-xs text-zinc-500">{Math.round(typeTotal)} kcal</span>
                    </div>
                    <div className="flex flex-col gap-0">
                      {typeEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-100 text-sm font-medium truncate">{entry.foodName}</p>
                            <p className="text-zinc-500 text-xs">
                              P{entry.protein}g · F{entry.fat}g · C{entry.carb}g
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-zinc-300 text-sm">{entry.calorie}kcal</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
