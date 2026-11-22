-- =====================================================================
-- 🏥 SAHARAMEDCARE - DỮ LIỆU KIỂM THỬ THỰC TẾ (SEED DATA)
-- Nguồn dữ liệu: Quy chuẩn Bệnh viện Đa khoa / Đại học Y Dược TP.HCM
-- Đã ẩn danh thông tin cá nhân theo đúng yêu cầu BA & Y đức y tế
-- =====================================================================

USE saharamedcare_db;

-- 1. Thêm danh mục Bác sĩ
INSERT INTO doctors (doctor_id, full_name, title, department, clinic_room, phone, email) VALUES
('DOC01', 'Lê Hoàng Nam', 'BS. CKII.', 'Khoa Khám bệnh - Nội tổng quát', 'Bàn khám số 08', '0903112233', 'nam.lh@saharamedcare.vn'),
('DOC02', 'Trần Minh Quân', 'TS. BS.', 'Khoa Xét nghiệm Trung tâm', 'Phòng Trưởng khoa', '0903223344', 'quan.tm@saharamedcare.vn'),
('DOC03', 'Phạm Quỳnh Trang', 'BS. CKII.', 'Khoa Phụ sản & Nội khoa', 'Bàn khám số 03', '0903334455', 'trang.pq@saharamedcare.vn'),
('DOC04', 'Nguyễn Quốc Huy', 'BS. CKI.', 'Khoa Chẩn đoán hình ảnh', 'Phòng X-quang kỹ thuật số & Siêu âm', '0903445566', 'huy.nq@saharamedcare.vn'),
('DOC05', 'Đỗ Thành Đạt', 'BS. CKI.', 'Khoa Ngoại Tiêu hóa', 'Bàn khám số 02', '0903556677', 'dat.dt@saharamedcare.vn')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Thêm nhóm xét nghiệm
INSERT INTO lab_categories (category_id, category_code, code_prefix, category_name, method_note, display_order) VALUES
(1, 'hematology', 'HH', 'Huyết học (Tổng phân tích tế bào máu ngoại vi - 18 thông số)', 'Mẫu máu toàn phần chống đông EDTA. Máy phân tích tự động Sysmex XN-1000.', 1),
(2, 'biochemistry', 'SH', 'Sinh hóa máu & Chức năng chuyển hóa', 'Mẫu huyết thanh sau nhịn ăn 10 tiếng. Máy phân tích sinh hóa tự động Roche Cobas 8000.', 2),
(3, 'imaging', 'CDHA', 'Chẩn đoán hình ảnh (X-Quang Kỹ thuật số & Siêu âm)', 'Máy X-quang Shimadzu DR và Máy siêu âm Doppler màu GE Voluson E10.', 3),
(4, 'urinalysis', 'NT', 'Tổng phân tích nước tiểu (10 thông số)', 'Mẫu nước tiểu giữa dòng. Máy phân tích tự động Roche Urisys 2400.', 4)
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 3. Bảng giá & Danh mục xét nghiệm chuẩn
INSERT INTO lab_test_catalog (service_code, category_id, service_name, department, sample_type, turnaround_time, price, price_formatted, bhyt_coverage, preparation_guide) VALUES
('HH-01', 1, 'Tổng phân tích tế bào máu ngoại vi (18 thông số Laser)', 'Huyết học', 'Máu toàn phần EDTA (2ml)', '45-60 phút', 120000, '120.000 VNĐ', 'Có hỗ trợ 80-100%', 'Không cần nhịn ăn quá nghiêm ngặt, uống nước lọc vừa phải.'),
('SH-01', 2, 'Định lượng Glucose máu lúc đói', 'Sinh hóa', 'Huyết thanh (1ml)', '45 phút', 45000, '45.000 VNĐ', 'Có hỗ trợ 80-100%', 'Bắt buộc nhịn ăn từ 8 - 12 tiếng.'),
('SH-02', 2, 'Định lượng HbA1c (Sắc ký lỏng HPLC)', 'Sinh hóa', 'Máu toàn phần EDTA (2ml)', '60-90 phút', 185000, '185.000 VNĐ', 'Có hỗ trợ 80-100%', 'Đánh giá đường huyết trung bình 3 tháng, không cần nhịn đói.'),
('SH-03', 2, 'Định lượng Men gan (AST / ALT / GGT)', 'Sinh hóa', 'Huyết thanh (2ml)', '45-60 phút', 110000, '110.000 VNĐ', 'Có hỗ trợ 80-100%', 'Tránh rượu bia và thuốc lá trong 48 giờ trước xét nghiệm.'),
('SH-04', 2, 'Bộ mỡ máu Lipid 4 chỉ số (Cholesterol, Triglyceride, HDL, LDL)', 'Sinh hóa', 'Huyết thanh (2ml)', '60 phút', 170000, '170.000 VNĐ', 'Có hỗ trợ 80-100%', 'Bắt buộc nhịn ăn 10-12 tiếng qua đêm.'),
('SH-05', 2, 'Chức năng thận (Ure, Creatinine, eGFR)', 'Sinh hóa', 'Huyết thanh (1ml)', '45 phút', 95000, '95.000 VNĐ', 'Có hỗ trợ 80-100%', 'Uống đủ nước, tránh tập thể lực nặng trước lấy mẫu.'),
('SH-06', 2, 'Định lượng Acid Uric máu (Tầm soát Gout)', 'Sinh hóa', 'Huyết thanh (1ml)', '45 phút', 55000, '55.000 VNĐ', 'Có hỗ trợ 80-100%', 'Tránh ăn nhiều đạm thịt đỏ, hải sản vào tối hôm trước.'),
('CD-01', 3, 'Chụp X-quang Tim phổi thẳng số hóa (DR)', 'CĐHA', 'Chụp X-quang', '20-30 phút', 150000, '150.000 VNĐ', 'Có hỗ trợ 80-100%', 'Tháo bỏ trang sức kim loại vùng ngực, thông báo nếu mang thai.'),
('CD-02', 3, 'Siêu âm Doppler màu ổ bụng tổng quát', 'CĐHA', 'Siêu âm', '20-30 phút', 220000, '220.000 VNĐ', 'Có hỗ trợ 80-100%', 'Uống nhiều nước và nhịn tiểu 30-45 phút trước khi siêu âm.')
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name);

