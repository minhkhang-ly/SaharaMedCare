-- =====================================================================
-- 🏥 SAHARAMEDCARE - HỆ THỐNG CƠ SỞ DỮ LIỆU CẬN LÂM SÀNG BỆNH VIỆN
-- Tác giả: Nguyễn Thế Ngọc (Backend Developer - feat/backend-ai)
-- Đồ án: QL05-W - Cổng tra cứu cận lâm sàng tích hợp AI
-- Chuẩn CSDL: MySQL 8.0+ / MariaDB 10.5+ (utf8mb4_unicode_ci)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS saharamedcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saharamedcare_db;

-- 1. Bảng Bác sĩ (Doctors)
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id VARCHAR(20) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    title VARCHAR(50) NOT NULL,          -- BS. CKII, TS. BS, ThS. BS, BS. CKI
    department VARCHAR(100) NOT NULL,    -- Khoa Khám bệnh, Khoa Xét nghiệm, Khoa CĐHA
    clinic_room VARCHAR(100),            -- Phòng khám số 08, Phòng siêu âm 02...
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Bệnh nhân (Patients)
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(20) PRIMARY KEY,  -- Ví dụ: BN2026-089
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    national_id VARCHAR(20),
    health_insurance_number VARCHAR(25),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number),
    INDEX idx_national_id (national_id)
);

-- 3. Bảng Nhóm xét nghiệm (Lab Categories)
CREATE TABLE IF NOT EXISTS lab_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) NOT NULL UNIQUE, -- hematology, biochemistry, imaging, urinalysis
    code_prefix VARCHAR(10) NOT NULL,          -- HH, SH, CDHA, NT
    category_name VARCHAR(150) NOT NULL,       -- Huyết học (...), Sinh hóa máu (...), Chẩn đoán hình ảnh (...)
    method_note TEXT,                          -- Máy Sysmex XN-1000, Roche Cobas 8000...
    display_order INT DEFAULT 0
);

-- 4. Bảng Danh mục xét nghiệm & Bảng giá BHYT (Lab Test Catalog)
CREATE TABLE IF NOT EXISTS lab_test_catalog (
    service_code VARCHAR(30) PRIMARY KEY,      -- HH-01, SH-01, SH-02...
    category_id INT NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    sample_type VARCHAR(100),                  -- Máu toàn phần EDTA, Huyết thanh, Nước tiểu...
    turnaround_time VARCHAR(50),               -- 45-60 phút
    price DECIMAL(12, 0) NOT NULL,             -- 120000
    price_formatted VARCHAR(50) NOT NULL,      -- 120.000 VNĐ
    bhyt_coverage VARCHAR(50) NOT NULL,        -- Có hỗ trợ 80-100%
    preparation_guide TEXT,
    FOREIGN KEY (category_id) REFERENCES lab_categories(category_id) ON DELETE CASCADE
);

-- 5. Bảng Phiếu chỉ định cận lâm sàng (Lab Orders)
CREATE TABLE IF NOT EXISTS lab_orders (
    order_id VARCHAR(30) PRIMARY KEY,          -- Ví dụ: CLS2026-1119-089
    patient_id VARCHAR(20) NOT NULL,
    sample_code VARCHAR(50),                   -- MAU-882910
    barcode VARCHAR(50),                       -- BN2026089CLS
    doctor_name VARCHAR(120) NOT NULL,
    ordering_doctor_id VARCHAR(20),
    clinic_room VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    clinical_diagnosis TEXT NOT NULL,          -- Chẩn đoán lâm sàng sơ bộ
    status ENUM('RECEIVED', 'PROCESSING', 'COMPLETED', 'DOCTOR_SIGNED') DEFAULT 'RECEIVED',
    current_step INT DEFAULT 1,                -- 1: Đã tiếp nhận, 2: Đang phân tích, 3: Hoàn tất ký số
    status_text VARCHAR(200),
    sampling_time DATETIME NOT NULL,
    received_lab_time DATETIME,
    completed_time DATETIME,
    reviewer_doctor VARCHAR(120),              -- TS. BS. Trần Minh Quân (Trưởng khoa XN)
    risk_summary JSON,                         -- Cấu trúc phân tích rủi ro y khoa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (ordering_doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    INDEX idx_patient_order (patient_id, status)
);

-- 6. Bảng Kết quả chỉ số cận lâm sàng (Lab Test Results)
CREATE TABLE IF NOT EXISTS lab_test_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    category_id INT NOT NULL,
    indicator_code VARCHAR(50) NOT NULL,       -- RBC, HGB, GLU, HBA1C, AST, ALT...
    indicator_name VARCHAR(150) NOT NULL,      -- Tên chỉ số tiếng Việt
    value_numeric DECIMAL(10, 2),
    value_text VARCHAR(100),
    unit VARCHAR(30),                          -- g/L, mmol/L, U/L, T/L...
    ref_min DECIMAL(10, 2),
    ref_max DECIMAL(10, 2),
    ref_text VARCHAR(100),                     -- "4.0 - 5.8", "< 35.0", v.v.
    status_flag ENUM('NORMAL', 'HIGH', 'LOW', 'CRITICAL') DEFAULT 'NORMAL',
    delta_text VARCHAR(30),                    -- "+15.9%", "-10.0%"
    note TEXT,
    display_order INT DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES lab_categories(category_id) ON DELETE CASCADE,
    INDEX idx_order_indicator (order_id, category_id)
);

-- 7. Bảng Hình ảnh chẩn đoán cận lâm sàng (Lab Images - DICOM/X-Quang/Siêu âm)
CREATE TABLE IF NOT EXISTS lab_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    modality VARCHAR(50) NOT NULL,             -- XRAY, ULTRASOUND, CT, MRI
    title VARCHAR(200) NOT NULL,               -- Chụp X-quang Ngực thẳng, Siêu âm ổ bụng...
    performed_time DATETIME,
    radiologist VARCHAR(120),                  -- BS. CKI. Nguyễn Quốc Huy
    image_url TEXT NOT NULL,
    description TEXT,                          -- Mô tả hình ảnh học chi tiết
    conclusion TEXT,                           -- Kết luận của bác sĩ CĐHA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE
);

-- 8. Bảng Hướng dẫn chuẩn bị lấy mẫu cho bệnh nhân (Sample Guidelines)
CREATE TABLE IF NOT EXISTS sample_guidelines (
    guide_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    requirement TEXT NOT NULL,
    note TEXT,
    display_order INT DEFAULT 0
);

-- 9. Bảng Nhật ký Hội thoại Chatbot AI (AI Chat Sessions & Messages - Sẵn sàng cho Giai đoạn 2)
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(20),
    order_id VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    sender ENUM('USER', 'BOT') NOT NULL,
    content TEXT NOT NULL,
    context_attached JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE
);
