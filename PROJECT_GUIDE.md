# 📖 TÀI LIỆU DỰ ÁN VẤN ĐẠO CÁC (AI & DEVELOPER HANDBOOK)

Tài liệu này tổng hợp toàn bộ bối cảnh kiến trúc, quy tắc nghiệp vụ, công thức tính toán và lưu ý vận hành của dự án **Vấn Đạo Các** để các AI Agent và Developer ở các phiên làm việc tiếp theo có thể nắm bắt và tiếp tục phát triển dự án một cách chính xác nhất.

---

## 1. 🏗️ Môi Trường & Kiến Trúc Dự Án

### 1.1. Thư mục mã nguồn & Đồng bộ song song
- **Mã nguồn chính (Primary Directory)**: `D:\Work_Dev\van-dao-cac`
- **Thư mục Antigravity Mirror Workspace**: `c:\Users\Do Anh Tu\Documents\antigravity\eager-galileo`
- **Quy tắc quan trọng**: Khi chỉnh sửa mã nguồn tại `D:\Work_Dev\van-dao-cac`, luôn chạy lệnh đồng bộ sang Antigravity workspace:
  ```powershell
  Copy-Item -Path "D:\Work_Dev\van-dao-cac\*" -Destination "c:\Users\Do Anh Tu\Documents\antigravity\eager-galileo" -Recurse -Force -Exclude "node_modules",".next",".git"
  ```
- **Git Binary Path trên máy**: `D:\tools\git\cmd\git.exe`

