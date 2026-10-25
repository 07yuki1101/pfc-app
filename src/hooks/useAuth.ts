"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { configurePurchases, getNativePremium } from "@/lib/premium/client";
import { isOwnerEmail } from "@/lib/premium/config";

const NATIVE_PREMIUM_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

async function syncNativePremium(uid: string) {
  try {
    await withTimeout(configurePurchases(uid), NATIVE_PREMIUM_TIMEOUT_MS);
    const premium = await withTimeout(getNativePremium(), NATIVE_PREMIUM_TIMEOUT_MS);
    if (!premium) return;
    const { profile, setProfile } = useAuthStore.getState();
    if (profile && profile.uid === uid && !profile.isPremium) setProfile({ ...profile, isPremium: true });
  } catch (e) {
    console.error("[Auth] native premium check failed:", e);
  }
}

export function useAuthListener() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[Auth] state changed:", user?.uid ?? "null");
      setUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          console.log("[Auth] profile:", profile ? "found" : "not found");
          const ownerPremium = user.emailVerified && isOwnerEmail(user.email);
          setProfile(profile && ownerPremium ? { ...profile, isPremium: true } : profile);
          // In the iOS app, the App Store subscription decides premium. Check it in the
          // background so a slow or failing store call never blocks the app from opening.
          if (profile) syncNativePremium(user.uid);
        } catch (e) {
          console.error("[Auth] profile fetch error:", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setProfile, setLoading]);
}
