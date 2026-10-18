import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import { articles, categories, type NewArticle } from "./schema";

// "all" = 전체, "uncategorized" = 미분류, 숫자 = 해당 카테고리 id
export type CategoryFilterValue = "all" | "uncategorized" | number;

export const PAGE_SIZE = 9;

export function listCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.id));
}

function articleWhere(userId: string, filter: CategoryFilterValue) {
  const byCategory =
    filter === "all"
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  return and(eq(articles.userId, userId), byCategory);
}

export async function countArticles(
  userId: string,
  filter: CategoryFilterValue,
) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(articleWhere(userId, filter));
  return row.total;
}

// page는 1부터 시작한다.
export function listArticles(
  userId: string,
  filter: CategoryFilterValue,
  page: number,
) {
  return db
    .select({
      id: articles.id,
      url: articles.url,
      source: articles.source,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      notionPageId: articles.notionPageId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(articleWhere(userId, filter))
    // 같은 시각의 기사가 페이지 사이에서 뒤섞이지 않도록 id를 보조 정렬 키로 쓴다.
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

// (user_id, url) 유니크 제약으로 이미 가져온 기사는 건너뛰고, 실제로 추가된 개수를 돌려준다.
export async function insertNewArticles(rows: NewArticle[]) {
  if (rows.length === 0) return 0;
  const inserted = await db
    .insert(articles)
    .values(rows)
    .onConflictDoNothing({ target: [articles.userId, articles.url] })
    .returning({ id: articles.id });
  return inserted.length;
}
