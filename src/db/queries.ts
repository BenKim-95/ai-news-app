import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
} from "drizzle-orm";
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

export const DEFAULT_CATEGORIES = [
  "모델·연구",
  "제품·서비스",
  "투자·비즈니스",
  "규제·정책",
  "기타",
];

// 카테고리가 하나도 없는 사용자(첫 접속)에게 기본 카테고리를 넣고 목록을 돌려준다.
export async function listCategoriesWithDefaults(userId: string) {
  const existing = await listCategories(userId);
  if (existing.length > 0) return existing;

  // 동시 요청이 겹쳐도 (user_id, name) 유니크 제약으로 중복되지 않는다.
  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing({ target: [categories.userId, categories.name] });
  return listCategories(userId);
}

// 제목·요약·원문 제목에서 키워드를 찾는다. LIKE 와일드카드는 글자 그대로 취급한다.
function keywordWhere(keyword: string) {
  if (!keyword) return undefined;
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
  return or(
    ilike(articles.titleKo, pattern),
    ilike(articles.summaryKo, pattern),
    ilike(articles.originalTitle, pattern),
  );
}

function articleWhere(
  userId: string,
  filter: CategoryFilterValue,
  keyword: string,
) {
  const byCategory =
    filter === "all"
      ? undefined
      : filter === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  return and(eq(articles.userId, userId), byCategory, keywordWhere(keyword));
}

export async function countArticles(
  userId: string,
  filter: CategoryFilterValue,
  keyword = "",
) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(articleWhere(userId, filter, keyword));
  return row.total;
}

// page는 1부터 시작한다.
export function listArticles(
  userId: string,
  filter: CategoryFilterValue,
  page: number,
  keyword = "",
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
      categoryId: articles.categoryId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(articleWhere(userId, filter, keyword))
    // 같은 시각의 기사가 페이지 사이에서 뒤섞이지 않도록 id를 보조 정렬 키로 쓴다.
    .orderBy(desc(articles.publishedAt), desc(articles.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

// 이미 저장된 기사 URL만 골라낸다. Claude에 중복 기사를 보내지 않기 위해 쓴다.
export async function findExistingUrls(userId: string, urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ url: articles.url })
    .from(articles)
    .where(and(eq(articles.userId, userId), inArray(articles.url, urls)));
  return new Set(rows.map((r) => r.url));
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

export async function getArticleForNotion(userId: string, id: number) {
  const [row] = await db
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
    .where(and(eq(articles.userId, userId), eq(articles.id, id)));
  return row;
}

// 아직 저장되지 않은 기사에만 page id를 기록한다. 이미 기록돼 있으면 false.
export async function setNotionPageId(
  userId: string,
  id: number,
  notionPageId: string,
) {
  const updated = await db
    .update(articles)
    .set({ notionPageId })
    .where(
      and(
        eq(articles.userId, userId),
        eq(articles.id, id),
        isNull(articles.notionPageId),
      ),
    )
    .returning({ id: articles.id });
  return updated.length > 0;
}

export async function deleteArticle(userId: string, id: number) {
  try {
    const deleted = await db
      .delete(articles)
      .where(and(eq(articles.userId, userId), eq(articles.id, id)))
      .returning({ id: articles.id });
    return deleted.length > 0;
  } catch (error) {
    console.error("기사 삭제 실패", error);
    throw error;
  }
}
