-- SaharaMedCare Database Schema for MySQL 8+
CREATE DATABASE IF NOT EXISTS saharamedcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saharamedcare_db;

-- 1. Bảng Bệnh nhân (Patients)
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(20) PRIMARY KEY, -- Ví dụ: BN2026-089
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    national_id VARCHAR(20),
    health_insurance_number VARCHAR(25),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Phiếu chỉ định cận lâm sàng (Lab Orders)
CREATE TABLE IF NOT EXISTS lab_orders (
    order_id VARCHAR(30) PRIMARY KEY, -- Ví dụ: CLS2026-1119-01
    patient_id VARCHAR(20) NOT NULL,
    doctor_name VARCHAR(120) NOT NULL,
    department VARCHAR(100) NOT NULL, -- Khoa Khám bệnh, Khoa Nội tổng hợp, etc.
    diagnosis_clinical TEXT, -- Chẩn đoán lâm sàng sơ bộ
    status ENUM('RECEIVED', 'PROCESSING', 'COMPLETED', 'DOCTOR_SIGNED') DEFAULT 'RECEIVED',
    sampling_time DATETIME NOT NULL,
    completed_time DATETIME,
    approved_by VARCHAR(120), -- Bác sĩ Trưởng khoa Xét nghiệm duyệt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- 3. Bảng Nhóm xét nghiệm (Lab Categories)
CREATE TABLE IF NOT EXISTS lab_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(30) NOT NULL UNIQUE, -- HEMATOLOGY, BIOCHEMISTRY, IMAGING
    category_name VARCHAR(150) NOT NULL, -- Công thức máu, Sinh hóa máu, Chẩn đoán hình ảnh
    display_order INT DEFAULT 0
);

-- 4. Bảng Kết quả chỉ số cận lâm sàng (Lab Indicators)
CREATE TABLE IF NOT EXISTS lab_test_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    category_id INT NOT NULL,
    indicator_code VARCHAR(50) NOT NULL, -- RBC, HGB, GLUCOSE, CHOL, etc.
    indicator_name VARCHAR(150) NOT NULL, -- Tên tiếng Việt: Số lượng hồng cầu, Glucose, v.v.
    value_numeric DECIMAL(10, 2),
    value_text VARCHAR(100),
    unit VARCHAR(30), -- g/L, mmol/L, mg/dL
    ref_min DECIMAL(10, 2),
    ref_max DECIMAL(10, 2),
    ref_text VARCHAR(100), -- Ví dụ: "4.0 - 10.0" hoặc "Âm tính"
    status_flag ENUM('NORMAL', 'HIGH', 'LOW', 'CRITICAL') DEFAULT 'NORMAL',
    note TEXT,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES lab_categories(category_id)
);

-- 5. Bảng Hình ảnh chẩn đoán cận lâm sàng (Imaging / X-Quang / Siêu âm)
CREATE TABLE IF NOT EXISTS lab_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    modality VARCHAR(50) NOT NULL, -- X-Ray, Ultrasound, CT, MRI
    title VARCHAR(200) NOT NULL,
    image_url TEXT NOT NULL,
    findings TEXT, -- Mô tả hình ảnh học
    conclusion TEXT, -- Kết luận của bác sĩ CĐHA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE
);

-- 6. Bảng Nhật ký Hội thoại Chatbot AI (AI Chat Logs)
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(20),
    order_id VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
