// Lightweight server-side ID token check via the Identity Toolkit REST API,
// so we don't need the firebase-admin SDK / a service account just to gate
// one API route.
export async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.users?.[0]?.localId ?? null;
}
