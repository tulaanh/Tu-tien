"use client";

import { useState } from "react";
import { useCultivator } from "@/lib/cultivatorContext";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
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

interface DailyStats {
  totalDaily: number;
  completedDaily: number;
  approvedDaily: number;
  remainingDaily: number;
  progressPercent: number;
  isDailyCompletedToday: boolean;
}

interface StreakInfo {
  streakCount: number;
  bonusPercent: number;
  lastStreakDate: string | null;
  isStreakCompletedToday: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  minRealmLevel: number;
  expReward: number;
  stoneReward: number;
  bonusExp?: number;
  bonusStones?: number;
  effectiveExp?: number;
  effectiveStones?: number;
  difficulty: string;
  icon: string;
  isCompleted?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
  submissionStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
}

export default function QuestsPage() {
  const { cultivator, refresh } = useCultivator();
  const questsUrl = cultivator?.id ? `/api/quests?cultivatorId=${cultivator.id}` : "/api/quests";
  const { data: questsData, isLoading, mutate: mutateQuests } = useSWR(questsUrl, fetcher);

  const quests: Quest[] = questsData?.quests || [];
  const dailyStats: DailyStats | null = questsData?.dailyStats || null;
  const streakInfo: StreakInfo | null = questsData?.streakInfo || null;
  const loading = isLoading && !questsData;

  const [activeTab, setActiveTab] = useState<"ALL" | "DAILY" | "CHALLENGE" | "BREAKTHROUGH">("ALL");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal nộp báo cáo nhiệm vụ
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [reportNote, setReportNote] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const openSubmitModal = (quest: Quest) => {
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
    setSelectedQuest(quest);
    setReportNote("");
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest || !cultivator) return;

    setSubmittingReport(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          questId: selectedQuest.id,
          note: reportNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        setSelectedQuest(null);
        setReportNote("");
        await mutateQuests();
        await refresh();

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#fbbf24", "#38bdf8"],
          });
        } catch (err) {}
      } else {
        setFeedback({ type: "error", message: data.error || "Không thể nộp báo cáo nhiệm vụ" });
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Lỗi kết nối máy chủ" });
    } finally {
      setSubmittingReport(false);
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

      {/* Daily Progress & Streak Widget */}
      {cultivator && dailyStats && (
        <div className="rounded-3xl p-5 sm:p-6 xianxia-card border border-amber-500/30 bg-gradient-to-r from-slate-900 via-[#0d141d] to-[#121b26] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 shrink-0">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    Chuỗi Tu Luyện:{" "}
                    <span className="text-amber-300 font-extrabold font-mono">
                      {streakInfo?.streakCount || 0} Ngày
                    </span>
                  </h3>
                  {(streakInfo?.bonusPercent || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      +{streakInfo?.bonusPercent}% Thưởng Ngày Mai
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(streakInfo?.streakCount || 0) > 0
                    ? `Duy trì hoàn thành nhiệm vụ nhật thường mỗi ngày để tăng +1%/ngày (tối đa +30%)`
                    : `Hoàn thành 100% nhiệm vụ nhật thường hôm nay để bắt đầu chuỗi ngày và nhận +1% thưởng ngày mai!`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Tiến Độ Nhật Thường Hôm Nay
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {dailyStats.completedDaily} / {dailyStats.totalDaily}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({dailyStats.progressPercent}%)
                </span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${dailyStats.progressPercent}%` }}
              />
            </div>

            {/* Notification message about remaining quests */}
            <div className="flex items-center justify-between text-xs pt-1">
              {dailyStats.remainingDaily > 0 ? (
                <p className="text-amber-300/90 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Còn thiếu <strong>{dailyStats.remainingDaily}</strong> nhiệm vụ nhật thường để
                    hoàn thành tu luyện hôm nay!
                  </span>
                </p>
              ) : (
                <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    🎉 Đạo hữu đã hoàn thành trọn vẹn toàn bộ nhiệm vụ nhật thường hôm nay! Chuỗi +1 ngày.
                  </span>
                </p>
              )}

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                +1% thưởng / ngày liên tiếp
              </span>
            </div>
          </div>
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> +{quest.expReward}
                      {(quest.bonusExp || 0) > 0 && (
                        <span className="text-amber-300 font-normal text-[10px]">
                          (+{quest.bonusExp} 🔥)
                        </span>
                      )} Tu Vi
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5" /> +{quest.stoneReward}
                      {(quest.bonusStones || 0) > 0 && (
                        <span className="text-emerald-300 font-normal text-[10px]">
                          (+{quest.bonusStones} 🔥)
                        </span>
                      )} Linh Thạch
                    </span>
                  </div>

                  <div className="w-full sm:w-auto">
                    {isCompleted ? (
                      <div className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 sm:py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã Hoàn Thành</span>
                      </div>
                    ) : quest.isPending ? (
                      <div className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-500/40 px-3 py-2 sm:py-1.5 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Chờ Trưởng Lão Duyệt</span>
                      </div>
                    ) : !meetsRealm ? (
                      <div className="text-xs text-rose-400/80 font-medium italic text-center sm:text-left py-1">
                        Cảnh giới chưa đủ
                      </div>
                    ) : (
                      <button
                        onClick={() => openSubmitModal(quest)}
                        className={`w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center ${
                          quest.isRejected
                            ? "bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900"
                            : "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20"
                        }`}
                      >
                        {quest.isRejected ? "Nộp Lại Báo Cáo" : "Báo Cáo Hoàn Thành"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nộp Báo Cáo Nhiệm Vụ */}
      {selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-2xl bg-[#0e1622] border border-amber-500/30 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scroll className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-amber-300">
                Báo Cáo Hoàn Thành Nhiệm Vụ
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gửi báo cáo lên Trưởng Lão để thẩm định và ban phát Tu Vi, Linh Thạch.
              </p>
            </div>

            {/* Quest Preview */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-3">
              <h4 className="font-bold text-slate-200 text-sm">{selectedQuest.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{selectedQuest.description}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-2.5 pt-2 border-t border-slate-800 font-semibold">
                <span className="text-amber-400">
                  +{selectedQuest.expReward}
                  {(selectedQuest.bonusExp || 0) > 0 && ` (+${selectedQuest.bonusExp} 🔥)`} Tu Vi
                </span>
                <span className="text-emerald-400">
                  +{selectedQuest.stoneReward}
                  {(selectedQuest.bonusStones || 0) > 0 && ` (+${selectedQuest.bonusStones} 🔥)`} Linh Thạch
                </span>
              </div>
            </div>

            {/* Facebook Proof Notice Box */}
            <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs flex items-start space-x-2.5 mb-3.5 shadow-sm">
              <span className="text-base shrink-0">📲</span>
              <p className="leading-relaxed">
                <strong className="text-blue-300">Yêu cầu minh chứng:</strong> Đạo hữu vui lòng <strong>gửi ảnh / video minh chứng qua tin nhắn Facebook</strong> cho Trưởng Lão để được thẩm định và phê chuẩn!
              </p>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú báo cáo (Gửi minh chứng qua Facebook)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đã gửi ảnh / video minh chứng qua Facebook cho Trưởng Lão..."
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedQuest(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 active:scale-95 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
                >
                  {submittingReport ? "Đang gửi..." : "Gửi Phê Duyệt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
