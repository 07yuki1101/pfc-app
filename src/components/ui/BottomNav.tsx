"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/add-meal", label: "記録", icon: Plus, accent: true },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {items.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
                active ? "text-emerald-400" : "text-zinc-500",
                accent && !active && "text-zinc-300"
              )}
            >
              {accent ? (
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center -mt-6 shadow-lg shadow-emerald-500/30">
                  <Icon size={24} className="text-white" />
                </div>
              ) : (
                <Icon size={22} />
              )}
              {!accent && <span className="text-xs">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
