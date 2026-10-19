// Server-side source of truth for "is this user premium?".
//
// When REVENUECAT_SECRET_API_KEY is set, premium is decided only by RevenueCat
// (App Store subscriptions + promotional grants from unlock codes). The
// Firestore `isPremium` flag is client-writable under the current rules, so it
// is only used as a fallback before RevenueCat is configured.
import { PREMIUM_ENTITLEMENT_ID, isOwnerEmail } from "./config";

const RC_API = "https://api.revenuecat.com/v1";

function secretKey(): string | undefined {
  return process.env.REVENUECAT_SECRET_API_KEY || undefined;
}

export function isRevenueCatConfigured(): boolean {
  return secretKey() !== undefined;
}

export async function hasPremiumEntitlement(uid: string): Promise<boolean> {
  const res = await fetch(`${RC_API}/subscribers/${encodeURIComponent(uid)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
  const data = await res.json();
  const entitlement = data.subscriber?.entitlements?.[PREMIUM_ENTITLEMENT_ID];
  if (!entitlement) return false;
  // expires_date is null for lifetime/promotional-lifetime grants
  return entitlement.expires_date === null || new Date(entitlement.expires_date) > new Date();
}

// Used by unlock codes: grants premium without a purchase.
export async function grantPromotionalPremium(uid: string): Promise<void> {
  const res = await fetch(
    `${RC_API}/subscribers/${encodeURIComponent(uid)}/entitlements/${PREMIUM_ENTITLEMENT_ID}/promotional`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ duration: "lifetime" }),
    }
  );
  if (!res.ok) throw new Error(`RevenueCat ${res.status}`);
}

export async function isPremiumUser(
  uid: string,
  firestoreIsPremium: boolean,
  verifiedEmail: string | null
): Promise<boolean> {
  if (isOwnerEmail(verifiedEmail)) return true;
  if (!isRevenueCatConfigured()) return firestoreIsPremium;
  try {
    return await hasPremiumEntitlement(uid);
  } catch (e) {
    console.error("[premium] RevenueCat lookup failed:", e);
    return false;
  }
}
