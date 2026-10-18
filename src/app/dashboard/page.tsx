import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import FetchNewsButton from "@/components/FetchNewsButton";
import NewsCard from "@/components/NewsCard";
import Pagination from "@/components/Pagination";
import {
  PAGE_SIZE,
  countArticles,
  listArticles,
  listCategoriesWithDefaults,
  type CategoryFilterValue,
} from "@/db/queries";

export const metadata = { title: "대시보드 · AI 뉴스 수집기" };

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            AI 뉴스 수집기
          </h1>
          <div className="flex items-center gap-3">
            <FetchNewsButton />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const raw = (await searchParams).category;
  const param = typeof raw === "string" ? raw : "all";

  const categoryList = await listCategoriesWithDefaults(userId);
  // 목록에 없는 값(남의 id, 오타 등)은 전체로 취급한다.
  const filter: CategoryFilterValue =
    param === "uncategorized"
      ? "uncategorized"
      : (categoryList.find((c) => String(c.id) === param)?.id ?? "all");
  const selected = filter === "all" ? "all" : String(filter);

  const total = await countArticles(userId, filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // 잘못된 값이나 범위를 벗어난 값(예: 기사가 줄어든 뒤의 옛 링크)은 가장 가까운 페이지로 맞춘다.
  const rawPage = Number((await searchParams).page);
  const page = Number.isInteger(rawPage)
    ? Math.min(Math.max(rawPage, 1), totalPages)
    : 1;

  const items = await listArticles(userId, filter, page);

  return (
    <>
      <CategoryFilter categories={categoryList} selected={selected} />
      {items.length === 0 ? (
        <p className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">
          {filter === "all"
            ? "아직 수집한 뉴스가 없어요. 오른쪽 위 '뉴스 가져오기'를 눌러 보세요."
            : "이 카테고리에는 기사가 없어요."}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <NewsCard
              key={a.id}
              id={a.id}
              title={a.titleKo}
              summary={a.summaryKo}
              categoryName={a.categoryName}
              source={a.source}
              publishedAt={a.publishedAt}
              url={a.url}
              saved={a.notionPageId !== null}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} category={selected} />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}
