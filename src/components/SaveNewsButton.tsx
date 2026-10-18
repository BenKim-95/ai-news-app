"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SaveNewsButton({
  id,
  saved,
}: {
  id: number;
  saved: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(saved);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();

  async function handleClick() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${id}/notion`, { method: "POST" });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setDone(true);
      startRefresh(() => router.refresh());
    } catch {
      setError("네트워크 문제로 저장하지 못했어요. 연결을 확인해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950"
      >
        저장됨
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving || refreshing}
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {saving ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </>
  );
}
