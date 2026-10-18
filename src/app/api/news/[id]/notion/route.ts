import { auth } from "@clerk/nextjs/server";
import { getArticleForNotion, setNotionPageId } from "@/db/queries";
import { createNewsPage } from "@/lib/notion";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/news/[id]/notion">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const article = await getArticleForNotion(userId, id);
  if (!article) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }
  // 이미 저장된 기사는 다시 만들지 않는다.
  if (article.notionPageId) {
    return Response.json({ saved: true, alreadySaved: true });
  }

  try {
    const pageId = await createNewsPage({
      title: article.titleKo,
      summary: article.summaryKo,
      category: article.categoryName ?? "미분류",
      source: article.source,
      url: article.url,
      publishedAt: article.publishedAt,
    });
    await setNotionPageId(userId, id, pageId);
    return Response.json({ saved: true });
  } catch (error) {
    console.error("Notion 저장 실패", error);
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
