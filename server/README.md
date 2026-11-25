# 🏥 SaharaMedCare - Backend LIS & RESTful API Service

> **Thành viên phụ trách:** Nguyễn Thế Ngọc (Backend Developer)  
> **Nhánh phát triển:** `feat/backend-ai`  
> **Giai đoạn hiện tại:** **Giai đoạn 1 (Tuần 2 – Tuần 3): Thiết kế Database & API Lõi**  
> **Đồ án:** QL05-W - Cổng thông tin và tra cứu kết quả cận lâm sàng tích hợp Chatbot AI  

---

## 📌 Tổng Quan Giai Đoạn 1 (Phase 1 Deliverables)

Theo đúng kế hoạch triển khai của nhóm Sahara, Giai đoạn 1 tập trung xây dựng toàn bộ nền tảng dữ liệu y tế thực tế và hệ thống API lõi:
1. **Thiết kế & Khởi tạo CSDL MySQL chuẩn hóa (`schema.sql`):** Quản lý hồ sơ bệnh nhân, danh mục bác sĩ, phiếu chỉ định cận lâm sàng, kết quả xét nghiệm 18 thông số huyết học & sinh hóa, chẩn đoán hình ảnh DICOM/X-quang, bảng giá BHYT.
2. **Bộ dữ liệu mẫu thực tế chuẩn y khoa (`seed.sql` & `mockData.js`):** Bám sát dữ liệu thực tế từ Bệnh viện Đa khoa / Đại học Y Dược TP.HCM (nói không với số ảo), đã ẩn danh thông tin cá nhân.
3. **Bộ RESTful API hoàn chỉnh (Node.js + Express):**
   - Tra cứu hồ sơ bệnh nhân (`/api/patients/lookup`) phục vụ trực tiếp cho Hero Lookup của Frontend.
   - Tra cứu kết quả cận lâm sàng chi tiết (`/api/lab-results/:patientId`) với Range Bar, cảnh báo bất thường, chẩn đoán hình ảnh và phân tích rủi ro.
   - Quản lý danh sách & hồ sơ bệnh nhân (`/api/patients`).
   - Quản lý phiếu chỉ định & cập nhật tiến trình xét nghiệm (`/api/lab-results/orders`).
   - Quản lý danh mục bác sĩ chuyên khoa (`/api/doctors`).
   - Danh mục xét nghiệm & bảng giá BHYT, hướng dẫn chuẩn bị lấy mẫu (`/api/catalog`).
4. **Cơ chế Dual-Mode thông minh:** Kết nối trực tiếp MySQL Connection Pool khi có CSDL; tự động kích hoạt High-Fidelity Clinical Mock Store nếu MySQL chưa khởi động để việc phát triển frontend và test API diễn ra liên tục, mượt mà.

---

## 🛠️ Công Nghệ Sử Dụng

- **Runtime:** Node.js (ES Modules `import/export`)
- **Web Framework:** Express.js 4.x
- **Database Driver:** `mysql2/promise` (Connection Pooling)
- **Realtime Ready:** Socket.IO Server (chuẩn bị sẵn cho Giai đoạn 2)
- **Security & Config:** `dotenv`, `cors`, `jsonwebtoken`

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử Nghiệm

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
cd server
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` dựa trên file `.env.example`:
```env
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=saharamedcare_db

# Security & AI
JWT_SECRET=sahara_medcare_secret_token_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Khởi tạo Cơ sở dữ liệu MySQL & Nạp Seed Data
*(Đảm bảo MySQL / XAMPP / Laragon đã được bật và đang lắng nghe cổng 3306)*
```bash
npm run db:init
# hoặc:
npm run db:seed
```

### 4. Khởi chạy Server Backend
```bash
# Chế độ phát triển (Tự động reload với nodemon):
npm run dev

# Hoặc chế độ production thông thường:
npm start
```
Server sẽ chạy tại: 👉 **`http://localhost:5000`**

### 5. Chạy Kiểm Thử Tự Động (API Verification Suite)
```bash
npm run test:api
```

---

## 📋 Danh Sách Endpoints RESTful API Chi Tiết

### 1. Hệ thống & Kiểm tra Sức khỏe (Health Check)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra tình trạng hoạt động của API Server |
| `GET` | `/api` | Danh mục tổng hợp tất cả các routes khả dụng |

