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

    // 1. Lấy báo cáo nhiệm vụ
    const questSubmissions = await prisma.questCompletion.findMany({
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

    // 2. Lấy báo cáo điểm bài kiểm tra (ExamReport)
    const examSubmissions = await prisma.examReport.findMany({
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
      },
    });

    const formattedQuestSubmissions = questSubmissions.map((s) => ({
      ...s,
      type: "QUEST",
    }));

    const formattedExamSubmissions = examSubmissions.map((s) => ({
      id: s.id,
      cultivatorId: s.cultivatorId,
      status: s.status,
      note: s.note,
      createdAt: s.createdAt,
      completedAt: s.approvedAt,
      type: "EXAM",
      cultivator: s.cultivator,
      exam: {
        id: s.id,
        subject: s.subject,
        examType: s.examType,
        score: s.score,
        expReward: s.expReward,
        stoneReward: s.stoneReward,
      },
    }));

    return NextResponse.json({
      submissions: formattedQuestSubmissions,
      examSubmissions: formattedExamSubmissions,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nộp nhiệm vụ / bài kiểm tra:", error);
    return NextResponse.json(
      { error: "Lỗi lấy danh sách nộp bài" },
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

    const { id, action, type } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Thiếu thông tin xử lý" }, { status: 400 });
    }

    // === XỬ LÝ PHÊ DUYỆT BÁO ĐIỂM KIỂM TRA (EXAM) ===
    if (type === "EXAM") {
      const examReport = await prisma.examReport.findUnique({
        where: { id },
        include: { cultivator: true },
      });

      if (!examReport) {
        return NextResponse.json({ error: "Không tìm thấy báo cáo điểm thi" }, { status: 404 });
      }

      if (action === "DELETE") {
        await prisma.examReport.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Đã xóa bản ghi báo cáo điểm thi" });
      }

      if (action === "REJECT") {
        const updated = await prisma.examReport.update({
          where: { id },
          data: { status: "REJECTED" },
        });
        return NextResponse.json({
          success: true,
          message: "Đã bác bỏ báo cáo điểm thi.",
          submission: updated,
        });
      }

      if (action === "APPROVE") {
        if (examReport.status === "APPROVED") {
          return NextResponse.json({
            success: true,
            message: "Báo cáo điểm này đã được phê chuẩn trước đó rồi.",
          });
        }

        const updatedExam = await prisma.examReport.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        const { cultivator } = examReport;
        let newExp = cultivator.currentExp + examReport.expReward;
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
            spiritStones: { increment: examReport.stoneReward },
          },
        });

        const realmInfo = getRealmByLevel(updatedCultivator.realmLevel);

        return NextResponse.json({
          success: true,
          message: `Đã phê chuẩn điểm môn ${examReport.subject} (${examReport.score} điểm)! Đạo hữu ${cultivator.name} nhận +${examReport.expReward} Tu Vi & +${examReport.stoneReward} Linh Thạch.`,
          submission: updatedExam,
          cultivator: {
            ...updatedCultivator,
            realmInfo,
          },
        });
      }
    }

    // === XỬ LÝ PHÊ DUYỆT NHIỆM VỤ THƯỜNG (QUEST) ===
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

      // Tính thưởng có cộng thêm Streak Bonus %
      const bonusPercent = Math.min(30, cultivator.streakCount * 1);
      const bonusExp = Math.round(quest.expReward * (bonusPercent / 100));
      const bonusStones = Math.round(quest.stoneReward * (bonusPercent / 100));
      const awardedExp = quest.expReward + bonusExp;
      const awardedStones = quest.stoneReward + bonusStones;

      let newExp = cultivator.currentExp + awardedExp;
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
          spiritStones: { increment: awardedStones },
        },
      });

      const realmInfo = getRealmByLevel(updatedCultivator.realmLevel);

      const bonusNote = bonusPercent > 0 ? ` (bao gồm +${bonusPercent}% Streak 🔥)` : "";

      return NextResponse.json({
        success: true,
        message: `Đã phê chuẩn thành công! Đạo hữu ${cultivator.name} nhận +${awardedExp} Tu Vi & +${awardedStones} Linh Thạch${bonusNote}.`,
        submission: updatedCompletion,
        cultivator: {
          ...updatedCultivator,
          realmInfo,
        },
      });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Lỗi duyệt nhiệm vụ / điểm thi:", error);
    return NextResponse.json(
      { error: "Lỗi xử lý duyệt: " + (error instanceof Error ? error.message : "") },
      { status: 500 }
    );
  }
}
