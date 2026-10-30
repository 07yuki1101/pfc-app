// Minimal Firestore REST helpers for use from API routes, authenticated as
// the calling user via their Firebase ID token (so security rules apply
// exactly as they do for the client SDK — no service account needed).

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null };

function decodeValue(v: FirestoreValue | undefined): string | number | boolean | null {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("booleanValue" in v) return v.booleanValue;
  return null;
}

function encodeValue(v: string | number | boolean): FirestoreValue {
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  return { integerValue: String(v) };
}

export interface UserAiUsage {
  isPremium: boolean;
  aiUsageDate: string;
  aiUsageToday: number;
  labelScanDate: string;
  labelScanToday: number;
}

export async function getUserAiUsage(uid: string, idToken: string): Promise<UserAiUsage> {
  const res = await fetch(`${BASE_URL}/users/${uid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    return { isPremium: false, aiUsageDate: "", aiUsageToday: 0, labelScanDate: "", labelScanToday: 0 };
  }

  const data = await res.json();
  const fields = data.fields ?? {};
  return {
    isPremium: Boolean(decodeValue(fields.isPremium)),
    aiUsageDate: String(decodeValue(fields.aiUsageDate) ?? ""),
    aiUsageToday: Number(decodeValue(fields.aiUsageToday) ?? 0),
    labelScanDate: String(decodeValue(fields.labelScanDate) ?? ""),
    labelScanToday: Number(decodeValue(fields.labelScanToday) ?? 0),
  };
}

export async function updateUserAiUsage(
  uid: string,
  idToken: string,
  usage: { aiUsageDate: string; aiUsageToday: number }
): Promise<void> {
  const mask = "updateMask.fieldPaths=aiUsageDate&updateMask.fieldPaths=aiUsageToday";
  await fetch(`${BASE_URL}/users/${uid}?${mask}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      fields: {
        aiUsageDate: encodeValue(usage.aiUsageDate),
        aiUsageToday: encodeValue(usage.aiUsageToday),
      },
    }),
  });
}

export async function updateUserLabelScanUsage(
  uid: string,
  idToken: string,
  usage: { labelScanDate: string; labelScanToday: number }
): Promise<void> {
  const mask = "updateMask.fieldPaths=labelScanDate&updateMask.fieldPaths=labelScanToday";
  await fetch(`${BASE_URL}/users/${uid}?${mask}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      fields: {
        labelScanDate: encodeValue(usage.labelScanDate),
        labelScanToday: encodeValue(usage.labelScanToday),
      },
    }),
  });
}
