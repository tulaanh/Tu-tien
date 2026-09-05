import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateExamReward, ExamType } from "@/lib/studyConfig";

// GET: Lấy danh sách lịch sử báo điểm bài kiểm tra
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cultivatorId = searchParams.get("cultivatorId");

    if (!cultivatorId) {
      return NextResponse.json({ reports: [] });
    }

    const reports = await prisma.examReport.findMany({
      where: { cultivatorId },
      orderBy: { createdAt: "desc" },
    });

    // Thống kê tổng Tu Vi & Linh Thạch nhận từ bài kiểm tra
    const totalApproved = reports.filter((r) => r.status === "APPROVED");
    const totalExpEarned = totalApproved.reduce((sum, r) => sum + r.expReward, 0);
    const totalStonesEarned = totalApproved.reduce((sum, r) => sum + r.stoneReward, 0);

    return NextResponse.json({
      reports,
      stats: {
        totalReports: reports.length,
        approvedCount: totalApproved.length,
        totalExpEarned,
        totalStonesEarned,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách báo điểm kiểm tra:", error);
    return NextResponse.json({ error: "Lỗi nạp danh sách báo điểm" }, { status: 500 });
  }
}

// POST: Nộp báo cáo điểm bài kiểm tra mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cultivatorId, subject, examType, score, note } = body;

    if (!cultivatorId || !subject || !subject.trim() || score === undefined || score === null) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ Tên môn học và Điểm số đạt được!" },
        { status: 400 }
      );
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 8.0 || numScore > 10.0) {
      return NextResponse.json(
        { error: "Tông Môn chỉ trao thưởng cho các bài kiểm tra đạt điểm từ 8.0 đến 10.0!" },
        { status: 400 }
      );
    }

    const validExamType: ExamType = (["REGULAR", "MIDTERM", "FINAL"].includes(examType) ? examType : "REGULAR") as ExamType;
    const { expReward, stoneReward } = calculateExamReward(numScore, validExamType);

    const cultivator = await prisma.cultivator.findUnique({
      where: { id: cultivatorId },
    });

    if (!cultivator) {
      return NextResponse.json({ error: "Đạo Hữu không tồn tại" }, { status: 404 });
    }

    const report = await prisma.examReport.create({
      data: {
        cultivatorId,
        subject: subject.trim(),
        examType: validExamType,
        score: numScore,
        expReward,
        stoneReward,
        note: note?.trim() || "Đã gửi ảnh bài kiểm tra qua Facebook cho Trưởng Lão",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: `Đã gửi báo cáo điểm ${numScore} môn ${subject.trim()}! Vui lòng gửi ảnh minh chứng bài thi qua Facebook cho Trưởng Lão để được thẩm định.`,
      report,
    });
  } catch (error) {
    console.error("Lỗi gửi báo cáo điểm:", error);
    return NextResponse.json({ error: "Không thể nộp báo cáo điểm lúc này" }, { status: 500 });
  }
}
