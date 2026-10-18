import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type NotionArticle = {
  title: string;
  summary: string;
  category: string;
  source: string;
  url: string;
  publishedAt: Date;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function text(content: string, link?: string) {
  // Notion rich_text 한 조각은 2000자까지만 허용한다.
  return [
    {
      type: "text",
      text: {
        content: content.slice(0, 2000),
        ...(link ? { link: { url: link } } : {}),
      },
    },
  ];
}

// 로컬 Notion MCP 서버를 stdio로 띄워 도구 하나를 호출하고 JSON 결과를 돌려준다.
async function callNotionTool(
  name: string,
  args: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");

  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.join(
        process.cwd(),
        "node_modules/@notionhq/notion-mcp-server/bin/cli.mjs",
      ),
    ],
    env: { ...(process.env as Record<string, string>), NOTION_TOKEN: token },
  });

  try {
    await client.connect(transport);
    const result = await client.callTool({ name, arguments: args });
    const first = (result.content as { type: string; text?: string }[])[0];
    const body = first?.text ? JSON.parse(first.text) : {};
    if (result.isError || body.object === "error") {
      throw new Error(body.message ?? `Notion ${name} 호출 실패`);
    }
    return body;
  } finally {
    await client.close().catch(() => {});
  }
}

// 새 Notion API는 database가 아닌 data source 아래에 페이지를 만든다.
let dataSourceId: string | undefined;
async function getDataSourceId() {
  if (dataSourceId) return dataSourceId;
  // 환경 변수에 URL 꼬리표("?v=...")가 붙어 있어도 32자리 ID만 뽑아 쓴다.
  const databaseId = process.env.NOTION_DATABASE_ID?.match(/[0-9a-f]{32}/i)?.[0];
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID 환경 변수가 올바르지 않습니다.");
  }
  const db = await callNotionTool("API-retrieve-a-database", {
    database_id: databaseId,
  });
  const id = (db.data_sources as { id: string }[] | undefined)?.[0]?.id;
  if (!id) throw new Error("Notion 데이터베이스의 data source를 찾지 못했습니다.");
  return (dataSourceId = id);
}

// 기사를 Notion 데이터베이스에 페이지로 만들고 page id를 돌려준다.
// 원문 전체는 저장하지 않고, 제목에 원문 링크를 걸어 요약과 함께 둔다.
export async function createNewsPage(article: NotionArticle): Promise<string> {
  const page = await callNotionTool("API-post-page", {
    parent: { data_source_id: await getDataSourceId() },
    properties: {
      제목: { title: text(article.title, article.url) },
      요약: { rich_text: text(article.summary) },
      카테고리: { rich_text: text(article.category) },
      출처: { rich_text: text(article.source) },
      날짜: {
        rich_text: text(
          dateFormat
            .format(article.publishedAt)
            .replace(/\.\s*/g, ".")
            .replace(/\.$/, ""),
        ),
      },
    },
  });
  if (typeof page.id !== "string") {
    throw new Error("Notion 페이지 ID를 받지 못했습니다.");
  }
  return page.id;
}
