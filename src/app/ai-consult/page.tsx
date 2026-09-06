"use client";

import { useRouter } from "next/navigation";
import { useAIConsult } from "@/hooks/useAIConsult";
import { CONSULTATION_OPTIONS } from "@/lib/ai/consultationOptions";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { BottomNav } from "@/components/ui/BottomNav";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function AIConsultPage() {
  const router = useRouter();
  const { loading, result, error, consult, reset } = useAIConsult();

  const showingAnswer = !loading && (result || error);

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-6 flex items-center gap-3">
          <button
            onClick={() => (showingAnswer ? reset() : router.push("/home"))}
            className="text-zinc-400"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-zinc-100">AIに相談</h1>
        </div>

        {loading && (
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 size={28} className="text-emerald-400 animate-spin" />
            <p className="text-zinc-300 text-sm">AIが今日のPFCを分析しています…</p>
          </Card>
        )}

        {!loading && error && (
          <Card className="mb-4">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button size="sm" variant="secondary" onClick={reset}>
              メニューに戻る
            </Button>
          </Card>
        )}

        {!loading && !error && result && (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h2 className="font-bold text-zinc-100">{result.title}</h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{result.summary}</p>
            </Card>

            {result.foods.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">提案する食事</h3>
                <div className="flex flex-col gap-2">
                  {result.foods.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2.5"
                    >
                      <div>
                        <p className="text-zinc-100 font-medium text-sm">{f.name}</p>
                        <p className="text-zinc-500 text-xs">{f.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-sm font-semibold">P {f.protein}g</p>
                        <p className="text-zinc-500 text-xs">{f.calories}kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Button variant="secondary" onClick={reset}>
              他の相談をする
            </Button>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="flex flex-col gap-3">
            <p className="text-zinc-500 text-sm mb-1">相談したい内容を選んでください</p>
            {CONSULTATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => consult(opt.id)}
                className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-emerald-500/50 transition-colors"
              >
                <p className="text-zinc-100 font-semibold text-sm">{opt.label}</p>
                <p className="text-zinc-500 text-xs mt-1">{opt.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
