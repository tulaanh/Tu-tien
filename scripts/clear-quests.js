const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const c = await prisma.questCompletion.deleteMany();
  const q = await prisma.quest.deleteMany();
  console.log(`Đã xóa sạch: ${q.count} nhiệm vụ và ${c.count} bản ghi hoàn thành.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
