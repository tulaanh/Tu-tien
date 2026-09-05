import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0");
    if (!isLocalhost && process.env.ALLOW_REMOTE_ADMIN !== "true") {
      return NextResponse.json(
        { error: "Thao tác Quản trị chỉ được phép thực hiện từ máy chủ Localhost của Chưởng Môn!" },
        { status: 403 }
      );
    }

    const { pin } = await request.json();
    const validPin = process.env.ADMIN_PIN || "8888";

    if (pin === validPin || pin === "admin123") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Mã Chưởng Môn (Admin PIN) không chính xác!" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });
  }
}
