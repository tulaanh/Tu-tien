import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0");
    if (!isLocalhost && process.env.ALLOW_REMOTE_ADMIN !== "true") {
      return NextResponse.json({ error: "Chỉ cho phép truy cập từ Localhost" }, { status: 403 });
    }

    const redemptions = await prisma.redemption.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cultivator: {
          select: { name: true, realm: true },
        },
        reward: true,
      },
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy lịch sử đổi quà" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const updated = await prisma.redemption.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, redemption: updated });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật trạng thái đổi quà" }, { status: 500 });
  }
}
