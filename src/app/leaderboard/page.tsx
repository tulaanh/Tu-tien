"use client";

import { useCultivator } from "@/lib/cultivatorContext";
import { RealmTier } from "@/lib/cultivation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Gem, 
  Flame, 
  Sparkles, 
  User, 
  Swords 
} from "lucide-react";

interface CultivatorRank {
  id: string;
  name: string;
  realm: string;
  realmLevel: number;
  currentExp: number;
  maxExp: number;
  spiritStones: number;
  isBottleneck: boolean;
  avatar: string;
  bio?: string;
  realmInfo: RealmTier;
}

export default function LeaderboardPage() {
  const { cultivator } = useCultivator();
  const { data, isLoading } = useSWR("/api/leaderboard", fetcher);
  const leaderboard: CultivatorRank[] = data?.leaderboard || [];
  const loading = isLoading && !data;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <Trophy className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">Tiên Bảng Chi Thượng</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700">
            Bảng Phong Thần
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Vinh danh những bậc đại năng có tu vi thâm hậu và đạo tâm kiên cường nhất trong thiên địa.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Đang câu thông Tiên Bảng...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 xianxia-card rounded-2xl border border-slate-200 p-8">
          <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-600">Chưa có đạo hữu nào ghi danh</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((item, index) => {
            const isCurrentUser = cultivator?.id === item.id;
            const rank = index + 1;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrentUser
                    ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-600/10"
                    : "xianxia-card border-slate-200 hover:border-blue-500/30"
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    {rank === 1 ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
                        <Crown className="w-5 h-5 fill-white" />
                      </div>
                    ) : rank === 2 ? (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                        <Medal className="w-5 h-5 fill-slate-950" />
                      </div>
                    ) : rank === 3 ? (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-200 font-black shadow-md">
                        <Medal className="w-5 h-5 fill-amber-200" />
                      </div>
                    ) : (
                      <span className="text-base font-bold text-slate-500 font-mono">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Identity */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold">
                            Bạn
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-700 border border-blue-500/30">
                        {item.realm}
                      </span>
                      {item.isBottleneck && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          ⚡ Đang nghênh chiến Thiên Kiếp
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Exp & Stones */}
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Tu Vi Hiện Tại</p>
                    <p className="text-xs font-mono font-bold text-blue-700">
                      {item.currentExp} / {item.maxExp}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase">Linh Thạch</p>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1 justify-end">
                      <Gem className="w-3.5 h-3.5" />
                      <span>{item.spiritStones.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
