import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { UserProfile, Food, MealEntry, DailyLog } from "@/types";
import { format } from "date-fns";

// ─── User ────────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as UserProfile;
}

export async function createUserProfile(
  uid: string,
  profile: Omit<UserProfile, "createdAt" | "updatedAt">
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserData(uid: string): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, "users", uid));

  const logsSnap = await getDocs(collection(db, "mealLogs", uid, "dates"));
  logsSnap.forEach((d) => batch.delete(d.ref));

  const favsSnap = await getDocs(collection(db, "favorites", uid, "foods"));
  favsSnap.forEach((d) => batch.delete(d.ref));

  await batch.commit();
}

// ─── Foods ───────────────────────────────────────────────────────────────────

export async function getFoods(uid?: string): Promise<Food[]> {
  const [defaultSnap, customSnap] = await Promise.all([
    getDocs(collection(db, "foods")),
    uid ? getDocs(collection(db, "users", uid, "customFoods")) : Promise.resolve(null),
  ]);

  // Deduplicate default foods (same name → keep default_ id)
  const seen = new Map<string, Food>();
  for (const d of defaultSnap.docs) {
    const food = { id: d.id, ...d.data() } as Food;
    if (!seen.has(food.name) || food.id.startsWith("default_")) {
      seen.set(food.name, food);
    }
  }

  const customs = customSnap
    ? customSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Food))
    : [];

  return [...Array.from(seen.values()), ...customs];
}

export async function addCustomFood(
  uid: string,
  food: Omit<Food, "id">
): Promise<string> {
  const ref = doc(collection(db, "users", uid, "customFoods"));
  await setDoc(ref, { ...food, isCustom: true, createdBy: uid });
  return ref.id;
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export async function getDailyLog(
  uid: string,
  date: string
): Promise<DailyLog> {
  const snap = await getDoc(doc(db, "mealLogs", uid, "dates", date));
  if (!snap.exists()) {
    return {
      date,
      entries: [],
      totalCalorie: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarb: 0,
    };
  }
  const data = snap.data();
  return {
    ...data,
    entries: data.entries.map((e: Record<string, unknown>) => ({
      ...e,
      loggedAt: (e.loggedAt as Timestamp).toDate(),
    })),
  } as DailyLog;
}

export async function addMealEntry(
  uid: string,
  date: string,
  entry: MealEntry
): Promise<void> {
  const ref = doc(db, "mealLogs", uid, "dates", date);
  const existing = await getDailyLog(uid, date);
  const entries = [...existing.entries, entry];
  const totals = calcTotals(entries);
  await setDoc(ref, { date, entries, ...totals });
}

export async function deleteMealEntry(
  uid: string,
  date: string,
  entryId: string
): Promise<void> {
  const existing = await getDailyLog(uid, date);
  const entries = existing.entries.filter((e) => e.id !== entryId);
  const totals = calcTotals(entries);
  await setDoc(doc(db, "mealLogs", uid, "dates", date), {
    date,
    entries,
    ...totals,
  });
}

function calcTotals(entries: MealEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      totalCalorie: acc.totalCalorie + e.calorie,
      totalProtein: acc.totalProtein + e.protein,
      totalFat: acc.totalFat + e.fat,
      totalCarb: acc.totalCarb + e.carb,
    }),
    { totalCalorie: 0, totalProtein: 0, totalFat: 0, totalCarb: 0 }
  );
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function getFavorites(uid: string): Promise<Food[]> {
  const snap = await getDocs(collection(db, "favorites", uid, "foods"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Food));
}

export async function addFavorite(uid: string, food: Food): Promise<void> {
  await setDoc(doc(db, "favorites", uid, "foods", food.id), food);
}

export async function removeFavorite(
  uid: string,
  foodId: string
): Promise<void> {
  await deleteDoc(doc(db, "favorites", uid, "foods", foodId));
}
