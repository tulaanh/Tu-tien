export default function StudyLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-10 border border-amber-500/20 bg-slate-900/40">
        <div className="h-5 w-48 bg-amber-500/20 rounded-full mb-3" />
        <div className="h-8 w-72 bg-slate-800 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-800/60 rounded-lg" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Skeleton */}
        <div className="lg:col-span-2 rounded-3xl p-6 xianxia-card border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-10 w-full bg-slate-800/60 rounded-xl" />
          <div className="h-10 w-full bg-slate-800/60 rounded-xl" />
          <div className="h-20 w-full bg-slate-800/40 rounded-xl" />
          <div className="h-12 w-full bg-amber-500/20 rounded-xl" />
        </div>

        {/* Right Rules Skeleton */}
        <div className="space-y-6">
          <div className="rounded-3xl p-5 xianxia-card border border-amber-500/20 bg-slate-900/40 space-y-3">
            <div className="h-5 w-36 bg-amber-500/20 rounded-md" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
