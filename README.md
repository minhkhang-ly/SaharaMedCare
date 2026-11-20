# 🏥 SaharaMedCare - Cổng Thông Tin & Tra Cứu Kết Quả Cận Lâm Sàng Tích Hợp Chatbot AI

> **Đồ án môn học:** Quản lý dự án CNTT  
> **Nhóm thực hiện:** Nhóm 3 - Sahara  
> **Mã đề tài:** QL05-W: *Cổng thông tin và tra cứu kết quả cận lâm sàng cho bệnh viện tích hợp chatbot AI*

---

## 👥 Danh Sách Thành Viên & Phân Quyền Trách Nhiệm

| STT | Họ và Tên | Vai Trò (Role) | Nhánh Phụ Trách | Nhiệm Vụ Trọng Tâm |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Lý Minh Khang** | **Tech Lead** | `feat/ai-realtime` | - Quản lý nhánh `main` và `develop`<br>- Thiết lập cấu trúc dự án & chuẩn hóa kiến trúc<br>- Phát triển module AI Clinician & Socket.IO Realtime<br>- Code Review & duyệt Merge Pull Request (PR) |
| **2** | **Đỗ Huy An** | **Frontend Developer** | `feat/frontend-ui` | - Giao diện cổng tra cứu bệnh nhân & Stepper thời gian thực<br>- Giao diện Dashboard cận lâm sàng, xem ảnh DICOM/PACS<br>- Khung Chatbot AI & xuất phiếu báo cáo (PDF/In) |
| **3** | **Nguyễn Thế Ngọc** | **Backend Developer** | `feat/backend-api` | - Thiết kế & tối ưu Database MySQL y tế<br>- Xây dựng RESTful API tra cứu & kết quả xét nghiệm<br>- Tích hợp Realtime cập nhật tiến trình mẫu & logic cảnh báo |

---

## 🌿 Quy Định Hệ Thống Nhánh (Git Branching Strategy)

Dự án áp dụng mô hình chuẩn **Git Flow** nhằm đảm bảo an toàn mã nguồn và tính đồng bộ cao trong quá trình phát triển nhóm:

```text
  main (Production / Release chính thức)
    │
    └── develop (Nhánh tích hợp chính)
          ├── feat/ai-realtime     (Tech Lead - Lý Minh Khang)
          ├── feat/frontend-ui     (Frontend Dev - Đỗ Huy An)
          └── feat/backend-api     (Backend Dev - Nguyễn Thế Ngọc)
```

### 1. Nhánh Cốt Lõi (Core Branches)
- `main`: Nhánh chứa mã nguồn ổn định nhất, đã qua kiểm thử và sẵn sàng báo cáo/triển khai. Chỉ Tech Lead mới có quyền merge vào nhánh này từ `develop`.
- `develop`: Nhánh tích hợp trung tâm. Toàn bộ các tính năng mới sau khi review xong sẽ được merge vào đây.

### 2. Nhánh Tính Năng Của Thành Viên (Feature Branches)
- `feat/ai-realtime` *(Lý Minh Khang)*: Tập trung phát triển trợ lý ảo AI Clinician, luồng gợi ý chẩn đoán sơ bộ, tích hợp Socket.IO streaming trạng thái mẫu phân tích tự động.
- `feat/frontend-ui` *(Đỗ Huy An)*: Tập trung phát triển giao diện React + Vite + Tailwind CSS, các màn hình tra cứu, bảng chỉ số xét nghiệm, modal xem phim X-quang/siêu âm. *(Có thể tách thêm các nhánh con `feat/ui-...`)*.
- `feat/backend-api` *(Nguyễn Thế Ngọc)*: Tập trung phát triển server Express.js, kết nối MySQL Connection Pool, viết các endpoints REST API, xác thực OTP/mã hồ sơ. *(Có thể tách thêm các nhánh con `feat/api-...`)*.

### 3. Quy Trình Phối Hợp Làm Việc (Workflow Guidelines)
1. Trước khi code tính năng mới, luôn kéo mã nguồn mới nhất:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Chuyển sang nhánh làm việc cá nhân (hoặc tạo nhánh con từ nhánh cá nhân):
   ```bash
   git checkout feat/frontend-ui   # Hoặc feat/backend-api, feat/ai-realtime
   ```
3. Đặt thông điệp commit theo chuẩn **Conventional Commits**:
   - `feat: thêm chức năng mới...`
   - `fix: sửa lỗi...`
   - `ui: cập nhật giao diện...`
   - `docs: cập nhật tài liệu...`
   - `chore: cấu hình thư viện, bảo trì...`
