// Lightweight server-side ID token check via the Identity Toolkit REST API,
// so we don't need the firebase-admin SDK / a service account just to gate
// one API route.
export interface VerifiedUser {
  uid: string;
  // Only set when the sign-in provider verified it (Google/Apple), so it can be trusted for allowlists
  verifiedEmail: string | null;
}

export async function verifyFirebaseUser(idToken: string): Promise<VerifiedUser | null> {
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
  const user = data.users?.[0];
  if (!user?.localId) return null;
  return {
    uid: user.localId,
    verifiedEmail: user.emailVerified && user.email ? String(user.email).toLowerCase() : null,
  };
}

export async function verifyFirebaseIdToken(idToken: string): Promise<string | null> {
  return (await verifyFirebaseUser(idToken))?.uid ?? null;
}
