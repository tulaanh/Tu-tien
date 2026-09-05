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

    // Kiểm tra lịch sử hoàn thành
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completions = await prisma.questCompletion.findMany({
      where: { cultivatorId },
    });

    const questsWithStatus = quests.map((q) => {
      const isCompletedToday = completions.some((c) => {
        if (c.questId !== q.id) return false;
        if (q.category === "DAILY") {
          return new Date(c.completedAt) >= today;
        }
        return true; // Với Challenge hoặc Breakthrough đã hoàn thành
      });

      return {
        ...q,
        isCompleted: isCompletedToday,
      };
    });

    return NextResponse.json({ quests: questsWithStatus });
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

    await prisma.quest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã hủy bỏ nhiệm vụ thành công" });
  } catch (error) {
    console.error("Lỗi xóa quest:", error);
    return NextResponse.json({ error: "Không thể xóa nhiệm vụ" }, { status: 500 });
  }
}
