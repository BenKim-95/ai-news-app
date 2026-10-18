# UI 가이드

앱 이름: **AI 뉴스 수집기**
메인 화면: 뉴스를 카드로 보여 주는 대시보드. Tailwind CSS 4 유틸리티 클래스로 스타일링한다.

기능 요구사항은 `PRD.md`, 이 문서는 화면 구성과 스타일 규칙만 다룬다.

## 1. 디자인 원칙

- **깔끔함**: 장식을 줄이고 여백과 얇은 테두리로 영역을 나눈다. 그림자는 호버 때만 약하게 쓴다.
- **읽기 편함**: 본문은 `text-sm`~`text-base`, 줄 간격은 넉넉하게(`leading-relaxed`). 요약은 3줄까지만 보이게 자른다.
- **색은 절제**: 기본은 회색 계열(slate) 하나에 강조색(indigo) 하나. 카테고리 구분에 여러 색을 쓰지 않는다.
- **다크 모드**: 시스템 설정을 따른다. 색은 `dark:` 변형으로 짝을 맞춘다.

## 2. 디자인 토큰

`src/app/globals.css`의 `@theme inline`에 아래 값을 추가해 쓴다. 클래스에서는 Tailwind 기본 팔레트를 그대로 써도 된다.

| 용도 | 라이트 | 다크 | 클래스 |
|---|---|---|---|
| 페이지 배경 | slate-50 | slate-950 | `bg-slate-50 dark:bg-slate-950` |
| 카드/헤더 배경 | white | slate-900 | `bg-white dark:bg-slate-900` |
| 테두리 | slate-200 | slate-800 | `border-slate-200 dark:border-slate-800` |
| 제목 텍스트 | slate-900 | slate-100 | `text-slate-900 dark:text-slate-100` |
| 본문 텍스트 | slate-600 | slate-300 | `text-slate-600 dark:text-slate-300` |
| 보조 텍스트 | slate-500 | slate-400 | `text-slate-500 dark:text-slate-400` |
| 강조색 | indigo-600 | indigo-400 | `bg-indigo-600 dark:bg-indigo-500` |

- 글꼴: `font-sans`(Geist). 한글은 시스템 폴백을 쓴다. `globals.css`의 `body { font-family: Arial… }`는 지우고 `font-sans`를 적용한다.
- 모서리: 카드 `rounded-xl`, 버튼·칩 `rounded-full` 또는 `rounded-lg`.
- 간격: 4의 배수 단위(`gap-2`, `gap-4`, `p-5`, `py-8`).

## 3. 화면 구성

```
┌──────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                    [뉴스 가져오기] (유저) │  헤더 (sticky)
├──────────────────────────────────────────────────────┤
│  [전체] [모델·연구] [제품·서비스] [투자·비즈니스]        │
│  [규제·정책] [기타] [미분류] [+ 카테고리 추가]           │  카테고리 바
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ 카테고리     │  │            │  │            │      │
│  │ 한국어 제목  │  │   뉴스 카드 │  │            │      │  카드 그리드
│  │ 요약…       │  │            │  │            │      │
│  │ 출처·날짜 ↗ │  │            │  │            │      │
│  │ [Notion 저장]│  │            │  │            │      │
│  └────────────┘  └────────────┘  └────────────┘      │
└──────────────────────────────────────────────────────┘
```

### 페이지 골격

```tsx
<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
  <header>…</header>
  <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <CategoryFilter />   {/* 카드 목록 바로 위 */}
    <NewsGrid />
  </main>
</div>
```

콘텐츠 최대 너비는 `max-w-6xl`, 좌우 패딩은 모바일 `px-4`, `sm` 이상 `px-6`.

## 4. 컴포넌트

### 4.1 헤더

- 위치: 상단 고정(`sticky top-0 z-10`), 반투명 배경과 하단 테두리.
- 왼쪽: 앱 이름 "AI 뉴스 수집기". 오른쪽: "뉴스 가져오기" 버튼, Clerk `UserButton`.

```tsx
<header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
      AI 뉴스 수집기
    </h1>
    <div className="flex items-center gap-3">
      {/* 뉴스 가져오기 버튼 + UserButton */}
    </div>
  </div>
</header>
```

### 4.2 버튼

| 종류 | 용도 | 클래스 |
|---|---|---|
| 기본(Primary) | 뉴스 가져오기 | `inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50` |
| 보조(Secondary) | Notion 저장 | `rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800` |
| 완료 | 저장됨 | 보조 버튼에 `disabled`, `text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-900` |

- 진행 중에는 버튼을 `disabled`로 두고 문구를 "가져오는 중…", "저장 중…"으로 바꾼다.
- 터치 대상은 최소 높이 36px 이상.

### 4.3 카테고리 바 (카드 목록 위)

카테고리를 칩(pill) 형태로 가로로 나열하고, **맨 끝에 "+ 카테고리 추가" 버튼**을 둔다.

순서: `전체` → 사용자 카테고리들 → `미분류` → `+ 카테고리 추가`

- 칩이 많으면 줄바꿈(`flex-wrap`). 모바일에서는 한 줄 가로 스크롤도 허용한다(`overflow-x-auto`, `flex-nowrap`).
- 선택된 칩은 강조색 채움, 나머지는 테두리만.
- "카테고리 추가"는 점선 테두리로 칩과 구별하고, 항상 마지막에 둔다.
- 칩 호버 시 이름 수정·삭제 진입점(연필·× 아이콘 또는 "관리" 메뉴)을 제공한다. 삭제 전에는 확인을 받는다(기사는 "미분류"가 됨).

