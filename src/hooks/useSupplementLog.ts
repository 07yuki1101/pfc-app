"use client";

import { useEffect, useCallback, useRef } from "react";
import { getSupplements, getSupplementLog } from "@/lib/firebase/firestore";
import { useSupplementStore } from "@/store/supplementStore";
import { useAuthStore } from "@/store/authStore";
import { todayString } from "@/lib/utils";

export function useSupplementLog() {
  const { user } = useAuthStore();
  const { setSupplements, setTodayLog } = useSupplementStore();
  const currentDateRef = useRef(todayString());

  const refresh = useCallback(async () => {
    if (!user) return;
    currentDateRef.current = todayString();
    const [supplements, log] = await Promise.all([
      getSupplements(user.uid),
      getSupplementLog(user.uid, currentDateRef.current),
    ]);
    setSupplements(supplements);
    setTodayLog(log);
  }, [user, setSupplements, setTodayLog]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reset checked state at midnight even if the app is left open overnight.
  useEffect(() => {
    function checkDateRollover() {
      if (todayString() !== currentDateRef.current) refresh();
    }
    const interval = setInterval(checkDateRollover, 60_000);
    document.addEventListener("visibilitychange", checkDateRollover);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", checkDateRollover);
    };
  }, [refresh]);

  return { refresh };
}
