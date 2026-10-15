"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/config";
import type { NutritionLabelResult } from "@/lib/ai/nutritionLabel";

// Phone photos are several MB; shrink so the upload is fast and small text stays legible.
const MAX_EDGE = 1600;

async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function useNutritionLabelScan() {
  const [scanning, setScanning] = useState(false);

  async function scan(file: File): Promise<NutritionLabelResult> {
    setScanning(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("ログインが必要です");

      const image = await fileToResizedDataUrl(file);
      const res = await fetch("/api/nutrition-label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "読み取りに失敗しました");
      return data as NutritionLabelResult;
    } finally {
      setScanning(false);
    }
  }

  return { scan, scanning };
}
