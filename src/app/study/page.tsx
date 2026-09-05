"use client";

import { useCultivator } from "@/lib/cultivatorContext";
import { useState, useEffect } from "react";
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
  const [reports, setReports] = useState<ExamReportItem[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    approvedCount: 0,
    totalExpEarned: 0,
    totalStonesEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState<ExamType>("REGULAR");
  const [score, setScore] = useState("9.0");
  const [note, setNote] = useState("");

  const numScore = parseFloat(score) || 0;
  const rewardEstimate = calculateExamReward(numScore, examType);

  const fetchReports = async () => {
    if (!cultivator?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/study?cultivatorId=${cultivator.id}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [cultivator?.id]);

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
        fetchReports();
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
            <span>Tu Luyện Đạo Quả & Đổi Điểm Thưởng</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 tracking-tight">
            Văn Đạo Tu Thân • Báo Điểm Nhận Thưởng
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Học tập cũng là một nhánh của Tu Tiên! Mọi bài kiểm tra đạt điểm cao (từ 8 đến 10) 
            đều được Tông Môn ban phát Tu Vi & Linh Thạch tương ứng. 
            Kiểm tra thường xuyên (x1), Giữa kỳ (x2) và Cuối kỳ (x3).
          </p>

          {/* Stats overview */}
          {cultivator && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bài Đã Duyệt</span>
                <span className="text-base sm:text-lg font-bold text-amber-300">
                  {stats.approvedCount} / {stats.totalReports}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tu Vi Tích Lũy</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> +{stats.totalExpEarned}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Linh Thạch Tích Lũy</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1">
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
          <div className="p-5 sm:p-7 rounded-3xl xianxia-card border border-amber-500/30 shadow-xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  Kê Khai Điểm Số Bài Kiểm Tra
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập kết quả bài thi để quy đổi linh khí tu vi.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên Môn Học
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Toán Cao Cấp, Tiếng Anh, Lập Trình Web..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
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
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                            ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                            isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                          }`}>
                            Hệ Số x{cfg.multiplier}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100">{cfg.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{cfg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Score Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Điểm Số Đạt Được (Thang điểm 8.0 - 10.0)
                  </label>
                  <span className="text-xs font-bold text-amber-300 font-mono">
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
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
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
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Real-time Reward Preview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-emerald-950/30 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Ước Tính Thưởng Nhận Được:
                  </span>
                  <div className="flex items-center space-x-3 mt-1 text-sm font-bold">
                    <span className="text-amber-400 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> +{rewardEstimate.expReward} Tu Vi
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Gem className="w-4 h-4" /> +{rewardEstimate.stoneReward} Linh Thạch
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-amber-300/80 px-2.5 py-1 rounded-xl bg-slate-900 border border-amber-500/20">
                  Hệ số x{EXAM_TYPE_CONFIG[examType]?.multiplier}
                </span>
              </div>

              {/* Facebook Notice Box */}
              <div className="p-3.5 rounded-2xl bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs flex items-start space-x-2.5 shadow-sm">
                <span className="text-base shrink-0">📲</span>
                <p className="leading-relaxed">
                  <strong className="text-blue-300">Minh chứng bài kiểm tra:</strong> Sau khi bấm gửi, Đạo hữu vui lòng <strong>chụp ảnh bài thi / bảng điểm và gửi qua tin nhắn Facebook</strong> cho Trưởng Lão để được thẩm định và phê chuẩn!
                </p>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ghi chú báo cáo (Gửi qua Facebook)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đã gửi ảnh bài kiểm tra 1 tiết môn Toán 9.5đ qua tin nhắn Facebook cho Trưởng Lão..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !rewardEstimate.eligible}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
              >
                {submitting ? "Đang gửi báo cáo..." : "Gửi Báo Cáo Phê Duyệt"}
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 cols: Reward Rules & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rules Card */}
          <div className="p-5 sm:p-6 rounded-3xl xianxia-card border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Quy Định Thưởng Bài Kiểm Tra</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Điểm 8.0 - 8.9</span>
                  <span className="text-[11px] text-slate-400">Đạt yêu cầu xuất sắc</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-400">+50 Tu Vi</span>
                  <span className="text-[10px] text-slate-500 block">0 Linh Thạch</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300 block">Điểm 9.0 - 9.9</span>
                  <span className="text-[11px] text-slate-400">Tuyệt hảo xuất chúng</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-400">+100 Tu Vi</span>
                  <span className="font-bold text-emerald-400 block">+10 Linh Thạch</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-yellow-950/30 border border-amber-400/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-yellow-300 block">Điểm 10.0 Tuyệt Đối</span>
                  <span className="text-[11px] text-amber-400/80">Đỉnh phong thiên tài</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-300">+200 Tu Vi</span>
                  <span className="font-bold text-emerald-300 block">+25 Linh Thạch</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
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
          <div className="p-5 sm:p-6 rounded-3xl xianxia-card border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>Lịch Sử Báo Điểm Của Đạo Hữu</span>
            </h3>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Đang tải lịch sử...</div>
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
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-200">{r.subject}</span>
                          <span className="font-mono font-bold text-amber-300">
                            {r.score.toFixed(1)}đ
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {EXAM_TYPE_CONFIG[r.examType]?.label} • {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>

                      <div className="text-right">
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 animate-pulse">
                            ⏳ Chờ Duyệt
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                            ✅ +{r.expReward} EXP
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30">
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
