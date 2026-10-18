const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(date: Date) {
  // "2026. 10. 18." -> "2026.10.18"
  return dateFormat.format(date).replace(/\.\s*/g, ".").replace(/\.$/, "");
}

export type NewsCardProps = {
  title: string;
  summary: string;
  categoryName: string | null;
  source: string;
  publishedAt: Date;
  url: string;
  saved: boolean;
};

export default function NewsCard({
  title,
  summary,
  categoryName,
  source,
  publishedAt,
  url,
  saved,
}: NewsCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span
        className={
          categoryName
            ? "mb-3 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            : "mb-3 w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }
      >
        {categoryName ?? "미분류"}
      </span>

      <h2 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
        {title}
      </h2>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {summary}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {source} · {formatDate(publishedAt)}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            원문 보기 ↗
          </a>
        </div>
        {/* 저장 기능(Notion 연동)은 이후 단계에서 연결한다. */}
        <button
          type="button"
          disabled
          className={
            saved
              ? "mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950"
              : "mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 opacity-50 dark:border-slate-700 dark:text-slate-200"
          }
        >
          {saved ? "저장됨" : "Notion 저장"}
        </button>
      </div>
    </article>
  );
}
