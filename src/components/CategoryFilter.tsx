import Link from "next/link";

type Props = {
  categories: { id: number; name: string }[];
  // "all" | "uncategorized" | 카테고리 id(문자열)
  selected: string;
};

const chipBase =
  "rounded-full border px-4 py-1.5 text-sm font-medium transition";
const chipOn = "border-indigo-600 bg-indigo-600 text-white";
const chipOff =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";

function Chip({
  value,
  selected,
  children,
}: {
  value: string;
  selected: string;
  children: React.ReactNode;
}) {
  const on = value === selected;
  return (
    <Link
      href={value === "all" ? "/dashboard" : `/dashboard?category=${value}`}
      aria-current={on ? "true" : undefined}
      className={`${chipBase} ${on ? chipOn : chipOff}`}
    >
      {children}
    </Link>
  );
}

export default function CategoryFilter({ categories, selected }: Props) {
  return (
    <nav aria-label="카테고리" className="mb-6 flex flex-wrap items-center gap-2">
      <Chip value="all" selected={selected}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip key={c.id} value={String(c.id)} selected={selected}>
          {c.name}
        </Chip>
      ))}
      <Chip value="uncategorized" selected={selected}>
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
