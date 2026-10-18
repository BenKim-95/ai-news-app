# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude AI가 한국어로 번역·요약·카테고리 분류한 결과를 카드 형태로 보여주는 개인용 웹앱. 마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 목표
- 영어 AI 뉴스를 한국어 요약 카드로 빠르게 훑어본다.
- 뉴스가 자동으로 카테고리별로 분류되어 관심 주제만 골라 본다.
- 중요한 뉴스는 버튼 한 번으로 Notion에 보관한다.

## 3. 범위

### 포함
- 로그인(필수)
- "뉴스 가져오기" 버튼으로 수동 수집
- Claude 기반 한국어 번역·요약·카테고리 자동 분류
- 카테고리별 필터링
- 카테고리 추가·수정·삭제
- 카드별 "Notion 저장" 버튼

### 제외 (현재 버전)
- 자동 주기 수집(스케줄러)
- 기사 원문 전체 저장 및 번역 (요약과 원문 링크만 저장)
- 다중 사용자 협업 기능
- 모바일 네이티브 앱

## 4. 사용자 시나리오
1. 앱을 실행하면 로그인 화면이 나온다. 로그인해야 앱을 쓸 수 있다.
2. "뉴스 가져오기"를 누르면 RSS에서 새 기사를 가져온다. 이미 가져온 기사는 건너뛴다.
3. 새 기사마다 Claude가 한국어 제목·요약을 만들고 카테고리를 정한다.
4. 카드 목록에서 카테고리를 골라 해당 뉴스만 본다.
5. 카테고리를 추가·수정·삭제한다.
6. 카드의 "Notion 저장"을 누르면 선택한 뉴스가 Notion에 저장되고, 버튼은 "저장됨"으로 바뀐다.

## 5. 기능 요구사항

### 5.1 로그인
- Clerk 사용. 모든 페이지와 API는 로그인 후에만 접근 가능.
- 미로그인 접근 시 로그인 화면으로 이동. 미로그인 API 호출은 401.

### 5.2 뉴스 수집
- 소스(RSS/Atom):
  - TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/` (RSS 2.0)
  - The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` (Atom)
- 피드당 최근 10개를 가져온다.
- 기사 URL 기준으로 중복을 제거한다.
- 피드 하나가 실패해도 나머지는 계속 처리하고, 실패한 소스는 사용자에게 알린다.

### 5.3 번역·요약·분류 (Claude API)
- 새 기사만 처리한다. 입력은 제목과 피드의 description.
- 출력: 한국어 제목, 한국어 요약, 카테고리(현재 카테고리 목록 중 하나, 맞는 게 없으면 "기타").
- 구조화 JSON으로 받는다. 한 기사가 실패해도 나머지는 계속 처리한다.
- 기본 모델은 Haiku 계열. 필요 시 상향.

### 5.4 카드 목록
- 카드 표시 항목: 한국어 제목, 한국어 요약, 카테고리, 출처, 날짜, 원문 링크, Notion 저장 버튼.
- 카테고리 탭/필터로 해당 뉴스만 표시. 최신순 정렬. 비어 있을 때 안내 문구.

### 5.5 카테고리 관리
- 추가, 이름 수정, 삭제 가능. 언제든 변경할 수 있다.
- 기본 카테고리(초기값): 모델·연구, 제품·서비스, 투자·비즈니스, 규제·정책, 기타.
- 삭제 시 해당 기사는 "미분류"로 이동한다.
- "재분류" 기능: 미분류 또는 선택한 기사를 현재 카테고리 기준으로 Claude가 다시 분류한다.
- 변경된 카테고리 목록은 다음 수집부터 분류에 반영된다.

### 5.6 Notion 저장
- 카드의 "Notion 저장" 버튼으로 해당 뉴스를 Notion 데이터베이스에 페이지로 생성한다.
- 저장 항목: 한국어 제목, 한국어 요약, 카테고리, 원문 링크, 출처.
- Notion MCP 서버를 통해 저장한다. 서버 측에서만 호출한다.
- 저장 후 Notion 페이지 ID를 기록하고 버튼을 "저장됨"으로 표시한다. 중복 생성을 막는다.

