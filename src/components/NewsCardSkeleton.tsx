const BAR_CLASS = "bg-slate-200 dark:bg-slate-800";

export default function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-60 animate-pulse flex-col rounded-xl border border-slate-200 bg-white p-6 motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={`mb-4 h-5 w-16 rounded-md ${BAR_CLASS}`} />
      <div className={`h-5 w-4/5 rounded ${BAR_CLASS}`} />
      <div className={`mt-3 h-4 w-full rounded ${BAR_CLASS}`} />
      <div className={`mt-3 h-4 w-full rounded ${BAR_CLASS}`} />
      <div className={`mt-3 h-4 w-2/3 rounded ${BAR_CLASS}`} />
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className={`h-3 w-24 rounded ${BAR_CLASS}`} />
          <div className={`h-3 w-16 rounded ${BAR_CLASS}`} />
        </div>
        <div className={`mt-4 h-10 w-full rounded-lg ${BAR_CLASS}`} />
      </div>
    </div>
  );
}
