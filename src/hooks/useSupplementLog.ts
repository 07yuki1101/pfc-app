"use client";

import { useEffect, useCallback } from "react";
import { getSupplements, getSupplementLog } from "@/lib/firebase/firestore";
import { useSupplementStore } from "@/store/supplementStore";
import { useAuthStore } from "@/store/authStore";
import { todayString } from "@/lib/utils";

export function useSupplementLog() {
  const { user } = useAuthStore();
  const { setSupplements, setTodayLog } = useSupplementStore();

  const refresh = useCallback(async () => {
    if (!user) return;
    const [supplements, log] = await Promise.all([
      getSupplements(user.uid),
      getSupplementLog(user.uid, todayString()),
    ]);
    setSupplements(supplements);
    setTodayLog(log);
  }, [user, setSupplements, setTodayLog]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { refresh };
}