-- 4. Hướng dẫn chuẩn bị lấy mẫu
INSERT INTO sample_guidelines (guide_id, title, requirement, note, display_order) VALUES
(1, 'Xét nghiệm Đường huyết & Bộ mỡ máu (Lipid)', 'Nhịn ăn từ 8 - 12 tiếng trước khi lấy mẫu máu. Được phép uống nước lọc với lượng vừa phải.', 'Không uống nước ngọt, trà đường, sữa hoặc dùng các chất kích thích như cà phê, rượu bia trước xét nghiệm.', 1),
(2, 'Xét nghiệm Chức năng gan & Axit Uric', 'Tránh bữa ăn quá nhiều đạm, dầu mỡ động vật và tuyệt đối không uống rượu bia trong vòng 24 - 48 giờ trước đó.', 'Thông báo với bác sĩ danh sách thuốc tây hoặc thực phẩm chức năng bạn đang uống.', 2),
(3, 'Siêu âm bụng tổng quát', 'Uống nhiều nước lọc và nhịn tiểu trước khi siêu âm khoảng 30 - 45 phút để bàng quang căng đầy.', 'Đối với kiểm tra túi mật và gan mật, nên nhịn ăn sáng.', 3),
(4, 'Chụp X-quang Ngực / Xương khớp', 'Tháo bỏ trang sức kim loại (dây chuyền, khuyên áo nịt ngực có gọng sắt) ở vùng chụp chiếu.', 'Bệnh nhân nữ nghi ngờ hoặc đang mang thai cần báo ngay cho kỹ thuật viên phòng chụp.', 4)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. Dữ liệu Bệnh nhân thực tế
INSERT INTO patients (patient_id, full_name, date_of_birth, gender, phone_number, national_id, health_insurance_number, address) VALUES
('BN2026-089', 'NGUYỄN VĂN AN', '1974-05-14', 'Nam', '0912345678', '079074001234', 'GD 4 79 79 21589341', 'Số 142/8 Nguyễn Tri Phương, Phường 9, Quận 5, TP. Hồ Chí Minh'),
('BN2026-042', 'TRẦN THỊ MAI', '1992-08-20', 'Nữ', '0987654321', '079192004567', 'DN 4 79 79 19827364', 'Căn hộ 12B Tháp Sapphire, Quận Bình Thạnh, TP. Hồ Chí Minh'),
('BN2026-105', 'LÊ HOÀNG BẢO', '1998-11-03', 'Nam', '0909112233', '079098007890', 'SV 4 79 79 17654321', 'Số 88 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh'),
('BN2026-118', 'VŨ ĐỨC MINH', '1981-03-25', 'Nam', '0933445566', '079081009988', 'GD 4 79 79 22334455', 'Số 25 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh'),
('BN2026-152', 'HOÀNG KIM OANH', '1966-12-10', 'Nữ', '0918765432', '079066003322', 'HT 4 79 79 99887766', 'Số 50 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 6. Phiếu chỉ định cận lâm sàng (Lab Orders)
INSERT INTO lab_orders (order_id, patient_id, sample_code, barcode, doctor_name, ordering_doctor_id, clinic_room, department, clinical_diagnosis, status, current_step, status_text, sampling_time, received_lab_time, completed_time, reviewer_doctor, risk_summary) VALUES
(
    'CLS2026-1119-089',
    'BN2026-089',
    'MAU-882910',
    'BN2026089CLS',
    'BS. CKII. Lê Hoàng Nam',
    'DOC01',
    'Phòng Khám Nội Tổng Quát - Bàn khám số 08',
    'Khoa Nội Tổng Hợp',
    'Kiểm tra sức khỏe định kỳ / Theo dõi tiền đái tháo đường, rối loạn lipid máu, hội chứng chuyển hóa',
    'COMPLETED',
    3,
    'Đã có kết quả & Bác sĩ trưởng khoa duyệt',
    '2026-11-19 07:45:00',
    '2026-11-19 08:05:00',
    '2026-11-19 09:30:00',
    'TS. BS. Trần Minh Quân (Trưởng khoa Xét nghiệm)',
    JSON_OBJECT(
        'overallRisk', 'warning',
        'riskLabel', 'Mức độ rủi ro trung bình - Cần can thiệp điều chỉnh',
        'badgeColor', 'amber',
        'abnormalCount', 7,
        'totalCount', 22,
        'keyFindings', JSON_ARRAY(
            JSON_OBJECT(
                'title', 'Rối loạn đường huyết đói & HbA1c tăng',
                'detail', 'Glucose đói 7.42 mmol/L (> 6.4) và HbA1c 6.8% (> 6.0%) biểu hiện tình trạng đái tháo đường type 2 giai đoạn khởi phát.',
                'severity', 'high'
            ),
            JSON_OBJECT(
                'title', 'Rối loạn Lipid máu hỗn hợp & Men gan tăng nhẹ',
                'detail', 'Triglyceride (2.65 mmol/L) và LDL-C (3.60 mmol/L) tăng kết hợp AST (48.2 U/L), ALT (56.4 U/L) tăng nhẹ, phù hợp hình ảnh gan nhiễm mỡ độ 1.',
                'severity', 'medium'
            ),
            JSON_OBJECT(
                'title', 'Tăng Acid Uric máu tiềm tàng',
                'detail', 'Axit Uric 468.0 µmol/L (ngưỡng trên 420 µmol/L) làm tăng nguy cơ viêm khớp Gout cấp và sỏi tiết niệu.',
                'severity', 'medium'
            )
        ),
        'recommendedDepartments', JSON_ARRAY(
            JSON_OBJECT('name', 'Khoa Nội Tiết & Đái Tháo Đường', 'urgency', 'Ưu tiên khám sớm trong tuần'),
            JSON_OBJECT('name', 'Khoa Tiêu Hóa & Gan Mật', 'urgency', 'Theo dõi định kỳ 3 tháng')
        ),
        'dietaryAdvice', JSON_ARRAY(
            'Hạn chế tinh bột hấp thu nhanh (cơm trắng, bánh mì trắng, nước ngọt có ga, bánh kẹo).',
            'Giảm mỡ động vật, phủ tạng, đồ chiên rán; tăng cường rau xanh, yến mạch và các loại cá giàu Omega-3.',
            'Kiêng tuyệt đối bia rượu và đồ uống có cồn để bảo vệ tế bào gan.',
            'Duy trì đi bộ nhanh hoặc tập thể dục tối thiểu 30-45 phút/ngày.'
        )
    )
),
(
    'CLS2026-1119-042',
    'BN2026-042',
    'MAU-882740',
    'BN2026042CLS',
    'BS. CKII. Phạm Quỳnh Trang',
    'DOC03',
    'Phòng Khám Phụ Sản & Tổng Quát - Bàn 03',
    'Khoa Phụ Sản',
    'Mệt mỏi, hoa mắt chóng mặt khi đứng dậy / Kiểm tra tầm soát thiếu máu thiếu sắt',
    'COMPLETED',
    3,
    'Đã có kết quả & Bác sĩ duyệt hoàn tất',
    '2026-11-19 08:00:00',
    '2026-11-19 08:15:00',
    '2026-11-19 09:45:00',
    'TS. BS. Trần Minh Quân',
    JSON_OBJECT(
        'overallRisk', 'warning',
        'riskLabel', 'Thiếu máu hồng cầu nhỏ nhược sắc nhẹ',
        'badgeColor', 'amber',
        'abnormalCount', 3,
        'totalCount', 15,
        'keyFindings', JSON_ARRAY(
            JSON_OBJECT(
                'title', 'Hemoglobin (HGB) và MCV giảm nhẹ',
                'detail', 'HGB 108 g/L (bình thường nữ: 120-155 g/L), MCV 74 fL phản ánh tình trạng thiếu máu hồng cầu nhỏ nhược sắc, thường liên quan đến thiếu hụt sắt dự trữ.',
                'severity', 'medium'
            )
        ),
        'recommendedDepartments', JSON_ARRAY(
            JSON_OBJECT('name', 'Khoa Huyết Học Lâm Sàng', 'urgency', 'Tư vấn bổ sung sắt và dinh dưỡng')
        ),
        'dietaryAdvice', JSON_ARRAY(
            'Bổ sung thực phẩm giàu sắt: thịt bò nạc, đậu lăng, rau bina, mộc nhĩ.',
            'Uống kèm nước cam hoặc hoa quả giàu vitamin C để tăng cường hấp thu sắt.'
        )
    )
),
(
    'CLS2026-1119-105',
    'BN2026-105',
    'MAU-883015',
    'BN2026105CLS',
    'BS. CKI. Đỗ Thành Đạt',
    'DOC05',
    'Phòng Khám Ngoại Tiêu Hóa - Bàn 02',
    'Khoa Ngoại Tiêu Hóa',
    'Đau hạ sườn phải, đầy bụng khó tiêu sau bữa ăn',
    'PROCESSING',
    2,
    'Đang phân tích mẫu tại phòng Lab trung tâm',
    '2026-11-19 09:10:00',
    '2026-11-19 09:25:00',
    NULL,
    'Chờ bác sĩ duyệt',
    JSON_OBJECT(
        'overallRisk', 'normal',
        'riskLabel', 'Đang chạy mẫu trên hệ thống máy phân tích tự động',
        'badgeColor', 'blue',
        'abnormalCount', 0,
        'totalCount', 0,
        'keyFindings', JSON_ARRAY(
            JSON_OBJECT(
                'title', 'Hệ thống tự động đang đo quang và đếm tế bào laser',
                'detail', 'Kết quả dự kiến sẽ có và được bác sĩ ký số sau 35 phút nữa.',
                'severity', 'low'
            )
        ),
        'recommendedDepartments', JSON_ARRAY(),
        'dietaryAdvice', JSON_ARRAY()
    )
)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. Chỉ số xét nghiệm BN2026-089 (Huyết học & Sinh hóa)
DELETE FROM lab_test_results WHERE order_id IN ('CLS2026-1119-089', 'CLS2026-1119-042');

INSERT INTO lab_test_results (order_id, category_id, indicator_code, indicator_name, value_numeric, value_text, unit, ref_min, ref_max, ref_text, status_flag, delta_text, display_order) VALUES
-- Huyết học BN2026-089
('CLS2026-1119-089', 1, 'RBC', 'Số lượng hồng cầu', 4.85, '4.85', 'T/L', 4.00, 5.80, '4.0 - 5.8', 'NORMAL', NULL, 1),
('CLS2026-1119-089', 1, 'HGB', 'Huyết sắc tố (Hemoglobin)', 146.00, '146', 'g/L', 130.00, 175.00, '130 - 175', 'NORMAL', NULL, 2),
('CLS2026-1119-089', 1, 'HCT', 'Dung tích hồng cầu (Hematocrit)', 0.44, '0.44', 'L/L', 0.39, 0.50, '0.39 - 0.50', 'NORMAL', NULL, 3),
('CLS2026-1119-089', 1, 'MCV', 'Thể tích trung bình hồng cầu', 90.70, '90.7', 'fL', 80.00, 100.00, '80.0 - 100.0', 'NORMAL', NULL, 4),
('CLS2026-1119-089', 1, 'MCH', 'Lượng Hb trung bình hồng cầu', 30.10, '30.1', 'pg', 27.00, 33.00, '27.0 - 33.0', 'NORMAL', NULL, 5),
('CLS2026-1119-089', 1, 'MCHC', 'Nồng độ Hb trung bình hồng cầu', 332.00, '332', 'g/L', 320.00, 360.00, '320 - 360', 'NORMAL', NULL, 6),
('CLS2026-1119-089', 1, 'RDW-CV', 'Độ phân bố kích thước HC', 12.80, '12.8', '%', 11.00, 15.00, '11.0 - 15.0', 'NORMAL', NULL, 7),
('CLS2026-1119-089', 1, 'WBC', 'Số lượng bạch cầu', 7.20, '7.20', 'G/L', 4.00, 10.00, '4.0 - 10.0', 'NORMAL', NULL, 8),
('CLS2026-1119-089', 1, 'NEUT%', 'Tỷ lệ bạch cầu trung tính', 62.40, '62.4', '%', 43.00, 75.00, '43.0 - 75.0', 'NORMAL', NULL, 9),
('CLS2026-1119-089', 1, 'LYM%', 'Tỷ lệ bạch cầu Lympho', 28.10, '28.1', '%', 17.00, 48.00, '17.0 - 48.0', 'NORMAL', NULL, 10),
('CLS2026-1119-089', 1, 'MONO%', 'Tỷ lệ bạch cầu Mono', 6.20, '6.2', '%', 4.00, 10.00, '4.0 - 10.0', 'NORMAL', NULL, 11),
('CLS2026-1119-089', 1, 'EO%', 'Tỷ lệ bạch cầu ái toan', 2.80, '2.8', '%', 0.10, 7.00, '0.1 - 7.0', 'NORMAL', NULL, 12),
('CLS2026-1119-089', 1, 'BASO%', 'Tỷ lệ bạch cầu ái kiềm', 0.50, '0.5', '%', 0.00, 2.50, '0.0 - 2.5', 'NORMAL', NULL, 13),
('CLS2026-1119-089', 1, 'PLT', 'Số lượng tiểu cầu', 245.00, '245', 'G/L', 150.00, 450.00, '150 - 450', 'NORMAL', NULL, 14),
('CLS2026-1119-089', 1, 'MPV', 'Thể tích trung bình tiểu cầu', 8.60, '8.6', 'fL', 6.50, 12.00, '6.5 - 12.0', 'NORMAL', NULL, 15),

-- Sinh hóa BN2026-089
('CLS2026-1119-089', 2, 'GLU', 'Glucose máu lúc đói', 7.42, '7.42', 'mmol/L', 3.90, 6.40, '3.90 - 6.40', 'HIGH', '+15.9%', 16),
('CLS2026-1119-089', 2, 'HBA1C', 'HbA1c (Đường huyết trung bình 3 tháng)', 6.80, '6.8', '%', 4.00, 6.00, '4.0 - 6.0', 'HIGH', '+13.3%', 17),
('CLS2026-1119-089', 2, 'URE', 'Ure máu', 5.60, '5.60', 'mmol/L', 2.50, 7.50, '2.50 - 7.50', 'NORMAL', NULL, 18),
('CLS2026-1119-089', 2, 'CREAT', 'Creatinine máu (Kèm eGFR 88.5)', 84.00, '84.0', 'µmol/L', 62.00, 115.00, '62.0 - 115.0', 'NORMAL', NULL, 19),
('CLS2026-1119-089', 2, 'URIC', 'Axit Uric máu', 468.00, '468.0', 'µmol/L', 210.00, 420.00, '210.0 - 420.0', 'HIGH', '+11.4%', 20),
('CLS2026-1119-089', 2, 'AST', 'AST (SGOT - Men gan)', 48.20, '48.2', 'U/L', 10.00, 37.00, '10.0 - 37.0', 'HIGH', '+30.2%', 21),
('CLS2026-1119-089', 2, 'ALT', 'ALT (SGPT - Men gan)', 56.40, '56.4', 'U/L', 10.00, 40.00, '10.0 - 40.0', 'HIGH', '+41.0%', 22),
('CLS2026-1119-089', 2, 'GGT', 'GGT (Gamma GT)', 68.00, '68.0', 'U/L', 11.00, 50.00, '11.0 - 50.0', 'HIGH', '+36.0%', 23),
('CLS2026-1119-089', 2, 'CHOL', 'Cholesterol toàn phần', 5.86, '5.86', 'mmol/L', 3.90, 5.20, '3.90 - 5.20', 'HIGH', '+12.7%', 24),
('CLS2026-1119-089', 2, 'TRIG', 'Triglyceride', 2.65, '2.65', 'mmol/L', 0.46, 1.88, '0.46 - 1.88', 'HIGH', '+40.9%', 25),
('CLS2026-1119-089', 2, 'HDL', 'HDL - Cholesterol (Mỡ tốt)', 1.05, '1.05', 'mmol/L', 1.00, 99.00, '> 1.00', 'NORMAL', NULL, 26),
('CLS2026-1119-089', 2, 'LDL', 'LDL - Cholesterol (Mỡ xấu)', 3.60, '3.60', 'mmol/L', 0.00, 3.40, '< 3.40', 'HIGH', '+5.8%', 27),

-- Huyết học & Sinh hóa BN2026-042
('CLS2026-1119-042', 1, 'RBC', 'Số lượng hồng cầu', 3.92, '3.92', 'T/L', 3.80, 5.00, '3.8 - 5.0', 'NORMAL', NULL, 1),
('CLS2026-1119-042', 1, 'HGB', 'Huyết sắc tố (Hemoglobin)', 108.00, '108', 'g/L', 120.00, 155.00, '120 - 155', 'LOW', '-10.0%', 2),
('CLS2026-1119-042', 1, 'HCT', 'Hematocrit', 0.33, '0.33', 'L/L', 0.35, 0.45, '0.35 - 0.45', 'LOW', '-5.7%', 3),
('CLS2026-1119-042', 1, 'MCV', 'Thể tích trung bình hồng cầu', 74.20, '74.2', 'fL', 80.00, 100.00, '80.0 - 100.0', 'LOW', '-7.2%', 4),
('CLS2026-1119-042', 1, 'WBC', 'Số lượng bạch cầu', 6.40, '6.4', 'G/L', 4.00, 10.00, '4.0 - 10.0', 'NORMAL', NULL, 5),
('CLS2026-1119-042', 1, 'PLT', 'Số lượng tiểu cầu', 290.00, '290', 'G/L', 150.00, 450.00, '150 - 450', 'NORMAL', NULL, 6),
('CLS2026-1119-042', 2, 'GLU', 'Glucose máu lúc đói', 5.10, '5.1', 'mmol/L', 3.90, 6.40, '3.90 - 6.40', 'NORMAL', NULL, 7),
('CLS2026-1119-042', 2, 'FERRITIN', 'Ferritin huyết thanh (Dự trữ sắt)', 14.20, '14.2', 'ng/mL', 20.00, 200.00, '20.0 - 200.0', 'LOW', '-29.0%', 8),
('CLS2026-1119-042', 2, 'AST', 'AST (SGOT)', 22.00, '22.0', 'U/L', 0.00, 35.00, '< 35.0', 'NORMAL', NULL, 9),
('CLS2026-1119-042', 2, 'ALT', 'ALT (SGPT)', 19.50, '19.5', 'U/L', 0.00, 35.00, '< 35.0', 'NORMAL', NULL, 10);

-- 8. Hình ảnh chẩn đoán cận lâm sàng (Lab Images)
DELETE FROM lab_images WHERE order_id = 'CLS2026-1119-089';

INSERT INTO lab_images (order_id, modality, title, performed_time, radiologist, image_url, description, conclusion) VALUES
(
    'CLS2026-1119-089',
    'XRAY',
    'Chụp X-quang Ngực thẳng (Tim phổi thẳng)',
    '2026-11-19 08:15:00',
    'BS. CKI. Nguyễn Quốc Huy',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    'Hai phế trường sáng đều, không thấy tổn thương thâm nhiễm hay nốt mờ khu trú. Cung sườn, rốn phổi hai bên bình thường. Bóng tim không to (chỉ số tim/lồng ngực < 50%). Vòm hoành hai bên nhẵn, góc sườn hoành hai bên sáng nhọn.',
    'Hiện tại chưa thấy hình ảnh bất thường tim phổi trên phim chụp X-quang ngực thẳng.'
),
(
    'CLS2026-1119-089',
    'ULTRASOUND',
    'Siêu âm Doppler màu ổ bụng tổng quát',
    '2026-11-19 08:35:00',
    'BS. CKI. Nguyễn Quốc Huy',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    'Gan: Kích thước không to, nhu mô tăng âm lan tỏa mức độ nhẹ, giảm âm vùng thấp, bờ đều. Tĩnh mạch cửa không giãn. Túi mật: Kích thước bình thường, thành mỏng, dịch mật trong không thấy sỏi. Tụy, Lách: Nhu mô đồng nhất. Thận 2 bên: Kích thước bình thường, đài bể thận không giãn, không có sỏi cản âm. Bàng quang: Thành mỏng, không có sỏi.',
    'Hình ảnh Gan nhiễm mỡ mức độ nhẹ (Độ 1). Các tạng khác trong ổ bụng chưa phát hiện bất thường.'
);
