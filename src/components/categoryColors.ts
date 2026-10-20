// 카테고리별 색. Tailwind가 클래스를 찾을 수 있도록 전체 문자열로 적는다.
// id를 팔레트 길이로 나눈 나머지로 고르므로 이름을 바꿔도 색이 유지된다.
type Palette = {
  chipOn: string; // 선택된 칩
  chipOff: string; // 선택 안 된 칩
  badge: string; // 카드의 카테고리 뱃지
};

const PALETTE: Palette[] = [
  {
    chipOn: "border-indigo-600 bg-indigo-600 text-white",
    chipOff:
      "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    chipOn: "border-emerald-600 bg-emerald-600 text-white",
    chipOff:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    chipOn: "border-amber-500 bg-amber-500 text-white",
    chipOff:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    chipOn: "border-rose-600 bg-rose-600 text-white",
    chipOff:
      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  {
    chipOn: "border-sky-600 bg-sky-600 text-white",
    chipOff:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  {
    chipOn: "border-violet-600 bg-violet-600 text-white",
    chipOff:
      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    chipOn: "border-teal-600 bg-teal-600 text-white",
    chipOff:
      "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900",
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  {
    chipOn: "border-orange-600 bg-orange-600 text-white",
    chipOff:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
];

// 전체·미분류는 회색 계열
const NEUTRAL: Palette = {
  chipOn: "border-slate-700 bg-slate-700 text-white dark:border-slate-300 dark:bg-slate-300 dark:text-slate-900",
  chipOff:
    "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
  badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function categoryColor(categoryId: number | null): Palette {
  if (categoryId === null) return NEUTRAL;
  return PALETTE[categoryId % PALETTE.length];
}
