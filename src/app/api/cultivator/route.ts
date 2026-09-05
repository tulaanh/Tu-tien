import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRealmByLevel } from "@/lib/cultivation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (!id && !name) {
      // Trả về danh sách tóm tắt hoặc đạo hữu đầu tiên
      const first = await prisma.cultivator.findFirst({
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ cultivator: first });
    }

    const cultivator = await prisma.cultivator.findFirst({
      where: id ? { id } : { name: name! },
      include: {
        completions: {
          orderBy: { completedAt: "desc" },
          take: 10,
          include: { quest: true },
        },
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { reward: true },
        },
      },
    });

    if (!cultivator) {
      return NextResponse.json({ error: "Không tìm thấy Đạo Hữu" }, { status: 404 });
    }

    const realmInfo = getRealmByLevel(cultivator.realmLevel);

    return NextResponse.json({
      cultivator: {
        ...cultivator,
        realmInfo,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin cultivator:", error);
    return NextResponse.json({ error: "Lỗi máy chủ Tiên Giới" }, { status: 500 });
  }
}

// Đăng nhập hoặc Tạo Đạo Hiệu mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, pin } = body;

    if (!name || !name.trim() || !pin) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Đạo Hiệu và Mã PIN bảo mật" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    let cultivator = await prisma.cultivator.findUnique({
      where: { name: cleanName },
    });

    if (cultivator) {
      // Kiểm tra PIN
      if (cultivator.pin !== pin.trim()) {
        return NextResponse.json(
          { error: "Mã PIN không chính xác! Không thể xâm nhập động phủ của đạo hữu khác." },
          { status: 401 }
        );
      }
    } else {
      // Tạo Đạo Hữu mới khởi đầu từ Phàm Nhân
      const initialRealm = getRealmByLevel(0);
      cultivator = await prisma.cultivator.create({
        data: {
          name: cleanName,
          pin: pin.trim(),
          realm: initialRealm.name,
          realmLevel: 0,
          currentExp: 0,
          maxExp: initialRealm.maxExp,
          spiritStones: 20, // Tặng 20 linh thạch tân thủ
          avatar: "sword",
          bio: "Phàm thai nhập đạo, nghịch thiên cải mệnh.",
        },
      });
    }

    const realmInfo = getRealmByLevel(cultivator.realmLevel);

    return NextResponse.json({
      message: cultivator ? "Tiến vào động phủ thành công!" : "Khởi tạo đạo lộ thành công!",
      cultivator: {
        ...cultivator,
        realmInfo,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập/tạo cultivator:", error);
    return NextResponse.json({ error: "Lỗi kết nối Tiên Giới" }, { status: 500 });
  }
}
