export default function ShopLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-emerald-500/20 bg-white/60">
        <div className="h-4 w-32 bg-emerald-500/20 rounded-full mb-3" />
        <div className="h-8 w-56 bg-slate-200 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-200/60 rounded-lg" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-28 bg-white/80 border border-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 xianxia-card border border-slate-200/80 bg-white/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20" />
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200/60 rounded" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 w-20 bg-emerald-500/20 rounded" />
              <div className="h-8 w-24 bg-emerald-500/20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
