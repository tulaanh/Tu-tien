import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId, questId, note } = body;

    if (!cultivatorId || !questId) {
      return NextResponse.json({ error: "Thiếu thông tin nộp nhiệm vụ" }, { status: 400 });
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
        { error: "Cảnh giới chưa đủ để tiếp nhận nhiệm vụ này!" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Kiểm tra xem có yêu cầu đang CHỜ DUYỆT (PENDING) không
    const pendingSubmission = await prisma.questCompletion.findFirst({
      where: {
        cultivatorId,
        questId,
        status: "PENDING",
      },
    });

    if (pendingSubmission) {
      return NextResponse.json(
        { error: "Nhiệm vụ này đã gửi báo cáo và đang chờ Trưởng Lão phê duyệt!" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra xem ĐÃ DUYỆT (APPROVED) trong ngày hôm nay chưa
    const approvedCompletion = await prisma.questCompletion.findFirst({
      where: {
        cultivatorId,
        questId,
        status: "APPROVED",
        ...(quest.category === "DAILY" ? { createdAt: { gte: today } } : {}),
      },
    });

    if (approvedCompletion) {
      return NextResponse.json(
        { error: "Nhiệm vụ này hôm nay đã được phê chuẩn hoàn thành rồi!" },
        { status: 400 }
      );
    }

    // 3. Tạo bản ghi báo cáo hoàn thành ở trạng thái PENDING
    const submission = await prisma.questCompletion.create({
      data: {
        cultivatorId,
        questId,
        status: "PENDING",
        note: note ? String(note).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      status: "PENDING",
      submissionId: submission.id,
      message: `📜 Đã gửi báo cáo nhiệm vụ "${quest.title}" lên Trưởng Lão! Tu Vi (+${quest.expReward}) & Linh Thạch (+${quest.stoneReward}) sẽ được ban thưởng ngay khi được phê chuẩn.`,
    });
  } catch (error) {
    console.error("Lỗi gửi báo cáo quest:", error);
    return NextResponse.json({ error: "Không thể nộp báo cáo lúc này" }, { status: 500 });
  }
}
