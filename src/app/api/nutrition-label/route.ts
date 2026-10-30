import { NextResponse } from "next/server";
import { isPremiumUser } from "@/lib/premium/server";
import { PREMIUM_MONTHLY_PRICE_JPY } from "@/lib/premium/config";
import { verifyFirebaseUser } from "@/lib/firebase/verifyIdToken";
import { getUserAiUsage, updateUserLabelScanUsage } from "@/lib/firebase/firestoreRest";
import { readNutritionLabel } from "@/lib/ai/nutritionLabel";
import { FREE_LABEL_SCAN_DAILY_LIMIT, PREMIUM_LABEL_SCAN_DAILY_LIMIT } from "@/lib/ai/limits";
import { todayString } from "@/lib/utils";

// Client downsizes photos before upload, so anything larger than this is unexpected.
const MAX_IMAGE_CHARS = 4_000_000;

export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = idToken ? await verifyFirebaseUser(idToken) : null;
  const uid = user?.uid ?? null;
  if (!uid || !idToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let image: unknown;
  try {
    ({ image } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "画像が正しくありません" }, { status: 400 });
  }

  const usage = await getUserAiUsage(uid, idToken);
  const premium = await isPremiumUser(uid, usage.isPremium, user?.verifiedEmail ?? null);
  const today = todayString();
  const usedToday = usage.labelScanDate === today ? usage.labelScanToday : 0;

  if (premium && usedToday >= PREMIUM_LABEL_SCAN_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `本日の撮影読み取りの上限（${PREMIUM_LABEL_SCAN_DAILY_LIMIT}回）に達しました。明日またご利用ください` },
      { status: 429 }
    );
  }
  if (!premium && usedToday >= FREE_LABEL_SCAN_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `本日の撮影読み取りの上限（${FREE_LABEL_SCAN_DAILY_LIMIT}回）に達しました。プレミアム（月¥${PREMIUM_MONTHLY_PRICE_JPY}）なら1日${PREMIUM_LABEL_SCAN_DAILY_LIMIT}回まで使えます` },
      { status: 429 }
    );
  }

  try {
    const result = await readNutritionLabel(image);
    // Count every attempt that reached the AI, including unreadable photos.
    await updateUserLabelScanUsage(uid, idToken, {
      labelScanDate: today,
      labelScanToday: usedToday + 1,
    });
    if (!result) {
      return NextResponse.json(
        { error: "栄養成分表示が読み取れませんでした。表示部分が大きく写るように撮り直してください" },
        { status: 422 }
      );
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("Nutrition label error:", e);
    return NextResponse.json({ error: "読み取りに失敗しました" }, { status: 500 });
  }
}
