"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";

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
          setProfile(profile);
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
