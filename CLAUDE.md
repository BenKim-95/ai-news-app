# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 개인용 웹앱. 마음에 드는 뉴스는 Notion에 저장한다. 요구사항의 기준 문서는 `PRD.md`이며, 이 파일은 그 핵심을 요약한 것이다. 둘이 어긋나면 `PRD.md`를 따르고 이 파일을 갱신한다.

## UI 가이드

화면 구성, 컴포넌트, Tailwind 스타일 규칙은 `ui.md`를 따른다. UI 코드를 쓰기 전에 먼저 읽는다. 기능 요구사항은 `PRD.md`가 우선이다.

## 현재 상태

`create-next-app` 스캐폴드와 PRD 스택의 의존성만 설치돼 있고, 앱 코드는 아직 작성하지 않았다.

구현 단계(PRD §10):
1. 프로젝트 세팅 → 2. 로그인(Clerk) → 3. DB(Neon + Drizzle) 스키마·시드 → 4. RSS 수집 → 5. Claude 번역·요약·분류 → 6. 뉴스 가져오기 API + 버튼 → 7. 카드 UI + 카테고리 필터 → 8. 카테고리 관리 → 9. Notion 저장 → 10. 마무리(오류 처리, 반응형, README)

구현 전에 최소 실험(RSS 파싱, Claude JSON 출력, Neon 연결, Notion MCP 페이지 생성)으로 스택 호환성을 먼저 확인한다.

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (타입 검사 포함)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npx drizzle-kit generate` / `npx drizzle-kit migrate` — 마이그레이션 (`drizzle.config.ts`를 먼저 만들어야 하며, `dotenv`로 `.env.local`을 읽는다)
- 테스트 러너는 설정돼 있지 않다.

### 커스텀 슬래시 명령

- `/news-workflow [브랜치 이름]` (`.claude/commands/news-workflow.md`) — 새 기능 개발 워크플로우. main 확인 → 새 브랜치 생성(이름이 없으면 영어 소문자-하이픈 이름 제안) → 기술 스택·컨벤션 안내 → '완료'/'done' 입력 시 변경 파일 확인, 커밋 메시지 제안, 커밋 후 main 병합 → 작업 요약.

## Next.js 버전 주의

`AGENTS.md`에 따르면 이 Next.js(16.x)는 이전 버전과 호환되지 않는 변경이 있다. Next.js 코드(라우팅, 미들웨어/프록시 규칙, 비동기 요청 API 등)를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽는다. `@clerk/nextjs` 7.x, Zod 4, Tailwind 4도 예전 문서와 다를 수 있다.

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) |
| 로그인 | Clerk |
| DB | Neon (PostgreSQL) + Drizzle ORM |
| 번역·요약·분류 | Claude API (기본 Haiku 계열, 필요 시 상향) |
| Notion 저장 | Notion MCP 서버 (`@modelcontextprotocol/sdk` 클라이언트가 Integration 토큰으로 로컬 `@notionhq/notion-mcp-server` 호출) |
| RSS | `rss-parser` (RSS 2.0과 Atom 모두) |

## 아키텍처

제안 디렉토리 구조(PRD §8):

```
src/
├─ app/
│  ├─ (auth)/sign-in, sign-up
│  ├─ page.tsx
│  └─ api/
│     ├─ news/fetch/route.ts
│     ├─ news/[id]/notion/route.ts
│     └─ categories/route.ts
├─ components/   NewsCard, CategoryFilter, CategoryManager
├─ db/           schema.ts, index.ts
├─ lib/          rss.ts, claude.ts, notion.ts
└─ middleware.ts
drizzle/, drizzle.config.ts, .env.local
```

- **계층 규칙**: 외부 연동(RSS, Claude, Notion)은 `src/lib/`에만 둔다. 라우트와 컴포넌트는 호출만 한다. 비밀 키는 서버 코드에서만 쓰고 클라이언트에 노출하지 않는다.
- **인증**: 모든 페이지와 API는 Clerk로 로그인 후에만 접근 가능. 미로그인 페이지 접근은 로그인 화면으로 이동, 미로그인 API 호출은 401. 모든 데이터는 `user_id` 기준으로 분리한다.
- **데이터 모델**
  - `categories(id, user_id, name)`
  - `articles(id, user_id, url[사용자별 고유], source, original_title, author[null 허용], title_ko, summary_ko, category_id[null = 미분류], published_at, notion_page_id[null 허용], created_at)`

## 기능별 규칙

- **수집**
  - 소스: TechCrunch AI `https://techcrunch.com/category/artificial-intelligence/feed/` (RSS 2.0), The Verge AI `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` (Atom).
  - 피드당 최근 10개, 기사 URL 기준 중복 제거, 이미 가져온 기사는 건너뛴다.
  - 피드 하나가 실패해도 나머지는 계속 처리하고, 실패한 소스는 사용자에게 알린다.
  - 수동 수집만 한다("뉴스 가져오기" 버튼). 자동 스케줄러는 범위 밖.
