import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel, REALMS } from "@/lib/cultivation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId, rewardId } = body;

    if (!cultivatorId || !rewardId) {
      return NextResponse.json({ error: "Thiếu thông tin đổi thưởng" }, { status: 400 });
    }

    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });
    if (!cultivator) {
      return NextResponse.json({ error: "Không tìm thấy Đạo Hữu" }, { status: 404 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });
    if (!reward) {
      return NextResponse.json({ error: "Vật phẩm không tồn tại trong Tàng Bảo Các" }, { status: 404 });
    }

    if (reward.stock === 0) {
      return NextResponse.json({ error: "Vật phẩm này đã hết hàng!" }, { status: 400 });
    }

    if (cultivator.spiritStones < reward.cost) {
      return NextResponse.json(
        {
          error: `Linh thạch không đủ! Đạo hữu hiện có ${cultivator.spiritStones} Linh Thạch, cần ${reward.cost} Linh Thạch. Hãy siêng năng làm nhiệm vụ!`,
        },
        { status: 400 }
      );
    }

    // Trừ Linh thạch và tạo bản ghi Redemption
    let updatedCultivator = await prisma.cultivator.update({
      where: { id: cultivatorId },
      data: {
        spiritStones: { decrement: reward.cost },
      },
    });

    if (reward.stock > 0) {
      await prisma.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });
    }

    await prisma.redemption.create({
      data: {
        cultivatorId,
        rewardId,
        cost: reward.cost,
        status: reward.category === "PILL" ? "USED" : "APPROVED",
      },
    });

    let extraMessage = "";

    // Nếu là Đan Dược Đột Phá, hỗ trợ lập tức phá vỡ bình cảnh!
    if (reward.category === "PILL") {
      if (updatedCultivator.realmLevel < REALMS.length - 1) {
        const nextLevel = updatedCultivator.realmLevel + 1;
        const nextRealm = getRealmByLevel(nextLevel);

        updatedCultivator = await prisma.cultivator.update({
          where: { id: cultivatorId },
          data: {
            realmLevel: nextLevel,
            realm: nextRealm.name,
            currentExp: 0,
            maxExp: nextRealm.maxExp,
            isBottleneck: false,
          },
        });
        extraMessage = ` 🌟 Uống đan dược thần diệu! Kinh mạch khai thông, lập tức đột phá lên [${nextRealm.name}]!`;
      }
    }

    const realmInfo = getRealmByLevel(updatedCultivator.realmLevel);

    return NextResponse.json({
      success: true,
      message: `Đổi thành công [${reward.title}]! Đã tiêu hao ${reward.cost} Linh Thạch.${extraMessage}`,
      cultivator: {
        ...updatedCultivator,
        realmInfo,
      },
    });
  } catch (error) {
    console.error("Lỗi đổi quà:", error);
    return NextResponse.json({ error: "Không thể đổi vật phẩm lúc này" }, { status: 500 });
  }
}
