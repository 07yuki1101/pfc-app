import { setDoc, getDocs, doc, collection } from "firebase/firestore";
import { db } from "./firebase/config";
import { DEFAULT_FOODS } from "@/constants/foods";

export async function seedFoods(): Promise<void> {
  const snap = await getDocs(collection(db, "foods"));
  const existingDefaultCount = snap.docs.filter((d) => d.id.startsWith("default_")).length;
  if (existingDefaultCount >= DEFAULT_FOODS.length) return;

  await Promise.all(
    DEFAULT_FOODS.map((food, i) =>
      setDoc(doc(db, "foods", `default_${i}`), food)
    )
  );
}
