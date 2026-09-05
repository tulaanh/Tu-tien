import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo hạt dữ liệu Tiên Giới...");

  // Xóa dữ liệu cũ nếu có
  await prisma.questCompletion.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.cultivator.deleteMany();

  // 1. Tạo Đạo hữu mẫu
  const demoCultivator = await prisma.cultivator.create({
    data: {
      name: "Hàn Lập",
      pin: "1234",
      realm: "Luyện Khí Tầng 1",
      realmLevel: 1,
      currentExp: 60,
      maxExp: 150,
      spiritStones: 120,
      isBottleneck: false,
      avatar: "sword",
      bio: "Sát phạt quyết đoán, đạo tâm kiên định. Cầu trường sinh bất tử.",
    },
  });

  console.log(`✨ Đã tạo Đạo hữu khởi đầu: ${demoCultivator.name} (PIN: 1234)`);

  // 2. Tạo Nhiệm Vụ mẫu
  const quests = [
    {
      title: "Thần Tiên Khởi Thân",
      description: "Thức dậy trước 06:30 sáng, uống một ngụm nước ấm thanh lọc cơ thể, hít thở không khí sớm mai.",
      category: "DAILY",
      difficulty: "Dễ",
      expReward: 30,
      stoneReward: 15,
      minRealmLevel: 0,
      icon: "sunrise",
    },
    {
      title: "Luyện Thể Vạn Dặm",
      description: "Vận động thân thể ít nhất 30 phút (Chạy bộ, Gym, Cầu lông hoặc Hít đất 50 cái).",
      category: "DAILY",
      difficulty: "Trung bình",
      expReward: 50,
      stoneReward: 25,
      minRealmLevel: 0,
      icon: "activity",
    },
    {
      title: "Tụ Khí Ngưng Thần",
      description: "Tập trung sâu 45 phút học tập hoặc làm việc, tuyệt đối không chạm vào mạng xã hội / điện thoại.",
      category: "DAILY",
      difficulty: "Trung bình",
      expReward: 40,
      stoneReward: 20,
      minRealmLevel: 0,
      icon: "focus",
    },
    {
      title: "Bách Thảo Cầu Tri",
      description: "Đọc ít nhất 15 trang sách bổ ích hoặc học 15 từ vựng ngoại ngữ mới.",
      category: "DAILY",
      difficulty: "Dễ",
      expReward: 35,
      stoneReward: 20,
      minRealmLevel: 0,
      icon: "book",
    },
    {
      title: "Thanh Tịnh Động Phủ",
      description: "Dọn dẹp bàn làm việc, sắp xếp phòng ốc gọn gàng ngăn nắp, xua đuổi tà khí hỗn độn.",
      category: "DAILY",
      difficulty: "Dễ",
      expReward: 25,
      stoneReward: 15,
      minRealmLevel: 0,
      icon: "sparkles",
    },
    {
      title: "Trảm Ma Đoạt Bảo: Dứt Điểm Deadline",
      description: "Hoàn thành dứt điểm 1 dự án / nhiệm vụ khó nhằn hoặc nộp bài tập lớn trước hạn định.",
      category: "CHALLENGE",
      difficulty: "Khó",
      expReward: 150,
      stoneReward: 100,
      minRealmLevel: 1,
      icon: "sword",
    },
    {
      title: "Thiên Kiếp Đột Phá: Vượt Qua Bình Cảnh",
      description: "Nhiệm vụ đặc biệt: Liên tục 3 ngày hoàn thành toàn bộ nhiệm vụ nhật thường không gián đoạn.",
      category: "BREAKTHROUGH",
      difficulty: "Địa ngục",
      expReward: 250,
      stoneReward: 150,
      minRealmLevel: 0,
      icon: "zap",
    },
  ];

  for (const q of quests) {
    await prisma.quest.create({ data: q });
  }
  console.log(`📜 Đã tạo ${quests.length} nhiệm vụ tại Nhiệm Vụ Đường.`);

  // 3. Tạo Phần Thưởng Tàng Bảo Các
  const rewards = [
    {
      title: "Ngọc Lộ Trà Sữa",
      description: "Được thưởng 1 ly trà sữa hoặc đồ uống yêu thích để bồi bổ tinh thần.",
      category: "REAL_LIFE",
      cost: 80,
      stock: -1,
      icon: "cup-soda",
    },
    {
      title: "Tiêu Dao Du Lạc (1 Giờ Game)",
      description: "Tận hưởng 60 phút chơi game / lướt web giải trí hoàn toàn không vướng bận âu lo.",
      category: "REAL_LIFE",
      cost: 60,
      stock: -1,
      icon: "gamepad-2",
    },
    {
      title: "Thái Hư Xem Phim Rạp",
      description: "Đổi 1 vé xem phim chiếu rạp cuối tuần cùng đạo lữ hoặc bằng hữu.",
      category: "REAL_LIFE",
      cost: 200,
      stock: -1,
      icon: "film",
    },
    {
      title: "Trúc Cơ Thần Đan",
      description: "Đan dược thượng phẩm giúp trực tiếp phá vỡ bình cảnh, tăng 1 cảnh giới tức thì!",
      category: "PILL",
      cost: 300,
      stock: 5,
      icon: "sparkle",
    },
    {
      title: "Mỹ Vị Đại Yến",
      description: "Một bữa ăn ngon thịnh soạn tự thưởng (Lẩu Haidilao, Nướng BBQ, hoặc món ăn khoái khẩu).",
      category: "REAL_LIFE",
      cost: 350,
      stock: -1,
      icon: "utensils",
    },
    {
      title: "Tịnh Tâm Thụy Giác (Ngủ Nướng)",
      description: "Quyền lợi ngủ nướng thêm 1-2 tiếng vào sáng cuối tuần mà không có cảm giác tội lỗi.",
      category: "REAL_LIFE",
      cost: 70,
      stock: -1,
      icon: "moon",
    },
  ];

  for (const r of rewards) {
    await prisma.reward.create({ data: r });
  }
  console.log(`🎁 Đã thiết lập ${rewards.length} vật phẩm quý giá tại Tàng Bảo Các.`);

  console.log("🎉 Hoàn tất khởi tạo dữ liệu Tiên Giới!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