### 1.2. Cơ sở dữ liệu & Prisma ORM
- **Database**: PostgreSQL Hosted trên [Neon Cloud](https://neon.tech)
- **Chuỗi kết nối (Connection String)**: Đặt trong `.env` (`DATABASE_URL`)
- **Tập lệnh sinh Prisma Client**: `node scripts/generate.js` hoặc `npx prisma generate`
- **Xử lý lỗi khóa file trên Windows**: Nếu gặp lỗi `EPERM` khi sinh client, hãy dừng các tiến trình Node đang chiếm file:
  ```powershell
  Get-Process -Name node, next -ErrorAction SilentlyContinue | Stop-Process -Force
  ```

### 1.3. Cơ Chế Caching Client-Side & Tối Ưu Chuyển Tab (SWR)
- **Thư viện**: `swr` kết hợp `src/lib/fetcher.ts`
- **Cơ chế Stale-While-Revalidate**:
  - Khi chuyển qua lại giữa các tab (Động Phủ `/`, Nhiệm Vụ `/quests`, Tu Luyện `/study`, Tàng Bảo Các `/shop`, Bảng Phong Thần `/leaderboard`), dữ liệu được hiển thị **ngay lập tức từ cache** mà không bị giật hay spinner loading.
  - SWR tự động revalidate ngầm và deduplicate request (ví dụ: danh sách `/api/quests` được dùng chung giữa `/` và `/quests`, `/api/rewards` giữa `/` và `/shop`).
- **Làm mới dữ liệu (Mutate)**:
  - Khi người dùng nộp nhiệm vụ, đổi quà hoặc gửi điểm thi: gọi hàm `mutate()` tương ứng để cập nhật cache tức thì.
- **Route Loading Skeletons (`loading.tsx`)**:
  - Tất cả các trang đều có file `loading.tsx` skeleton đồng bộ phong cách xianxia để Next.js App Router render tức thì.
- **Next.js Link Prefetch**:
  - Tất cả các link trên Navbar đều có `prefetch={true}` để Next.js nạp trước route chunks.

---

## 2. 🗄️ Cấu Trúc Database Schema (`prisma/schema.prisma`)

1. **`Cultivator` (Đạo Hữu / Người Dùng)**:
   - `id`, `name` (unique), `pin` (mã PIN 4 số), `realm` (tên cảnh giới), `realmLevel` (0 - 17), `currentExp`, `maxExp`, `spiritStones`, `isBottleneck` (boolean), `streakCount` (số ngày chuỗi), `lastStreakDate` (ngày đạt chuỗi gần nhất), `avatar`, `bio`.
2. **`Quest` (Nhiệm Vụ)**:
   - `id`, `title`, `description`, `category` (`DAILY` | `CHALLENGE` | `BREAKTHROUGH`), `minRealmLevel`, `expReward`, `stoneReward`, `difficulty`, `icon`, `isArchived`.
3. **`QuestCompletion` (Báo Cáo Hoàn Thành Nhiệm Vụ)**:
   - `id`, `cultivatorId`, `questId`, `status` (`PENDING` | `APPROVED` | `REJECTED`), `note`, `createdAt`, `completedAt`.
4. **`ExamReport` (Báo Cáo Điểm Bài Kiểm Tra / Tu Luyện)**:
   - `id`, `cultivatorId`, `subject`, `examType` (`REGULAR` | `MIDTERM` | `FINAL`), `score` (8.0 - 10.0), `expReward`, `stoneReward`, `note`, `status` (`PENDING` | `APPROVED` | `REJECTED`), `createdAt`, `approvedAt`.
5. **`Reward` (Vật Phẩm Tàng Bảo Các)**:
   - `id`, `title`, `description`, `category` (`REAL_LIFE` | `BREAKTHROUGH_PILL`), `cost`, `stock`, `icon`, `isArchived`.
6. **`Redemption` (Lịch Sử Đổi Quà)**:
   - `id`, `cultivatorId`, `rewardId`, `cost`, `status` (`PENDING` | `USED`), `createdAt`, `usedAt`.

---

## 3. ⚖️ Quy Tắc Nghiệp Vụ & Công Thức Tính Toán

### 3.1. Cảnh Giới & Bình Cảnh (`src/lib/realmConfig.ts`)
- Gồm 18 cảnh giới: *Phàm Nhân (Lv.0) ➔ Luyện Khí Tầng 1..9 (Lv.1..9) ➔ Trúc Cơ Sơ/Trung/Hậu (Lv.10..12) ➔ Kim Đan Sơ/Trung/Hậu (Lv.13..15) ➔ Nguyên Anh (Lv.16) ➔ Hóa Thần (Lv.17)*.
- Khi `currentExp >= maxExp`, đệ tử bị rơi vào trạng thái `isBottleneck = true` (không thể tích lũy thêm EXP vượt quá `maxExp`).
- Đột phá bằng cách: Làm nhiệm vụ đột phá hoặc dùng **Trúc Cơ Thần Đan** trong Tàng Bảo Các.

### 3.2. Tu Luyện Đổi Điểm Kiểm Tra (`src/lib/studyConfig.ts`)
- Áp dụng thang điểm **8.0 đến 10.0**:
  - `8.0 – 8.4`: `+50 ~ +70 Tu Vi`, `0 Linh Thạch`
  - `8.5 – 8.9`: `+75 ~ +95 Tu Vi`, `+5 ~ +9 Linh Thạch`
  - `9.0 – 9.4`: `+110 ~ +150 Tu Vi`, `+10 ~ +16 Linh Thạch`
  - `9.5 – 9.9`: `+160 ~ +192 Tu Vi`, `+18 ~ +22 Linh Thạch`
  - `10.0`: `+200 Tu Vi`, `+25 Linh Thạch`
- Hệ số bài thi:
  - Kiểm tra Thường xuyên: `x1`
  - Kiểm tra Giữa kỳ: `x2`
  - Kiểm tra Cuối kỳ / Đồ án: `x3`

### 3.3. Nhiệm Vụ Đường, Thanh Tiến Độ & Chuỗi Ngày (Streak 🔥)
- **Thanh tiến độ**: Chỉ áp dụng cho nhiệm vụ **Nhật Thường (`category: DAILY`)**.
- **Tăng chuỗi**: Khi nộp đủ 100% nhiệm vụ nhật thường trong ngày ➔ `streakCount` tăng +1 ngày.
- **Thưởng chuỗi**: Mỗi 1 ngày chuỗi tăng **+1% phần thưởng** (tối đa **+30%**) cho ngày hôm sau (áp dụng cả Tu Vi & Linh Thạch).
- **Reset chuỗi**: Nếu bỏ lỡ 1 ngày không nộp đủ 100% nhiệm vụ nhật thường ➔ `streakCount` reset về 0.

### 3.4. Quy Trình Thẩm Định Minh Chứng Qua Facebook
- Đệ tử nộp báo cáo (Nhiệm vụ hoặc Điểm thi) ➔ Đơn ở trạng thái `PENDING`.
- Đệ tử gửi ảnh/video minh chứng qua tin nhắn Facebook cho Admin.
- Admin truy cập `/admin` (chỉ cho phép mở từ Localhost) để Phê chuẩn hoặc Bác bỏ:
  - Khi phê chuẩn: Tự động cộng Tu Vi & Linh Thạch (kèm Streak Bonus), cập nhật điểm nghẽn cảnh giới.

---

## 4. 🌐 Danh Sách Tuyến API (Backend Endpoints)

| Endpoint | Method | Chức Năng |
| :--- | :---: | :--- |
| `/api/cultivator` | `GET/POST` | Lấy thông tin / Đăng ký / Đăng nhập Đạo hữu |
| `/api/cultivator/breakthrough` | `POST` | Thực hiện đột phá cảnh giới |
| `/api/quests` | `GET/POST/PUT/DELETE` | Lấy danh sách nhiệm vụ (+ stats, streak info) / Quản lý quest |
| `/api/quests/complete` | `POST` | Nộp báo cáo nhiệm vụ (kích hoạt kiểm tra tăng streak) |
| `/api/study` | `GET/POST` | Lấy lịch sử & nộp báo cáo điểm kiểm tra |
| `/api/rewards` | `GET/POST/PUT/DELETE` | Lấy danh sách vật phẩm / Quản trị Tàng Bảo Các |
| `/api/rewards/redeem` | `POST` | Đổi vật phẩm / Sử dụng đan dược |
| `/api/admin/submissions` | `GET/PUT` | Quản lý thẩm định báo cáo nhiệm vụ & điểm thi |
| `/api/admin/redemptions` | `GET/PUT` | Quản lý trao quà ngoài đời thực |
| `/api/admin/verify` | `POST` | Xác thực mã PIN Admin |
| `/api/leaderboard` | `GET` | Bảng xếp hạng đệ tử |

---

## 5. 🛠️ Lưu Ý Vận Hành Cho AI & Dev Tiếp Theo
1. Luôn chạy `npm run build` để kiểm tra trước khi hoàn thành task.
2. Quản lý trạng thái Admin: Admin chỉ được phép truy cập từ Localhost (`localhost:3000`).
3. Mọi dữ liệu về phần thưởng nhiệm vụ, điểm thi và đổi quà đều phải đồng bộ với thông báo gửi minh chứng qua Facebook.
