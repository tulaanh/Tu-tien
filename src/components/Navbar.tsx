"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCultivator } from "@/lib/cultivatorContext";
import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Scroll, 
  Gift, 
  Trophy, 
  ShieldAlert, 
  User, 
  LogOut, 
  Gem, 
  Flame,
  KeyRound,
  BookOpen
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { cultivator, logout, login, register } = useCultivator();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authPin, setAuthPin] = useState("");
  const [authPinConfirm, setAuthPinConfirm] = useState("");
  const [authAvatar, setAuthAvatar] = useState("sword");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authTab === "register") {
      if (authPin.trim().length < 4) {
        setAuthError("Mã PIN phải có ít nhất 4 chữ số");
        return;
      }
      if (authPin !== authPinConfirm) {
        setAuthError("Mã PIN xác nhận không trùng khớp!");
        return;
      }
    }

    setAuthSubmitting(true);
    let res;
    if (authTab === "login") {
      res = await login(authName, authPin);
    } else {
      res = await register(authName, authPin, authAvatar);
    }
    setAuthSubmitting(false);

    if (res.success) {
      setShowAuthModal(false);
      setAuthName("");
      setAuthPin("");
      setAuthPinConfirm("");
    } else {
      setAuthError(res.message || (authTab === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại"));
    }
  };

  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      setIsLocalhost(host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0");
    }
  }, []);

  const navItems = [
    { label: "Động Phủ", mobileLabel: "Động Phủ", href: "/", icon: Flame },
    { label: "Tu Luyện", mobileLabel: "Tu Luyện", href: "/study", icon: BookOpen },
    { label: "Nhiệm Vụ Đường", mobileLabel: "Nhiệm Vụ", href: "/quests", icon: Scroll },
    { label: "Tàng Bảo Các", mobileLabel: "Tàng Bảo", href: "/shop", icon: Gift },
    { label: "Bảng Phong Thần", mobileLabel: "Phong Thần", href: "/leaderboard", icon: Trophy },
    ...(isLocalhost
      ? [{ label: "Quản Trị", mobileLabel: "Quản Trị", href: "/admin", icon: ShieldAlert }]
      : []),
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-900/30 bg-[#0a0f16]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" prefetch={true} className="flex items-center space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow">
                VẤN ĐẠO CÁC
              </span>
              <p className="text-[9px] sm:text-[10px] text-amber-400/60 uppercase tracking-widest leading-none hidden sm:block">
                Tu Tiên Đắc Đạo
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cultivator Status / Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {cultivator ? (
              <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-900/90 border border-amber-500/30 rounded-full py-1 px-2.5 sm:py-1.5 sm:px-3">
                {/* Spirit stones */}
                <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  <Gem className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{cultivator.spiritStones.toLocaleString()}</span>
                </div>

                {/* Cultivator info */}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-amber-300 leading-tight max-w-[90px] sm:max-w-none truncate">
                    {cultivator.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 leading-tight hidden sm:block">
                    {cultivator.realm}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  title="Đăng xuất / Chuyển Đạo Hữu"
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition active:scale-90"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090e15]/95 backdrop-blur-xl border-t border-amber-900/40 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
        <div className={`grid ${navItems.length === 6 ? "grid-cols-6" : navItems.length === 5 ? "grid-cols-5" : "grid-cols-4"} gap-0.5 sm:gap-1`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-90 ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "text-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "text-slate-400"}`} />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate w-full text-center">
                  {item.mobileLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Auth Modal (Optimized for Mobile) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-2xl bg-[#0e1622] border border-amber-500/30 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                {authTab === "login" ? "Tiến Vào Động Phủ" : "Khai Mở Tiên Duyên"}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                {authTab === "login"
                  ? "Nhập Đạo Hiệu và Mã PIN để tiếp tục hành trình tu đạo."
                  : "Đăng ký Đạo Hiệu mới để bắt đầu tích lũy tu vi từ con số 0."}
              </p>
            </div>

            {/* Switch Tabs: Đăng Nhập vs Đăng Ký */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authTab === "login"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authTab === "register"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tạo Đạo Hiệu Mới
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đạo Hiệu (Tên bạn / Nhân vật)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hàn Lập, Bạch Tiểu Thuần, Tuấn..."
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {authTab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xuất Thân Tu Hành
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
                        onClick={() => setAuthAvatar(item.id)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                          authAvatar === item.id
                            ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md"
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
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
                  {authTab === "register" ? "Đặt Mã PIN Bảo Mật (4 - 6 số)" : "Mã PIN Bảo Mật"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    placeholder="Ví dụ: 1234"
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {authTab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xác Nhận Lại Mã PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      inputMode="numeric"
                      placeholder="Nhập lại mã PIN trên"
                      value={authPinConfirm}
                      onChange={(e) => setAuthPinConfirm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 active:scale-95 transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
                >
                  {authSubmitting
                    ? "Đang kết nối..."
                    : authTab === "login"
                    ? "Đăng Nhập"
                    : "Đăng Ký Đạo Hiệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
