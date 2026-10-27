import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Notion MCP 서버는 코드에서 import하지 않고 자식 프로세스로 띄우므로,
  // 배포 번들(Vercel)에 파일이 빠지지 않도록 명시적으로 포함한다.
  outputFileTracingIncludes: {
    "/api/news/[id]/notion": [
      "./node_modules/@notionhq/notion-mcp-server/**/*",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
