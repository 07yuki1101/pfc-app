"use client";

import { useAuthListener } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/", "/login", "/register", "/legal/terms", "/legal/privacy"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener();
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // trailingSlash: true の影響で末尾スラッシュがつく場合があるため正規化
    const path = pathname.replace(/\/$/, "") || "/";
    const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && !profile && path !== "/register") {
      router.replace("/register");
    } else if (user && profile && (path === "/login" || path === "/" || path === "/register")) {
      router.replace("/home");
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
