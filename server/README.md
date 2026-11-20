# SaharaMedCare - Backend Server Architecture

Khung cấu trúc backend được thiết lập sẵn cho giai đoạn kết nối cơ sở dữ liệu và realtime:
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Realtime:** Socket.IO (Thông báo trạng thái mẫu xét nghiệm theo thời gian thực)
- **Database:** MySQL 8+ (Connection pooling qua `mysql2/promise`)
- **AI Integration:** Google Gemini API

## Cấu trúc thư mục Server:
```text
server/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── server.js               # Entry point Express + Socket.IO
    ├── config/
    │   └── db.js               # Cấu hình kết nối MySQL pool
    ├── controllers/            # Xử lý logic nghiệp vụ
    │   ├── labResultController.js
    │   ├── chatbotController.js
    │   └── patientController.js
    ├── routes/                 # Định tuyến API
    │   ├── labResultRoutes.js
    │   ├── chatbotRoutes.js
    │   └── patientRoutes.js
    ├── sockets/                # Socket.IO event handlers
    │   └── labStatusSocket.js
    └── models/
        └── schema.sql          # Kịch bản khởi tạo CSDL MySQL y tế
```