4. Khi hoàn thành công việc, đẩy nhánh lên remote và tạo **Pull Request (PR)** hướng về nhánh `develop`:
   - Ghi rõ nội dung thay đổi và ảnh chụp màn hình kiểm thử.
   - Gán Tech Lead (*Lý Minh Khang*) làm Reviewer để duyệt và merge.

---

## 📂 Cấu Trúc Mã Nguồn Dự Án

```text
SaharaMedCare/
├── client/                     # Ứng dụng Frontend (React 19 + Vite + Tailwind CSS + Lucide React + Framer Motion)
│   ├── index.html              # HTML template tích hợp Google Fonts (Plus Jakarta Sans)
│   ├── package.json            # Thư viện Frontend
│   ├── vite.config.js          # Cấu hình Vite Dev Server
│   ├── tailwind.config.js      # Bảng màu y tế công nghệ (Medical Teal/Cyan, Pure White, Alert colors)
│   ├── run-dev.bat             # Script chạy nhanh frontend
│   └── src/
│       ├── main.jsx            # Entry point React
│       ├── App.jsx             # Điều phối trạng thái, tra cứu & điều hướng
│       ├── index.css           # Hiệu ứng Glassmorphism & cấu hình in ấn y khoa
│       ├── data/
│       │   └── mockLabData.js  # Dữ liệu xét nghiệm mẫu chuẩn lâm sàng bệnh viện VN
│       └── components/
│           ├── Navbar.jsx               # Header & thanh menu điều hướng
│           ├── LookupHero.jsx           # Tra cứu nhanh & Stepper thời gian thực
│           ├── LabResultDashboard.jsx   # Bảng chỉ số xét nghiệm chi tiết
│           ├── RiskAnalysisCard.jsx     # Thẻ dự báo rủi ro & gợi ý chuyên khoa
│           ├── ImagingViewerModal.jsx   # Modal xem ảnh X-Quang / Siêu âm DICOM
│           ├── AIChatbotWidget.jsx      # Widget Trợ lý AI y tế thông minh
│           ├── PriceCatalogModal.jsx    # Bảng giá xét nghiệm áp dụng BHYT
│           ├── GuideModal.jsx           # Hướng dẫn chuẩn bị lấy mẫu bệnh nhân
│           └── PrintReportView.jsx      # Mẫu in phiếu kết quả chuẩn Bộ Y Tế
│
├── server/                     # Khung Backend (Node.js + Express + Socket.IO + MySQL)
│   ├── package.json            # Thư viện Backend
│   ├── .env.example            # Mẫu cấu hình biến môi trường
│   ├── README.md               # Tài liệu hướng dẫn Backend
│   └── src/
│       ├── server.js           # Server Express & cấu hình Socket.IO
│       ├── config/db.js        # Cấu hình MySQL Connection Pool
│       ├── controllers/        # Bộ điều khiển xử lý nghiệp vụ
│       ├── routes/             # Định tuyến RESTful API
│       ├── sockets/            # Socket.IO xử lý sự kiện realtime
│       └── models/schema.sql   # Thiết kế CSDL MySQL y tế chuẩn hóa
│
├── .gitignore                  # Bỏ qua node_modules, build artifacts, env...
├── start-dev.bat               # File khởi chạy nhanh dev server từ thư mục gốc
└── README.md                   # Tài liệu hướng dẫn dự án & quy định nhóm
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử Nghiệm

### 1. Yêu cầu môi trường
- **Node.js:** Phiên bản 18+ trở lên
- **Trình duyệt:** Chrome, Edge, Firefox phiên bản hiện đại

### 2. Khởi chạy Frontend Client
```bash
cd client
# Khởi chạy Vite Dev Server:
.\run-dev.bat
# Hoặc:
.\vite.bat --host
```
Truy cập ứng dụng tại: 👉 **[http://localhost:5173/](http://localhost:5173/)**

### 3. Dữ liệu hồ sơ mẫu để tra cứu thử nghiệm:
- **`BN2026-089`** *(Nguyễn Văn An, 52 tuổi)*: Có kết quả đầy đủ (Huyết học, Sinh hóa máu, X-Quang, Siêu âm) với các chỉ số báo động: tiền đái tháo đường (Glucose 7.42, HbA1c 6.8%), men gan tăng, acid uric cao, mỡ máu, gan nhiễm mỡ độ 1.
- **`BN2026-042`** *(Trần Thị Mai, 34 tuổi)*: Kết quả phát hiện thiếu máu thiếu sắt nhẹ.
- **`BN2026-105`** *(Lê Hoàng Bảo, 28 tuổi)*: Trạng thái mẫu đang trong phòng Lab xử lý phân tích tự động.
