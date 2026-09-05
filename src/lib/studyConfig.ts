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
  } else if (score >= 9.0) {
    baseExp = 100;
    baseStones = 10;
  } else if (score >= 8.0) {
    baseExp = 50;
    baseStones = 0;
  }

  const multiplier = EXAM_TYPE_CONFIG[examType]?.multiplier || 1;

  return {
    expReward: baseExp * multiplier,
    stoneReward: baseStones * multiplier,
    eligible: true,
  };
}