- **Claude 처리**
  - 새 기사만 처리한다. 입력은 제목과 피드의 description뿐이다.
  - 출력은 한국어 제목, 한국어 요약, 카테고리를 구조화 JSON으로 받는다. 카테고리는 현재 목록 중 하나이고, 맞는 게 없으면 "기타".
  - 여러 기사를 묶어 호출해 비용·시간을 줄이되, 한 기사가 실패해도 나머지는 계속 처리한다.
- **카드 목록**: 한국어 제목, 한국어 요약, 카테고리, 출처, 날짜, 원문 링크, Notion 저장 버튼을 표시한다. 카테고리 탭/필터, 최신순 정렬, 비어 있을 때 안내 문구.
- **카테고리 관리**
  - 추가, 이름 수정, 삭제. 초기값: 모델·연구, 제품·서비스, 투자·비즈니스, 규제·정책, 기타.
  - 삭제 시 해당 기사의 `category_id`는 null("미분류")이 된다.
  - "재분류": 미분류 또는 선택한 기사를 현재 카테고리 기준으로 Claude가 다시 분류한다. 변경된 목록은 다음 수집부터 반영된다.
- **Notion 저장**
  - 서버에서만, Notion MCP 서버를 통해 호출한다.
  - 저장 항목: 한국어 제목, 한국어 요약, 카테고리, 원문 링크, 출처.
  - 생성 후 `notion_page_id`를 기록하고 버튼을 "저장됨"으로 바꾼다. 중복 생성을 막는다.
- **저작권**: 원문 전체는 저장·번역하지 않는다. 요약과 원문 링크만 저장한다.
- **오류 처리**: 피드/AI/Notion 실패 시 사용자가 이해할 수 있는 메시지를 보여준다.

## 검증 기준 (PRD §11)

- 미로그인 접근은 로그인으로 이동하고, 미로그인 API 호출은 401.
- "뉴스 가져오기" 후 한국어 제목·요약·카테고리가 있는 카드가 표시되고, 다시 가져와도 중복이 생기지 않는다.
- 카테고리 필터와 추가·수정·삭제가 동작하고, 삭제 시 기사가 "미분류"가 된다.
- "Notion 저장" 시 Notion에 페이지가 생기고 재클릭해도 중복 생성되지 않는다.
- `npm run build`와 타입 검사가 통과하고, 클라이언트 번들에 비밀 키가 없다.

## 환경 변수

`.env.local`(git 제외)이 필요하다: Clerk 키, Neon `DATABASE_URL`, Anthropic API 키, Notion Integration 토큰과 저장할 DB ID.

## 미결정 사항 (PRD §13)

- 배포 여부: 먼저 로컬에서 완성하고 배포는 나중에. 배포 시 Notion MCP 서버 프로세스를 실행할 수 있는지 확인이 필요하다.
- Notion MCP 연결 방식: 개인용이므로 Integration 토큰 + 로컬 MCP 서버를 제안.
- 기본 카테고리와 Claude 모델의 최종 확정.
