"use client";

import { cn } from "@/lib/utils";

interface PFCBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

export function PFCBar({ label, value, target, color, unit = "g" }: PFCBarProps) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const over = value > target;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className={cn("font-bold", over ? "text-red-400" : "text-zinc-100")}>
          {Math.round(value)}{unit}
          <span className="text-zinc-500 font-normal"> / {Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color, over && "opacity-60")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PFCBarsProps {
  consumed: { totalProtein: number; totalFat: number; totalCarb: number; totalCalorie: number };
  target: { protein: number; fat: number; carb: number; calories: number };
}

export function PFCBars({ consumed, target }: PFCBarsProps) {
  return (
    <div className="flex flex-col gap-3">
      <PFCBar
        label="タンパク質 (P)"
        value={consumed.totalProtein}
        target={target.protein}
        color="bg-blue-500"
      />
      <PFCBar
        label="脂質 (F)"
        value={consumed.totalFat}
        target={target.fat}
        color="bg-yellow-500"
      />
      <PFCBar
        label="炭水化物 (C)"
        value={consumed.totalCarb}
        target={target.carb}
        color="bg-orange-500"
      />
    </div>
  );
}
