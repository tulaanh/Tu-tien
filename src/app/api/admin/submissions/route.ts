import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel } from "@/lib/cultivation";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("0.0.0.0");
    if (!isLocalhost && process.env.ALLOW_REMOTE_ADMIN !== "true") {
      return NextResponse.json(
        { error: "Chỉ cho phép truy cập từ Localhost" },
        { status: 403 }
      );
    }

    const submissions = await prisma.questCompletion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cultivator: {
          select: {
            id: true,
            name: true,
            realm: true,
            realmLevel: true,
            currentExp: true,
            maxExp: true,
            spiritStones: true,
            avatar: true,
          },
        },
        quest: true,
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Lỗi lấy danh sách nộp nhiệm vụ:", error);
    return NextResponse.json(
      { error: "Lỗi lấy danh sách nộp nhiệm vụ" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("0.0.0.0");
    if (!isLocalhost && process.env.ALLOW_REMOTE_ADMIN !== "true") {
      return NextResponse.json(
        { error: "Chỉ cho phép truy cập từ Localhost" },
        { status: 403 }
      );
    }

    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Thiếu thông tin xử lý" }, { status: 400 });
    }

    const submission = await prisma.questCompletion.findUnique({
      where: { id },
      include: { quest: true, cultivator: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Không tìm thấy báo cáo nhiệm vụ" }, { status: 404 });
    }

    if (action === "DELETE") {
      await prisma.questCompletion.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Đã xóa bản ghi báo cáo" });
    }

    if (action === "REJECT") {
      const updated = await prisma.questCompletion.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({
        success: true,
        message: "Đã bác bỏ báo cáo nhiệm vụ.",
        submission: updated,
      });
    }

    if (action === "APPROVE") {
      if (submission.status === "APPROVED") {
        return NextResponse.json({
          success: true,
          message: "Báo cáo này đã được phê chuẩn trước đó rồi.",
        });
      }

      const updatedCompletion = await prisma.questCompletion.update({
        where: { id },
        data: {
          status: "APPROVED",
          completedAt: new Date(),
        },
      });

      const { cultivator, quest } = submission;
      let newExp = cultivator.currentExp + quest.expReward;
      let reachedBottleneck = cultivator.isBottleneck;

      if (newExp >= cultivator.maxExp) {
        newExp = cultivator.maxExp;
        reachedBottleneck = true;
      }

      const updatedCultivator = await prisma.cultivator.update({
        where: { id: cultivator.id },
        data: {
          currentExp: newExp,
          isBottleneck: reachedBottleneck,
          spiritStones: { increment: quest.stoneReward },
        },
      });

      const realmInfo = getRealmByLevel(updatedCultivator.realmLevel);

      return NextResponse.json({
        success: true,
        message: `Đã phê chuẩn thành công! Đạo hữu ${cultivator.name} nhận +${quest.expReward} Tu Vi & +${quest.stoneReward} Linh Thạch.`,
        submission: updatedCompletion,
        cultivator: {
          ...updatedCultivator,
          realmInfo,
        },
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Lỗi duyệt nhiệm vụ:", error);
    return NextResponse.json(
      { error: "Lỗi xử lý duyệt nhiệm vụ: " + (error instanceof Error ? error.message : "") },
      { status: 500 }
    );
  }
}
