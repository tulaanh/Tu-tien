import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel } from "@/lib/cultivation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId, questId } = body;

    if (!cultivatorId || !questId) {
      return NextResponse.json({ error: "Thiếu thông tin nhận thưởng" }, { status: 400 });
    }

    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });
    if (!cultivator) {
      return NextResponse.json({ error: "Không tìm thấy Đạo Hữu" }, { status: 404 });
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });
    if (!quest) {
      return NextResponse.json({ error: "Nhiệm vụ không tồn tại" }, { status: 404 });
    }

    // Kiểm tra điều kiện cảnh giới tối thiểu
    if (cultivator.realmLevel < quest.minRealmLevel) {
      return NextResponse.json(
        { error: "Cảnh giới chưa đủ để nhận phần thưởng nhiệm vụ này!" },
        { status: 400 }
      );
    }

    // Kiểm tra đã hoàn thành chưa
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.questCompletion.findFirst({
      where: {
        cultivatorId,
        questId,
        ...(quest.category === "DAILY" ? { completedAt: { gte: today } } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Nhiệm vụ này hôm nay đã hoàn thành rồi, ngày mai hãy tiếp tục!" },
        { status: 400 }
      );
    }

    // Ghi nhận hoàn thành
    await prisma.questCompletion.create({
      data: {
        cultivatorId,
        questId,
      },
    });

    // Tính toán Tu Vi & Linh Thạch
    let newExp = cultivator.currentExp + quest.expReward;
    let reachedBottleneck = cultivator.isBottleneck;

    if (newExp >= cultivator.maxExp) {
      newExp = cultivator.maxExp;
      reachedBottleneck = true;
    }

    const updated = await prisma.cultivator.update({
      where: { id: cultivatorId },
      data: {
        currentExp: newExp,
        isBottleneck: reachedBottleneck,
        spiritStones: { increment: quest.stoneReward },
      },
    });

    const realmInfo = getRealmByLevel(updated.realmLevel);

    let message = `Nhận thành công +${quest.expReward} Tu Vi và +${quest.stoneReward} Linh Thạch!`;
    if (!cultivator.isBottleneck && reachedBottleneck) {
      message += " ⚠️ Đạo hữu đã đạt tới ĐỈNH PHONG CẢNH GIỚI! Cần tiến hành ĐỘT PHÁ để bước tiếp trên tiên lộ!";
    }

    return NextResponse.json({
      success: true,
      message,
      cultivator: {
        ...updated,
        realmInfo,
      },
      reachedBottleneck,
    });
  } catch (error) {
    console.error("Lỗi hoàn thành quest:", error);
    return NextResponse.json({ error: "Không thể nhận thưởng lúc này" }, { status: 500 });
  }
}
