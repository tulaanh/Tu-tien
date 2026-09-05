import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel } from "@/lib/cultivation";

export async function GET() {
  try {
    const cultivators = await prisma.cultivator.findMany({
      orderBy: [
        { realmLevel: "desc" },
        { currentExp: "desc" },
        { spiritStones: "desc" },
      ],
      take: 20,
      select: {
        id: true,
        name: true,
        realm: true,
        realmLevel: true,
        currentExp: true,
        maxExp: true,
        spiritStones: true,
        isBottleneck: true,
        avatar: true,
        bio: true,
      },
    });

    const formatted = cultivators.map((c) => ({
      ...c,
      realmInfo: getRealmByLevel(c.realmLevel),
    }));

    return NextResponse.json({ leaderboard: formatted });
  } catch (error) {
    console.error("Lỗi lấy bảng phong thần:", error);
    return NextResponse.json({ error: "Lỗi nạp Bảng Phong Thần" }, { status: 500 });
  }
}
