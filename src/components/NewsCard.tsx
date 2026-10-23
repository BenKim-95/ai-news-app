import { categoryColor } from "./categoryColors";
import DeleteNewsButton from "./DeleteNewsButton";
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
  categoryId: number | null;
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
  categoryId,
  categoryName,
  source,
  publishedAt,
  url,
  saved,
}: NewsCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-900/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:hover:shadow-black/30">
      <DeleteNewsButton id={id} />

      <span
        className={`mb-4 w-fit rounded-md px-2 py-0.5 text-xs font-semibold ${categoryColor(categoryId).badge}`}
      >
        {categoryName ?? "미분류"}
      </span>

      <h2 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 [word-break:keep-all] dark:text-slate-50">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 rounded-sm transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 dark:group-hover:text-indigo-300"
        >
          {title}
        </a>
      </h2>

      <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-slate-600 [word-break:keep-all] dark:text-slate-300">
        {summary}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
          <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {source}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <time dateTime={publishedAt.toISOString()} className="tabular-nums">
              {formatDate(publishedAt)}
            </time>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-indigo-600 motion-reduce:transition-none dark:group-hover:text-indigo-400"
              aria-hidden
            >
              <path d="M7 13L13 7M8 7h5v5" />
            </svg>
          </span>
        </div>
        <SaveNewsButton id={id} saved={saved} />
      </div>
    </article>
  );
}
