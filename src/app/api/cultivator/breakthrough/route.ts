import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel, REALMS } from "@/lib/cultivation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId } = body;

    if (!cultivatorId) {
      return NextResponse.json({ error: "Thiếu mã định danh đạo hữu" }, { status: 400 });
    }

    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });

    if (!cultivator) {
      return NextResponse.json({ error: "Không tìm thấy đạo hữu" }, { status: 404 });
    }

    if (cultivator.realmLevel >= REALMS.length - 1) {
      return NextResponse.json(
        { error: "Đạo hữu đã đạt cảnh giới tối cao trong cõi này (Hóa Thần Kỳ), không thể thăng tiếp!" },
        { status: 400 }
      );
    }

    if (!cultivator.isBottleneck && cultivator.currentExp < cultivator.maxExp) {
      return NextResponse.json(
        { error: "Tu vi chưa đủ tích lũy để dẫn động thiên kiếp đột phá!" },
        { status: 400 }
      );
    }

    // Đột phá thành công!
    const nextLevel = cultivator.realmLevel + 1;
    const nextRealm = getRealmByLevel(nextLevel);
    const tribulationStoneBonus = (nextLevel + 1) * 20; // Thưởng thiên kiếp

    const updated = await prisma.cultivator.update({
      where: { id: cultivatorId },
      data: {
        realmLevel: nextLevel,
        realm: nextRealm.name,
        currentExp: 0,
        maxExp: nextRealm.maxExp,
        isBottleneck: false,
        spiritStones: { increment: tribulationStoneBonus },
      },
    });

    return NextResponse.json({
      success: true,
      message: `⚡ Oanh Đùng! Độ kiếp thành công! Chúc mừng đạo hữu bước vào cảnh giới [${nextRealm.name}]! Thiên đạo ban thưởng ${tribulationStoneBonus} Linh Thạch!`,
      cultivator: {
        ...updated,
        realmInfo: nextRealm,
      },
      bonusStones: tribulationStoneBonus,
    });
  } catch (error) {
    console.error("Lỗi đột phá cảnh giới:", error);
    return NextResponse.json({ error: "Đột phá thất bại do thiên đạo chấn động" }, { status: 500 });
  }
}
