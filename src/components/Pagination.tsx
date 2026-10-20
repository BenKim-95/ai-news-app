import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  // "all" | "uncategorized" | 카테고리 id(문자열)
  category: string;
  query: string;
};

// 현재 페이지 앞뒤로 몇 페이지씩 보여 줄지
const SIBLINGS = 2;

function pageHref(category: string, query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

// 첫·끝 페이지는 항상 보이고, 현재 페이지 앞뒤 SIBLINGS개를 함께 보여 준다.
// 번호가 이어지지 않는 자리에만 말줄임("gap")을 넣는다.
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const set = new Set([1, totalPages]);
  for (let n = page - SIBLINGS; n <= page + SIBLINGS; n++) set.add(n);

  const nums = [...set]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push("gap");
    items.push(n);
  });
  return items;
}

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition";
const itemOn = "border-indigo-600 bg-indigo-600 text-white";
const itemOff =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";
const itemDisabled =
  "border-slate-200 bg-white text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500";

// 처음·이전·다음·끝 버튼. target이 null이면 비활성화한다.
function EdgeButton({
  category,
  query,
  target,
  children,
}: {
  category: string;
  query: string;
  target: number | null;
  children: React.ReactNode;
}) {
  if (target === null) {
    return (
      <span aria-disabled className={`${itemBase} ${itemDisabled}`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={pageHref(category, query, target)}
      className={`${itemBase} ${itemOff}`}
    >
      {children}
    </Link>
  );
}

export default function Pagination({
  page,
  totalPages,
  category,
  query,
}: Props) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <EdgeButton category={category} query={query} target={hasPrev ? 1 : null}>
        처음
      </EdgeButton>
      <EdgeButton
        category={category}
        query={query}
        target={hasPrev ? page - 1 : null}
      >
        이전
      </EdgeButton>

      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-slate-500 dark:text-slate-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(category, query, item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`${item}페이지`}
            className={`${itemBase} ${item === page ? itemOn : itemOff}`}
          >
            {item}
          </Link>
        ),
      )}

      <EdgeButton
        category={category}
        query={query}
        target={hasNext ? page + 1 : null}
      >
        다음
      </EdgeButton>
      <EdgeButton
        category={category}
        query={query}
        target={hasNext ? totalPages : null}
      >
        끝
      </EdgeButton>
    </nav>
  );
}
