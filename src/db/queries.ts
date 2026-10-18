import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "./index";
import { articles, categories } from "./schema";

// "all" = 전체, "uncategorized" = 미분류, 숫자 = 해당 카테고리 id
export type CategoryFilterValue = "all" | "uncategorized" | number;

const ARTICLE_LIMIT = 60;

export function listCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.id));
}

export function listArticles(userId: string, filter: CategoryFilterValue) {
  const byCategory =
    filter === "all"
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

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
    .where(and(eq(articles.userId, userId), byCategory))
    .orderBy(desc(articles.publishedAt))
    .limit(ARTICLE_LIMIT);
}
