import Parser from "rss-parser";

export type FeedSource = { name: string; url: string };

export type FeedItem = {
  url: string;
  source: string;
  originalTitle: string;
  author: string | null;
  // 피드의 description(HTML 제거본). 없으면 빈 문자열.
  description: string;
  publishedAt: Date;
};

export type FetchResult = {
  items: FeedItem[];
  failedSources: string[];
};

export const FEEDS: FeedSource[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "ai-news-collector/0.1" },
});

const DESCRIPTION_MAX = 500;

// 같은 기사가 추적 파라미터나 해시만 달라 중복 저장되지 않도록 URL을 정리한다.
export function normalizeUrl(raw: string): string {
  const u = new URL(raw.trim());
  u.hash = "";
  for (const key of [...u.searchParams.keys()]) {
    if (key.startsWith("utm_")) u.searchParams.delete(key);
  }
  return u.toString();
}

async function fetchFeed(feed: FeedSource): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);
  const items: FeedItem[] = [];

  for (const item of parsed.items) {
    const title = item.title?.trim();
    const published = item.isoDate ?? item.pubDate;
    if (!item.link || !title || !published) continue;

    const publishedAt = new Date(published);
    if (Number.isNaN(publishedAt.getTime())) continue;

    let url: string;
    try {
      url = normalizeUrl(item.link);
    } catch {
      continue;
    }

    // TechCrunch는 creator, The Verge(Atom)는 author에 작성자가 담긴다.
    const author = (item.creator ?? item.author)?.trim() || null;
    const description = (item.contentSnippet ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, DESCRIPTION_MAX);

    items.push({
      url,
      source: feed.name,
      originalTitle: title,
      author,
      description,
      publishedAt,
    });
  }

  return items;
}

// 두 피드를 병렬로 가져와 피드마다 최신 `perFeed`개만 남긴다.
// 한 피드가 실패해도 나머지는 계속 처리하고, 실패한 소스 이름을 돌려준다.
export async function fetchLatestArticles(perFeed = 5): Promise<FetchResult> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const items: FeedItem[] = [];
  const failedSources: string[] = [];
  const seen = new Set<string>();

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      failedSources.push(FEEDS[i].name);
      return;
    }
    // 피드 순서에 기대지 않고 발행 시각 기준 최신 기사부터 고른다.
    const latest = [...result.value]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, perFeed);
    for (const item of latest) {
      // 피드 사이에서도 URL이 같으면 한 번만 담는다.
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      items.push(item);
    }
  });

  return { items, failedSources };
}
