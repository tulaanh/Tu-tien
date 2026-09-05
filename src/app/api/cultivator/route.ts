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

// Đăng nhập hoặc Đăng ký Đạo Hiệu mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, pin, action, avatar, bio } = body;

    if (!name || !name.trim() || !pin) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Đạo Hiệu và Mã PIN bảo mật" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanPin = String(pin).trim();
    let cultivator = await prisma.cultivator.findUnique({
      where: { name: cleanName },
    });

    // 1. Chế độ Đăng ký (Register)
    if (action === "register") {
      if (cultivator) {
        return NextResponse.json(
          { error: `Đạo hiệu "${cleanName}" đã có người đăng ký! Vui lòng chọn Đạo hiệu khác hoặc chuyển sang tab Đăng Nhập.` },
          { status: 400 }
        );
      }

      if (cleanPin.length < 4) {
        return NextResponse.json(
          { error: "Mã PIN phải có ít nhất 4 ký tự/chữ số để bảo vệ động phủ!" },
          { status: 400 }
        );
      }

      const initialRealm = getRealmByLevel(0);
      cultivator = await prisma.cultivator.create({
        data: {
          name: cleanName,
          pin: cleanPin,
          realm: initialRealm.name,
          realmLevel: 0,
          currentExp: 0,
          maxExp: initialRealm.maxExp,
          spiritStones: 0, // Khởi đầu từ 0 linh thạch, tích lũy qua làm nhiệm vụ
          avatar: avatar || "sword",
          bio: bio || "Phàm thai nhập đạo, nghịch thiên cải mệnh.",
        },
      });

      const realmInfo = getRealmByLevel(cultivator.realmLevel);
      return NextResponse.json({
        message: "Chúc mừng đạo hữu đã khai mở tiên lộ thành công!",
        cultivator: {
          ...cultivator,
          realmInfo,
        },
      });
    }

    // 2. Chế độ Đăng nhập (Login)
    if (action === "login") {
      if (!cultivator) {
        return NextResponse.json(
          { error: `Đạo hiệu "${cleanName}" chưa từng xuất hiện tại Vấn Đạo Các. Vui lòng chuyển sang tab "Đăng Ký" để tạo tài khoản mới!` },
          { status: 404 }
        );
      }

      if (cultivator.pin !== cleanPin) {
        return NextResponse.json(
          { error: "Mã PIN không chính xác! Không thể xâm nhập động phủ của đạo hữu khác." },
          { status: 401 }
        );
      }

      const realmInfo = getRealmByLevel(cultivator.realmLevel);
      return NextResponse.json({
        message: `Chào mừng Đạo hữu ${cultivator.name} trở lại động phủ!`,
        cultivator: {
          ...cultivator,
          realmInfo,
        },
      });
    }

    // 3. Chế độ tự động / Fallback tương thích
    if (cultivator) {
      if (cultivator.pin !== cleanPin) {
        return NextResponse.json(
          { error: "Mã PIN không chính xác! Không thể xâm nhập động phủ của đạo hữu khác." },
          { status: 401 }
        );
      }
    } else {
      const initialRealm = getRealmByLevel(0);
      cultivator = await prisma.cultivator.create({
        data: {
          name: cleanName,
          pin: cleanPin,
          realm: initialRealm.name,
          realmLevel: 0,
          currentExp: 0,
          maxExp: initialRealm.maxExp,
          spiritStones: 0,
          avatar: avatar || "sword",
          bio: bio || "Phàm thai nhập đạo, nghịch thiên cải mệnh.",
        },
      });
    }

    const realmInfo = getRealmByLevel(cultivator.realmLevel);
    return NextResponse.json({
      message: "Tiến vào động phủ thành công!",
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
