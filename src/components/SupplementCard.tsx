"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSupplementStore } from "@/store/supplementStore";
import { useSupplementLog } from "@/hooks/useSupplementLog";
import { addSupplement, deleteSupplement, saveSupplementLog } from "@/lib/firebase/firestore";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { Plus, X, Check } from "lucide-react";

export function SupplementCard() {
  const { user } = useAuthStore();
  const { supplements, todayLog, setTodayLog } = useSupplementStore();
  const { refresh } = useSupplementLog();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(todayLog?.note ?? "");
  }, [todayLog?.date, todayLog?.note]);

  if (!todayLog) return null;

  async function handleToggle(id: string) {
    if (!user || !todayLog) return;
    const checkedIds = todayLog.checkedIds.includes(id)
      ? todayLog.checkedIds.filter((i) => i !== id)
      : [...todayLog.checkedIds, id];
    const updated = { ...todayLog, checkedIds };
    setTodayLog(updated);
    try {
      await saveSupplementLog(user.uid, updated);
    } catch {
      toast.error("保存に失敗しました");
      await refresh();
    }
  }

  async function handleAdd() {
    if (!user || !newName.trim()) return;
    setAdding(true);
    try {
      await addSupplement(user.uid, newName.trim());
      setNewName("");
      await refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    try {
      await deleteSupplement(user.uid, id);
      await refresh();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  async function handleSaveNote() {
    if (!user || !todayLog || note === todayLog.note) return;
    const updated = { ...todayLog, note };
    try {
      await saveSupplementLog(user.uid, updated);
      setTodayLog(updated);
    } catch {
      toast.error("保存に失敗しました");
    }
  }

  return (
    <Card className="mb-4">
      <h2 className="font-bold text-zinc-100 mb-3">サプリメント</h2>

      <div className="flex flex-col gap-2 mb-3">
        {supplements.length === 0 ? (
          <p className="text-zinc-500 text-sm">まだ項目がありません</p>
        ) : (
          supplements.map((s) => {
            const checked = todayLog.checkedIds.includes(s.id);
            return (
              <div
                key={s.id}
                className="flex items-center justify-between bg-zinc-800 rounded-xl px-3 py-2.5"
              >
                <button
                  onClick={() => handleToggle(s.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      checked ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
                    }`}
                  >
                    {checked && <Check size={14} className="text-white" />}
                  </span>
                  <span className={`text-sm ${checked ? "text-zinc-100" : "text-zinc-400"}`}>
                    {s.name}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors shrink-0 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="新しい項目を追加"
          className="py-2.5"
        />
        <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus size={16} />
        </Button>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">今日だけ摂ったもの</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="例: 鉄剤, ビタミンD 1粒"
          rows={2}
          className="w-full bg-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none resize-none placeholder:text-zinc-600"
        />
      </div>
    </Card>
  );
}