### 2. Xác thực & Phân quyền (Authentication & Authorization)
| Method | Endpoint | Quyền | Mô tả | Body mẫu / Header |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Công khai | **Đăng ký tài khoản Bệnh nhân** | `{"role": "PATIENT", "fullName": "...", "phoneNumber": "...", "dateOfBirth": "...", "gender": "...", "password": "..."}` |
| `POST` | `/api/auth/login` | Công khai | **Đăng nhập Bệnh nhân / Bác sĩ** | `{"role": "PATIENT" \| "DOCTOR", "identifier": "...", "password": "..."}` |
| `GET` | `/api/auth/me` | Bearer Token | Lấy thông tin user hiện tại | Header: `Authorization: Bearer <JWT>` |

### 3. Tra cứu & Quản lý Bệnh nhân (`/api/patients`)
| Method | Endpoint | Mô tả | Body mẫu / Tham số |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/patients/lookup` | **Tra cứu hồ sơ cho Hero Lookup** | `{"patientCode": "BN2026-089", "phone": "0912345678"}` |
| `GET` | `/api/patients` | Danh sách bệnh nhân (tìm kiếm) | `?q=Nguyễn&limit=20` |
| `GET` | `/api/patients/:patientId` | Thông tin chi tiết một bệnh nhân | Param: `patientId` |
| `POST` | `/api/patients` | Tiếp nhận / tạo mới bệnh nhân | `{"patientId": "BN2026-999", "fullName": "...", ...}` |
| `PUT` | `/api/patients/:patientId` | Cập nhật hồ sơ bệnh nhân | Body chứa các trường cần sửa |
| `DELETE` | `/api/patients/:patientId` | Xóa hồ sơ bệnh nhân | Param: `patientId` |

### 3. Quản lý Kết quả Cận Lâm Sàng (`/api/lab-results`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/lab-results/:patientId` | **Tra cứu toàn bộ kết quả xét nghiệm & CĐHA của bệnh nhân** (Khớp 100% với Frontend Dashboard) |
| `GET` | `/api/lab-results/orders` | Danh sách phiếu chỉ định cận lâm sàng (`?status=COMPLETED`) |
| `GET` | `/api/lab-results/orders/:orderId` | Chi tiết một phiếu chỉ định cụ thể |
| `POST` | `/api/lab-results/orders` | Tạo mới phiếu chỉ định xét nghiệm |
| `PATCH` | `/api/lab-results/orders/:orderId/status` | Cập nhật trạng thái phiếu (`RECEIVED` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED`) |
| `POST` | `/api/lab-results/orders/:orderId/results` | Nhập danh sách chỉ số xét nghiệm chi tiết |
| `POST` | `/api/lab-results/orders/:orderId/images` | Thêm kết quả chẩn đoán hình ảnh (X-quang / Siêu âm) |

### 4. Danh mục Bác sĩ (`/api/doctors`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/doctors` | Danh sách bác sĩ chỉ định & duyệt kết quả |
| `GET` | `/api/doctors/:doctorId` | Thông tin chi tiết một bác sĩ |
| `POST` | `/api/doctors` | Thêm mới bác sĩ |
| `PUT` | `/api/doctors/:doctorId` | Cập nhật thông tin bác sĩ |

### 5. Bảng Giá Xét Nghiệm & Hướng Dẫn Chuẩn Bị (`/api/catalog`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/catalog/tests` | Bảng giá xét nghiệm & tỷ lệ thanh toán BHYT |
| `GET` | `/api/catalog/categories` | Danh mục các nhóm xét nghiệm (Huyết học, Sinh hóa, CĐHA...) |
| `GET` | `/api/catalog/guidelines` | Hướng dẫn chuẩn bị lấy mẫu cho bệnh nhân |

---

## 📑 Dữ Liệu Tra Cứu Thực Tế Cho Kiểm Thử

- **`BN2026-089` (Nguyễn Văn An, 52 tuổi - Nam):** Có đầy đủ kết quả Huyết học (15 chỉ số), Sinh hóa (12 chỉ số cảnh báo đái tháo đường & men gan tăng), 2 phim X-Quang phổi và Siêu âm gan nhiễm mỡ.
- **`BN2026-042` (Trần Thị Mai, 34 tuổi - Nữ):** Kết quả phát hiện thiếu máu hồng cầu nhỏ nhược sắc nhẹ (HGB 108 g/L, Ferritin giảm).
- **`BN2026-105` (Lê Hoàng Bảo, 28 tuổi - Nam):** Trạng thái mẫu đang chạy tại Lab (`PROCESSING`, Step 2).
- **`BN2026-118` (Vũ Đức Minh, 45 tuổi - Nam):** Kết quả khám sức khỏe tổng quát bình thường (`COMPLETED`, Step 3).
