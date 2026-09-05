import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cultivatorId = searchParams.get("cultivatorId");

    const quests = await prisma.quest.findMany({
      where: { isArchived: false },
      orderBy: [{ category: "asc" }, { minRealmLevel: "asc" }, { createdAt: "desc" }],
    });

    if (!cultivatorId) {
      return NextResponse.json({ quests });
    }

    // Lấy thông tin đạo hữu để kiểm tra Chuỗi (Streak)
    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });

    let currentStreak = cultivator?.streakCount || 0;
    const lastStreakDate = cultivator?.lastStreakDate ? new Date(cultivator.lastStreakDate) : null;

    // Kiểm tra đứt chuỗi: nếu lần cuối đạt chuỗi trước ngày hôm qua (bỏ lỡ > 1 ngày) thì reset về 0
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastStreakDate && currentStreak > 0) {
      const lastDateMidnight = new Date(lastStreakDate);
      lastDateMidnight.setHours(0, 0, 0, 0);
      if (lastDateMidnight < yesterday) {
        currentStreak = 0;
        await prisma.cultivator.update({
          where: { id: cultivatorId },
          data: { streakCount: 0 },
        });
      }
    }

    const bonusPercent = Math.min(30, currentStreak * 1); // +1% mỗi ngày, tối đa +30%

    const completions = await prisma.questCompletion.findMany({
      where: { cultivatorId },
      orderBy: { createdAt: "desc" },
    });

    const questsWithStatus = quests.map((q) => {
      const relevantCompletions = completions.filter((c) => c.questId === q.id);

      // 1. Kiểm tra xem có đơn đang Chờ Duyệt (PENDING) không
      const hasPending = relevantCompletions.some((c) => {
        if (c.status !== "PENDING") return false;
        if (q.category === "DAILY") {
          const compDate = new Date(c.createdAt);
          return compDate >= today;
        }
        return true;
      });

      // 2. Kiểm tra xem ĐÃ DUYỆT (APPROVED) chưa
      const isApproved = relevantCompletions.some((c) => {
        if (c.status !== "APPROVED") return false;
        if (q.category === "DAILY") {
          const compDate = c.completedAt ? new Date(c.completedAt) : new Date(c.createdAt);
          return compDate >= today;
        }
        return true;
      });

      // 3. Kiểm tra Bị bác bỏ (REJECTED) gần nhất
      const latest = relevantCompletions[0];
      const isRejected = !hasPending && !isApproved && latest && latest.status === "REJECTED";

      let submissionStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;
      if (hasPending) submissionStatus = "PENDING";
      else if (isApproved) submissionStatus = "APPROVED";
      else if (isRejected) submissionStatus = "REJECTED";

      // Tính thưởng có cộng thêm Streak Bonus %
      const bonusExp = Math.round(q.expReward * (bonusPercent / 100));
      const bonusStones = Math.round(q.stoneReward * (bonusPercent / 100));
      const effectiveExp = q.expReward + bonusExp;
      const effectiveStones = q.stoneReward + bonusStones;

      return {
        ...q,
        isCompleted: isApproved,
        isPending: hasPending,
        isRejected,
        submissionStatus,
        bonusExp,
        bonusStones,
        effectiveExp,
        effectiveStones,
      };
    });

    // Tính toán tiến độ nhiệm vụ Nhật Thường (DAILY) hôm nay
    const dailyQuests = questsWithStatus.filter((q) => q.category === "DAILY");
    const totalDaily = dailyQuests.length;
    const completedDaily = dailyQuests.filter(
      (q) => q.submissionStatus === "PENDING" || q.submissionStatus === "APPROVED"
    ).length;
    const approvedDaily = dailyQuests.filter((q) => q.submissionStatus === "APPROVED").length;
    const remainingDaily = Math.max(0, totalDaily - completedDaily);
    const progressPercent = totalDaily > 0 ? Math.round((completedDaily / totalDaily) * 100) : 0;
    const isDailyCompletedToday = totalDaily > 0 && completedDaily === totalDaily;

    return NextResponse.json({
      quests: questsWithStatus,
      dailyStats: {
        totalDaily,
        completedDaily,
        approvedDaily,
        remainingDaily,
        progressPercent,
        isDailyCompletedToday,
      },
      streakInfo: {
        streakCount: currentStreak,
        bonusPercent,
        lastStreakDate,
        isStreakCompletedToday: isDailyCompletedToday,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách quest:", error);
    return NextResponse.json({ error: "Lỗi nạp nhiệm vụ đường" }, { status: 500 });
  }
}

// Admin: Tạo nhiệm vụ mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, expReward, stoneReward, difficulty, minRealmLevel } =
      body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên và mô tả nhiệm vụ" },
        { status: 400 }
      );
    }

    const quest = await prisma.quest.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || "DAILY",
        expReward: Number(expReward) || 30,
        stoneReward: Number(stoneReward) || 15,
        difficulty: difficulty || "Trung bình",
        minRealmLevel: Number(minRealmLevel) || 0,
        icon: category === "BREAKTHROUGH" ? "zap" : category === "CHALLENGE" ? "sword" : "scroll",
      },
    });

    return NextResponse.json({ success: true, quest });
  } catch (error) {
    console.error("Lỗi tạo quest:", error);
    return NextResponse.json({ error: "Không thể khởi tạo nhiệm vụ mới" }, { status: 500 });
  }
}

// Admin: Cập nhật nhiệm vụ
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, category, expReward, stoneReward, difficulty, minRealmLevel } =
      body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID nhiệm vụ" }, { status: 400 });
    }

    const updated = await prisma.quest.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description?.trim(),
        category,
        expReward: Number(expReward),
        stoneReward: Number(stoneReward),
        difficulty,
        minRealmLevel: Number(minRealmLevel),
      },
    });

    return NextResponse.json({ success: true, quest: updated });
  } catch (error) {
    console.error("Lỗi sửa quest:", error);
    return NextResponse.json({ error: "Không thể chỉnh sửa nhiệm vụ" }, { status: 500 });
  }
}

// Admin: Xóa nhiệm vụ
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID nhiệm vụ" }, { status: 400 });
    }

    // Xóa các lần hoàn thành nhiệm vụ này trước để tránh lỗi ràng buộc khóa ngoại
    await prisma.questCompletion.deleteMany({
      where: { questId: id },
    });

    await prisma.quest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã hủy bỏ nhiệm vụ thành công" });
  } catch (error) {
    console.error("Lỗi xóa quest:", error);
    return NextResponse.json(
      { error: "Không thể xóa nhiệm vụ: " + (error instanceof Error ? error.message : "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
