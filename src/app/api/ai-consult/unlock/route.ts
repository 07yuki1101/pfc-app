import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { setUserPremium } from "@/lib/firebase/firestoreRest";
import { grantPromotionalPremium, isRevenueCatConfigured } from "@/lib/premium/server";

export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const uid = idToken ? await verifyFirebaseIdToken(idToken) : null;
  if (!uid || !idToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const unlockCode = process.env.AI_UNLOCK_CODE;
  if (!unlockCode) {
    return NextResponse.json({ error: "unlock code is not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || code !== unlockCode) {
    return NextResponse.json({ error: "コードが正しくありません" }, { status: 400 });
  }

  if (isRevenueCatConfigured()) {
    try {
      await grantPromotionalPremium(uid);
    } catch (e) {
      console.error("Unlock grant error:", e);
      return NextResponse.json({ error: "解除に失敗しました" }, { status: 500 });
    }
  }
  // Keeps the client-side profile flag in sync (also the source of truth before RevenueCat is set up)
  await setUserPremium(uid, idToken, true);
  return NextResponse.json({ ok: true });
}
