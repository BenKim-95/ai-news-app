import Link from "next/link";
import { categoryColor } from "./categoryColors";

type Props = {
  categories: { id: number; name: string }[];
  // "all" | "uncategorized" | 카테고리 id(문자열)
  selected: string;
  // 검색어. 카테고리를 바꿔도 유지한다.
  query: string;
};

const chipBase =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition";

function Chip({
  value,
  selected,
  query,
  children,
}: {
  value: string;
  selected: string;
  query: string;
  children: React.ReactNode;
}) {
  const on = value === selected;
  // "all"·"uncategorized"는 회색, 카테고리 id는 id별 색
  const color = categoryColor(/^\d+$/.test(value) ? Number(value) : null);
  const params = new URLSearchParams();
  if (value !== "all") params.set("category", value);
  if (query) params.set("q", query);
  const qs = params.toString();
  return (
    <Link
      href={qs ? `/dashboard?${qs}` : "/dashboard"}
      aria-current={on ? "true" : undefined}
      className={`${chipBase} ${on ? color.chipOn : color.chipOff}`}
    >
      {children}
    </Link>
  );
}

export default function CategoryFilter({ categories, selected, query }: Props) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      <Chip value="all" selected={selected} query={query}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip key={c.id} value={String(c.id)} selected={selected} query={query}>
          {c.name}
        </Chip>
      ))}
      <Chip value="uncategorized" selected={selected} query={query}>
        미분류
      </Chip>

      {/* 추가 기능(카테고리 API)은 이후 단계에서 연결한다. */}
      <button
        type="button"
        disabled
        title="준비 중"
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-500 opacity-60 dark:border-slate-700 dark:text-slate-400"
      >
        <span aria-hidden>+</span> 카테고리 추가
      </button>
    </nav>
  );
}
