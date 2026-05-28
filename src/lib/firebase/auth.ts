import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  deleteUser,
  User,
} from "firebase/auth";
import { auth } from "./config";
import { deleteUserData } from "./firestore";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithApple(): Promise<User> {
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("ログインしていません");

  await deleteUserData(user.uid);
  await deleteUser(user);
}
