"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  Gift, 
  Scroll, 
  KeyRound, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2,
  Users,
  Lock,
  Zap,
  Gem,
  Clock,
  X,
  MessageSquare,
  BookOpen
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  minRealmLevel: number;
  expReward: number;
  stoneReward: number;
  difficulty: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  stock: number;
}


interface RedemptionItem {
  id: string;
  cultivator: {
    name: string;
    realm: string;
  };
  reward: {
    title: string;
    category: string;
  };
  cost: number;
  status: string;
  createdAt: string;
}

interface SubmissionItem {
  id: string;
  type: "QUEST" | "EXAM";
  cultivator: {
    id: string;
    name: string;
    realm: string;
    spiritStones: number;
    avatar: string;
  };
  quest?: {
    id: string;
    title: string;
    category: string;
    expReward: number;
    stoneReward: number;
  };
  exam?: {
    id: string;
    subject: string;
    examType: string;
    score: number;
    expReward: number;
    stoneReward: number;
  };
  status: string;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
}

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      setIsLocalhost(host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0");
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "QUESTS" | "REWARDS" | "REDEMPTIONS">("SUBMISSIONS");

  // Data states
  const [quests, setQuests] = useState<Quest[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState<"ALL" | "QUEST" | "EXAM">("ALL");
  const [processingSubmissionId, setProcessingSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Quest Form Modal
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [questForm, setQuestForm] = useState({
    title: "",
    description: "",
    category: "DAILY",
    expReward: 30,
    stoneReward: 15,
    difficulty: "Trung bình",
    minRealmLevel: 0,
  });

  // Reward Form Modal
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    category: "REAL_LIFE",
    cost: 50,
    stock: -1,
  });

  // Check saved admin session
  useEffect(() => {
    const saved = localStorage.getItem("tien_gioi_admin_auth");
    if (saved === "authenticated") {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("tien_gioi_admin_auth", "authenticated");
        fetchAdminData();
      } else {
        setAuthError("Mã Chưởng Môn không chính xác!");
      }
    } catch (e) {
      setAuthError("Lỗi kết nối xác thực");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("tien_gioi_admin_auth");
    setIsAuthenticated(false);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [qRes, rRes, redRes, subRes] = await Promise.all([
        fetch("/api/quests"),
        fetch("/api/rewards"),
        fetch("/api/admin/redemptions"),
        fetch("/api/admin/submissions"),
      ]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuests(qData.quests || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRewards(rData.rewards || []);
      }
      if (redRes.ok) {
        const redData = await redRes.json();
        setRedemptions(redData.redemptions || []);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        const allSubs = [
          ...(subData.submissions || []),
          ...(subData.examSubmissions || []),
        ];
        allSubs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSubmissions(allSubs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Submissions Actions
  const handleSubmissionAction = async (id: string, action: "APPROVE" | "REJECT" | "DELETE", type: "QUEST" | "EXAM") => {
    if (action === "DELETE" && !confirm("Đạo hữu có chắc muốn xóa bản ghi báo cáo này?")) return;
    setProcessingSubmissionId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: "success", message: data.message || "Thao tác thành công!" });
        fetchAdminData();
      } else {
        setToast({ type: "error", message: data.error || "Thao tác thất bại" });
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi kết nối máy chủ" });
    } finally {
      setProcessingSubmissionId(null);
    }
  };


  // Quest Actions
  const openCreateQuest = () => {
    setEditingQuest(null);
    setQuestForm({
      title: "",
      description: "",
      category: "DAILY",
      expReward: 30,
      stoneReward: 15,
      difficulty: "Trung bình",
      minRealmLevel: 0,
    });
    setShowQuestModal(true);
  };

  const openEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setQuestForm({
      title: quest.title,
      description: quest.description,
      category: quest.category,
      expReward: quest.expReward,
      stoneReward: quest.stoneReward,
      difficulty: quest.difficulty,
      minRealmLevel: quest.minRealmLevel,
    });
    setShowQuestModal(true);
  };

  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingQuest;
      const res = await fetch("/api/quests", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingQuest.id, ...questForm } : questForm),
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: isEdit ? "Đã cập nhật nhiệm vụ thành công!" : "Đã ban bố nhiệm vụ mới!",
        });
        setShowQuestModal(false);
        fetchAdminData();
      } else {
        setToast({ type: "error", message: "Thao tác nhiệm vụ thất bại" });
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi kết nối máy chủ" });
    }
  };

  const handleDeleteQuest = async (id: string) => {
    if (!confirm("Đạo hữu có chắc muốn xóa nhiệm vụ này khỏi tông môn?")) return;
    try {
      const res = await fetch(`/api/quests?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: "success", message: data.message || "Đã xóa nhiệm vụ thành công" });
        fetchAdminData();
      } else {
        setToast({ type: "error", message: data.error || "Lỗi khi xóa nhiệm vụ" });
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi kết nối khi xóa nhiệm vụ" });
    }
  };

  // Reward Actions
  const openCreateReward = () => {
    setEditingReward(null);
    setRewardForm({
      title: "",
      description: "",
      category: "REAL_LIFE",
      cost: 50,
      stock: -1,
    });
    setShowRewardModal(true);
  };

  const openEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setRewardForm({
      title: reward.title,
      description: reward.description,
      category: reward.category,
      cost: reward.cost,
      stock: reward.stock,
    });
    setShowRewardModal(true);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingReward;
      const res = await fetch("/api/rewards", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingReward.id, ...rewardForm } : rewardForm),
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: isEdit ? "Đã cập nhật vật phẩm Tàng Bảo Các!" : "Đã nhập thêm bảo vật mới!",
        });
        setShowRewardModal(false);
        fetchAdminData();
      } else {
        setToast({ type: "error", message: "Thao tác vật phẩm thất bại" });
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi kết nối máy chủ" });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm("Đạo hữu có chắc muốn gỡ vật phẩm này khỏi Tàng Bảo Các?")) return;
    try {
      const res = await fetch(`/api/rewards?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: "success", message: data.message || "Đã gỡ bỏ vật phẩm thành công" });
        fetchAdminData();
      } else {
        setToast({ type: "error", message: data.error || "Lỗi khi xóa vật phẩm" });
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi kết nối khi xóa vật phẩm" });
    }
  };

  // Fulfill Redemption
  const handleFulfillRedemption = async (id: string) => {
    try {
      const res = await fetch("/api/admin/redemptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "USED" }),
      });
      if (res.ok) {
        setToast({ type: "success", message: "Đã đánh dấu hoàn tất trao quà ngoài đời!" });
        fetchAdminData();
      }
    } catch (e) {
      setToast({ type: "error", message: "Lỗi cập nhật trạng thái" });
    }
  };

  // If accessing from public internet / not localhost
  if (!isLocalhost) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="p-8 rounded-3xl xianxia-card border border-rose-500/40 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-600">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-rose-700">
            Cấm Địa Tông Môn (Bản Địa Chỉ Giới)
          </h1>
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
            Khu vực Quản Trị Tông Môn chỉ có thể mở trực tiếp từ máy tính Chưởng Môn (chạy trên <strong>Localhost</strong>: <span className="text-blue-700">http://localhost:3000</span>) để bảo vệ an toàn tối cao cho Tông Môn!
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 transition"
            >
              Quay Về Động Phủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated as admin yet
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="p-8 rounded-3xl xianxia-card border border-blue-500/40 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-blue-800">
            Quản Trị Tông Môn (Admin)
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Nhập Mã Chưởng Môn (Admin PIN) để toàn quyền cập nhật nhiệm vụ, phần thưởng và giám sát tiến độ tu luyện.
          </p>

          <div className="mt-2 text-[11px] text-blue-700/80 bg-blue-50 py-1 px-2 rounded border border-blue-500/20 inline-block">
            Mã mặc định khởi tạo: <strong>8888</strong> (hoặc <strong>admin123</strong>)
          </div>

          {authError && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Nhập mã Chưởng Môn..."
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:brightness-110 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition"
            >
              {isVerifying ? "Đang xác thực..." : "Khai Mở Đại Trận Quản Trị"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="rounded-2xl p-6 md:p-8 xianxia-card border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-1">
            <ShieldAlert className="w-6 h-6" />
            <span className="text-xs font-semibold uppercase tracking-wider">Chưởng Môn Đại Điện</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700">
            Quản Trị Tông Môn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toàn quyền khởi tạo nhiệm vụ, thiết lập phần thưởng đời thực và giám sát tu luyện.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-600 hover:text-blue-700 transition"
          >
            Làm Mới Dữ Liệu
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 transition"
          >
            Thoát Admin
          </button>
        </div>
      </div>

      {/* Toast message */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            toast.type === "success"
              ? "bg-blue-50 border border-blue-400/60 text-blue-800"
              : "bg-rose-50 border border-rose-400/60 text-rose-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs text-slate-500 hover:text-slate-800 ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "SUBMISSIONS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-500 hover:text-blue-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Duyệt Báo Cáo</span>
          {submissions.filter((s) => s.status === "PENDING").length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-black animate-pulse shadow">
              {submissions.filter((s) => s.status === "PENDING").length}
            </span>
          )}
        </button>


        <button
          onClick={() => setActiveTab("QUESTS")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "QUESTS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-500 hover:text-blue-700"
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>Nhiệm Vụ Thường ({quests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REWARDS")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "REWARDS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-500 hover:text-blue-700"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Tàng Bảo Các ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REDEMPTIONS")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === "REDEMPTIONS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
              : "text-slate-500 hover:text-blue-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Duyệt Đổi Quà ({redemptions.length})</span>
        </button>
      </div>

      {/* TAB 0: DUYỆT BÁO CÁO (Nhiệm vụ & Bài học tu luyện) */}
      {activeTab === "SUBMISSIONS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Thẩm Định Báo Cáo Tu Luyện & Nhiệm Vụ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra minh chứng Facebook và phê duyệt để cấp Tu Vi & Linh Thạch (hoặc mở khóa tầng tiếp theo).
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                {[
                  { id: "ALL", label: "Tất cả" },
                  { id: "PENDING", label: `Chờ duyệt (${submissions.filter((s) => s.status === "PENDING").length})` },
                  { id: "APPROVED", label: "Đã duyệt" },
                  { id: "REJECTED", label: "Đã bác bỏ" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSubmissionFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      submissionFilter === f.id
                        ? "bg-blue-600/10 text-blue-700 border border-blue-500/30"
                        : "text-slate-500 hover:text-blue-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                {[
                  { id: "ALL", label: "Tất cả loại" },
                  { id: "EXAM", label: "Điểm Thi (Tu Luyện)" },
                  { id: "QUEST", label: "Nhiệm vụ thường" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSubmissionTypeFilter(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      submissionTypeFilter === t.id
                        ? "bg-blue-600/10 text-blue-700 border border-blue-500/30"
                        : "text-slate-500 hover:text-blue-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {submissions.filter((s) => 
            (submissionFilter === "ALL" || s.status === submissionFilter) &&
            (submissionTypeFilter === "ALL" || s.type === submissionTypeFilter)
          ).length === 0 ? (
            <div className="text-center py-12 xianxia-card rounded-2xl border border-slate-200 p-6">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Không có báo cáo nào trong mục này</p>
              <p className="text-xs text-slate-500 mt-1">
                Khi Đạo Hữu bấm nộp báo cáo điểm thi hoặc nhiệm vụ, báo cáo sẽ hiện tại đây để bạn phê chuẩn!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions
                .filter((s) => 
                  (submissionFilter === "ALL" || s.status === submissionFilter) &&
                  (submissionTypeFilter === "ALL" || s.type === submissionTypeFilter)
                )
                .map((sub) => {
                  const isPending = sub.status === "PENDING";
                  const isApproved = sub.status === "APPROVED";
                  const isRejected = sub.status === "REJECTED";
                  const isExam = sub.type === "EXAM";

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isPending
                          ? "xianxia-card border-blue-500/40 bg-blue-50/60 shadow-[0_0_15px_rgba(37,99,235,0.08)]"
                          : isApproved
                          ? "bg-slate-100/60 border-slate-200 opacity-80"
                          : "bg-rose-50/60 border-rose-300/40 opacity-75"
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        {/* Header: Cultivator + Time */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm sm:text-base">
                            👤 {sub.cultivator?.name || "Đạo Hữu Vô Danh"}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({sub.cultivator?.realm || "Phàm Nhân"})
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isExam 
                              ? "bg-blue-600/10 text-blue-700 border-blue-500/30"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}>
                            {isExam ? "🎓 BÁO ĐIỂM THI (TU LUYỆN)" : "📜 NHIỆM VỤ THƯỜNG"}
                          </span>

                          <span className="text-[11px] text-slate-500 ml-auto md:ml-0">
                            🕒 {new Date(sub.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {/* Exam or Quest Info */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {isExam ? (
                            <>
                              <span className="font-semibold text-blue-700">
                                📚 Môn: {sub.exam?.subject || "Kiểm tra"}
                              </span>
                              <span className="font-bold font-mono text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-500/30">
                                ⭐ {sub.exam?.score?.toFixed(1)} Điểm ({sub.exam?.examType === "FINAL" ? "Cuối kỳ x3" : sub.exam?.examType === "MIDTERM" ? "Giữa kỳ x2" : "Thường xuyên x1"})
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-amber-700">
                              📜 {sub.quest?.title || "Nhiệm vụ"}
                            </span>
                          )}

                          <span className="text-blue-600 font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> +{isExam ? sub.exam?.expReward : sub.quest?.expReward} Tu Vi
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Gem className="w-3.5 h-3.5" /> +{isExam ? sub.exam?.stoneReward : sub.quest?.stoneReward} Linh Thạch
                          </span>
                        </div>

                        {/* Note from user */}
                        {sub.note && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-bold text-blue-600/80 uppercase block">
                                Minh chứng tu luyện (Gửi qua Facebook):
                              </span>
                              <p className="mt-0.5 italic text-slate-700">{sub.note}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleSubmissionAction(sub.id, "REJECT", sub.type)}
                              disabled={processingSubmissionId === sub.id}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 transition disabled:opacity-50"
                            >
                              Bác Bỏ
                            </button>

                            <button
                              onClick={() => handleSubmissionAction(sub.id, "APPROVE", sub.type)}
                              disabled={processingSubmissionId === sub.id}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-md shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Phê Chuẩn (Duyệt)</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã Phê Chuẩn</span>
                            </span>
                            <button
                              onClick={() => handleSubmissionAction(sub.id, "DELETE", sub.type)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Xóa bản ghi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              <span>Đã Bác Bỏ</span>
                            </span>
                            <button
                              onClick={() => handleSubmissionAction(sub.id, "APPROVE", sub.type)}
                              disabled={processingSubmissionId === sub.id}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-blue-700 hover:bg-slate-200 transition"
                            >
                              Duyệt Lại
                            </button>
                            <button
                              onClick={() => handleSubmissionAction(sub.id, "DELETE", sub.type)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Xóa bản ghi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}


      {/* TAB 2: Quản lý Nhiệm vụ */}
      {activeTab === "QUESTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Danh Sách Nhiệm Vụ Đường</h3>
            <button
              onClick={openCreateQuest}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:brightness-110 shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ban Bố Nhiệm Vụ Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl xianxia-card border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/10 text-blue-700 border border-blue-500/30">
                      {q.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{q.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{q.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-blue-600 font-bold">+{q.expReward} Tu Vi</span>
                    <span className="text-emerald-700 font-bold">+{q.stoneReward} Linh Thạch</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditQuest(q)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Sửa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuest(q.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Quản lý Quà Tàng Bảo Các */}
      {activeTab === "REWARDS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Vật Phẩm Tàng Bảo Các</h3>
            <button
              onClick={openCreateReward}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-md shadow-emerald-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bảo Vật Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl xianxia-card border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      {r.category === "PILL" ? "Đan Dược" : "Quà Đời Thực"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {r.stock === -1 ? "Vô hạn" : `Còn: ${r.stock}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{r.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                    <Gem className="w-3.5 h-3.5" /> {r.cost} Linh Thạch
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditReward(r)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title="Sửa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(r.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Duyệt Đổi Quà */}
      {activeTab === "REDEMPTIONS" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800">
            Lịch Sử & Yêu Cầu Đổi Quà Của Các Đạo Hữu
          </h3>

          {redemptions.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Chưa có yêu cầu đổi quà nào.</p>
          ) : (
            <div className="space-y-3">
              {redemptions.map((red) => (
                <div
                  key={red.id}
                  className="p-4 rounded-2xl xianxia-card border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-blue-800 font-bold text-sm">
                        {red.cultivator.name}
                      </strong>
                      <span className="text-xs text-slate-500">({red.cultivator.realm})</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-slate-800 font-bold text-sm">
                        Đổi: {red.reward.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Thời gian: {new Date(red.createdAt).toLocaleString("vi-VN")} | Tiêu hao: {red.cost} Linh Thạch
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {red.status === "USED" ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Đã Trao Quà
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFulfillRedemption(red.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600/10 text-blue-700 border border-blue-500/40 hover:bg-blue-600 hover:text-white transition active:scale-95"
                      >
                        Đánh Dấu Đã Trao Quà Ngoài Đời
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quest Modal */}
      {showQuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-blue-300/60 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-800">
              {editingQuest ? "Sửa Nhiệm Vụ" : "Ban Bố Nhiệm Vụ Mới"}
            </h3>

            <form onSubmit={handleSaveQuest} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Nhiệm Vụ
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Luyện Thể Vạn Dặm (Chạy bộ 3km)"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mô Tả Chi Tiết Công Việc Ngoài Đời Thực
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Hướng dẫn người chơi làm những gì để hoàn thành..."
                  value={questForm.description}
                  onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phân Loại
                  </label>
                  <select
                    value={questForm.category}
                    onChange={(e) => setQuestForm({ ...questForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  >
                    <option value="DAILY">Nhật Thường (Reset hàng ngày)</option>
                    <option value="CHALLENGE">Thử Thách (Dự án / 1 lần)</option>
                    <option value="BREAKTHROUGH">Đột Phá Cảnh Giới</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Độ Khó
                  </label>
                  <select
                    value={questForm.difficulty}
                    onChange={(e) => setQuestForm({ ...questForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                    <option value="Địa ngục">Địa ngục</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Thưởng Tu Vi
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={questForm.expReward}
                    onChange={(e) =>
                      setQuestForm({ ...questForm, expReward: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Thưởng Linh Thạch
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questForm.stoneReward}
                    onChange={(e) =>
                      setQuestForm({ ...questForm, stoneReward: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Cảnh Giới Min
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questForm.minRealmLevel}
                    onChange={(e) =>
                      setQuestForm({ ...questForm, minRealmLevel: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuestModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                >
                  Lưu Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-emerald-300/60 shadow-2xl">
            <h3 className="text-xl font-bold text-emerald-700">
              {editingReward ? "Sửa Bảo Vật" : "Thêm Bảo Vật Vào Tàng Bảo Các"}
            </h3>

            <form onSubmit={handleSaveReward} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Vật Phẩm / Quà Tặng
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 1 Cốc Trà Sữa / 1 Giờ Chơi Game"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mô Tả Chi Tiết / Điều Kiện Thụ Hưởng
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Mô tả quyền lợi nhận được ngoài đời thực hoặc tác dụng..."
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phân Loại
                  </label>
                  <select
                    value={rewardForm.category}
                    onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  >
                    <option value="REAL_LIFE">Quà Đời Thực</option>
                    <option value="PILL">Đan Dược Đột Phá</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Giá Linh Thạch
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rewardForm.cost}
                    onChange={(e) =>
                      setRewardForm({ ...rewardForm, cost: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Lượng (-1: Vô hạn)
                  </label>
                  <input
                    type="number"
                    value={rewardForm.stock}
                    onChange={(e) =>
                      setRewardForm({ ...rewardForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Lưu Bảo Vật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
