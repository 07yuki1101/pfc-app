// RevenueCat on the iOS app (Capacitor). On the web nothing here loads the SDK;
// subscriptions can only be bought inside the iOS app.
import { PREMIUM_ENTITLEMENT_ID } from "./config";

export class PurchaseCancelledError extends Error {
  constructor() {
    super("購入がキャンセルされました");
  }
}

let configuredForUid: string | null = null;

export async function isNativeApp(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function apiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_REVENUECAT_IOS_API_KEY || undefined;
}

async function purchases() {
  if (!apiKey() || !(await isNativeApp())) return null;
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  return Purchases;
}

// Call once the Firebase user is known. Uses the Firebase uid as the
// RevenueCat app user id so the server can look the user up by uid.
export async function configurePurchases(uid: string): Promise<void> {
  if (configuredForUid === uid) return;
  const Purchases = await purchases();
  if (!Purchases) return;
  try {
    await Purchases.configure({ apiKey: apiKey()!, appUserID: uid });
    configuredForUid = uid;
  } catch (e) {
    console.error("[premium] RevenueCat configure failed:", e);
  }
}

// Returns null when not running in the iOS app (premium state then comes from the server/profile).
export async function getNativePremium(): Promise<boolean | null> {
  const Purchases = await purchases();
  if (!Purchases) return null;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

export async function purchaseMonthly(): Promise<void> {
  const Purchases = await purchases();
  if (!Purchases) throw new Error("購入はiOSアプリから行えます");
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current ?? offerings.all["default"];
  const pkg = offering?.monthly ?? offering?.availablePackages[0];
  if (!pkg) throw new Error("購入できるプランが見つかりませんでした");
  try {
    await Purchases.purchasePackage({ aPackage: pkg });
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) throw new PurchaseCancelledError();
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = await purchases();
  if (!Purchases) throw new Error("復元はiOSアプリから行えます");
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}
