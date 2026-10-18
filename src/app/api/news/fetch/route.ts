import { auth } from "@clerk/nextjs/server";
import { insertNewArticles } from "@/db/queries";
import { FEEDS, fetchRecentArticles } from "@/lib/rss";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { items, failedSources } = await fetchRecentArticles(24);

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
    // 번역·요약·분류는 이후 단계(Claude)에서 한다. 지금은 원문을 임시로 채운다.
    const added = await insertNewArticles(
      items.map((a) => ({
        userId,
        url: a.url,
        source: a.source,
        originalTitle: a.originalTitle,
        author: a.author,
        titleKo: a.originalTitle,
        summaryKo: a.description,
        categoryId: null,
        publishedAt: a.publishedAt,
      })),
    );

    return Response.json({
      added,
      skipped: items.length - added,
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
