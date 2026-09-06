import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/verifyIdToken";
import { buildConsultationPrompt } from "@/lib/ai/prompt";
import { generateConsultation } from "@/lib/ai/provider";
import { CONSULTATION_OPTIONS } from "@/lib/ai/consultationOptions";
import { ConsultationRequestPayload } from "@/lib/ai/types";

export async function POST(req: Request) {
  const idToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const uid = idToken ? await verifyFirebaseIdToken(idToken) : null;
  if (!uid) {
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

  try {
    const prompt = buildConsultationPrompt(payload);
    const result = await generateConsultation(prompt);
    return NextResponse.json(result);
  } catch (e) {
    console.error("AI consult error:", e);
    return NextResponse.json(
      { error: "AIアドバイスの取得に失敗しました" },
      { status: 500 }
    );
  }
}
