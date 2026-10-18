import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
  },
  (t) => [unique("categories_user_id_name_unique").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    url: text("url").notNull(),
    source: text("source").notNull(),
    originalTitle: text("original_title").notNull(),
    // 피드에 작성자 정보가 없으면 null
    author: text("author"),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    // null = 미분류 (카테고리 삭제 시 null로 전환)
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    notionPageId: text("notion_page_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("articles_user_id_url_unique").on(t.userId, t.url),
    index("articles_user_id_published_at_idx").on(t.userId, t.publishedAt),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
