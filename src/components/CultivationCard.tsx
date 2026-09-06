"use client";

import { useState } from "react";
import { useCultivator } from "@/lib/cultivatorContext";
import { getRealmByLevel, REALMS } from "@/lib/cultivation";
import { 
  Zap, 
  Gem, 
  Flame, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  Swords
} from "lucide-react";
import Link from "next/link";

export default function CultivationCard() {
  const { cultivator, breakthrough } = useCultivator();
  const [breakingThrough, setBreakingThrough] = useState(false);
  const [breakthroughResult, setBreakthroughResult] = useState<string | null>(null);

  if (!cultivator) return null;

  const realmInfo = cultivator.realmInfo || getRealmByLevel(cultivator.realmLevel);
  const nextRealm = cultivator.realmLevel < REALMS.length - 1 ? getRealmByLevel(cultivator.realmLevel + 1) : null;
  
  const expPercentage = Math.min(
    100,
    Math.round((cultivator.currentExp / cultivator.maxExp) * 100)
  );

  const handleBreakthrough = async () => {
    setBreakingThrough(true);
    setBreakthroughResult(null);
    const res = await breakthrough();
    setBreakingThrough(false);
    if (res.message) {
      setBreakthroughResult(res.message);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl xianxia-card p-4 sm:p-6 md:p-8 border border-blue-500/30">
      {/* Background celestial glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {breakthroughResult && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-blue-50 border border-blue-400/60 text-blue-800 text-xs sm:text-sm flex items-start space-x-2.5 animate-fade-in">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{breakthroughResult}</p>
          </div>
          <button 
            onClick={() => setBreakthroughResult(null)}
            className="text-xs text-blue-500/80 hover:text-blue-800 ml-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Avatar & Info */}
        <div className="flex items-center space-x-3.5 sm:space-x-5 w-full sm:w-auto">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-white via-blue-50 to-blue-100/80 border-2 border-blue-500/40 p-1 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <div className="w-full h-full rounded-xl bg-gradient-to-b from-blue-500/15 to-cyan-500/10 flex items-center justify-center">
                <Swords className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 filter drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-white border border-blue-500/40 text-[9px] sm:text-[10px] font-bold text-blue-700">
              Lv.{cultivator.realmLevel}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 truncate">
                {cultivator.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-600/10 text-blue-700 border border-blue-500/30 shrink-0">
                {realmInfo.subStage || "Tiên Lộ"}
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm mt-0.5 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-slate-500">Cảnh giới:</span>
              <strong className="text-blue-700">{cultivator.realm}</strong>
            </p>

            <p className="text-[11px] sm:text-xs text-slate-500 italic mt-0.5 line-clamp-1">
              &quot;{cultivator.bio || realmInfo.description}&quot;
            </p>
          </div>
        </div>

        {/* Right: Spirit Stones Card on Mobile & Desktop */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/80">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2">
            <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-pulse" />
            <div>
              <p className="text-[9px] sm:text-[10px] text-emerald-700/70 font-medium uppercase tracking-wider">
                Linh Thạch
              </p>
              <p className="text-base sm:text-xl font-bold text-emerald-700">
                {cultivator.spiritStones.toLocaleString()}
              </p>
            </div>
          </div>

          <Link
            href="/shop"
            className="sm:hidden flex items-center space-x-1 text-xs text-blue-600/90 font-medium hover:text-blue-700"
          >
            <span>Đổi quà</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress Bar: Tu Vi */}
      <div className="mt-5 sm:mt-7 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
          <div className="flex items-center space-x-1 text-slate-600">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span>Tu Vi:</span>
            <span className="text-blue-700 font-mono">
              {cultivator.currentExp} / {cultivator.maxExp}
            </span>
          </div>

          <div className="text-slate-500 text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none text-right">
            {nextRealm ? (
              <span>Kế tiếp: <strong className="text-slate-800">{nextRealm.name}</strong></span>
            ) : (
              <span className="text-blue-600">Đỉnh Phong Vô Thượng</span>
            )}
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-3 sm:h-4 w-full rounded-full bg-blue-50/90 border border-slate-300/60 p-0.5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${realmInfo.color} transition-all duration-500 relative`}
            style={{ width: `${expPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
        <div className="text-right text-[10px] sm:text-[11px] text-slate-500 font-mono">
          {expPercentage}%
        </div>
      </div>

      {/* Bottleneck Alert & Breakthrough Action */}
      {cultivator.isBottleneck ? (
        <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-blue-600/10 border-2 border-blue-500/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 animate-pulse">
          <div className="flex items-center space-x-2.5 text-blue-800 w-full sm:w-auto">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-blue-800">
                ĐẠT ĐỈNH PHONG BÌNH CẢNH!
              </h4>
              <p className="text-[10px] sm:text-xs text-blue-700/80">
                Tu vi đã đầy 100%! Đột phá ngay để phi thăng.
              </p>
            </div>
          </div>

          <button
            onClick={handleBreakthrough}
            disabled={breakingThrough}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-600/30 disabled:opacity-50 transition transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            {breakingThrough ? "Đang vượt kiếp..." : "⚡ ĐỘT PHÁ CẢNH GIỚI"}
          </button>
        </div>
      ) : expPercentage >= 100 ? (
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={handleBreakthrough}
            disabled={breakingThrough}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:brightness-110 shadow-lg shadow-blue-600/25 active:scale-95 transition"
          >
            {breakingThrough ? "Đang độ kiếp..." : "⚡ Đột Phá Cảnh Giới"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
