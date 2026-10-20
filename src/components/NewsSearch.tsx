import Link from "next/link";

type Props = {
  query: string;
  // "all" | "uncategorized" | 카테고리 id(문자열)
  category: string;
};

// GET 폼이라 '검색' 버튼과 Enter 키가 같은 방식으로 동작한다.
// 검색하면 page는 빠지고(첫 페이지), 선택한 카테고리는 유지한다.
export default function NewsSearch({ query, category }: Props) {
  return (
    <form
      action="/dashboard"
      role="search"
      className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={category} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        className="min-w-0 flex-1 rounded-lg sm:w-56 sm:flex-none border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900"
      />
      <button
        type="submit"
        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        검색
      </button>
      {query && (
        <Link
          href={category === "all" ? "/dashboard" : `/dashboard?category=${category}`}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
