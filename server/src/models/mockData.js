/**
 * SaharaMedCare - Realistic Clinical Dataset (Fallback & Seed Store)
 * Based on official Vietnamese Hospital Laboratory Standards (LIS)
 * Curated for Team Sahara - Subject QL05-W
 */

export const doctorsData = [
  {
    doctorId: "BS-001",
    fullName: "TS. BS. Trần Minh Quân",
    title: "TS. BS.",
    department: "Khoa Xét nghiệm Trung tâm",
    clinicRoom: "Phòng Trưởng khoa Xét nghiệm",
    phone: "0901234567",
    email: "minhquan@saharamedcare.vn"
  },
  {
    doctorId: "DOC01",
    fullName: "Lê Hoàng Nam",
    title: "BS. CKII.",
    department: "Khoa Khám bệnh - Nội tổng quát",
    clinicRoom: "Bàn khám số 08",
    phone: "0903112233",
    email: "nam.lh@saharamedcare.vn"
  },
  {
    doctorId: "DOC02",
    fullName: "Trần Minh Quân",
    title: "TS. BS.",
    department: "Khoa Xét nghiệm Trung tâm",
    clinicRoom: "Phòng Trưởng khoa Xét nghiệm",
    phone: "0903223344",
    email: "quan.tm@saharamedcare.vn"
  },
  {
    doctorId: "DOC03",
    fullName: "Phạm Quỳnh Trang",
    title: "BS. CKII.",
    department: "Khoa Phụ sản & Nội khoa",
    clinicRoom: "Bàn khám số 03",
    phone: "0903334455",
    email: "trang.pq@saharamedcare.vn"
  },
  {
    doctorId: "DOC04",
    fullName: "Nguyễn Quốc Huy",
    title: "BS. CKI.",
    department: "Khoa Chẩn đoán hình ảnh",
    clinicRoom: "Phòng X-quang kỹ thuật số & Siêu âm",
    phone: "0903445566",
    email: "huy.nq@saharamedcare.vn"
  },
  {
    doctorId: "DOC05",
    fullName: "Đỗ Thành Đạt",
    title: "BS. CKI.",
    department: "Khoa Ngoại Tiêu hóa",
    clinicRoom: "Bàn khám số 02",
    phone: "0903556677",
    email: "dat.dt@saharamedcare.vn"
  }
];

