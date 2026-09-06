export default function QuestsLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-blue-500/20 bg-white/60">
        <div className="h-4 w-28 bg-blue-500/20 rounded-full mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-200/60 rounded-lg" />
      </div>

      {/* Streak Widget Skeleton */}
      <div className="rounded-3xl p-5 sm:p-6 xianxia-card border border-blue-500/20 bg-white/60 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-56 bg-slate-200/60 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-slate-200/80 rounded-full" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 bg-white/80 border border-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Quests Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 xianxia-card border border-slate-200/80 bg-white/50 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-blue-500/20 rounded-md" />
              <div className="h-5 w-16 bg-slate-200 rounded-md" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-full bg-slate-200/50 rounded-lg" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-blue-500/20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
