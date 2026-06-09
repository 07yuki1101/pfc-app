import { setDoc, getDocs, doc, collection } from "firebase/firestore";
import { db } from "./firebase/config";
import { DEFAULT_FOODS } from "@/constants/foods";

export async function seedFoods(): Promise<void> {
  const snap = await getDocs(collection(db, "foods"));
  const existingNames = new Set(snap.docs.map((d) => d.data().name as string));

  const missing = DEFAULT_FOODS.filter((food) => !existingNames.has(food.name));
  if (missing.length === 0) return;

  const allNames = DEFAULT_FOODS.map((f) => f.name);
  await Promise.all(
    missing.map((food) => {
      const i = allNames.indexOf(food.name);
      return setDoc(doc(db, "foods", `default_${i}`), food);
    })
  );
}
