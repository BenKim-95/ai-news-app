const BAR_CLASS = "bg-slate-200 dark:bg-slate-800";

export default function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-52 animate-pulse flex-col rounded-xl border border-slate-200 bg-white p-5 motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={`mb-3 h-5 w-16 rounded-full ${BAR_CLASS}`} />
      <div className={`h-4 w-4/5 rounded ${BAR_CLASS}`} />
      <div className={`mt-2 h-3 w-full rounded ${BAR_CLASS}`} />
      <div className={`mt-2 h-3 w-full rounded ${BAR_CLASS}`} />
      <div className={`mt-2 h-3 w-2/3 rounded ${BAR_CLASS}`} />
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <div className={`h-3 w-24 rounded ${BAR_CLASS}`} />
          <div className={`h-3 w-16 rounded ${BAR_CLASS}`} />
        </div>
        <div className={`mt-3 h-9 w-full rounded-lg ${BAR_CLASS}`} />
      </div>
    </div>
  );
}
