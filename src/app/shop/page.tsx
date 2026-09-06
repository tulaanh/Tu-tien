"use client";

import { useState } from "react";
import { useCultivator } from "@/lib/cultivatorContext";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  Gift, 
  Gem, 
  Sparkles, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  Film, 
  Gamepad2, 
  Utensils, 
  Moon, 
  Zap,
  ShoppingBag
} from "lucide-react";
import confetti from "canvas-confetti";

interface Reward {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  stock: number;
  icon: string;
}

interface RedemptionLog {
  id: string;
  reward: {
    title: string;
    category: string;
  };
  cost: number;
  status: string;
  createdAt: string;
}

export default function ShopPage() {
  const { cultivator, refresh } = useCultivator();
  const { data: rewardsData, isLoading, mutate: mutateRewards } = useSWR("/api/rewards", fetcher);
  const rewards: Reward[] = rewardsData?.rewards || [];
  const loading = isLoading && !rewardsData;

  const [activeCategory, setActiveCategory] = useState<"ALL" | "REAL_LIFE" | "PILL">("ALL");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<RedemptionLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openHistory = async () => {
    setShowHistory(true);
    if (!cultivator) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/cultivator?id=${cultivator.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.cultivator?.redemptions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConfirmRedeem = async () => {
    if (!cultivator || !selectedReward) return;

    if (cultivator.spiritStones < selectedReward.cost) {
      setFeedback({
        type: "error",
        message: `Linh Thạch không đủ! Đạo hữu cần thêm ${selectedReward.cost - cultivator.spiritStones} Linh Thạch.`,
      });
      setSelectedReward(null);
      return;
    }

    setIsRedeeming(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          rewardId: selectedReward.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        await refresh();
        await mutateRewards();

        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#34d399", "#fbbf24", "#60a5fa"],
          });
        } catch (e) {}
      } else {
        setFeedback({ type: "error", message: data.error || "Không thể đổi vật phẩm" });
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Lỗi kết nối tới Tàng Bảo Các" });
    } finally {
      setIsRedeeming(false);
      setSelectedReward(null);
    }
  };

  const filteredRewards = rewards.filter((r) => {
    if (activeCategory === "ALL") return true;
    return r.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Gift className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">Tông Môn Khố Phòng</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600">
            Tàng Bảo Các
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Nơi quy đổi Linh Thạch tích lũy từ công sức đời thực thành các phần thưởng thực tế và thần đan diệu dược.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {cultivator ? (
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-2.5 shadow-lg">
              <Gem className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-[10px] text-emerald-700/80 uppercase font-semibold">Túi Càn Khôn</p>
                <p className="text-base font-extrabold text-emerald-700">
                  {cultivator.spiritStones.toLocaleString()} Linh Thạch
                </p>
              </div>
            </div>
          ) : null}

          {cultivator && (
            <button
              onClick={openHistory}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-400 transition"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch Sử Đổi</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-400/60 text-emerald-800"
              : "bg-rose-50 border border-rose-400/60 text-rose-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-slate-500 hover:text-slate-800 ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {[
          { id: "ALL", label: "Tất Cả Bảo Vật" },
          { id: "REAL_LIFE", label: "Quyền Lợi & Quà Đời Thực" },
          { id: "PILL", label: "Đan Dược Đột Phá" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 active:scale-95 ${
              activeCategory === cat.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "bg-white/80 text-slate-500 hover:text-emerald-700 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Đang mở khóa cấm chế Tàng Bảo Các...</p>
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-16 xianxia-card rounded-2xl border border-slate-200 p-6 sm:p-8">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-600">Chưa có vật phẩm trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1">Chưởng môn sẽ sớm bổ sung thêm bảo vật!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredRewards.map((reward) => {
            const canAfford = cultivator ? cultivator.spiritStones >= reward.cost : false;
            const isOutOfStock = reward.stock === 0;

            return (
              <div
                key={reward.id}
                className="rounded-2xl p-4 sm:p-6 xianxia-card border border-emerald-500/20 hover:border-emerald-500/40 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      {reward.category === "PILL" ? "Đan Dược Tu Tiên" : "Quà Đời Thực"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {reward.stock === -1 ? "Vô hạn" : `Còn lại: ${reward.stock}`}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition">
                    {reward.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-extrabold text-base">
                    <Gem className="w-4 h-4 text-emerald-600" />
                    <span>{reward.cost.toLocaleString()} Linh Thạch</span>
                  </div>

                  <button
                    onClick={() => setSelectedReward(reward)}
                    disabled={isOutOfStock || !cultivator}
                    className={`w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center ${
                      isOutOfStock
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : canAfford
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-md shadow-emerald-500/25"
                        : "bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-300"
                    }`}
                  >
                    {isOutOfStock
                      ? "Đã Hết Hàng"
                      : !cultivator
                      ? "Chưa Đăng Nhập"
                      : canAfford
                      ? "Đổi Vật Phẩm"
                      : "Thiếu Linh Thạch"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-2xl bg-white border border-emerald-300/60 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-700 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span>Xác Nhận Đổi Thưởng</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Đạo hữu có chắc chắn muốn dùng Linh Thạch để đổi bảo vật này không?
            </p>

            <div className="my-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 text-sm">{selectedReward.title}</h4>
              <p className="text-slate-600 mt-1">{selectedReward.description}</p>
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Tiêu hao:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Gem className="w-3.5 h-3.5" /> {selectedReward.cost} Linh Thạch
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-slate-500">Linh thạch còn lại:</span>
                <span className="font-bold text-slate-800">
                  {((cultivator?.spiritStones || 0) - selectedReward.cost).toLocaleString()} Linh Thạch
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                disabled={isRedeeming}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition"
              >
                Suy Nghĩ Lại
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                disabled={isRedeeming}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-50 transition"
              >
                {isRedeeming ? "Đang đổi..." : "Xác Nhận Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <span>Lịch Sử Đổi Quà Của Đạo Hữu</span>
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingHistory ? (
                <p className="text-center text-xs text-slate-500 py-6">Đang truy vấn sổ sách...</p>
              ) : historyList.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">
                  Đạo hữu chưa đổi vật phẩm nào tại Tàng Bảo Các.
                </p>
              ) : (
                historyList.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{log.reward.title}</h4>
                      <p className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700">
                        -{log.cost} Linh Thạch
                      </span>
                      <p className="text-[10px] text-slate-500 capitalize">{log.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
