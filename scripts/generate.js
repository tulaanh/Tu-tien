const { execSync } = require("child_process");

// Đảm bảo DATABASE_URL luôn có giá trị hợp lệ khi build trên Vercel
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

try {
  console.log("⚡ Đang tạo Prisma Client với DATABASE_URL:", process.env.DATABASE_URL);
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
} catch (e) {
  console.error("Lỗi tạo Prisma Client:", e);
  process.exit(1);
}
