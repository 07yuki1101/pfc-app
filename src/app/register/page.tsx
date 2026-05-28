"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { createUserProfile } from "@/lib/firebase/firestore";
import { calcPFCTarget } from "@/lib/pfc";
import { Gender, Goal } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { seedFoods } from "@/lib/seedFoods";

const schema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(10).max(100),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(20).max(300),
  targetWeight: z.coerce.number().min(20).max(300),
  goal: z.enum(["cut", "bulk", "maintain"]),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["基本情報", "目標設定"] as const;

export default function RegisterPage() {
  const { user, setProfile } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "male", goal: "cut" },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      const pfc = calcPFCTarget(data);
      const profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        gender: data.gender as Gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        goal: data.goal as Goal,
        targetCalories: pfc.calories,
        targetProtein: pfc.protein,
        targetFat: pfc.fat,
        targetCarb: pfc.carb,
        isPremium: false,
        aiUsageToday: 0,
        aiUsageDate: "",
      };
      await createUserProfile(user.uid, profile);
      setProfile({ ...profile, createdAt: new Date(), updatedAt: new Date() });
      seedFoods().catch(() => {});
      toast.success("プロフィールを設定しました！");
      router.replace("/home");
    } catch (e) {
      console.error(e);
      toast.error("プロフィールの保存に失敗しました。Firestoreのルールを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <p className="text-emerald-400 text-sm font-medium mb-1">
            STEP {step + 1} / {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-zinc-100">{STEPS[step]}</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {step === 0 && (
            <>
              <div>
                <label className="text-sm text-zinc-400 font-medium mb-2 block">性別</label>
                <div className="flex gap-3">
                  {[{ value: "male", label: "男性" }, { value: "female", label: "女性" }].map((opt) => (
                    <label key={opt.value} className="flex-1">
                      <input type="radio" value={opt.value} {...register("gender")} className="sr-only" />
                      <div className={`text-center py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("gender") === opt.value
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 text-zinc-400"
                      }`}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="年齢"
                type="number"
                placeholder="25"
                error={errors.age?.message}
                {...register("age")}
              />
              <Input
                label="身長 (cm)"
                type="number"
                placeholder="170"
                error={errors.height?.message}
                {...register("height")}
              />
              <Input
                label="体重 (kg)"
                type="number"
                step="0.1"
                placeholder="70"
                error={errors.weight?.message}
                {...register("weight")}
              />

              <Button
                type="button"
                size="lg"
                className="w-full mt-2"
                onClick={() => setStep(1)}
              >
                次へ
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <Input
                label="目標体重 (kg)"
                type="number"
                step="0.1"
                placeholder="65"
                error={errors.targetWeight?.message}
                {...register("targetWeight")}
              />

              <div>
                <label className="text-sm text-zinc-400 font-medium mb-2 block">目的</label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "cut", label: "減量", desc: "体脂肪を落とす" },
                    { value: "bulk", label: "増量", desc: "筋肉をつける" },
                    { value: "maintain", label: "維持", desc: "現状を保つ" },
                  ].map((opt) => (
                    <label key={opt.value}>
                      <input type="radio" value={opt.value} {...register("goal")} className="sr-only" />
                      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("goal") === opt.value
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-zinc-700"
                      }`}>
                        <span className={`font-semibold ${watch("goal") === opt.value ? "text-emerald-400" : "text-zinc-200"}`}>
                          {opt.label}
                        </span>
                        <span className="text-zinc-500 text-sm">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(0)}>
                  戻る
                </Button>
                <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                  {loading ? "設定中..." : "はじめる"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
