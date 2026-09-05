export type ExamType = "REGULAR" | "MIDTERM" | "FINAL";

export const EXAM_TYPE_CONFIG: Record<ExamType, { label: string; multiplier: number; desc: string }> = {
  REGULAR: {
    label: "Kiểm Tra Thường Xuyên",
    multiplier: 1,
    desc: "Kiểm tra 15 phút, 1 tiết, kiểm tra miệng (Hệ số x1)",
  },
  MIDTERM: {
    label: "Kiểm Tra Giữa Kỳ",
    multiplier: 2,
    desc: "Thi giữa học kỳ (Hệ số x2)",
  },
  FINAL: {
    label: "Kiểm Tra Cuối Kỳ",
    multiplier: 3,
    desc: "Thi kết thúc học phần / Học kỳ (Hệ số x3)",
  },
};

/**
 * Tính thưởng Tu Vi & Linh Thạch từ điểm số & loại bài thi
 * Thang điểm áp dụng: từ 8.0 đến 10.0
 * Có chia mốc lũy tiến chi tiết theo từng 0.1 điểm (cân bằng 8.5, 8.9, 9.5, 9.9, 10.0)
 */
export function calculateExamReward(score: number, examType: ExamType): { expReward: number; stoneReward: number; eligible: boolean } {
  if (score < 8.0 || score > 10.0) {
    return { expReward: 0, stoneReward: 0, eligible: false };
  }

  let baseExp = 0;
  let baseStones = 0;

  if (score >= 10.0) {
    baseExp = 200;
    baseStones = 25;
  } else if (score >= 9.5) {
    // 9.5 -> 9.9: 160 - 192 Tu Vi, 18 - 22 Linh Thạch
    const step = Math.min(4, Math.max(0, Math.round((score - 9.5) * 10)));
    baseExp = 160 + step * 8;
    baseStones = 18 + step * 1;
  } else if (score >= 9.0) {
    // 9.0 -> 9.4: 110 - 150 Tu Vi, 10 - 16 Linh Thạch
    const step = Math.min(4, Math.max(0, Math.round((score - 9.0) * 10)));
    baseExp = 110 + step * 10;
    baseStones = 10 + Math.floor(step * 1.5);
  } else if (score >= 8.5) {
    // 8.5 -> 8.9: 75 - 95 Tu Vi, 5 - 9 Linh Thạch
    const step = Math.min(4, Math.max(0, Math.round((score - 8.5) * 10)));
    baseExp = 75 + step * 5;
    baseStones = 5 + step * 1;
  } else if (score >= 8.0) {
    // 8.0 -> 8.4: 50 - 70 Tu Vi, 0 Linh Thạch
    const step = Math.min(4, Math.max(0, Math.round((score - 8.0) * 10)));
    baseExp = 50 + step * 5;
    baseStones = 0;
  }

  const multiplier = EXAM_TYPE_CONFIG[examType]?.multiplier || 1;

  return {
    expReward: Math.round(baseExp * multiplier),
    stoneReward: Math.round(baseStones * multiplier),
    eligible: true,
  };
}