export const testPriceCatalog = [
  { code: "HH-01", name: "Tổng phân tích tế bào máu ngoại vi (18 thông số Laser)", department: "Huyết học", timeMinutes: "45-60 phút", price: "120.000 VNĐ", priceNumeric: 120000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-01", name: "Định lượng Glucose máu lúc đói", department: "Sinh hóa", timeMinutes: "45 phút", price: "45.000 VNĐ", priceNumeric: 45000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-02", name: "Định lượng HbA1c (Sắc ký lỏng HPLC)", department: "Sinh hóa", timeMinutes: "60-90 phút", price: "185.000 VNĐ", priceNumeric: 185000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-03", name: "Định lượng Men gan (AST / ALT / GGT)", department: "Sinh hóa", timeMinutes: "45-60 phút", price: "110.000 VNĐ", priceNumeric: 110000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-04", name: "Bộ mỡ máu Lipid 4 chỉ số (Cholesterol, Triglyceride, HDL, LDL)", department: "Sinh hóa", timeMinutes: "60 phút", price: "170.000 VNĐ", priceNumeric: 170000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-05", name: "Chức năng thận (Ure, Creatinine, eGFR)", department: "Sinh hóa", timeMinutes: "45 phút", price: "95.000 VNĐ", priceNumeric: 95000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "SH-06", name: "Định lượng Acid Uric máu (Tầm soát Gout)", department: "Sinh hóa", timeMinutes: "45 phút", price: "55.000 VNĐ", priceNumeric: 55000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "CD-01", name: "Chụp X-quang Tim phổi thẳng số hóa (DR)", department: "CĐHA", timeMinutes: "20-30 phút", price: "150.000 VNĐ", priceNumeric: 150000, bhyt: "Có hỗ trợ 80-100%" },
  { code: "CD-02", name: "Siêu âm Doppler màu ổ bụng tổng quát", department: "CĐHA", timeMinutes: "20-30 phút", price: "220.000 VNĐ", priceNumeric: 220000, bhyt: "Có hỗ trợ 80-100%" }
];

export const sampleGuidelines = [
  {
    title: "Xét nghiệm Đường huyết & Bộ mỡ máu (Lipid)",
    requirement: "Nhịn ăn từ 8 - 12 tiếng trước khi lấy mẫu máu. Được phép uống nước lọc với lượng vừa phải.",
    note: "Không uống nước ngọt, trà đường, sữa hoặc dùng các chất kích thích như cà phê, rượu bia trước xét nghiệm."
  },
  {
    title: "Xét nghiệm Chức năng gan & Axit Uric",
    requirement: "Tránh bữa ăn quá nhiều đạm, dầu mỡ động vật và tuyệt đối không uống rượu bia trong vòng 24 - 48 giờ trước đó.",
    note: "Thông báo với bác sĩ danh sách thuốc tây hoặc thực phẩm chức năng bạn đang uống."
  },
  {
    title: "Siêu âm bụng tổng quát",
    requirement: "Uống nhiều nước lọc và nhịn tiểu trước khi siêu âm khoảng 30 - 45 phút để bàng quang căng đầy.",
    note: "Đối với kiểm tra túi mật và gan mật, nên nhịn ăn sáng."
  },
  {
    title: "Chụp X-quang Ngực / Xương khớp",
    requirement: "Tháo bỏ trang sức kim loại (dây chuyền, khuyên áo nịt ngực có gọng sắt) ở vùng chụp chiếu.",
    note: "Bệnh nhân nữ nghi ngờ hoặc đang mang thai cần báo ngay cho kỹ thuật viên phòng chụp."
  }
];

export const mockPatients = {
  "BN2026-089": {
    patientId: "BN2026-089",
    fullName: "NGUYỄN VĂN AN",
    gender: "Nam",
    birthYear: 1974,
    dateOfBirth: "1974-05-14",
    age: 52,
    phone: "0912345678",
    nationalId: "079074001234",
    insuranceNumber: "GD 4 79 79 21589341",
    address: "Số 142/8 Nguyễn Tri Phương, Phường 9, Quận 5, TP. Hồ Chí Minh",
    orderId: "CLS2026-1119-089",
    sampleCode: "MAU-882910",
    barcode: "BN2026089CLS",
    clinicRoom: "Phòng Khám Nội Tổng Quát - Bàn khám số 08",
    doctorName: "BS. CKII. Lê Hoàng Nam",
    reviewerDoctor: "TS. BS. Trần Minh Quân (Trưởng khoa Xét nghiệm)",
    clinicalDiagnosis: "Kiểm tra sức khỏe định kỳ / Theo dõi tiền đái tháo đường, rối loạn lipid máu, hội chứng chuyển hóa",
    samplingTime: "07:45 19/11/2026",
    receivedLabTime: "08:05 19/11/2026",
    completedTime: "09:30 19/11/2026",
    currentStatus: "COMPLETED",
    currentStep: 3,
    statusText: "Đã có kết quả & Bác sĩ trưởng khoa duyệt",
    riskSummary: {
      overallRisk: "warning",
      riskLabel: "Mức độ rủi ro trung bình - Cần can thiệp điều chỉnh",
      badgeColor: "amber",
      abnormalCount: 7,
      totalCount: 22,
      keyFindings: [
        {
          title: "Rối loạn đường huyết đói & HbA1c tăng",
          detail: "Glucose đói 7.42 mmol/L (> 6.4) và HbA1c 6.8% (> 6.0%) biểu hiện tình trạng đái tháo đường type 2 giai đoạn khởi phát.",
          severity: "high"
        },
        {
          title: "Rối loạn Lipid máu hỗn hợp & Men gan tăng nhẹ",
          detail: "Triglyceride (2.65 mmol/L) và LDL-C (3.60 mmol/L) tăng kết hợp AST (48.2 U/L), ALT (56.4 U/L) tăng nhẹ, phù hợp hình ảnh gan nhiễm mỡ độ 1.",
          severity: "medium"
        },
        {
          title: "Tăng Acid Uric máu tiềm tàng",
          detail: "Axit Uric 468.0 µmol/L (ngưỡng trên 420 µmol/L) làm tăng nguy cơ viêm khớp Gout cấp và sỏi tiết niệu.",
          severity: "medium"
        }
      ],
      recommendedDepartments: [
        { name: "Khoa Nội Tiết & Đái Tháo Đường", urgency: "Ưu tiên khám sớm trong tuần" },
        { name: "Khoa Tiêu Hóa & Gan Mật", urgency: "Theo dõi định kỳ 3 tháng" }
      ],
      dietaryAdvice: [
        "Hạn chế tinh bột hấp thu nhanh (cơm trắng, bánh mì trắng, nước ngọt có ga, bánh kẹo).",
        "Giảm mỡ động vật, phủ tạng, đồ chiên rán; tăng cường rau xanh, yến mạch và các loại cá giàu Omega-3.",
        "Kiêng tuyệt đối bia rượu và đồ uống có cồn để bảo vệ tế bào gan.",
        "Duy trì đi bộ nhanh hoặc tập thể dục tối thiểu 30-45 phút/ngày."
      ]
    },
    categories: [
      {
        id: "hematology",
        name: "Huyết học (Tổng phân tích tế bào máu ngoại vi - 18 thông số)",
        code: "HH",
        note: "Mẫu máu toàn phần chống đông EDTA. Máy phân tích tự động Sysmex XN-1000.",
        results: [
          { code: "RBC", name: "Số lượng hồng cầu", value: 4.85, unit: "T/L", ref: "4.0 - 5.8", status: "NORMAL" },
          { code: "HGB", name: "Huyết sắc tố (Hemoglobin)", value: 146, unit: "g/L", ref: "130 - 175", status: "NORMAL" },
          { code: "HCT", name: "Dung tích hồng cầu (Hematocrit)", value: 0.44, unit: "L/L", ref: "0.39 - 0.50", status: "NORMAL" },
          { code: "MCV", name: "Thể tích trung bình hồng cầu", value: 90.7, unit: "fL", ref: "80.0 - 100.0", status: "NORMAL" },
          { code: "MCH", name: "Lượng Hb trung bình hồng cầu", value: 30.1, unit: "pg", ref: "27.0 - 33.0", status: "NORMAL" },
          { code: "MCHC", name: "Nồng độ Hb trung bình hồng cầu", value: 332, unit: "g/L", ref: "320 - 360", status: "NORMAL" },
          { code: "RDW-CV", name: "Độ phân bố kích thước HC", value: 12.8, unit: "%", ref: "11.0 - 15.0", status: "NORMAL" },
          { code: "WBC", name: "Số lượng bạch cầu", value: 7.20, unit: "G/L", ref: "4.0 - 10.0", status: "NORMAL" },
          { code: "NEUT%", name: "Tỷ lệ bạch cầu trung tính", value: 62.4, unit: "%", ref: "43.0 - 75.0", status: "NORMAL" },
          { code: "LYM%", name: "Tỷ lệ bạch cầu Lympho", value: 28.1, unit: "%", ref: "17.0 - 48.0", status: "NORMAL" },
          { code: "MONO%", name: "Tỷ lệ bạch cầu Mono", value: 6.2, unit: "%", ref: "4.0 - 10.0", status: "NORMAL" },
          { code: "EO%", name: "Tỷ lệ bạch cầu ái toan", value: 2.8, unit: "%", ref: "0.1 - 7.0", status: "NORMAL" },
          { code: "BASO%", name: "Tỷ lệ bạch cầu ái kiềm", value: 0.5, unit: "%", ref: "0.0 - 2.5", status: "NORMAL" },
          { code: "PLT", name: "Số lượng tiểu cầu", value: 245, unit: "G/L", ref: "150 - 450", status: "NORMAL" },
          { code: "MPV", name: "Thể tích trung bình tiểu cầu", value: 8.6, unit: "fL", ref: "6.5 - 12.0", status: "NORMAL" }
        ]
      },
      {
        id: "biochemistry",
        name: "Sinh hóa máu & Chức năng chuyển hóa",
        code: "SH",
        note: "Mẫu huyết thanh sau nhịn ăn 10 tiếng. Máy phân tích sinh hóa tự động Roche Cobas 8000.",
        results: [
          { code: "GLU", name: "Glucose máu lúc đói", value: 7.42, unit: "mmol/L", ref: "3.90 - 6.40", status: "HIGH", delta: "+15.9%" },
          { code: "HBA1C", name: "HbA1c (Đường huyết trung bình 3 tháng)", value: 6.8, unit: "%", ref: "4.0 - 6.0", status: "HIGH", delta: "+13.3%" },
          { code: "URE", name: "Ure máu", value: 5.60, unit: "mmol/L", ref: "2.50 - 7.50", status: "NORMAL" },
          { code: "CREAT", name: "Creatinine máu (Kèm eGFR 88.5)", value: 84.0, unit: "µmol/L", ref: "62.0 - 115.0", status: "NORMAL" },
          { code: "URIC", name: "Axit Uric máu", value: 468.0, unit: "µmol/L", ref: "210.0 - 420.0", status: "HIGH", delta: "+11.4%" },
          { code: "AST", name: "AST (SGOT - Men gan)", value: 48.2, unit: "U/L", ref: "10.0 - 37.0", status: "HIGH", delta: "+30.2%" },
          { code: "ALT", name: "ALT (SGPT - Men gan)", value: 56.4, unit: "U/L", ref: "10.0 - 40.0", status: "HIGH", delta: "+41.0%" },
          { code: "GGT", name: "GGT (Gamma GT)", value: 68.0, unit: "U/L", ref: "11.0 - 50.0", status: "HIGH", delta: "+36.0%" },
          { code: "CHOL", name: "Cholesterol toàn phần", value: 5.86, unit: "mmol/L", ref: "3.90 - 5.20", status: "HIGH", delta: "+12.7%" },
          { code: "TRIG", name: "Triglyceride", value: 2.65, unit: "mmol/L", ref: "0.46 - 1.88", status: "HIGH", delta: "+40.9%" },
          { code: "HDL", name: "HDL - Cholesterol (Mỡ tốt)", value: 1.05, unit: "mmol/L", ref: "> 1.00", status: "NORMAL" },
          { code: "LDL", name: "LDL - Cholesterol (Mỡ xấu)", value: 3.60, unit: "mmol/L", ref: "< 3.40", status: "HIGH", delta: "+5.8%" }
        ]
      },
      {
        id: "imaging",
        name: "Chẩn đoán hình ảnh (X-Quang Kỹ thuật số & Siêu âm)",
        code: "CDHA",
        note: "Máy X-quang Shimadzu DR và Máy siêu âm Doppler màu GE Voluson E10.",
        results: [
          {
            type: "XRAY",
            title: "Chụp X-quang Ngực thẳng (Tim phổi thẳng)",
            performedTime: "08:15 19/11/2026",
            radiologist: "BS. CKI. Nguyễn Quốc Huy",
            imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
            description: "Hai phế trường sáng đều, không thấy tổn thương thâm nhiễm hay nốt mờ khu trú. Cung sườn, rốn phổi hai bên bình thường. Bóng tim không to (chỉ số tim/lồng ngực < 50%). Vòm hoành hai bên nhẵn, góc sườn hoành hai bên sáng nhọn.",
            conclusion: "Hiện tại chưa thấy hình ảnh bất thường tim phổi trên phim chụp X-quang ngực thẳng."
          },
          {
            type: "ULTRASOUND",
            title: "Siêu âm Doppler màu ổ bụng tổng quát",
            performedTime: "08:35 19/11/2026",
            radiologist: "BS. CKI. Nguyễn Quốc Huy",
            imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
            description: "Gan: Kích thước không to, nhu mô tăng âm lan tỏa mức độ nhẹ, giảm âm vùng thấp, bờ đều. Tĩnh mạch cửa không giãn. Túi mật: Kích thước bình thường, thành mỏng, dịch mật trong không thấy sỏi. Tụy, Lách: Nhu mô đồng nhất. Thận 2 bên: Kích thước bình thường, đài bể thận không giãn, không có sỏi cản âm. Bàng quang: Thành mỏng, không có sỏi.",
            conclusion: "Hình ảnh Gan nhiễm mỡ mức độ nhẹ (Độ 1). Các tạng khác trong ổ bụng chưa phát hiện bất thường."
          }
        ]
      }
    ]
  },

  "BN2026-042": {
    patientId: "BN2026-042",
    fullName: "TRẦN THỊ MAI",
    gender: "Nữ",
    birthYear: 1992,
    dateOfBirth: "1992-08-20",
    age: 34,
    phone: "0987654321",
    nationalId: "079192004567",
    insuranceNumber: "DN 4 79 79 19827364",
    address: "Căn hộ 12B Tháp Sapphire, Quận Bình Thạnh, TP. Hồ Chí Minh",
    orderId: "CLS2026-1119-042",
    sampleCode: "MAU-882740",
    barcode: "BN2026042CLS",
    clinicRoom: "Phòng Khám Phụ Sản & Tổng Quát - Bàn 03",
    doctorName: "BS. CKII. Phạm Quỳnh Trang",
    reviewerDoctor: "TS. BS. Trần Minh Quân",
    clinicalDiagnosis: "Mệt mỏi, hoa mắt chóng mặt khi đứng dậy / Kiểm tra tầm soát thiếu máu thiếu sắt",
    samplingTime: "08:00 19/11/2026",
    receivedLabTime: "08:15 19/11/2026",
    completedTime: "09:45 19/11/2026",
    currentStatus: "COMPLETED",
    currentStep: 3,
    statusText: "Đã có kết quả & Bác sĩ duyệt hoàn tất",
    riskSummary: {
      overallRisk: "warning",
      riskLabel: "Thiếu máu hồng cầu nhỏ nhược sắc nhẹ",
      badgeColor: "amber",
      abnormalCount: 3,
      totalCount: 15,
      keyFindings: [
        {
          title: "Hemoglobin (HGB) và MCV giảm nhẹ",
          detail: "HGB 108 g/L (bình thường nữ: 120-155 g/L), MCV 74 fL phản ánh tình trạng thiếu máu hồng cầu nhỏ nhược sắc, thường liên quan đến thiếu hụt sắt dự trữ.",
          severity: "medium"
        }
      ],
      recommendedDepartments: [
        { name: "Khoa Huyết Học Lâm Sàng", urgency: "Tư vấn bổ sung sắt và dinh dưỡng" }
      ],
      dietaryAdvice: [
        "Bổ sung thực phẩm giàu sắt: thịt bò nạc, đậu lăng, rau bina, mộc nhĩ.",
        "Uống kèm nước cam hoặc hoa quả giàu vitamin C để tăng cường hấp thu sắt."
      ]
    },
    categories: [
      {
        id: "hematology",
        name: "Huyết học (Tổng phân tích tế bào máu ngoại vi)",
        code: "HH",
        note: "Mẫu máu toàn phần EDTA.",
        results: [
          { code: "RBC", name: "Số lượng hồng cầu", value: 3.92, unit: "T/L", ref: "3.8 - 5.0", status: "NORMAL" },
          { code: "HGB", name: "Huyết sắc tố", value: 108, unit: "g/L", ref: "120 - 155", status: "LOW", delta: "-10.0%" },
          { code: "HCT", name: "Hematocrit", value: 0.33, unit: "L/L", ref: "0.35 - 0.45", status: "LOW", delta: "-5.7%" },
          { code: "MCV", name: "Thể tích trung bình hồng cầu", value: 74.2, unit: "fL", ref: "80.0 - 100.0", status: "LOW", delta: "-7.2%" },
          { code: "WBC", name: "Số lượng bạch cầu", value: 6.4, unit: "G/L", ref: "4.0 - 10.0", status: "NORMAL" },
          { code: "PLT", name: "Số lượng tiểu cầu", value: 290, unit: "G/L", ref: "150 - 450", status: "NORMAL" }
        ]
      },
      {
        id: "biochemistry",
        name: "Sinh hóa máu",
        code: "SH",
        note: "Huyết thanh.",
        results: [
          { code: "GLU", name: "Glucose đói", value: 5.1, unit: "mmol/L", ref: "3.90 - 6.40", status: "NORMAL" },
          { code: "FERRITIN", name: "Ferritin huyết thanh (Dự trữ sắt)", value: 14.2, unit: "ng/mL", ref: "20.0 - 200.0", status: "LOW", delta: "-29.0%" },
          { code: "AST", name: "AST (SGOT)", value: 22.0, unit: "U/L", ref: "< 35.0", status: "NORMAL" },
          { code: "ALT", name: "ALT (SGPT)", value: 19.5, unit: "U/L", ref: "< 35.0", status: "NORMAL" }
        ]
      }
    ]
  },

  "BN2026-105": {
    patientId: "BN2026-105",
    fullName: "LÊ HOÀNG BẢO",
    gender: "Nam",
    birthYear: 1998,
    dateOfBirth: "1998-11-03",
    age: 28,
    phone: "0909112233",
    nationalId: "079098007890",
    insuranceNumber: "SV 4 79 79 17654321",
    address: "Số 88 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh",
    orderId: "CLS2026-1119-105",
    sampleCode: "MAU-883015",
    barcode: "BN2026105CLS",
    clinicRoom: "Phòng Khám Ngoại Tiêu Hóa - Bàn 02",
    doctorName: "BS. CKI. Đỗ Thành Đạt",
    reviewerDoctor: "Chờ bác sĩ duyệt",
    clinicalDiagnosis: "Đau hạ sườn phải, đầy bụng khó tiêu sau bữa ăn",
    samplingTime: "09:10 19/11/2026",
    receivedLabTime: "09:25 19/11/2026",
    completedTime: "Dự kiến 10:45 19/11/2026",
    currentStatus: "PROCESSING",
    currentStep: 2,
    statusText: "Đang phân tích mẫu tại phòng Lab trung tâm",
    riskSummary: {
      overallRisk: "normal",
      riskLabel: "Đang chạy mẫu trên hệ thống máy phân tích tự động",
      badgeColor: "blue",
      abnormalCount: 0,
      totalCount: 0,
      keyFindings: [
        {
          title: "Hệ thống tự động đang đo quang và đếm tế bào laser",
          detail: "Kết quả dự kiến sẽ có và được bác sĩ ký số sau 35 phút nữa.",
          severity: "low"
        }
      ],
      recommendedDepartments: [],
      dietaryAdvice: []
    },
    categories: []
  },

  "BN2026-118": {
    patientId: "BN2026-118",
    fullName: "VŨ ĐỨC MINH",
    gender: "Nam",
    birthYear: 1981,
    dateOfBirth: "1981-03-25",
    age: 45,
    phone: "0933445566",
    nationalId: "079081009988",
    insuranceNumber: "GD 4 79 79 22334455",
    address: "Số 25 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh",
    orderId: "CLS2026-1120-118",
    sampleCode: "MAU-883100",
    barcode: "BN2026118CLS",
    clinicRoom: "Phòng Khám Nội Tổng Quát - Bàn khám số 08",
    doctorName: "BS. CKII. Lê Hoàng Nam",
    reviewerDoctor: "TS. BS. Trần Minh Quân",
    clinicalDiagnosis: "Khám sức khỏe công ty định kỳ hàng năm",
    samplingTime: "08:15 20/11/2026",
    receivedLabTime: "08:30 20/11/2026",
    completedTime: "09:50 20/11/2026",
    currentStatus: "COMPLETED",
    currentStep: 3,
    statusText: "Đã có kết quả & Bác sĩ duyệt hoàn tất",
    riskSummary: {
      overallRisk: "normal",
      riskLabel: "Chỉ số cận lâm sàng trong giới hạn bình thường",
      badgeColor: "emerald",
      abnormalCount: 0,
      totalCount: 15,
      keyFindings: [
        {
          title: "Chỉ số huyết học & sinh hóa ổn định",
          detail: "Tất cả các thông số công thức máu và chức năng gan thận đều nằm trong giới hạn chuẩn y khoa.",
          severity: "low"
        }
      ],
      recommendedDepartments: [],
      dietaryAdvice: [
        "Duy trì chế độ dinh dưỡng cân bằng và tập luyện thể dục thể thao đều đặn."
      ]
    },
    categories: [
      {
        id: "hematology",
        name: "Huyết học (Tổng phân tích tế bào máu)",
        code: "HH",
        note: "Mẫu máu EDTA.",
        results: [
          { code: "RBC", name: "Số lượng hồng cầu", value: 4.70, unit: "T/L", ref: "4.0 - 5.8", status: "NORMAL" },
          { code: "HGB", name: "Huyết sắc tố", value: 145, unit: "g/L", ref: "130 - 175", status: "NORMAL" },
          { code: "WBC", name: "Số lượng bạch cầu", value: 6.8, unit: "G/L", ref: "4.0 - 10.0", status: "NORMAL" },
          { code: "PLT", name: "Số lượng tiểu cầu", value: 230, unit: "G/L", ref: "150 - 450", status: "NORMAL" }
        ]
      },
      {
        id: "biochemistry",
        name: "Sinh hóa máu",
        code: "SH",
        note: "Mẫu huyết thanh.",
        results: [
          { code: "GLU", name: "Glucose đói", value: 5.2, unit: "mmol/L", ref: "3.90 - 6.40", status: "NORMAL" },
          { code: "URE", name: "Ure máu", value: 4.8, unit: "mmol/L", ref: "2.50 - 7.50", status: "NORMAL" },
          { code: "CREAT", name: "Creatinine máu", value: 78.0, unit: "µmol/L", ref: "62.0 - 115.0", status: "NORMAL" },
          { code: "AST", name: "AST (SGOT)", value: 25.0, unit: "U/L", ref: "10.0 - 37.0", status: "NORMAL" },
          { code: "ALT", name: "ALT (SGPT)", value: 28.0, unit: "U/L", ref: "10.0 - 40.0", status: "NORMAL" }
        ]
      }
    ]
  }
};

export const usersData = [
  {
    userId: 1,
    role: 'PATIENT',
    identifier: '0912345678',
    passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm', // 123456
    patientId: 'BN2026-089',
    doctorId: null
  },
  {
    userId: 2,
    role: 'PATIENT',
    identifier: '0987654321',
    passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm', // 123456
    patientId: 'BN2026-042',
    doctorId: null
  },
  {
    userId: 101,
    role: 'DOCTOR',
    identifier: 'BS-001',
    passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm', // 123456
    patientId: null,
    doctorId: 'BS-001'
  },
  {
    userId: 102,
    role: 'DOCTOR',
    identifier: 'minhquan@saharamedcare.vn',
    passwordHash: '$2b$10$jZXr.9Uz1n8V2hZniVkueuXcSOB0fEwiI538gK9.zVCXaWaVFUqVm', // 123456
    patientId: null,
    doctorId: 'BS-001'
  }
];