```tsx
<nav aria-label="카테고리" className="mb-6 flex flex-wrap items-center gap-2">
  {/* 선택됨 */}
  <button
    aria-pressed="true"
    className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
  >
    전체
  </button>

  {/* 선택 안 됨 */}
  <button
    aria-pressed="false"
    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
  >
    모델·연구
  </button>

  {/* 맨 끝: 카테고리 추가 */}
  <button
    className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
  >
    <span aria-hidden>+</span> 카테고리 추가
  </button>
</nav>
```

"카테고리 추가"를 누르면 칩 자리에서 입력창으로 바뀌는 인라인 입력을 기본으로 한다(`Enter` 저장, `Esc` 취소).

```tsx
<input
  autoFocus
  placeholder="카테고리 이름"
  className="w-40 rounded-full border border-indigo-400 bg-white px-4 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900"
/>
```

### 4.4 뉴스 카드

표시 항목(위에서 아래): 카테고리 · 한국어 제목 · 한국어 요약 · 출처/날짜/원문 링크 · Notion 저장 버튼

```tsx
<article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
  <span className="mb-3 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
    모델·연구
  </span>

  <h2 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
    한국어 제목
  </h2>

  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
    한국어 요약
  </p>

  <div className="mt-auto pt-4">
    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <span>TechCrunch · 2026.10.18</span>
      <a
        href="원문 URL"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        원문 보기 ↗
      </a>
    </div>
    <button className="mt-3 w-full …보조 버튼…">Notion 저장</button>
  </div>
</article>
```

- 제목은 최대 2줄(`line-clamp-2`)로 자른다.
- 카드 높이는 같은 행에서 맞추고(`h-full`), 하단 영역은 `mt-auto`로 바닥에 붙인다.
- 미분류 기사의 카테고리 라벨은 회색(`bg-slate-100 text-slate-600`)으로 표시한다.
- 날짜는 `YYYY.MM.DD` 형식.

### 4.5 카드 그리드

```tsx
<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">…</div>
```

- 모바일 1열, `sm`(640px) 2열, `lg`(1024px) 3열.
- 최신순 정렬.

## 5. 상태별 화면

| 상태 | 표시 |
|---|---|
| 비어 있음 | 카드 영역 가운데에 안내 문구 "아직 수집한 뉴스가 없어요. 오른쪽 위 '뉴스 가져오기'를 눌러 보세요." (`py-20 text-center text-sm text-slate-500`) |
| 카테고리에 기사 없음 | "이 카테고리에는 기사가 없어요." |
| 로딩 | 카드 모양의 스켈레톤(`animate-pulse`, `bg-slate-200 dark:bg-slate-800`) 6개 |
| 수집 성공 | 상단 토스트 "새 기사 N개를 가져왔어요." |
| 일부 피드 실패 | 경고 배너: `rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200`. 문구 예: "The Verge에서 가져오지 못했어요. 나머지는 정상 처리했어요." |
| 오류 | 오류 배너: 위와 같은 구조에 `red` 계열. 원인을 사용자가 이해할 수 있는 문장으로 쓴다. 기술적 오류 메시지를 그대로 노출하지 않는다. |

## 6. 반응형

- 기준: 모바일 우선. `sm`(640) → `lg`(1024) 순으로 확장.
- 헤더: 모바일에서는 "뉴스 가져오기" 버튼 글자를 줄이거나 아이콘+짧은 문구로 둔다.
- 카테고리 바: 모바일에서 가로 스크롤 또는 줄바꿈. "+ 카테고리 추가"는 항상 목록의 마지막.
- 본문 너비: 카드 안 텍스트가 한 줄에 너무 길어지지 않도록 3열 상한(`max-w-6xl`)을 유지한다.

## 7. 접근성

- 대비: 본문 텍스트는 배경 대비 4.5:1 이상. 보조 텍스트도 slate-500 이상 진하기를 유지한다.
- 카테고리 칩은 `<button>`에 `aria-pressed`로 선택 상태를 알린다.
- 아이콘만 있는 버튼에는 `aria-label`을 단다.
- 포커스 표시를 지우지 않는다(`focus-visible:outline-*`).
- 외부 링크는 `target="_blank"`와 함께 `rel="noopener noreferrer"`.
- 진행/결과 메시지는 `role="status"`(오류는 `role="alert"`)로 스크린 리더에 전달한다.

## 8. 파일 배치

`CLAUDE.md`의 구조를 따른다.

| 파일 | 역할 |
|---|---|
| `src/app/page.tsx` | 대시보드 페이지 (헤더 + 카테고리 바 + 카드 그리드) |
| `src/components/NewsCard.tsx` | 뉴스 카드 |
| `src/components/CategoryFilter.tsx` | 카테고리 칩 바, 끝에 "카테고리 추가" |
| `src/components/CategoryManager.tsx` | 카테고리 추가·수정·삭제 UI |

상호작용이 있는 컴포넌트(필터, 추가 입력, 저장 버튼)만 `"use client"`로 두고, 나머지는 서버 컴포넌트로 유지한다.
