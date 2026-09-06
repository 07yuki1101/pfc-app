import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { setUserPremium } from "@/lib/firebase/firestoreRest";

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

  await setUserPremium(uid, idToken, true);
  return NextResponse.json({ ok: true });
}
