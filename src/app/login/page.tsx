"use client";

import { useState } from "react";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase/auth";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  async function handleGoogle() {
    setLoading("google");
    try {
      const user = await signInWithGoogle();
      console.log("[Login] Google sign in success:", user.uid);
    } catch (e) {
      console.error("[Login] Google sign in error:", e);
      toast.error("Googleログインに失敗しました");
    } finally {
      setLoading(null);
    }
  }

  async function handleApple() {
    setLoading("apple");
    try {
      await signInWithApple();
    } catch {
      toast.error("Appleログインに失敗しました");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/30">
          <span className="text-4xl">💪</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">PFC Manager</h1>
        <p className="text-zinc-500 mt-2 text-sm">ボディメイクのための食事管理</p>
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Button
          onClick={handleApple}
          disabled={loading !== null}
          className="w-full bg-white hover:bg-zinc-100 text-zinc-900 py-4 text-base"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.15.77 1.2-.24 2.35-.93 3.64-.84 1.54.12 2.7.72 3.47 1.84-3.16 1.9-2.4 5.76.38 6.96-.57 1.47-1.32 2.94-2.64 4.15zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {loading === "apple" ? "リダイレクト中..." : "Appleでサインイン"}
        </Button>

        <Button
          onClick={handleGoogle}
          disabled={loading !== null}
          variant="secondary"
          className="w-full py-4 text-base"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading === "google" ? "リダイレクト中..." : "Googleでサインイン"}
        </Button>
      </div>

      <p className="mt-8 text-xs text-zinc-600 text-center px-4">
        ログインすることで
        <Link href="/legal/terms" className="text-emerald-500 underline mx-1">利用規約</Link>
        および
        <Link href="/legal/privacy" className="text-emerald-500 underline mx-1">プライバシーポリシー</Link>
        に同意したものとみなします
      </p>
    </main>
  );
}
