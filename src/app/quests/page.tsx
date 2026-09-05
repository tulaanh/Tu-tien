"use client";

import { useState, useEffect } from "react";
import { useCultivator } from "@/lib/cultivatorContext";
import { 
  Scroll, 
  Zap, 
  Gem, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Filter, 
  Sparkles,
  Flame,
  Award,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  minRealmLevel: number;
  expReward: number;
  stoneReward: number;
  difficulty: string;
  icon: string;
  isCompleted?: boolean;
}

export default function QuestsPage() {
  const { cultivator, refresh } = useCultivator();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "DAILY" | "CHALLENGE" | "BREAKTHROUGH">("ALL");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchQuests = async () => {
    try {
      const url = cultivator?.id ? `/api/quests?cultivatorId=${cultivator.id}` : "/api/quests";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, [cultivator?.id]);

  const handleComplete = async (quest: Quest) => {
    if (!cultivator) {
      setFeedback({ type: "error", message: "Vui lòng đăng nhập Đạo Hiệu trước khi nhận thưởng!" });
      return;
    }

    if (cultivator.realmLevel < quest.minRealmLevel) {
      setFeedback({
        type: "error",
        message: `Đạo hữu chưa đạt cảnh giới yêu cầu để nhận nhiệm vụ này!`,
      });
      return;
    }

    setCompletingId(quest.id);
    setFeedback(null);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          questId: quest.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        await refresh();
        await fetchQuests();

        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.7 },
            colors: ["#fbbf24", "#34d399", "#38bdf8"],
          });
        } catch (err) {}
      } else {
        setFeedback({ type: "error", message: data.error || "Không thể hoàn thành nhiệm vụ" });
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Lỗi kết nối máy chủ" });
    } finally {
      setCompletingId(null);
    }
  };

  const filteredQuests = quests.filter((q) => {
    if (activeTab === "ALL") return true;
    return q.category === activeTab;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Dễ":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";
      case "Trung bình":
        return "bg-blue-950/60 text-blue-300 border-blue-500/30";
      case "Khó":
        return "bg-amber-950/60 text-amber-300 border-amber-500/30";
      case "Địa ngục":
        return "bg-rose-950/60 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <Scroll className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">Tông Môn Chấp Sự</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
            Nhiệm Vụ Đường
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Hoàn thành các việc cần làm ngoài đời thực để nhận Tu Vi bồi dưỡng linh căn và Linh Thạch đổi quà.
          </p>
        </div>

        {cultivator && (
          <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Cảnh Giới Hiện Tại</p>
              <p className="text-sm font-bold text-amber-300">{cultivator.realm}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Linh Thạch</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" /> {cultivator.spiritStones}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between animate-fade-in ${
            feedback.type === "success"
              ? "bg-amber-950/70 border border-amber-500/50 text-amber-200"
              : "bg-rose-950/70 border border-rose-500/50 text-rose-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-slate-400 hover:text-slate-200 ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {[
          { id: "ALL", label: "Tất Cả Nhiệm Vụ" },
          { id: "DAILY", label: "Nhật Thường (Hàng Ngày)" },
          { id: "CHALLENGE", label: "Thử Thách (Dự Án)" },
          { id: "BREAKTHROUGH", label: "Đột Phá (Thiên Kiếp)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 active:scale-95 ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Đang kiểm tra lệnh bài nhiệm vụ...</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="text-center py-16 xianxia-card rounded-2xl border border-slate-800 p-6 sm:p-8">
          <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Không có nhiệm vụ trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1">
            Chưởng môn nhân sẽ sớm ban hành các nhiệm vụ mới trên bảng!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredQuests.map((quest) => {
            const isCompleted = quest.isCompleted;
            const meetsRealm = !cultivator || cultivator.realmLevel >= quest.minRealmLevel;

            return (
              <div
                key={quest.id}
                className={`rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-200 ${
                  isCompleted
                    ? "bg-slate-950/40 border-slate-800/80 opacity-60"
                    : "xianxia-card border-amber-500/20 hover:border-amber-500/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {quest.category === "DAILY"
                          ? "Nhật Thường"
                          : quest.category === "BREAKTHROUGH"
                          ? "⚡ Đột Phá"
                          : "Thử Thách"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(
                          quest.difficulty
                        )}`}
                      >
                        {quest.difficulty}
                      </span>
                    </div>

                    {quest.minRealmLevel > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Yêu cầu: Lv.{quest.minRealmLevel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-2">
                    {quest.title}
                  </h3>

                  <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> +{quest.expReward} Tu Vi
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5" /> +{quest.stoneReward} Linh Thạch
                    </span>
                  </div>

                  <div className="w-full sm:w-auto">
                    {isCompleted ? (
                      <div className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 sm:py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã Hoàn Thành</span>
                      </div>
                    ) : !meetsRealm ? (
                      <div className="text-xs text-rose-400/80 font-medium italic text-center sm:text-left py-1">
                        Cảnh giới chưa đủ
                      </div>
                    ) : (
                      <button
                        onClick={() => handleComplete(quest)}
                        disabled={completingId === quest.id}
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50 flex items-center justify-center"
                      >
                        {completingId === quest.id ? "Đang ghi nhận..." : "Hoàn Thành & Nhận Thưởng"}
                      </button>
                    )}
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
