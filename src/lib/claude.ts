import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { FeedItem } from "./rss";

export type ProcessedArticle = {
  titleKo: string;
  summaryKo: string;
  // 전달한 카테고리 목록 중 하나. 맞는 게 없으면 FALLBACK_CATEGORY.
  category: string;
};

export type ProcessResult = {
  // 키는 기사 URL
  results: Map<string, ProcessedArticle>;
  failed: FeedItem[];
};

export const FALLBACK_CATEGORY = "기타";

const MODEL = "claude-haiku-5-5";
const BATCH_SIZE = 10;

const OutputSchema = z.object({
  articles: z.array(
    z.object({
      id: z.number(),
      titleKo: z.string(),
      summaryKo: z.string(),
      category: z.string(),
    }),
  ),
});

// 키가 없으면 첫 호출 때가 아니라 사용 시점에 분명한 오류를 낸다.
let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic();
  return client;
}

function buildPrompt(batch: FeedItem[], categories: string[]) {
  const list = batch.map((item, id) => ({
    id,
    title: item.originalTitle,
    description: item.description,
  }));

  return [
    "아래는 영문 AI 뉴스 기사의 제목과 피드 설명입니다. 각 기사마다 다음을 만드세요.",
    "- titleKo: 자연스러운 한국어 제목",
    "- summaryKo: 한국어 요약 2~3문장. 주어진 제목과 설명에 있는 내용만 쓰고, 없는 사실을 추측해 덧붙이지 마세요.",
    `- category: 다음 목록 중 정확히 하나: ${categories.join(", ")}. 맞는 것이 없으면 "${FALLBACK_CATEGORY}".`,
    "입력의 id를 그대로 돌려주세요. 제품명, 회사명, 사람 이름은 널리 쓰이는 표기를 따르세요.",
    "",
    JSON.stringify(list),
  ].join("\n");
}

async function processBatch(
  batch: FeedItem[],
  categories: string[],
): Promise<ProcessResult> {
  const results = new Map<string, ProcessedArticle>();
  const failed: FeedItem[] = [];

  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 8000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(OutputSchema),
      },
      messages: [{ role: "user", content: buildPrompt(batch, categories) }],
    });

    const parsed = response.parsed_output;
    if (!parsed) throw new Error(`응답을 해석하지 못했어요 (${response.stop_reason})`);

    for (const row of parsed.articles) {
      const item = batch[row.id];
      const titleKo = row.titleKo.trim();
      const summaryKo = row.summaryKo.trim();
      if (!item || !titleKo || !summaryKo || results.has(item.url)) continue;

      results.set(item.url, {
        titleKo,
        summaryKo,
        category: categories.includes(row.category)
          ? row.category
          : FALLBACK_CATEGORY,
      });
    }
  } catch (error) {
    console.error("Claude 묶음 처리 실패", error);
  }

  // 응답에서 빠졌거나 묶음 전체가 실패한 기사
  for (const item of batch) {
    if (!results.has(item.url)) failed.push(item);
  }
  return { results, failed };
}

// 제목과 피드 설명만 Claude에 보내 한국어 제목·요약·카테고리를 받는다.
// 한 묶음이 실패해도 나머지는 계속 처리하고, 실패한 기사는 failed로 돌려준다.
export async function processArticles(
  items: FeedItem[],
  categories: string[],
): Promise<ProcessResult> {
  const batches: FeedItem[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  const outputs = await Promise.all(
    batches.map((batch) => processBatch(batch, categories)),
  );

  const results = new Map<string, ProcessedArticle>();
  const failed: FeedItem[] = [];
  for (const out of outputs) {
    out.results.forEach((value, key) => results.set(key, value));
    failed.push(...out.failed);
  }
  return { results, failed };
}
