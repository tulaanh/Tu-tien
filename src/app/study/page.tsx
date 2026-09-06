"use client";

import { useCultivator } from "@/lib/cultivatorContext";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  GraduationCap, 
  Sparkles, 
  Send, 
  Award, 
  Zap, 
  Gem, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  BookOpen
} from "lucide-react";
import confetti from "canvas-confetti";
import { EXAM_TYPE_CONFIG, calculateExamReward, ExamType } from "@/lib/studyConfig";

interface ExamReportItem {
  id: string;
  subject: string;
  examType: ExamType;
  score: number;
  expReward: number;
  stoneReward: number;
  note: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
}

const COMMON_SUBJECTS = [
  "Toán Học",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Ngữ Văn",
  "Lập Trình",
  "Lịch Sử",
  "Sinh Học",
  "Tin Học",
  "Triết Học",
];

export default function StudyPage() {
  const { cultivator } = useCultivator();
  const studyKey = cultivator?.id ? `/api/study?cultivatorId=${cultivator.id}` : null;
  const { data: studyData, isLoading, mutate: mutateReports } = useSWR(studyKey, fetcher);

  const reports: ExamReportItem[] = studyData?.reports || [];
  const stats = studyData?.stats || {
    totalReports: 0,
    approvedCount: 0,
    totalExpEarned: 0,
    totalStonesEarned: 0,
  };
  const loading = Boolean(cultivator?.id && isLoading && !studyData);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState<ExamType>("REGULAR");
  const [score, setScore] = useState("9.0");
  const [note, setNote] = useState("");

  const numScore = parseFloat(score) || 0;
  const rewardEstimate = calculateExamReward(numScore, examType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultivator) {
      setToastMessage("Vui lòng đăng nhập để gửi báo cáo điểm!");
      return;
    }

    if (!subject.trim()) {
      setToastMessage("Vui lòng nhập tên môn học!");
      return;
    }

    if (numScore < 8.0 || numScore > 10.0) {
      setToastMessage("Chỉ áp dụng đổi thưởng cho bài thi đạt từ 8.0 đến 10.0 điểm!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultivatorId: cultivator.id,
          subject: subject.trim(),
          examType,
          score: numScore,
          note: note.trim() || "Đã gửi ảnh bài kiểm tra qua Facebook cho Trưởng Lão",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage(data.message || "Đã gửi báo cáo điểm thành công!");
        setSubject("");
        setNote("");
        mutateReports();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setToastMessage(data.error || "Gửi báo cáo thất bại");
      }
    } catch (e) {
      setToastMessage("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-400/60 text-blue-800 text-sm flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="font-medium">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-blue-500/80 hover:text-blue-800 ml-4 font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-blue-500/30 bg-gradient-to-b from-white via-[#f2f7fd] to-[#e8f0fa] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-700 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Tu Luyện Đạo Quả & Đổi Điểm Thưởng</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 tracking-tight">
            Văn Đạo Tu Thân • Báo Điểm Nhận Thưởng
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Học tập cũng là một nhánh của Tu Tiên! Mọi bài kiểm tra đạt điểm cao (từ 8 đến 10) 
            đều được Tông Môn ban phát Tu Vi & Linh Thạch tương ứng. 
            Kiểm tra thường xuyên (x1), Giữa kỳ (x2) và Cuối kỳ (x3).
          </p>

          {/* Stats overview */}
          {cultivator && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-2xl bg-white/80 border border-blue-500/20">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Bài Đã Duyệt</span>
                <span className="text-base sm:text-lg font-bold text-blue-700">
                  {stats.approvedCount} / {stats.totalReports}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-blue-500/20">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Tu Vi Tích Lũy</span>
                <span className="text-base sm:text-lg font-bold text-blue-600 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> +{stats.totalExpEarned}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-blue-500/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Linh Thạch Tích Lũy</span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 flex items-center gap-1">
                  <Gem className="w-4 h-4" /> +{stats.totalStonesEarned}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form + Reward Rules Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 sm:p-7 rounded-3xl xianxia-card border border-blue-500/30 shadow-xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Kê Khai Điểm Số Bài Kiểm Tra
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập kết quả bài thi để quy đổi linh khí tu vi.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tên Môn Học
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Toán Cao Cấp, Tiếng Anh, Lập Trình Web..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />

                {/* Quick Subject Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_SUBJECTS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubject(sub)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        subject === sub
                          ? "bg-blue-600/10 border-blue-500/50 text-blue-700 font-semibold"
                          : "bg-white border-slate-200 text-slate-500 hover:text-blue-700"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Phân Loại Bài Kiểm Tra & Hệ Số Thưởng
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(Object.keys(EXAM_TYPE_CONFIG) as ExamType[]).map((key) => {
                    const cfg = EXAM_TYPE_CONFIG[key];
                    const isSelected = examType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setExamType(key)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600/10 border-blue-600 shadow-md shadow-blue-600/10"
                            : "bg-white/60 border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            Hệ Số x{cfg.multiplier}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800">{cfg.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{cfg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Điểm Số Đạt Được (Thang điểm 8.0 - 10.0)
                  </label>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {numScore.toFixed(1)} Điểm
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-2">
                  {["8.0", "8.5", "9.0", "9.5", "10.0"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScore(s)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        score === s
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {s} đ
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  step="0.1"
                  min="8.0"
                  max="10.0"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Hoặc nhập số điểm tùy ý (8.0 - 10.0)..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              {/* Real-time Reward Preview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Ước Tính Thưởng Nhận Được:
                  </span>
                  <div className="flex items-center space-x-3 mt-1 text-sm font-bold">
                    <span className="text-blue-600 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> +{rewardEstimate.expReward} Tu Vi
                    </span>
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Gem className="w-4 h-4" /> +{rewardEstimate.stoneReward} Linh Thạch
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-blue-700/80 px-2.5 py-1 rounded-xl bg-white border border-blue-500/20">
                  Hệ số x{EXAM_TYPE_CONFIG[examType]?.multiplier}
                </span>
              </div>

              {/* Facebook Notice Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-400/60 text-blue-800 text-xs flex items-start space-x-2.5 shadow-sm">
                <span className="text-base shrink-0">📲</span>
                <p className="leading-relaxed">
                  <strong className="text-blue-700">Minh chứng bài kiểm tra:</strong> Sau khi bấm gửi, Đạo hữu vui lòng <strong>chụp ảnh bài thi / bảng điểm và gửi qua tin nhắn Facebook</strong> cho Trưởng Lão để được thẩm định và phê chuẩn!
                </p>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Ghi chú báo cáo (Gửi qua Facebook)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đã gửi ảnh bài kiểm tra 1 tiết môn Toán 9.5đ qua tin nhắn Facebook cho Trưởng Lão..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !rewardEstimate.eligible}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:brightness-110 shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50 transition"
              >
                {submitting ? "Đang gửi báo cáo..." : "Gửi Báo Cáo Phê Duyệt"}
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 cols: Reward Rules & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rules Card */}
          <div className="p-5 sm:p-6 rounded-3xl xianxia-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span>Quy Định Thưởng Bài Kiểm Tra</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">Điểm 8.0 - 8.4</span>
                  <span className="text-[10px] text-slate-500">Khởi đầu giỏi</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600 block">+50 ~ 70 Tu Vi</span>
                  <span className="text-[10px] text-slate-500">0 Linh Thạch</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-700 block">Điểm 8.5 - 8.9</span>
                  <span className="text-[10px] text-slate-500">Xuất sắc cận 9</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600 block">+75 ~ 95 Tu Vi</span>
                  <span className="font-bold text-emerald-700 text-[11px]">+5 ~ 9 Linh Thạch</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-700 block">Điểm 9.0 - 9.4</span>
                  <span className="text-[10px] text-slate-500">Tuyệt hảo xuất chúng</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600 block">+110 ~ 150 Tu Vi</span>
                  <span className="font-bold text-emerald-700 text-[11px]">+10 ~ 16 Linh Thạch</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-amber-400/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-600 block">Điểm 9.5 - 9.9</span>
                  <span className="text-[10px] text-amber-600/80">Cận kề tuyệt đối</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-700 block">+160 ~ 192 Tu Vi</span>
                  <span className="font-bold text-emerald-700 text-[11px]">+18 ~ 22 Linh Thạch</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-400/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-600 block">Điểm 10.0 Tuyệt Đối</span>
                  <span className="text-[10px] text-amber-600/80">Đỉnh phong thiên tài</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-700 block">+200 Tu Vi</span>
                  <span className="font-bold text-emerald-700 text-[11px]">+25 Linh Thạch</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-500">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Thường xuyên (15p, 1 tiết): <strong>Hệ số x1</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Giữa kỳ: <strong>Hệ số x2</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Cuối kỳ / Đồ án: <strong>Hệ số x3</strong></span>
              </p>
            </div>
          </div>

          {/* History List */}
          <div className="p-5 sm:p-6 rounded-3xl xianxia-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>Lịch Sử Báo Điểm Của Đạo Hữu</span>
            </h3>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">Đang tải lịch sử...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Chưa có báo cáo điểm nào được gửi.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {reports.map((r) => {
                  const isPending = r.status === "PENDING";
                  const isApproved = r.status === "APPROVED";
                  const isRejected = r.status === "REJECTED";

                  return (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{r.subject}</span>
                          <span className="font-mono font-bold text-blue-700">
                            {r.score.toFixed(1)}đ
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {EXAM_TYPE_CONFIG[r.examType]?.label} • {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>

                      <div className="text-right">
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                            ⏳ Chờ Duyệt
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            ✅ +{r.expReward} EXP
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                            ❌ Bác Bỏ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
