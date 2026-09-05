import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cultivatorId = searchParams.get("cultivatorId");

    const lessons = await prisma.studyLesson.findMany({
      where: { isArchived: false },
      orderBy: { order: "asc" },
    });

    if (lessons.length === 0) {
      return NextResponse.json({ lessons: [] });
    }

    if (!cultivatorId) {
      const guestLessons = lessons.map((l, index) => ({
        ...l,
        status: index === 0 ? "UNLOCKED" : "LOCKED",
        progress: null,
      }));
      return NextResponse.json({ lessons: guestLessons });
    }

    const progressList = await prisma.studyProgress.findMany({
      where: { cultivatorId },
    });

    const progressMap = new Map(progressList.map((p) => [p.lessonId, p]));

    let previousCompleted = true;

    const mappedLessons = lessons.map((lesson) => {
      const prog = progressMap.get(lesson.id);
      let status = "LOCKED";
      let note = prog?.note || null;

      if (prog) {
        status = prog.status;
      } else if (previousCompleted) {
        status = "UNLOCKED";
      } else {
        status = "LOCKED";
      }

      previousCompleted = status === "COMPLETED";

      return {
        ...lesson,
        status,
        note,
        progressId: prog?.id || null,
      };
    });

    return NextResponse.json({ lessons: mappedLessons });
  } catch (error) {
    console.error("Lỗi lấy danh sách bài học:", error);
    return NextResponse.json({ error: "Lỗi nạp lộ trình tu luyện" }, { status: 500 });
  }
}
