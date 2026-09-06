export default function LeaderboardLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-blue-500/20 bg-white/60">
        <div className="h-4 w-32 bg-blue-500/20 rounded-full mb-3" />
        <div className="h-8 w-60 bg-slate-200 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-200/60 rounded-lg" />
      </div>

      {/* Leaderboard List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl xianxia-card border border-slate-200/80 bg-white/50 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-10 h-10 rounded-xl bg-blue-500/20" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200/60 rounded" />
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <div className="h-4 w-24 bg-blue-500/20 rounded" />
              <div className="h-3 w-16 bg-slate-200/60 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
