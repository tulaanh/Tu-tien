export default function Loading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Banner Skeleton */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-amber-500/20 bg-slate-900/40">
        <div className="h-4 w-32 bg-amber-500/20 rounded-full mb-3" />
        <div className="h-8 w-64 bg-slate-800 rounded-xl mb-2" />
        <div className="h-4 w-96 max-w-full bg-slate-800/60 rounded-lg" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 xianxia-card border border-slate-800/80 bg-slate-900/30 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-amber-500/20 rounded-md" />
              <div className="h-5 w-16 bg-slate-800 rounded-md" />
            </div>
            <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-800/50 rounded-lg" />
            <div className="flex justify-between pt-2">
              <div className="h-4 w-20 bg-slate-800 rounded" />
              <div className="h-8 w-24 bg-amber-500/20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
