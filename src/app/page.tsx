"use client";

import { useCultivator } from "@/lib/cultivatorContext";
import CultivationCard from "@/components/CultivationCard";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  Scroll, 
  Gift, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Clock, 
  UserPlus, 
  Shield, 
  Swords, 
  Gem,
  Award,
  BookOpen,
  Flame
} from "lucide-react";
import confetti from "canvas-confetti";

interface QuestItem {
  id: string;
  title: string;
  description: string;
  category: string;
  expReward: number;
  stoneReward: number;
  bonusExp?: number;
  bonusStones?: number;
  difficulty: string;
  isCompleted?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  stock: number;
}

export default function HomePage() {
  const { cultivator, loading, login, register, refresh } = useCultivator();
  const [homeAuthTab, setHomeAuthTab] = useState<"login" | "register">("login");
  const [guestName, setGuestName] = useState("");
  const [guestPin, setGuestPin] = useState("");
  const [guestPinConfirm, setGuestPinConfirm] = useState("");
  const [guestAvatar, setGuestAvatar] = useState("sword");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SWR Caching for quests & rewards
  const questsKey = cultivator?.id ? `/api/quests?cultivatorId=${cultivator.id}` : "/api/quests";
  const { data: questsData, mutate: mutateQuests } = useSWR(questsKey, fetcher);
  const { data: rewardsData } = useSWR("/api/rewards", fetcher);

  const dailyQuests: QuestItem[] = (questsData?.quests || []).slice(0, 4);
  const dailyStats = questsData?.dailyStats || null;
  const streakInfo = questsData?.streakInfo || null;
  const rewards: RewardItem[] = (rewardsData?.rewards || []).slice(0, 3);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (homeAuthTab === "register") {
      if (guestPin.trim().length < 4) {
        setLoginError("Mã PIN phải có ít nhất 4 chữ số");
        return;
      }
      if (guestPin !== guestPinConfirm) {
        setLoginError("Mã PIN xác nhận không trùng khớp!");
        return;
      }
    }

    setIsSubmitting(true);
    let res;
    if (homeAuthTab === "login") {
      res = await login(guestName, guestPin);
    } else {
      res = await register(guestName, guestPin, guestAvatar);
    }
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.message || (homeAuthTab === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại"));
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    if (!cultivator) return;
    setCompletingId(questId);
    setToastMessage(null);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          questId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(data.message);
        await mutateQuests();
        await refresh();

        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch (err) {}
      } else {
        setToastMessage(data.error || "Không thể gửi báo cáo");
      }
    } catch (e) {
      setToastMessage("Lỗi kết nối máy chủ");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Đang câu thông thiên địa linh khí...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-medium">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-amber-400/70 hover:text-amber-200 ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* When Cultivator is Logged In */}
      {cultivator ? (
        <>
          <CultivationCard />

          {/* Quick Navigation Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/study"
              className="group p-5 rounded-2xl xianxia-card border border-blue-500/20 hover:border-blue-500/40 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-blue-300 transition">
                    Lộ Trình Tu Luyện
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Học tập tuần tự, vượt tầng nhận thưởng
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/quests"
              className="group p-5 rounded-2xl xianxia-card border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <Scroll className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition">
                    Nhiệm Vụ Đường
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Nhận task ngày, tăng tu vi & thăng cấp
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/shop"
              className="group p-5 rounded-2xl xianxia-card border border-emerald-500/20 hover:border-emerald-500/40 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-emerald-300 transition">
                    Tàng Bảo Các
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dùng Linh Thạch đổi quà thực tế
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/leaderboard"
              className="group p-5 rounded-2xl xianxia-card border border-amber-500/20 hover:border-amber-500/40 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 group-hover:text-purple-300 transition">
                    Bảng Phong Thần
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    So tài cảnh giới cùng các đạo hữu
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Daily Progress & Streak Quick Widget */}
          {cultivator && dailyStats && (
            <div className="p-4 sm:p-5 rounded-2xl xianxia-card border border-amber-500/30 bg-gradient-to-r from-slate-900 via-[#0d141d] to-[#121b26] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm">
                      Chuỗi: <strong className="text-amber-300 font-mono font-black">{streakInfo?.streakCount || 0} Ngày</strong>
                    </span>
                    {(streakInfo?.bonusPercent || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        +{streakInfo?.bonusPercent}% Thưởng Ngày Mai
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dailyStats.remainingDaily > 0
                      ? `Hôm nay còn thiếu ${dailyStats.remainingDaily} nhiệm vụ nhật thường`
                      : `🎉 Đã hoàn thành toàn bộ nhật thường hôm nay!`}
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tiến độ nhật thường:</span>
                  <span className="font-mono font-bold text-amber-300">{dailyStats.completedDaily}/{dailyStats.totalDaily} ({dailyStats.progressPercent}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${dailyStats.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Daily Quests Focus */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scroll className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Nhiệm Vụ Đang Chờ Đạo Hữu
                </h3>
              </div>
              <Link
                href="/quests"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                    quest.isCompleted
                      ? "bg-slate-900/40 border-slate-800 opacity-60"
                      : "xianxia-card border-amber-500/25 hover:border-amber-500/50"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                          {quest.category === "DAILY" ? "Nhật Thường" : quest.category === "BREAKTHROUGH" ? "Đột Phá" : "Thử Thách"}
                        </span>
                        <h4 className="font-bold text-slate-100 text-base">
                          {quest.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {quest.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {quest.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> +{quest.expReward}
                        {(quest.bonusExp || 0) > 0 && (
                          <span className="text-amber-300 font-normal text-[10px]">(+{quest.bonusExp} 🔥)</span>
                        )} Tu Vi
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5" /> +{quest.stoneReward}
                        {(quest.bonusStones || 0) > 0 && (
                          <span className="text-emerald-300 font-normal text-[10px]">(+{quest.bonusStones} 🔥)</span>
                        )} Linh Thạch
                      </span>
                    </div>

                    {quest.isCompleted ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Đã Xong</span>
                      </span>
                    ) : quest.isPending ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chờ Duyệt</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteQuest(quest.id)}
                        disabled={completingId === quest.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                          quest.isRejected
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950"
                        }`}
                      >
                        {completingId === quest.id
                          ? "Đang gửi..."
                          : quest.isRejected
                          ? "Nộp Lại"
                          : "Báo Cáo Xong"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Shop items */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Vật Phẩm Nổi Bật Tại Tàng Bảo Các
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <span>Vào đổi quà</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-5 rounded-xl xianxia-card border border-emerald-500/25 flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
                      {reward.category === "PILL" ? "Đan Dược Đột Phá" : "Quà Đời Thực"}
                    </span>
                    <h4 className="font-bold text-slate-100 text-base">
                      {reward.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {reward.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                      <Gem className="w-4 h-4 text-emerald-400" /> {reward.cost} Linh Thạch
                    </span>
                    <Link
                      href="/shop"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition"
                    >
                      Đổi Ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Guest Hero / Landing View */
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-14 text-center border border-amber-500/30 bg-gradient-to-b from-slate-900/90 via-[#0a1017]/95 to-[#060a0e] shadow-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Gamification Tu Tiên Đời Thực</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 max-w-3xl mx-auto leading-tight">
              Biến Công Việc & Thói Quen Thành Hành Trình Tu Tiên
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Mỗi sáng thức dậy đúng giờ là một lần tụ khí ngưng thần, mỗi bài tập thể dục là một lần luyện thể vạn dặm.
              Tích lũy Tu Vi để phá vỡ bình cảnh, nhận Linh Thạch để đổi lấy những phần thưởng thực tế tại Tàng Bảo Các!
            </p>

            {/* Quick Registration / Login Card */}
            <div className="mt-10 max-w-md mx-auto p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl text-left">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{homeAuthTab === "login" ? "Tiến Vào Động Phủ" : "Khai Mở Tiên Duyên"}</span>
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setHomeAuthTab("login");
                    setLoginError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    homeAuthTab === "login"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHomeAuthTab("register");
                    setLoginError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    homeAuthTab === "register"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Tạo Đạo Hiệu Mới
                </button>
              </div>

              {loginError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleQuickLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Đạo Hiệu (Tên nhân vật / Tên bạn)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hàn Lập, Bạch Tiểu Thuần, Tuấn..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {homeAuthTab === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Xuất Thân Tu Hành Khởi Đầu
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "sword", label: "Kiếm Tu", icon: "🗡️" },
                        { id: "pill", label: "Đan Tu", icon: "🧪" },
                        { id: "scroll", label: "Phù Sư", icon: "📜" },
                        { id: "shield", label: "Thể Tu", icon: "🥋" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setGuestAvatar(item.id)}
                          className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            guestAvatar === item.id
                              ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-base mb-0.5">{item.icon}</span>
                          <span className="text-[10px] font-semibold">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {homeAuthTab === "register" ? "Đặt Mã PIN Bảo Mật (4 - 6 số)" : "Mã PIN Bảo Mật"}
                  </label>
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    placeholder="Ví dụ: 1234"
                    value={guestPin}
                    onChange={(e) => setGuestPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {homeAuthTab === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Xác Nhận Lại Mã PIN
                    </label>
                    <input
                      type="password"
                      required
                      inputMode="numeric"
                      placeholder="Nhập lại mã PIN trên"
                      value={guestPinConfirm}
                      onChange={(e) => setGuestPinConfirm(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
                >
                  {isSubmitting
                    ? "Đang kết nối..."
                    : homeAuthTab === "login"
                    ? "Tiến Vào Động Phủ"
                    : "Khai Mở Tiên Lộ"}
                </button>
              </form>
            </div>
          </div>

          {/* Pillars of Cultivation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl xianxia-card border border-amber-500/20 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Swords className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-amber-300">Cảnh Giới Chuẩn Tiên Hiệp</h3>
              <p className="text-xs text-slate-400 mt-2">
                Từ Phàm Nhân, Luyện Khí 9 Tầng, Trúc Cơ, Kim Đan đến Hóa Thần. Mỗi nấc thang cảnh giới đều có hiệu ứng hào quang và thử thách độ kiếp riêng biệt.
              </p>
            </div>

            <div className="p-6 rounded-2xl xianxia-card border border-blue-500/20 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Scroll className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-blue-300">Nhiệm Vụ Đời Thực</h3>
              <p className="text-xs text-slate-400 mt-2">
                Hoàn thành công việc, học ngoại ngữ, tập gym, giải quyết deadline để tích lũy Tu Vi và Linh Thạch hàng ngày.
              </p>
            </div>

            <div className="p-6 rounded-2xl xianxia-card border border-emerald-500/20 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-emerald-300">Tàng Bảo Các Đổi Thưởng</h3>
              <p className="text-xs text-slate-400 mt-2">
                Dùng Linh Thạch đổi các đặc quyền thực tế như một ly trà sữa, một vé xem phim, giờ chơi game tự do hoặc Đan Dược đột phá cảnh giới.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
