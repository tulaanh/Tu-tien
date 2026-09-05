"use client";

import { useCultivator } from "@/lib/cultivatorContext";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Gem, 
  Sparkles, 
  FileText, 
  Send, 
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import confetti from "canvas-confetti";

interface LessonItem {
  id: string;
  order: number;
  title: string;
  description: string;
  content: string;
  exercise: string;
  expReward: number;
  stoneReward: number;
  minRealmLevel: number;
  status: "LOCKED" | "UNLOCKED" | "PENDING" | "COMPLETED" | "REJECTED";
  note?: string | null;
  progressId?: string | null;
}

export default function StudyPage() {
  const { cultivator } = useCultivator();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [reportNote, setReportNote] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      const url = cultivator?.id
        ? `/api/study?cultivatorId=${cultivator.id}`
        : "/api/study";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [cultivator?.id]);

  const handleOpenLesson = (lesson: LessonItem) => {
    if (lesson.status === "LOCKED") return;
    setSelectedLesson(lesson);
    setReportNote(lesson.note || "");
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultivator) {
      setToastMessage("Vui lòng đăng nhập để nộp bài tu luyện!");
      return;
    }
    if (!selectedLesson) return;

    setSubmittingReport(true);
    try {
      const res = await fetch("/api/study/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          lessonId: selectedLesson.id,
          note: reportNote || "Đã gửi minh chứng tu luyện qua Facebook",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(data.message || "Đã gửi báo cáo tu luyện thành công!");
        setSelectedLesson(null);
        fetchLessons();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        setToastMessage(data.error || "Gửi báo cáo thất bại");
      }
    } catch (e) {
      setToastMessage("Lỗi kết nối máy chủ");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Tính toán tiến độ học tập
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-medium">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-amber-400/80 hover:text-amber-200 ml-4 font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-b from-slate-900 via-[#0a1017] to-[#060a0e] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Giáo Trình Tu Tiên & Học Tập Tuần Tự</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-tight">
            Lộ Trình Tu Luyện Đạo Quả
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Học từng tầng công pháp, thực hành bài tập và nộp minh chứng cho Trưởng Lão thẩm định. 
            Mỗi bài học hoàn thành sẽ khai thông kinh mạch, ban thưởng Tu Vi & Linh Thạch và tự động mở khóa tầng kế tiếp.
          </p>

          {/* Progress bar overview */}
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Tiến Độ Tu Hành:
              </span>
              <span className="font-bold text-amber-300">
                {completedCount} / {lessons.length} Tầng ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Đang nạp lộ trình giáo trình...</p>
          </div>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 xianxia-card rounded-2xl border border-slate-800 p-6">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Chưa có bài học nào trong Lộ Trình</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Trưởng Lão chưa ban bố giáo trình tu luyện. Vui lòng vào trang Quản Trị (Admin) trên localhost để tạo các bài học đầu tiên!
          </p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Vertical road line for desktop */}
          <div className="hidden md:block absolute left-8 top-6 bottom-6 w-0.5 bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-slate-800 pointer-events-none" />

          {lessons.map((lesson) => {
            const isCompleted = lesson.status === "COMPLETED";
            const isPending = lesson.status === "PENDING";
            const isRejected = lesson.status === "REJECTED";
            const isUnlocked = lesson.status === "UNLOCKED";
            const isLocked = lesson.status === "LOCKED";

            return (
              <div
                key={lesson.id}
                onClick={() => !isLocked && handleOpenLesson(lesson)}
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                  isLocked
                    ? "bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed"
                    : isCompleted
                    ? "bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer shadow-sm"
                    : isPending
                    ? "bg-amber-950/20 border-amber-500/50 hover:border-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : isRejected
                    ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-400 cursor-pointer"
                    : "xianxia-card border-amber-500/40 hover:border-amber-400 hover:scale-[1.01] cursor-pointer shadow-lg shadow-amber-950/20"
                }`}
              >
                {/* Left: Step Indicator & Info */}
                <div className="flex items-start space-x-3.5 sm:space-x-4 flex-1">
                  {/* Step Number / Icon Badge */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold text-sm sm:text-base border transition ${
                      isLocked
                        ? "bg-slate-900 border-slate-800 text-slate-500"
                        : isCompleted
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10"
                        : isPending
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                        : isRejected
                        ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                        : "bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : isPending ? (
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <span>T{lesson.order}</span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Tầng {lesson.order}
                      </span>

                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                          ✅ Đã Tinh Thông
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                          ⏳ Đang Chờ Duyệt (Qua FB)
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40">
                          ❌ Cần Bổ Sung & Nộp Lại
                        </span>
                      )}
                      {isUnlocked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🔥 Đang Tu Luyện
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-sm sm:text-base ${isLocked ? "text-slate-500" : "text-slate-100"}`}>
                      {lesson.title}
                    </h3>
                    <p className={`text-xs ${isLocked ? "text-slate-600" : "text-slate-400"} line-clamp-2`}>
                      {lesson.description || "Nội dung tu luyện bí kíp..."}
                    </p>
                  </div>
                </div>

                {/* Right: Rewards & Action */}
                <div className="mt-3 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto shrink-0">
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    <span className={`flex items-center gap-1 ${isLocked ? "text-slate-600" : "text-amber-400"}`}>
                      <Zap className="w-3.5 h-3.5" /> +{lesson.expReward} Tu Vi
                    </span>
                    <span className={`flex items-center gap-1 ${isLocked ? "text-slate-600" : "text-emerald-400"}`}>
                      <Gem className="w-3.5 h-3.5" /> +{lesson.stoneReward} Linh Thạch
                    </span>
                  </div>

                  <div>
                    {isLocked ? (
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900">
                        <Lock className="w-3 h-3" /> Cần qua tầng {lesson.order - 1}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 ${
                          isCompleted
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : isPending
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : isRejected
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-slate-950"
                            : "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20"
                        }`}
                      >
                        <span>{isCompleted ? "Xem Lại Bài" : isPending ? "Xem Báo Cáo" : isRejected ? "Nộp Lại" : "Vào Học & Nộp Bài"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lesson Detail & Submission Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col p-5 sm:p-6 rounded-2xl bg-[#0e1622] border border-amber-500/40 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Tầng {selectedLesson.order} • Lộ Trình Tu Luyện
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                  {selectedLesson.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Rewards Summary */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                <span className="text-slate-400">Phần thưởng vượt tầng:</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> +{selectedLesson.expReward} Tu Vi
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Gem className="w-3.5 h-3.5" /> +{selectedLesson.stoneReward} Linh Thạch
                </span>
              </div>

              {/* Lesson Content / Theory / Video Links */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Nội Dung Bài Học & Tài Liệu:
                </h4>
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedLesson.content || selectedLesson.description || "Chưa có nội dung lý thuyết chi tiết."}
                </div>
              </div>

              {/* Exercise / Practical Homework */}
              {selectedLesson.exercise && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    🎯 Yêu Cầu Thực Hành / Bài Tập:
                  </h4>
                  <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.exercise}
                  </div>
                </div>
              )}

              {/* Facebook Notice Box */}
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs flex items-start space-x-2.5 shadow-sm">
                <span className="text-base shrink-0">📲</span>
                <p className="leading-relaxed">
                  <strong className="text-blue-300">Gửi minh chứng qua Facebook:</strong> Sau khi hoàn thành bài tập, đạo hữu vui lòng <strong>gửi ảnh / video kết quả qua tin nhắn Facebook</strong> cho Trưởng Lão để được thẩm định và mở khóa tầng tiếp theo!
                </p>
              </div>

              {/* Submission Form */}
              {selectedLesson.status === "COMPLETED" ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Đạo hữu đã hoàn thành xuất sắc bài học này!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ghi chú báo cáo (Gửi minh chứng qua Facebook)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Đã làm xong bài tập và gửi ảnh minh chứng qua Facebook cho Trưởng Lão..."
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 active:scale-95 transition"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReport || selectedLesson.status === "PENDING"}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
                    >
                      {submittingReport
                        ? "Đang gửi..."
                        : selectedLesson.status === "PENDING"
                        ? "Đang Chờ Duyệt (FB)"
                        : selectedLesson.status === "REJECTED"
                        ? "Nộp Lại Báo Cáo"
                        : "Gửi Báo Cáo Phê Duyệt"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
