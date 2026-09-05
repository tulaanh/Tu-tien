import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Lấy danh sách toàn bộ bài học (kể cả archived) cho Admin
export async function GET() {
  try {
    const lessons = await prisma.studyLesson.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { progress: true },
        },
      },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Lỗi lấy danh sách bài học admin:", error);
    return NextResponse.json({ error: "Lỗi nạp danh sách bài học" }, { status: 500 });
  }
}

// POST: Tạo bài học mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, title, description, content, exercise, expReward, stoneReward, minRealmLevel } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Tên bài học không được để trống" }, { status: 400 });
    }

    // Nếu không truyền order, tự động lấy order cao nhất + 1
    let lessonOrder = order;
    if (lessonOrder === undefined || lessonOrder === null) {
      const lastLesson = await prisma.studyLesson.findFirst({
        orderBy: { order: "desc" },
      });
      lessonOrder = (lastLesson?.order || 0) + 1;
    }

    const lesson = await prisma.studyLesson.create({
      data: {
        order: Number(lessonOrder),
        title: title.trim(),
        description: description?.trim() || "",
        content: content?.trim() || "",
        exercise: exercise?.trim() || "",
        expReward: Number(expReward) || 50,
        stoneReward: Number(stoneReward) || 20,
        minRealmLevel: Number(minRealmLevel) || 0,
      },
    });

    return NextResponse.json({ message: "Khởi tạo bài học thành công!", lesson });
  } catch (error) {
    console.error("Lỗi tạo bài học:", error);
    return NextResponse.json({ error: "Không thể tạo bài học" }, { status: 500 });
  }
}

// PUT: Cập nhật bài học
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, order, title, description, content, exercise, expReward, stoneReward, minRealmLevel, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài học" }, { status: 400 });
    }

    const updated = await prisma.studyLesson.update({
      where: { id },
      data: {
        ...(order !== undefined && { order: Number(order) }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(exercise !== undefined && { exercise: exercise.trim() }),
        ...(expReward !== undefined && { expReward: Number(expReward) }),
        ...(stoneReward !== undefined && { stoneReward: Number(stoneReward) }),
        ...(minRealmLevel !== undefined && { minRealmLevel: Number(minRealmLevel) }),
        ...(isArchived !== undefined && { isArchived: Boolean(isArchived) }),
      },
    });

    return NextResponse.json({ message: "Cập nhật bài học thành công!", lesson: updated });
  } catch (error) {
    console.error("Lỗi cập nhật bài học:", error);
    return NextResponse.json({ error: "Không thể cập nhật bài học" }, { status: 500 });
  }
}

// DELETE: Xóa bài học
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID bài học" }, { status: 400 });
    }

    // Xóa tiến độ liên quan trước
    await prisma.studyProgress.deleteMany({
      where: { lessonId: id },
    });

    await prisma.studyLesson.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Đã xóa bài học thành công!" });
  } catch (error) {
    console.error("Lỗi xóa bài học:", error);
    return NextResponse.json({ error: "Không thể xóa bài học" }, { status: 500 });
  }
}
