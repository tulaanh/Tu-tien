"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { RealmTier } from "./cultivation";

export interface CultivatorData {
  id: string;
  name: string;
  pin: string;
  realm: string;
  realmLevel: number;
  currentExp: number;
  maxExp: number;
  spiritStones: number;
  isBottleneck: boolean;
  avatar: string;
  bio?: string | null;
  realmInfo?: RealmTier;
}

interface CultivatorContextType {
  cultivator: CultivatorData | null;
  loading: boolean;
  login: (name: string, pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
  breakthrough: () => Promise<{ success: boolean; message?: string }>;
}

const CultivatorContext = createContext<CultivatorContextType>({
  cultivator: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  refresh: async () => {},
  breakthrough: async () => ({ success: false }),
});

export const CultivatorProvider = ({ children }: { children: React.ReactNode }) => {
  const [cultivator, setCultivator] = useState<CultivatorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCultivator = async (id?: string) => {
    try {
      const targetId = id || localStorage.getItem("tien_gioi_cultivator_id");
      if (!targetId) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/cultivator?id=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cultivator) {
          setCultivator(data.cultivator);
          localStorage.setItem("tien_gioi_cultivator_id", data.cultivator.id);
        }
      } else {
        localStorage.removeItem("tien_gioi_cultivator_id");
        setCultivator(null);
      }
    } catch (e) {
      console.error("Lỗi nạp cultivator:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivator();
  }, []);

  const login = async (name: string, pin: string) => {
    try {
      const res = await fetch("/api/cultivator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Đăng nhập thất bại" };
      }

      setCultivator(data.cultivator);
      localStorage.setItem("tien_gioi_cultivator_id", data.cultivator.id);
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, message: "Lỗi kết nối mạng" };
    }
  };

  const logout = () => {
    localStorage.removeItem("tien_gioi_cultivator_id");
    setCultivator(null);
  };

  const refresh = async () => {
    if (cultivator?.id) {
      await fetchCultivator(cultivator.id);
    }
  };

  const breakthrough = async () => {
    if (!cultivator) return { success: false, message: "Chưa đăng nhập" };
    try {
      const res = await fetch("/api/cultivator/breakthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cultivatorId: cultivator.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error };
      }

      setCultivator(data.cultivator);

      // Hiệu ứng pháo hoa thiên kiếp rực rỡ
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#34d399", "#a855f7", "#38bdf8"],
        });
      } catch (e) {}

      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, message: "Lỗi thiên kiếp đột phá" };
    }
  };

  return (
    <CultivatorContext.Provider
      value={{
        cultivator,
        loading,
        login,
        logout,
        refresh,
        breakthrough,
      }}
    >
      {children}
    </CultivatorContext.Provider>
  );
};

export const useCultivator = () => useContext(CultivatorContext);
