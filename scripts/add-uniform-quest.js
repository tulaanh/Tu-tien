const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const quest = await prisma.quest.create({
    data: {
      title: "Tảo Triều Tiên Bào (Chụp Ảnh Đồng Phục Sáng Sớm)",
      description:
        "Mỗi buổi sáng trước khi đến trường (trước 07:30), chị gái chụp 1 bức ảnh em mặc đồng phục chỉnh tề, mỉm cười tự tin chào ngày mới và gửi vào nhóm gia đình.",
      category: "DAILY",
      difficulty: "Dễ",
      expReward: 40,
      stoneReward: 20,
      minRealmLevel: 0,
      icon: "sunrise",
    },
  });

  console.log("✅ Đã tạo nhiệm vụ thành công:", quest.title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
