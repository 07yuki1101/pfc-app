import {
  signInWithPopup,
  signInWithCredential,
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

// In the iOS app (WKWebView) popups don't work, so sign in with the native
// Google/Apple SDKs and hand the credential to the web Firebase SDK.
async function isNativeApp(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { Capacitor } = await import("@capacitor/core");
  return Capacitor.isNativePlatform();
}

export async function signInWithGoogle(): Promise<User> {
  if (await isNativeApp()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error("Google Sign-In: idToken が取得できませんでした");
    const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return cred.user;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithApple(): Promise<User> {
  if (await isNativeApp()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    const result = await FirebaseAuthentication.signInWithApple({ scopes: ["email", "name"] });
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error("Apple Sign-In: idToken が取得できませんでした");
    const credential = new OAuthProvider("apple.com").credential({
      idToken,
      rawNonce: result.credential?.nonce,
    });
    const cred = await signInWithCredential(auth, credential);
    return cred.user;
  }
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  // Also clear the native Google/Apple session, otherwise the next sign-in skips account selection
  if (await isNativeApp()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  await signOut(auth);
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("ログインしていません");

  await deleteUserData(user.uid);
  await deleteUser(user);
}
