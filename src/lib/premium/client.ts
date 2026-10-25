// RevenueCat on the iOS app (Capacitor). On the web the SDK is never called;
// subscriptions can only be bought inside the iOS app.
import { Purchases } from "@revenuecat/purchases-capacitor";
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

// Capacitor plugin proxies answer every property, including `then`, so returning one
// from an async function makes the Promise wait on a native "then" call that never
// resolves. Always hand the plugin around wrapped in an object.
async function purchases() {
  if (!apiKey() || !(await isNativeApp())) return null;
  return { Purchases };
}

const STORE_TIMEOUT_MS = 20000;

function withTimeout<T>(p: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), STORE_TIMEOUT_MS)),
  ]);
}

// Purchase/restore can run before the background setup finished (or after it timed out),
// so make sure RevenueCat is configured for the signed-in user first.
async function readyPurchases() {
  console.log("[premium] readyPurchases: loading SDK, native =", await isNativeApp(), "key =", !!apiKey());
  const plugin = (await purchases())?.Purchases;
  console.log("[premium] readyPurchases: SDK ready =", !!plugin);
  if (!plugin) return null;
  console.log("[premium] readyPurchases: configured for", configuredForUid);
  if (!configuredForUid) {
    const { auth } = await import("@/lib/firebase/config");
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("ログインが必要です");
    await withTimeout(configurePurchases(uid), "App Storeに接続できませんでした。通信環境を確認してもう一度お試しください");
  }
  return { Purchases };
}

// Call once the Firebase user is known. Uses the Firebase uid as the
// RevenueCat app user id so the server can look the user up by uid.
export async function configurePurchases(uid: string): Promise<void> {
  if (configuredForUid === uid) return;
  const Purchases = (await purchases())?.Purchases;
  if (!Purchases) return;
  try {
    console.log("[premium] configure: start");
    await Purchases.configure({ apiKey: apiKey()!, appUserID: uid });
    console.log("[premium] configure: done");
    configuredForUid = uid;
  } catch (e) {
    console.error("[premium] RevenueCat configure failed:", e);
  }
}

// Returns null when not running in the iOS app (premium state then comes from the server/profile).
export async function getNativePremium(): Promise<boolean | null> {
  const Purchases = (await purchases())?.Purchases;
  if (!Purchases) return null;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}

export async function purchaseMonthly(): Promise<void> {
  const Purchases = (await readyPurchases())?.Purchases;
  if (!Purchases) throw new Error("購入はiOSアプリから行えます");
  console.log("[premium] purchase: fetching offerings");
  const offerings = await withTimeout(
    Purchases.getOfferings(),
    "プランを読み込めませんでした。時間をおいてもう一度お試しください"
  );
  const offering = offerings.current ?? offerings.all["default"];
  const pkg = offering?.monthly ?? offering?.availablePackages[0];
  console.log("[premium] purchase: offerings", Object.keys(offerings.all), "package", pkg?.product.identifier);
  if (!pkg) throw new Error("購入できるプランが見つかりませんでした");
  try {
    await Purchases.purchasePackage({ aPackage: pkg });
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) throw new PurchaseCancelledError();
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const Purchases = (await readyPurchases())?.Purchases;
  if (!Purchases) throw new Error("復元はiOSアプリから行えます");
  const { customerInfo } = await withTimeout(
    Purchases.restorePurchases(),
    "復元に時間がかかっています。時間をおいてもう一度お試しください"
  );
  return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
}
