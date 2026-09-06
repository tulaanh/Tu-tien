export default function StudyLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-10 border border-blue-500/20 bg-white/60">
        <div className="h-5 w-48 bg-blue-500/20 rounded-full mb-3" />
        <div className="h-8 w-72 bg-slate-200 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-200/60 rounded-lg" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Skeleton */}
        <div className="lg:col-span-2 rounded-3xl p-6 xianxia-card border border-slate-200 bg-white/60 space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-10 w-full bg-slate-200/60 rounded-xl" />
          <div className="h-10 w-full bg-slate-200/60 rounded-xl" />
          <div className="h-20 w-full bg-slate-200/40 rounded-xl" />
          <div className="h-12 w-full bg-blue-500/20 rounded-xl" />
        </div>

        {/* Right Rules Skeleton */}
        <div className="space-y-6">
          <div className="rounded-3xl p-5 xianxia-card border border-blue-500/20 bg-white/60 space-y-3">
            <div className="h-5 w-36 bg-blue-500/20 rounded-md" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-200/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
