# ⚡ VẤN ĐẠO CÁC — HỆ THỐNG TU TIÊN ĐỜI THỰC (XIANXIA LIFE RPG)

> **"Thiên Đạo Thù Cần — Đạo Tâm Bất Hoảng, Đại Đạo Tự Thành."**  
> Ứng dụng Gamification phong cách Tiên Hiệp giúp chuyển hóa mọi mục tiêu, thói quen và công việc đời thực thành hành trình tu tiên đắc đạo!

---

## ✨ Tính Năng Nổi Bật

- ⛩️ **Hệ Thống Cảnh Giới Tiên Hiệp**:
  - 18 cấp bậc cảnh giới chuẩn mực: *Phàm Nhân → Luyện Khí (9 Tầng) → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần...*
  - Cơ chế **Bình Cảnh (Bottleneck)** khi đạt 100% Tu Vi → Kích hoạt thử thách **Đột Phá Thiên Kiếp** với hiệu ứng pháo hoa mãn nhãn!
- 📜 **Nhiệm Vụ Đường (Quest Board)**:
  - **Nhật Thường (Daily)**: Reset mỗi ngày (Dậy sớm, luyện thể, đọc sách, dọn dẹp động phủ...).
  - **Thử Thách (Challenge)**: Dứt điểm các dự án và deadline khó nhằn.
  - **Đột Phá (Breakthrough)**: Vượt qua giới hạn bản thân để phi thăng cảnh giới.
- 🎁 **Tàng Bảo Các (Reward Shop)**:
  - Dùng **Linh Thạch** tích lũy để đổi quà đời thực (*Trà sữa, vé xem phim, giờ chơi game xả hơi, bữa ăn ngon...*)
  - Đổi **Trúc Cơ Thần Đan** giúp phá vỡ bình cảnh, đột phá cảnh giới ngay lập tức!
- 🏆 **Bảng Phong Thần (Leaderboard)**:
  - So tài tu vi, vinh danh các bậc đại năng dẫn đầu thiên hạ.
- 🛡️ **Quản Trị Tông Môn (Admin Portal)**:
  - Dành riêng cho Chưởng Môn (Admin) quản lý: Tạo/Sửa/Xóa nhiệm vụ & phần thưởng, duyệt lịch sử đổi quà ngoài đời thực.
- 📱 **Tối Ưu Toàn Diện Mobile (PWA / Mobile-First)**:
  - Thanh điều hướng cố định ở đáy màn hình (Bottom Navigation Bar) chuẩn app di động native.
  - Chuẩn thao tác chạm cảm ứng công thái học (≥ 44px).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend & Backend**: [Next.js 16 (App Router)](https://nextjs.org), React 19, TypeScript
- **Styling**: Tailwind CSS 4 (Xianxia Dark Fantasy Palette)
- **Database & ORM**: SQLite (`prisma/dev.db`), Prisma ORM 6
- **Icons & Effects**: `lucide-react`, `canvas-confetti`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/tulaanh/Tu-tien.git
   cd Tu-tien
   ```

2. **Cài đặt các gói phụ thuộc**:
   ```bash
   npm install
   ```

3. **Khởi tạo cơ sở dữ liệu & nạp dữ liệu mẫu**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Chạy máy chủ phát triển (Dev Server)**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:3000`

---

## 🔑 Thông Tin Mặc Định

- **Đạo Hữu mẫu**: Đạo Hiệu `Hàn Lập` | PIN `1234`
- **Mã Chưởng Môn (Admin PIN)**: `8888` (hoặc `admin123`)

---

## 🌐 Hướng Dẫn Triển Khai Lên Mạng Miễn Phí (Deploy lên Vercel)

1. Truy cập [vercel.com/new](https://vercel.com/new) và đăng nhập bằng tài khoản GitHub của bạn.
2. Chọn repository **`Tu-tien`** và bấm **Import**.
3. Tại phần Cấu hình:
   - **Framework Preset**: Next.js (mặc định)
   - Bấm **Deploy**.
4. Sau 1 phút, Vercel sẽ cung cấp đường link website trực tiếp để bạn truy cập từ điện thoại hoặc chia sẻ cho mọi người!

---

*Phát triển với tâm huyết bởi Đỗ Anh Tú.*
