"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteNewsButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, startRefresh] = useTransition();

  async function handleClick() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
        setDeleting(false);
        return;
      }
      // 목록을 다시 불러오면 카드가 사라진다.
      startRefresh(() => router.refresh());
    } catch {
      setError("네트워크 문제로 삭제하지 못했어요. 연결을 확인해 주세요.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={deleting || refreshing}
        aria-label="뉴스 삭제"
        className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
          aria-hidden
        >
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </>
  );
}