## 6. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) |
| 로그인 | Clerk |
| 데이터베이스 | Neon (PostgreSQL) + Drizzle ORM |
| 번역·요약·분류 | Claude API |
| Notion 저장 | Notion MCP 서버 |
| RSS 파싱 | rss-parser (RSS 2.0과 Atom 모두 처리) |

## 7. 데이터 모델
- **categories**: id, user_id, name
- **articles**: id, user_id, url(사용자별 고유), source, original_title, author(null 허용), title_ko, summary_ko, category_id(null 허용 = 미분류), published_at, notion_page_id(null 허용), created_at

## 8. 디렉토리 구조 (제안)
```
ai-news-collector/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/sign-in, sign-up
│  │  ├─ page.tsx
│  │  └─ api/
│  │     ├─ news/fetch/route.ts
│  │     ├─ news/[id]/notion/route.ts
│  │     └─ categories/route.ts
│  ├─ components/   NewsCard, CategoryFilter, CategoryManager
│  ├─ db/           schema.ts, index.ts
│  ├─ lib/          rss.ts, claude.ts, notion.ts
│  └─ middleware.ts
├─ drizzle/
├─ drizzle.config.ts
└─ .env.local
```
- 외부 연동(RSS, Claude, Notion)은 `lib/`에만 둔다. 라우트와 컴포넌트는 호출만 한다.
- 비밀 키는 서버 코드에서만 사용하고 클라이언트에 노출하지 않는다.

## 9. 비기능 요구사항
- **보안**: API 키는 환경변수로 관리하고 git에 올리지 않는다. 모든 API는 인증을 확인한다.
- **비용·성능**: 새 기사만 Claude를 호출한다. 여러 기사를 묶어 호출해 시간과 비용을 줄인다.
- **저작권**: 원문 전체를 저장하지 않고 요약과 원문 링크만 저장한다.
- **오류 처리**: 피드/AI/Notion 실패 시 사용자에게 이해할 수 있는 메시지를 보여준다.

## 10. 구현 단계
1. 프로젝트 세팅
2. 로그인(Clerk)
3. DB(Neon + Drizzle) 스키마·시드
4. RSS 수집
5. Claude 번역·요약·분류
6. 뉴스 가져오기 API + 버튼
7. 카드 UI + 카테고리 필터
8. 카테고리 관리
9. Notion 저장
10. 마무리(오류 처리, 반응형, README)

구현 전에 최소 실험(RSS 파싱, Claude JSON 출력, Neon 연결, Notion MCP 페이지 생성)을 먼저 수행해 스택 호환성을 확인한다.

## 11. 검증 기준
- 미로그인 접근 시 로그인으로 이동하고, 미로그인 API 호출은 401을 반환한다.
- "뉴스 가져오기" 후 한국어 제목·요약·카테고리가 있는 카드가 표시된다.
- 다시 가져와도 중복 기사가 생기지 않는다.
- 카테고리 필터와 추가·수정·삭제가 동작하고, 삭제 시 기사가 "미분류"가 된다.
- "Notion 저장" 시 Notion에 페이지가 생기고 재클릭해도 중복 생성되지 않는다.
- `npm run build`와 타입 검사가 통과하고, 클라이언트 번들에 비밀 키가 없다.

## 12. 필요한 준비물
Clerk 키, Neon `DATABASE_URL`, Anthropic API 키, Notion Integration 토큰과 저장할 DB ID.

## 13. 미결정 사항
- 배포 여부 (제안: 먼저 로컬에서 완성하고 배포는 나중에. 배포 시 Notion MCP 서버 프로세스 실행 가능 여부 확인 필요)
- Notion MCP 연결 방식 (제안: 개인용이므로 Integration 토큰 + 로컬 MCP 서버)
- 기본 카테고리와 Claude 모델의 최종 확정
