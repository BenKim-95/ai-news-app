import SaveNewsButton from "./SaveNewsButton";

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
  id: number;
  title: string;
  summary: string;
  categoryName: string | null;
  source: string;
  publishedAt: Date;
  url: string;
  saved: boolean;
};

export default function NewsCard({
  id,
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
        <SaveNewsButton id={id} saved={saved} />
      </div>
    </article>
  );
}
