import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isArchived: false },
      orderBy: [{ category: "desc" }, { cost: "asc" }],
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("Lỗi lấy danh sách rewards:", error);
    return NextResponse.json({ error: "Lỗi mở Tàng Bảo Các" }, { status: 500 });
  }
}

// Admin: Tạo vật phẩm mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, cost, stock, icon } = body;

    if (!title || !description || !cost) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên, mô tả và giá linh thạch" },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || "REAL_LIFE",
        cost: Number(cost),
        stock: stock !== undefined && stock !== "" ? Number(stock) : -1,
        icon: icon || (category === "PILL" ? "sparkle" : "gift"),
      },
    });

    return NextResponse.json({ success: true, reward });
  } catch (error) {
    console.error("Lỗi tạo reward:", error);
    return NextResponse.json({ error: "Không thể thêm vật phẩm vào Tàng Bảo Các" }, { status: 500 });
  }
}

// Admin: Cập nhật vật phẩm
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, category, cost, stock, icon } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID vật phẩm" }, { status: 400 });
    }

    const updated = await prisma.reward.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description?.trim(),
        category,
        cost: Number(cost),
        stock: stock !== undefined && stock !== "" ? Number(stock) : -1,
        icon,
      },
    });

    return NextResponse.json({ success: true, reward: updated });
  } catch (error) {
    console.error("Lỗi sửa reward:", error);
    return NextResponse.json({ error: "Không thể chỉnh sửa vật phẩm" }, { status: 500 });
  }
}

// Admin: Xóa vật phẩm
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID vật phẩm" }, { status: 400 });
    }

    // Xóa các lịch sử đổi thưởng liên quan trước
    await prisma.redemption.deleteMany({
      where: { rewardId: id },
    });

    await prisma.reward.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã gỡ vật phẩm khỏi Tàng Bảo Các" });
  } catch (error) {
    console.error("Lỗi xóa reward:", error);
    return NextResponse.json(
      { error: "Không thể xóa vật phẩm: " + (error instanceof Error ? error.message : "Lỗi máy chủ") },
      { status: 500 }
    );
  }
}
