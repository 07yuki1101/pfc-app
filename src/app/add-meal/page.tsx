"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMealStore } from "@/store/mealStore";
import { useAuthStore } from "@/store/authStore";
import { addMealEntry, addFavorite, removeFavorite, addCustomFood } from "@/lib/firebase/firestore";
import { Food, MealType } from "@/types";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { generateId, todayString } from "@/lib/utils";
import toast from "react-hot-toast";
import { Search, Star, ArrowLeft, Check, PenLine, Bookmark } from "lucide-react";

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "朝食", emoji: "🌅" },
  { value: "lunch", label: "昼食", emoji: "☀️" },
  { value: "dinner", label: "夕食", emoji: "🌙" },
  { value: "snack", label: "間食", emoji: "🍎" },
];

const emptyManual = { name: "", calorie: "", protein: "", fat: "", carb: "" };

export default function AddMealPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { foods, favorites, setFoods, setFavorites } = useMealStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [amount, setAmount] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"search" | "favorites">("search");
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState(emptyManual);
  const [saveToFavorites, setSaveToFavorites] = useState(false);

  const filteredFoods = query
    ? foods.filter((f) => f.name.includes(query))
    : foods;

  const favoriteIds = new Set(favorites.map((f) => f.id));

  function calcNutrition(food: Food, grams: number) {
    const base = food.unit === "g" || food.unit === "ml" ? 100 : (food.servingSize || 1);
    const ratio = grams / base;
    return {
      calorie: Math.round(food.calorie * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      carb: Math.round(food.carb * ratio * 10) / 10,
    };
  }

  async function handleAdd() {
    if (!selected || !profile || !amount) return;
    setLoading(true);
    try {
      const grams = parseFloat(amount);
      const nutrition = calcNutrition(selected, grams);
      await addMealEntry(profile.uid, todayString(), {
        id: generateId(),
        foodId: selected.id,
        foodName: selected.name,
        amount: grams,
        ...nutrition,
        mealType,
        loggedAt: new Date(),
      });
      toast.success("記録しました！");
      router.push("/home");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddManual() {
    if (!profile) return;
    if (!manual.name.trim()) { toast.error("食品名を入力してください"); return; }
    const calorie = parseInt(manual.calorie);
    const protein = parseFloat(manual.protein);
    const fat = parseFloat(manual.fat);
    const carb = parseFloat(manual.carb);
    if (isNaN(calorie) || isNaN(protein) || isNaN(fat) || isNaN(carb)) {
      toast.error("栄養素をすべて入力してください");
      return;
    }
    setLoading(true);
    try {
      let foodId = "manual";

      if (saveToFavorites) {
        const foodData = {
          name: manual.name.trim(),
          calorie,
          protein,
          fat,
          carb,
          unit: "食",
          servingSize: 1,
          category: "other" as const,
          isCustom: true,
          createdBy: profile.uid,
        };
        foodId = await addCustomFood(profile.uid, foodData);
        const newFood: Food = { id: foodId, ...foodData };
        await addFavorite(profile.uid, newFood);
        setFoods([...foods, newFood]);
        setFavorites([...favorites, newFood]);
      }

      await addMealEntry(profile.uid, todayString(), {
        id: generateId(),
        foodId,
        foodName: manual.name.trim(),
        amount: 1,
        calorie,
        protein,
        fat,
        carb,
        mealType,
        loggedAt: new Date(),
      });
      toast.success(saveToFavorites ? "記録してよく食べるに保存しました！" : "記録しました！");
      router.push("/home");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(food: Food) {
    if (!profile) return;
    if (favoriteIds.has(food.id)) {
      await removeFavorite(profile.uid, food.id);
      toast.success("お気に入りから削除しました");
    } else {
      await addFavorite(profile.uid, food);
      toast.success("お気に入りに追加しました");
    }
  }

  const displayList = tab === "favorites" ? favorites : filteredFoods;

  // ── Selected food detail view ──
  if (selected) {
    const grams = parseFloat(amount) || selected.servingSize;
    const nutrition = calcNutrition(selected, grams);

    return (
      <div className="min-h-screen bg-zinc-950 pb-24">
        <div className="max-w-md mx-auto px-4">
          <div className="pt-12 pb-6 flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-zinc-400">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold text-zinc-100">{selected.name}</h1>
          </div>

          <div className="flex gap-2 mb-4">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  mealType === m.value ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <Card className="mb-4">
            <Input
              label="量"
              type="number"
              step="0.1"
              placeholder={`${selected.servingSize}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-zinc-500 mt-1">単位: {selected.unit}</p>
          </Card>

          <Card className="mb-6">
            <h3 className="text-sm text-zinc-400 mb-3">栄養素プレビュー</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "カロリー", value: nutrition.calorie, unit: "kcal", color: "text-emerald-400" },
                { label: "タンパク質", value: nutrition.protein, unit: "g", color: "text-blue-400" },
                { label: "脂質", value: nutrition.fat, unit: "g", color: "text-yellow-400" },
                { label: "炭水化物", value: nutrition.carb, unit: "g", color: "text-orange-400" },
              ].map((item) => (
                <div key={item.label} className="text-center bg-zinc-800 rounded-xl p-2">
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-zinc-500">{item.unit}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Button onClick={handleAdd} disabled={loading || !amount} size="lg" className="w-full">
            <Check size={18} className="mr-2" />
            {loading ? "記録中..." : "記録する"}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Manual entry view ──
  if (showManual) {
    return (
      <div className="min-h-screen bg-zinc-950 pb-24">
        <div className="max-w-md mx-auto px-4">
          <div className="pt-12 pb-6 flex items-center gap-3">
            <button onClick={() => setShowManual(false)} className="text-zinc-400">
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold text-zinc-100">手動で入力</h1>
          </div>

          {/* Meal type */}
          <div className="flex gap-2 mb-4">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMealType(m.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  mealType === m.value ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <Card className="mb-4 flex flex-col gap-4">
            {/* Food name */}
            <div>
              <label className="text-xs text-zinc-500 block mb-1">食品名</label>
              <input
                type="text"
                placeholder="例: チョコレートケーキ"
                value={manual.name}
                onChange={(e) => setManual((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-sm placeholder-zinc-600 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Nutrition fields */}
            {[
              { key: "calorie", label: "カロリー", unit: "kcal", color: "text-emerald-400" },
              { key: "protein", label: "タンパク質", unit: "g", color: "text-blue-400" },
              { key: "fat", label: "脂質", unit: "g", color: "text-yellow-400" },
              { key: "carb", label: "炭水化物", unit: "g", color: "text-orange-400" },
            ].map(({ key, label, unit, color }) => (
              <div key={key}>
                <label className={`text-xs block mb-1 ${color}`}>{label}</label>
                <div className="flex items-center bg-zinc-800 rounded-xl px-3">
                  <input
                    type="number"
                    placeholder="0"
                    value={manual[key as keyof typeof manual]}
                    onChange={(e) => setManual((f) => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 bg-transparent py-2.5 text-zinc-100 text-sm outline-none"
                  />
                  <span className="text-zinc-500 text-sm">{unit}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Save to favorites toggle */}
          <button
            onClick={() => setSaveToFavorites((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors mb-2 ${
              saveToFavorites
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-zinc-900 border-zinc-700 text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <Bookmark size={16} className={saveToFavorites ? "fill-emerald-400" : ""} />
              よく食べるに保存する
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${saveToFavorites ? "bg-emerald-500" : "bg-zinc-700"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${saveToFavorites ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </button>

          <Button onClick={handleAddManual} disabled={loading} size="lg" className="w-full">
            <Check size={18} className="mr-2" />
            {loading ? "記録中..." : "記録する"}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Search / list view ──
  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-zinc-100">食事を記録</h1>
        </div>

        {/* Tab */}
        <div className="flex bg-zinc-900 rounded-xl p-1 mb-4">
          {[
            { id: "search", label: "🔍 検索" },
            { id: "favorites", label: "⭐ よく食べる" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "search" | "favorites")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-zinc-700 text-zinc-100" : "text-zinc-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "search" && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="食品名を検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {displayList.map((food) => (
            <div
              key={food.id}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-500/50 transition-colors"
              onClick={() => {
                setSelected(food);
                setAmount(String(food.servingSize));
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-zinc-100 font-medium truncate">{food.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  P{food.protein}g · F{food.fat}g · C{food.carb}g · {food.calorie}kcal / {food.unit === "g" || food.unit === "ml" ? `100${food.unit}` : `${food.servingSize}${food.unit}`}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(food);
                }}
                className={`shrink-0 transition-colors ${favoriteIds.has(food.id) ? "text-yellow-400" : "text-zinc-600 hover:text-zinc-400"}`}
              >
                {favoriteIds.has(food.id) ? <Star size={18} fill="currentColor" /> : <Star size={18} />}
              </button>
            </div>
          ))}

          {displayList.length === 0 && tab === "favorites" && (
            <p className="text-zinc-500 text-sm text-center py-8">お気に入りはまだありません</p>
          )}

          {displayList.length === 0 && tab === "search" && (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm mb-4">「{query}」は見つかりませんでした</p>
              <button
                onClick={() => { setManual(emptyManual); setSaveToFavorites(false); setShowManual(true); }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <PenLine size={16} />
                手動で入力する
              </button>
            </div>
          )}
        </div>

        {/* Always-visible manual entry button at bottom of search list */}
        {tab === "search" && displayList.length > 0 && (
          <button
            onClick={() => { setManual(emptyManual); setSaveToFavorites(false); setShowManual(true); }}
            className="w-full mt-4 flex items-center justify-center gap-2 border border-zinc-700 rounded-xl py-3 text-zinc-500 text-sm hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
          >
            <PenLine size={15} />
            候補にない食べ物を手動で入力
          </button>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
