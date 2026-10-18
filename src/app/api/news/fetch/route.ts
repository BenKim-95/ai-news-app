import { auth } from "@clerk/nextjs/server";
import {
  findExistingUrls,
  insertNewArticles,
  listCategoriesWithDefaults,
} from "@/db/queries";
import { FALLBACK_CATEGORY, processArticles } from "@/lib/claude";
import { FEEDS, fetchLatestArticles } from "@/lib/rss";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { items, failedSources } = await fetchLatestArticles(5);

  // 모든 소스가 실패한 경우만 오류로 취급한다.
  if (failedSources.length === FEEDS.length) {
    return Response.json(
      {
        error: "뉴스 피드를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
        failedSources,
      },
      { status: 502 },
    );
  }

  try {
    // 이미 저장된 기사는 Claude에 보내지 않는다.
    const existing = await findExistingUrls(
      userId,
      items.map((a) => a.url),
    );
    const newItems = items.filter((a) => !existing.has(a.url));

    const categories = await listCategoriesWithDefaults(userId);
    const categoryIds = new Map(categories.map((c) => [c.name, c.id]));

    const { results, failed } = await processArticles(
      newItems,
      categories.map((c) => c.name),
    );

    // 모든 새 기사의 처리가 실패한 경우만 오류로 취급한다.
    if (newItems.length > 0 && results.size === 0) {
      return Response.json(
        {
          error:
            "AI 번역·요약에 실패했어요. 잠시 후 다시 시도해 주세요.",
          failedSources,
        },
        { status: 502 },
      );
    }

    // 실패한 기사는 저장하지 않는다. 저장하면 다음 수집에서 "이미 있음"으로
    // 건너뛰어 번역되지 않은 채 남기 때문이다. 다음 수집에서 다시 시도된다.
    const added = await insertNewArticles(
      newItems.flatMap((a) => {
        const r = results.get(a.url);
        if (!r) return [];
        return [
          {
            userId,
            url: a.url,
            source: a.source,
            originalTitle: a.originalTitle,
            author: a.author,
            titleKo: r.titleKo,
            summaryKo: r.summaryKo,
            categoryId:
              categoryIds.get(r.category) ??
              categoryIds.get(FALLBACK_CATEGORY) ??
              null,
            publishedAt: a.publishedAt,
          },
        ];
      }),
    );

    return Response.json({
      added,
      skipped: items.length - newItems.length,
      failedCount: failed.length,
      failedSources,
    });
  } catch (error) {
    console.error("기사 저장 실패", error);
    return Response.json(
      { error: "기사를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
