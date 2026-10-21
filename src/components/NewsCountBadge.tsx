export default function NewsCountBadge({ count }: { count: number }) {
  return (
    <span
      role="status"
      className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
    >
      총 {count.toLocaleString("ko-KR")}개의 뉴스
    </span>
  );
}
