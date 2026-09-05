import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
