"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { signOutUser, deleteAccount } from "@/lib/firebase/auth";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/config";
import { calcPFCTarget, ACTIVITY_OPTIONS, PACE_OPTIONS } from "@/lib/pfc";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import Link from "next/link";
import { LogOut, Trash2, ChevronRight, Shield, FileText, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { ActivityLevel, Gender, Goal, Pace } from "@/types";
import { FREE_DAILY_LIMIT, FREE_LABEL_SCAN_DAILY_LIMIT } from "@/lib/ai/limits";
import { PREMIUM_MONTHLY_PRICE_JPY } from "@/lib/premium/config";
import { isNativeApp, purchaseMonthly, restorePurchases, PurchaseCancelledError } from "@/lib/premium/client";

export default function SettingsPage() {
  const router = useRouter();
  const { profile, user, setProfile } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Body metrics edit state
  const [showBodyEdit, setShowBodyEdit] = useState(false);
  const [bodyForm, setBodyForm] = useState({
    gender: (profile?.gender ?? "male") as Gender,
    age: String(profile?.age ?? ""),
    height: String(profile?.height ?? ""),
    weight: String(profile?.weight ?? ""),
    targetWeight: String(profile?.targetWeight ?? ""),
    goal: (profile?.goal ?? "maintain") as Goal,
    activityLevel: (profile?.activityLevel ?? "moderate") as ActivityLevel,
    pace: (profile?.pace ?? "normal") as Pace,
    bodyFat: profile?.bodyFat != null ? String(profile.bodyFat) : "",
  });
  const [savingBody, setSavingBody] = useState(false);

  // PFC override edit state
  const [showPFCEdit, setShowPFCEdit] = useState(false);
  const [pfcForm, setPfcForm] = useState({
    targetCalories: String(profile?.targetCalories ?? ""),
    targetProtein: String(profile?.targetProtein ?? ""),
    targetFat: String(profile?.targetFat ?? ""),
    targetCarb: String(profile?.targetCarb ?? ""),
  });
  const [savingPFC, setSavingPFC] = useState(false);

  // AI unlock code
  const [unlockCode, setUnlockCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [showUnlockCode, setShowUnlockCode] = useState(false);

  // Subscription
  const [native, setNative] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    isNativeApp().then(setNative);
  }, []);

  async function handleSubscribe() {
    setPurchasing(true);
    try {
      await purchaseMonthly();
      setProfile({ ...profile!, isPremium: true });
      toast.success("プレミアムに登録しました！");
    } catch (e) {
      if (!(e instanceof PurchaseCancelledError)) {
        toast.error(e instanceof Error ? e.message : "購入に失敗しました");
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setPurchasing(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setProfile({ ...profile!, isPremium: true });
        toast.success("購入を復元しました");
      } else {
        toast.error("復元できる購入が見つかりませんでした");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "復元に失敗しました");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    router.replace("/login");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("アカウントを削除しました");
      router.replace("/login");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "エラーが発生しました";
      if (msg.includes("requires-recent-login")) {
        toast.error("セキュリティのため、一度ログアウトして再ログインしてから削除してください");
      } else {
        toast.error(msg);
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSaveBody() {
    if (!user || !profile) return;
    const age = parseInt(bodyForm.age);
    const height = parseFloat(bodyForm.height);
    const weight = parseFloat(bodyForm.weight);
    const targetWeight = parseFloat(bodyForm.targetWeight);
    if (!age || !height || !weight || !targetWeight) {
      toast.error("すべての項目を入力してください");
      return;
    }
    const bodyFat = bodyForm.bodyFat.trim() ? parseFloat(bodyForm.bodyFat) : undefined;
    if (bodyFat !== undefined && (isNaN(bodyFat) || bodyFat < 3 || bodyFat > 60)) {
      toast.error("体脂肪率は3〜60の数値で入力してください");
      return;
    }
    setSavingBody(true);
    try {
      const pfc = calcPFCTarget({
        gender: bodyForm.gender, age, height, weight, targetWeight, goal: bodyForm.goal,
        activityLevel: bodyForm.activityLevel, pace: bodyForm.pace, bodyFat,
      });
      const updates = {
        gender: bodyForm.gender,
        age,
        height,
        weight,
        targetWeight,
        goal: bodyForm.goal,
        activityLevel: bodyForm.activityLevel,
        pace: bodyForm.pace,
        bodyFat: bodyFat ?? null,
        targetCalories: pfc.calories,
        targetProtein: pfc.protein,
        targetFat: pfc.fat,
        targetCarb: pfc.carb,
      };
      await updateUserProfile(user.uid, updates);
      setProfile({ ...profile, ...updates });
      setPfcForm({
        targetCalories: String(pfc.calories),
        targetProtein: String(pfc.protein),
        targetFat: String(pfc.fat),
        targetCarb: String(pfc.carb),
      });
      toast.success("ボディ情報を更新しました");
      setShowBodyEdit(false);
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSavingBody(false);
    }
  }

  async function handleSavePFC() {
    if (!user || !profile) return;
    const targetCalories = parseInt(pfcForm.targetCalories);
    const targetProtein = parseInt(pfcForm.targetProtein);
    const targetFat = parseInt(pfcForm.targetFat);
    const targetCarb = parseInt(pfcForm.targetCarb);
    if (!targetCalories || !targetProtein || !targetFat || !targetCarb) {
      toast.error("すべての項目を入力してください");
      return;
    }
    setSavingPFC(true);
    try {
      const updates = { targetCalories, targetProtein, targetFat, targetCarb };
      await updateUserProfile(user.uid, updates);
      setProfile({ ...profile, ...updates });
      toast.success("PFC目標を更新しました");
      setShowPFCEdit(false);
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSavingPFC(false);
    }
  }

  async function handleUnlock() {
    if (!unlockCode.trim()) return;
    setUnlocking(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/ai-consult/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code: unlockCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "解除に失敗しました");
      setProfile({ ...profile!, isPremium: true });
      setUnlockCode("");
      toast.success("プレミアムを有効にしました");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "解除に失敗しました");
    } finally {
      setUnlocking(false);
    }
  }

  if (!profile) return null;

  const goalLabels: Record<Goal, string> = { cut: "減量", bulk: "増量", maintain: "維持" };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-6">
          <h1 className="text-2xl font-bold text-zinc-100">設定</h1>
        </div>

        {/* Profile */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-lg">
                  {profile.displayName?.[0] ?? "U"}
                </span>
              </div>
            )}
            <div>
              <p className="text-zinc-100 font-semibold">{profile.displayName}</p>
              <p className="text-zinc-500 text-sm">{profile.email}</p>
            </div>
          </div>
        </Card>

        {/* Body Metrics Edit */}
        <Card className="mb-4">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowBodyEdit((v) => !v)}
          >
            <div>
              <h2 className="text-sm font-medium text-zinc-300 text-left">ボディ情報</h2>
              <p className="text-xs text-zinc-500 mt-0.5 text-left">
                {profile.weight}kg → {profile.targetWeight}kg · {goalLabels[profile.goal]}
              </p>
            </div>
            {showBodyEdit ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
          </button>

          {showBodyEdit && (
            <div className="mt-4 flex flex-col gap-3">
              {/* Gender */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">性別</label>
                <div className="flex gap-2">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setBodyForm((f) => ({ ...f, gender: g }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${bodyForm.gender === g ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {g === "male" ? "男性" : "女性"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age / Height / Weight / TargetWeight */}
              {[
                { key: "age", label: "年齢", unit: "歳", type: "number" },
                { key: "height", label: "身長", unit: "cm", type: "number" },
                { key: "weight", label: "現在の体重", unit: "kg", type: "number" },
                { key: "targetWeight", label: "目標体重", unit: "kg", type: "number" },
                { key: "bodyFat", label: "体脂肪率（任意・分かれば）", unit: "%", type: "number" },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
                  <div className="flex items-center bg-zinc-800 rounded-xl px-3">
                    <input
                      type="number"
                      value={bodyForm[key as keyof typeof bodyForm]}
                      onChange={(e) => setBodyForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="flex-1 bg-transparent py-2.5 text-zinc-100 text-sm outline-none"
                    />
                    <span className="text-zinc-500 text-sm">{unit}</span>
                  </div>
                </div>
              ))}

              {/* Goal */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">目標</label>
                <div className="flex gap-2">
                  {(["cut", "maintain", "bulk"] as Goal[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setBodyForm((f) => ({ ...f, goal: g }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${bodyForm.goal === g ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {goalLabels[g]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity level */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">ふだんの活動量</label>
                <div className="flex flex-col gap-1.5">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBodyForm((f) => ({ ...f, activityLevel: opt.value }))}
                      className={`text-left px-3 py-2 rounded-xl transition-colors ${bodyForm.activityLevel === opt.value ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className={`text-xs ml-2 ${bodyForm.activityLevel === opt.value ? "text-emerald-50" : "text-zinc-500"}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              {bodyForm.goal !== "maintain" && (
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">{bodyForm.goal === "cut" ? "減量" : "増量"}のペース</label>
                  <div className="flex gap-2">
                    {PACE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBodyForm((f) => ({ ...f, pace: opt.value }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${bodyForm.pace === opt.value ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const age = parseInt(bodyForm.age), height = parseFloat(bodyForm.height), weight = parseFloat(bodyForm.weight);
                if (!age || !height || !weight) return null;
                const bf = bodyForm.bodyFat.trim() ? parseFloat(bodyForm.bodyFat) : undefined;
                const p = calcPFCTarget({
                  gender: bodyForm.gender, age, height, weight, targetWeight: parseFloat(bodyForm.targetWeight) || weight,
                  goal: bodyForm.goal, activityLevel: bodyForm.activityLevel, pace: bodyForm.pace, bodyFat: bf,
                });
                return (
                  <div className="bg-zinc-800/60 rounded-xl px-3 py-2.5 text-xs text-zinc-400 leading-relaxed">
                    <p>基礎代謝 {p.bmr}kcal ・ 1日の消費 {p.tdee}kcal{p.usedBodyFat ? "（体脂肪率から計算）" : ""}</p>
                    <p className="text-zinc-200 mt-1">
                      目標 {p.calories}kcal ・ P{p.protein}g F{p.fat}g C{p.carb}g
                    </p>
                    {p.weeklyChangeKg !== 0 && (
                      <p className="mt-1">ペースの目安：週 {p.weeklyChangeKg > 0 ? "+" : ""}{p.weeklyChangeKg}kg</p>
                    )}
                  </div>
                );
              })()}

              <Button onClick={handleSaveBody} disabled={savingBody} className="w-full mt-1">
                {savingBody ? "保存中..." : "保存してPFC再計算"}
              </Button>
            </div>
          )}
        </Card>

        {/* PFC Target Edit */}
        <Card className="mb-4">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowPFCEdit((v) => !v)}
          >
            <div>
              <h2 className="text-sm font-medium text-zinc-300 text-left">PFC目標</h2>
              <p className="text-xs text-zinc-500 mt-0.5 text-left">
                {profile.targetCalories}kcal · P{profile.targetProtein}g · F{profile.targetFat}g · C{profile.targetCarb}g
              </p>
            </div>
            {showPFCEdit ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
          </button>

          {showPFCEdit && (
            <div className="mt-4 flex flex-col gap-3">
              {[
                { key: "targetCalories", label: "カロリー", unit: "kcal", color: "text-emerald-400" },
                { key: "targetProtein", label: "タンパク質", unit: "g", color: "text-blue-400" },
                { key: "targetFat", label: "脂質", unit: "g", color: "text-yellow-400" },
                { key: "targetCarb", label: "炭水化物", unit: "g", color: "text-orange-400" },
              ].map(({ key, label, unit, color }) => (
                <div key={key}>
                  <label className={`text-xs mb-1 block ${color}`}>{label}</label>
                  <div className="flex items-center bg-zinc-800 rounded-xl px-3">
                    <input
                      type="number"
                      value={pfcForm[key as keyof typeof pfcForm]}
                      onChange={(e) => setPfcForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="flex-1 bg-transparent py-2.5 text-zinc-100 text-sm outline-none"
                    />
                    <span className="text-zinc-500 text-sm">{unit}</span>
                  </div>
                </div>
              ))}

              <Button onClick={handleSavePFC} disabled={savingPFC} className="w-full mt-1">
                {savingPFC ? "保存中..." : "保存"}
              </Button>
            </div>
          )}
        </Card>

        {/* Premium */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-zinc-300">プレミアム</h2>
            {profile.isPremium && (
              <span className="ml-auto text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                登録中
              </span>
            )}
          </div>

          <table className="w-full text-xs mt-3 mb-4">
            <thead>
              <tr className="text-zinc-500">
                <th className="text-left font-normal pb-2" />
                <th className="font-normal pb-2 w-20">無料</th>
                <th className="font-medium pb-2 w-24 text-emerald-400">プレミアム</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-t border-zinc-800">
                <td className="py-2">AIに相談</td>
                <td className="text-center text-zinc-500">1日{FREE_DAILY_LIMIT}回</td>
                <td className="text-center text-emerald-400 font-medium">無制限</td>
              </tr>
              <tr className="border-t border-zinc-800">
                <td className="py-2">成分表示の撮影読み取り</td>
                <td className="text-center text-zinc-500">1日{FREE_LABEL_SCAN_DAILY_LIMIT}回</td>
                <td className="text-center text-emerald-400 font-medium">無制限</td>
              </tr>
              <tr className="border-t border-zinc-800">
                <td className="py-2">食事記録・検索・PFC管理</td>
                <td className="text-center text-zinc-500">○</td>
                <td className="text-center text-emerald-400 font-medium">○</td>
              </tr>
            </tbody>
          </table>

          {profile.isPremium ? (
            <p className="text-xs text-emerald-400">AI相談と撮影読み取りを無制限で利用できます</p>
          ) : native ? (
            <>
              <Button onClick={handleSubscribe} disabled={purchasing} className="w-full">
                {purchasing ? "処理中..." : `月額¥${PREMIUM_MONTHLY_PRICE_JPY}で登録する`}
              </Button>
              <p className="text-[11px] leading-relaxed text-zinc-500 mt-3">
                1ヶ月ごとの自動更新です。更新日の24時間前までに解約しない限り、同じ料金で自動更新されます。
                解約はiPhoneの「設定」→ Apple ID →「サブスクリプション」から行えます。
                <Link href="/legal/terms" className="underline">利用規約</Link>・
                <Link href="/legal/privacy" className="underline">プライバシーポリシー</Link>
              </p>
              <button
                onClick={handleRestore}
                disabled={purchasing}
                className="w-full text-xs text-zinc-500 mt-3 py-1"
              >
                購入を復元する
              </button>
            </>
          ) : (
            <p className="text-xs text-zinc-500">プレミアムへの登録はiPhoneアプリから行えます</p>
          )}

          {!profile.isPremium && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              {showUnlockCode ? (
                <div className="flex gap-2">
                  <Input
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    placeholder="アンロックコード"
                    className="py-2.5"
                  />
                  <Button size="sm" onClick={handleUnlock} disabled={unlocking || !unlockCode.trim()}>
                    {unlocking ? "確認中..." : "解除"}
                  </Button>
                </div>
              ) : (
                <button onClick={() => setShowUnlockCode(true)} className="text-xs text-zinc-600">
                  コードをお持ちの方
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Menu Items */}
        <Card className="mb-4">
          <div className="flex flex-col">
            <Link
              href="/legal/terms"
              className="flex items-center justify-between py-3 border-b border-zinc-800 hover:text-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3 text-zinc-300">
                <FileText size={18} />
                <span>利用規約</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </Link>

            <Link
              href="/legal/privacy"
              className="flex items-center justify-between py-3 hover:text-emerald-400 transition-colors"
            >
              <div className="flex items-center gap-3 text-zinc-300">
                <Shield size={18} />
                <span>プライバシーポリシー</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </Link>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-2" />
            ログアウト
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-400 hover:text-red-300"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} className="mr-2" />
              アカウントを削除
            </Button>
          ) : (
            <Card className="border-red-800 bg-red-950/30">
              <p className="text-red-400 text-sm mb-4 text-center font-medium">
                本当にアカウントを削除しますか？
                <br />
                <span className="text-red-500/70 text-xs">この操作は取り消せません。全データが削除されます。</span>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "削除中..." : "削除する"}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">PFC Log v0.1.0</p>
      </div>
      <BottomNav />
    </div>
  );
}
