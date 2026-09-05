import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Hỗ trợ SQLite ghi dữ liệu trên Vercel Serverless (/tmp)
function setupDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const srcDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(srcDbPath)) {
        fs.copyFileSync(srcDbPath, tmpDbPath);
      }
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    } catch (e) {
      console.warn("Không thể copy DB sang /tmp:", e);
    }
  }
}

setupDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
