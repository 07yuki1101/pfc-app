import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { getUserAiUsage, updateUserAiUsage } from "@/lib/firebase/firestoreRest";
import { buildConsultationPrompt } from "@/lib/ai/prompt";
import { generateConsultation } from "@/lib/ai/provider";
import { CONSULTATION_OPTIONS } from "@/lib/ai/consultationOptions";
import { FREE_DAILY_LIMIT } from "@/lib/ai/limits";
import { ConsultationRequestPayload } from "@/lib/ai/types";
import { todayString } from "@/lib/utils";

export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const uid = idToken ? await verifyFirebaseIdToken(idToken) : null;
  if (!uid || !idToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: ConsultationRequestPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (!CONSULTATION_OPTIONS.some((o) => o.id === payload.consultationType)) {
    return NextResponse.json({ error: "invalid consultationType" }, { status: 400 });
  }

  const usage = await getUserAiUsage(uid, idToken);
  const today = todayString();
  const usedToday = usage.aiUsageDate === today ? usage.aiUsageToday : 0;

  if (!usage.isPremium && usedToday >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `本日の利用上限（${FREE_DAILY_LIMIT}回）に達しました。また明日お試しください` },
      { status: 429 }
    );
  }

  try {
    const prompt = buildConsultationPrompt(payload);
    const result = await generateConsultation(prompt);
    if (!usage.isPremium) {
      await updateUserAiUsage(uid, idToken, {
        aiUsageDate: today,
        aiUsageToday: usedToday + 1,
      });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("AI consult error:", e);
    return NextResponse.json(
      { error: "AIアドバイスの取得に失敗しました" },
      { status: 500 }
    );
  }
}
