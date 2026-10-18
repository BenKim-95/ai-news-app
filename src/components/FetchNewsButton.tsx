"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Notice = { kind: "success" | "warning" | "error"; text: string };

type FetchResponse = {
  added?: number;
  skipped?: number;
  failedSources?: string[];
  error?: string;
};

const noticeStyle: Record<Notice["kind"], string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
};

export default function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleClick() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data: FetchResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNotice({
          kind: "error",
          text:
            data.error ?? "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }

      const added = data.added ?? 0;
      const failed = data.failedSources ?? [];
      const base =
        added > 0
          ? `새 기사 ${added}개를 가져왔어요.`
          : "새로 가져올 기사가 없어요.";
      setNotice(
        failed.length > 0
          ? {
              kind: "warning",
              text: `${failed.join(", ")}에서 가져오지 못했어요. 나머지는 정상 처리했어요. ${base}`,
            }
          : { kind: "success", text: base },
      );
      startRefresh(() => router.refresh());
    } catch {
      setNotice({
        kind: "error",
        text: "네트워크 문제로 뉴스를 가져오지 못했어요. 연결을 확인해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || refreshing;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {busy ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`fixed inset-x-4 top-16 z-20 mx-auto max-w-xl rounded-lg border px-4 py-3 text-sm shadow-md ${noticeStyle[notice.kind]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="알림 닫기"
              className="shrink-0 font-medium opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
