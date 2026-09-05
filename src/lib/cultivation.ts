export interface RealmTier {
  level: number;
  name: string;
  majorRealm: string; // Phàm Nhân, Luyện Khí, Trúc Cơ, Kim Đan, Nguyên Anh, Hóa Thần
  subStage?: string;
  maxExp: number;
  color: string;
  auraColor: string;
  description: string;
}

export const REALMS: RealmTier[] = [
  {
    level: 0,
    name: "Phàm Nhân (Luyện Thể)",
    majorRealm: "Phàm Nhân",
    maxExp: 100,
    color: "from-stone-600 to-stone-400",
    auraColor: "border-stone-500 shadow-stone-500/20",
    description: "Chưa bước vào tiên lộ, gân cốt phàm thai, cần siêng năng rèn luyện thân thể.",
  },
  {
    level: 1,
    name: "Luyện Khí Tầng 1",
    majorRealm: "Luyện Khí",
    subStage: "Sơ Kỳ",
    maxExp: 150,
    color: "from-emerald-700 to-teal-500",
    auraColor: "border-emerald-500 shadow-emerald-500/25",
    description: "Cảm ứng được thiên địa linh khí, dẫn khí nhập thể, gột rửa kinh mạch.",
  },
  {
    level: 2,
    name: "Luyện Khí Tầng 2",
    majorRealm: "Luyện Khí",
    subStage: "Sơ Kỳ",
    maxExp: 220,
    color: "from-emerald-700 to-teal-500",
    auraColor: "border-emerald-500 shadow-emerald-500/25",
    description: "Khí tức ngưng tụ, khí huyết dồi dào, thân nhẹ như yến.",
  },
  {
    level: 3,
    name: "Luyện Khí Tầng 3",
    majorRealm: "Luyện Khí",
    subStage: "Sơ Kỳ",
    maxExp: 300,
    color: "from-emerald-700 to-teal-500",
    auraColor: "border-emerald-500 shadow-emerald-500/25",
    description: "Linh lực lưu chuyển thông suốt cửu khiếu.",
  },
  {
    level: 4,
    name: "Luyện Khí Tầng 4",
    majorRealm: "Luyện Khí",
    subStage: "Trung Kỳ",
    maxExp: 400,
    color: "from-teal-600 to-cyan-500",
    auraColor: "border-teal-400 shadow-teal-500/30",
    description: "Bắt đầu điều động linh lực phóng ra ngoài cơ thể.",
  },
  {
    level: 5,
    name: "Luyện Khí Tầng 5",
    majorRealm: "Luyện Khí",
    subStage: "Trung Kỳ",
    maxExp: 520,
    color: "from-teal-600 to-cyan-500",
    auraColor: "border-teal-400 shadow-teal-500/30",
    description: "Ngũ tạng lục phủ được linh khí tẩm bổ, bách bệnh bất xâm.",
  },
  {
    level: 6,
    name: "Luyện Khí Tầng 6",
    majorRealm: "Luyện Khí",
    subStage: "Trung Kỳ",
    maxExp: 650,
    color: "from-teal-600 to-cyan-500",
    auraColor: "border-teal-400 shadow-teal-500/30",
    description: "Khí hải mở rộng, linh lực mênh mông gấp bội.",
  },
  {
    level: 7,
    name: "Luyện Khí Tầng 7",
    majorRealm: "Luyện Khí",
    subStage: "Hậu Kỳ",
    maxExp: 800,
    color: "from-cyan-600 to-blue-500",
    auraColor: "border-cyan-400 shadow-cyan-500/35",
    description: "Bước vào hậu kỳ, ngự phong phi hành trong gang tấc.",
  },
  {
    level: 8,
    name: "Luyện Khí Tầng 8",
    majorRealm: "Luyện Khí",
    subStage: "Hậu Kỳ",
    maxExp: 1000,
    color: "from-cyan-600 to-blue-500",
    auraColor: "border-cyan-400 shadow-cyan-500/35",
    description: "Thần thức dần hình thành, có thể phân biệt linh vật trong phạm vi mười trượng.",
  },
  {
    level: 9,
    name: "Luyện Khí Tầng 9 (Đỉnh Phong)",
    majorRealm: "Luyện Khí",
    subStage: "Đại Viên Mãn",
    maxExp: 1300,
    color: "from-blue-600 to-indigo-500",
    auraColor: "border-blue-400 shadow-blue-500/40",
    description: "Luyện khí viên mãn, chuẩn bị đúc thành đạo cơ, một bước lên mây.",
  },
  {
    level: 10,
    name: "Trúc Cơ Sơ Kỳ",
    majorRealm: "Trúc Cơ",
    subStage: "Sơ Kỳ",
    maxExp: 1800,
    color: "from-indigo-600 to-purple-500",
    auraColor: "border-indigo-400 shadow-indigo-500/45",
    description: "Hóa khí thành dịch, thọ nguyên kéo dài hai trăm năm, chính thức xưng danh Đạo Nhân.",
  },
  {
    level: 11,
    name: "Trúc Cơ Trung Kỳ",
    majorRealm: "Trúc Cơ",
    subStage: "Trung Kỳ",
    maxExp: 2400,
    color: "from-indigo-600 to-purple-500",
    auraColor: "border-indigo-400 shadow-indigo-500/45",
    description: "Linh dịch trong đan điền dâng trào, ngự kiếm phi hành ngàn dặm.",
  },
  {
    level: 12,
    name: "Trúc Cơ Hậu Kỳ",
    majorRealm: "Trúc Cơ",
    subStage: "Hậu Kỳ",
    maxExp: 3200,
    color: "from-purple-600 to-fuchsia-500",
    auraColor: "border-purple-400 shadow-purple-500/50",
    description: "Đạo cơ vững như bàn thạch, chuẩn bị ngưng tụ Kim Đan.",
  },
  {
    level: 13,
    name: "Trúc Cơ Đại Viên Mãn",
    majorRealm: "Trúc Cơ",
    subStage: "Bình Cảnh Kết Đan",
    maxExp: 4200,
    color: "from-purple-600 to-fuchsia-500",
    auraColor: "border-purple-400 shadow-purple-500/50",
    description: "Cửa ải Kết Đan sắp tới, chỉ cần một đạo cơ duyên liền phá vỡ phàm trần.",
  },
  {
    level: 14,
    name: "Kim Đan Sơ Kỳ",
    majorRealm: "Kim Đan",
    subStage: "Sơ Kỳ",
    maxExp: 5500,
    color: "from-amber-600 to-yellow-400",
    auraColor: "border-yellow-400 shadow-yellow-500/60",
    description: "Một hạt kim đan nuốt vào bụng, từ đây mệnh ta do ta không do trời! Thọ nguyên năm trăm năm.",
  },
  {
    level: 15,
    name: "Kim Đan Hậu Kỳ",
    majorRealm: "Kim Đan",
    subStage: "Hậu Kỳ",
    maxExp: 7500,
    color: "from-amber-600 to-yellow-400",
    auraColor: "border-yellow-400 shadow-yellow-500/60",
    description: "Kim đan đại phóng quang mang, chưởng khống thiên địa linh lực như cánh tay.",
  },
  {
    level: 16,
    name: "Nguyên Anh Kỳ",
    majorRealm: "Nguyên Anh",
    subStage: "Chân Quân",
    maxExp: 10000,
    color: "from-rose-600 to-red-500",
    auraColor: "border-rose-400 shadow-rose-500/70",
    description: "Phá đan sinh anh, thân thể dẫu diệt thì nguyên anh vẫn bất tử, xưng hùng một phương.",
  },
  {
    level: 17,
    name: "Hóa Thần Kỳ",
    majorRealm: "Hóa Thần",
    subStage: "Tôn Giả",
    maxExp: 15000,
    color: "from-violet-500 via-fuchsia-500 to-amber-300",
    auraColor: "border-amber-300 shadow-amber-300/80 animate-pulse",
    description: "Thần du thái hư, chạm tới bản nguyên quy tắc trời đất, chuẩn bị phi thăng tiên giới.",
  },
];

export function getRealmByLevel(level: number): RealmTier {
  if (level < 0) return REALMS[0];
  if (level >= REALMS.length) return REALMS[REALMS.length - 1];
  return REALMS[level];
}

export function calculateTuViGain(currentExp: number, gainedExp: number, maxExp: number) {
  const nextExp = currentExp + gainedExp;
  if (nextExp >= maxExp) {
    return {
      isBottleneck: true,
      currentExp: maxExp,
      overflowExp: nextExp - maxExp,
    };
  }
  return {
    isBottleneck: false,
    currentExp: nextExp,
    overflowExp: 0,
  };
}
