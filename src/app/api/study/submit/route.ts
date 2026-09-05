import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Nộp báo cáo hoàn thành bài học (chờ Admin duyệt qua Facebook)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId, lessonId, note } = body;

    if (!cultivatorId || !lessonId) {
      return NextResponse.json(
        { error: "Thiếu thông tin Đạo Hữu hoặc Bài Học" },
        { status: 400 }
      );
    }

    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });

    if (!cultivator) {
      return NextResponse.json({ error: "Đạo Hữu không tồn tại" }, { status: 404 });
    }

    const lesson = await prisma.studyLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Bài học không tồn tại" }, { status: 404 });
    }

    // Kiểm tra tiến độ hiện tại
    const existingProgress = await prisma.studyProgress.findUnique({
      where: {
        cultivatorId_lessonId: {
          cultivatorId,
          lessonId,
        },
      },
    });

    if (existingProgress && existingProgress.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Đạo hữu đã hoàn thành xuất sắc bài học này rồi!" },
        { status: 400 }
      );
    }

    if (existingProgress && existingProgress.status === "PENDING") {
      return NextResponse.json(
        { error: "Báo cáo tu luyện đang chờ Trưởng Lão thẩm định. Vui lòng nhắn gửi minh chứng qua Facebook!" },
        { status: 400 }
      );
    }

    // Tạo hoặc cập nhật tiến độ sang PENDING
    const progress = await prisma.studyProgress.upsert({
      where: {
        cultivatorId_lessonId: {
          cultivatorId,
          lessonId,
        },
      },
      update: {
        status: "PENDING",
        note: note || "Đã gửi minh chứng tu luyện qua Facebook",
      },
      create: {
        cultivatorId,
        lessonId,
        status: "PENDING",
        note: note || "Đã gửi minh chứng tu luyện qua Facebook",
      },
    });

    return NextResponse.json({
      message: "Gửi báo cáo thành công! Vui lòng nhắn tin gửi ảnh/video minh chứng qua Facebook cho Trưởng Lão để được thẩm định.",
      progress,
    });
  } catch (error) {
    console.error("Lỗi nộp bài học:", error);
    return NextResponse.json({ error: "Không thể nộp báo cáo bài học lúc này" }, { status: 500 });
  }
}
