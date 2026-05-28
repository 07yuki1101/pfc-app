import { setDoc, getDoc, doc } from "firebase/firestore";
import { db } from "./firebase/config";
import { DEFAULT_FOODS } from "@/constants/foods";

export async function seedFoods(): Promise<void> {
  // Skip if already seeded (check the first deterministic doc)
  const sentinel = await getDoc(doc(db, "foods", "default_0"));
  if (sentinel.exists()) return;

  await Promise.all(
    DEFAULT_FOODS.map((food, i) =>
      setDoc(doc(db, "foods", `default_${i}`), food)
    )
  );
}
