"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { configurePurchases, getNativePremium } from "@/lib/premium/client";

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
          setProfile(profile && nativePremium ? { ...profile, isPremium: true } : profile);
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
