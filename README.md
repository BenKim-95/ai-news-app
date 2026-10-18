# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 개인용 웹앱입니다. 마음에 드는 뉴스는 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **뉴스 수집**: TechCrunch AI, The Verge AI 피드에서 최근 기사를 가져옵니다. 기사 URL 기준으로 중복을 걸러내고, 한 피드가 실패해도 나머지는 계속 처리합니다.
- **번역·요약·분류**: 새 기사의 제목과 피드 설명을 Claude에 보내 한국어 제목, 한국어 요약, 카테고리를 받습니다.
- **카드 목록**: 카테고리 필터, 최신순 정렬, 페이지네이션을 제공합니다.
- **Notion 저장**: 카드의 "뉴스 저장" 버튼을 누르면 Notion 데이터베이스에 페이지가 만들어지고, 버튼이 "저장됨"으로 바뀝니다. 같은 기사를 중복 저장하지 않습니다.
- **로그인**: Clerk로 로그인한 사용자만 접근할 수 있고, 데이터는 사용자별로 분리됩니다.

원문 전체는 저장하거나 번역하지 않습니다. 요약과 원문 링크만 다룹니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript), Tailwind CSS |
| 로그인 | Clerk |
| DB | Neon (PostgreSQL) + Drizzle ORM |
| 번역·요약·분류 | Claude API (`@anthropic-ai/sdk`) |
| Notion 저장 | `@notionhq/notion-mcp-server`를 `@modelcontextprotocol/sdk` 클라이언트로 호출 |
| RSS | `rss-parser` |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 이 파일은 git에 올리지 않습니다.

```env
# Clerk (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=

# Neon (PostgreSQL)
DATABASE_URL=

# Anthropic (Claude API)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=

# Notion (Integration 토큰, 저장할 데이터베이스 ID)
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

### 3. Notion 데이터베이스 준비

1. [Notion Integrations](https://www.notion.so/profile/integrations)에서 Integration을 만들고 토큰을 `NOTION_TOKEN`에 넣습니다.
2. 저장할 데이터베이스를 만들고 아래 속성을 추가합니다. 이름이 같아야 합니다.

   | 속성 | 타입 |
   |---|---|
   | 제목 | 제목(title) |
   | 요약 | 텍스트 |
   | 카테고리 | 텍스트 |
   | 출처 | 텍스트 |
   | 날짜 | 텍스트 |

3. 데이터베이스 페이지의 `···` 메뉴 → 연결(Connections)에서 만든 Integration을 추가합니다.
4. 데이터베이스 URL의 32자리 ID를 `NOTION_DATABASE_ID`에 넣습니다.

원문 링크는 페이지 제목에 걸립니다.

### 4. DB 마이그레이션

```bash
npx drizzle-kit migrate
```

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 오른쪽 위 "뉴스 가져오기"를 누릅니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npx drizzle-kit generate` | 스키마 변경으로 마이그레이션 생성 |
| `npx drizzle-kit migrate` | 마이그레이션 적용 |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ page.tsx                      로그인 화면
│  ├─ dashboard/page.tsx            뉴스 카드 목록
│  └─ api/news/
│     ├─ fetch/route.ts             뉴스 수집·번역·저장
│     └─ [id]/notion/route.ts       Notion 저장
├─ components/                      NewsCard, SaveNewsButton, CategoryFilter, FetchNewsButton, Pagination
├─ db/                              schema.ts, queries.ts, index.ts
├─ lib/                             rss.ts, claude.ts, notion.ts (외부 연동)
└─ proxy.ts                         Clerk 인증, 미로그인 API 호출은 401
drizzle/                            마이그레이션
```

외부 연동(RSS, Claude, Notion)은 `src/lib/`에만 두고, 비밀 키는 서버 코드에서만 사용합니다.

## 문서

- `PRD.md`: 요구사항 기준 문서
- `ui.md`: UI·Tailwind 스타일 가이드
- `CLAUDE.md`: Claude Code용 프로젝트 안내

## 참고

- Notion 저장은 서버에서 Notion MCP 서버 프로세스를 띄워 호출하므로, 배포 환경에서는 프로세스 실행이 가능한지 확인해야 합니다.
- 뉴스 수집은 수동("뉴스 가져오기" 버튼)만 지원합니다. 자동 스케줄러는 아직 없습니다.
