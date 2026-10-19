"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { configurePurchases, getNativePremium } from "@/lib/premium/client";
import { isOwnerEmail } from "@/lib/premium/config";

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
          // In the iOS app, the App Store subscription decides premium
          await configurePurchases(user.uid);
          const nativePremium = await getNativePremium().catch(() => null);
          const ownerPremium = user.emailVerified && isOwnerEmail(user.email);
          setProfile(profile && (nativePremium || ownerPremium) ? { ...profile, isPremium: true } : profile);
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
