import React from 'react';

export default function PrintReportView({ patient }) {
  if (!patient) return null;

  const hematologyCategory = patient.categories.find(c => c.id === 'hematology');
  const biochemistryCategory = patient.categories.find(c => c.id === 'biochemistry');
  const imagingCategory = patient.categories.find(c => c.id === 'imaging');

  return (
    <div className="print-only p-8 text-black bg-white max-w-4xl mx-auto font-serif">
      
      {/* Hospital & National Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4 text-xs">
        <div>
          <div className="font-bold text-sm uppercase">SỞ Y TẾ TP. HỒ CHÍ MINH</div>
          <div className="font-extrabold text-base uppercase">BỆNH VIỆN ĐA KHOA QUỐC TẾ SAHARA</div>
          <div>Khoa Xét Nghiệm & Chẩn Đoán Hình Ảnh</div>
          <div>Hotline: 1900-8888-MED | www.saharamedcare.vn</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-semibold text-xs">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-[10px] mt-1 italic">TP. Hồ Chí Minh, ngày 19 tháng 11 năm 2026</div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center my-4">
        <h1 className="text-xl font-bold uppercase tracking-wide">
          PHIẾU KẾT QUẢ XÉT NGHIỆM CẬN LÂM SÀNG
        </h1>
        <div className="text-xs font-mono mt-1">
          Mã hồ sơ: <strong>{patient.patientId}</strong> | Mã chỉ định: <strong>{patient.orderId}</strong> | Barcode: {patient.barcode}
        </div>
      </div>

      {/* Patient Administrative Info */}
      <div className="border border-black p-3 text-xs mb-4 grid grid-cols-2 gap-y-1 gap-x-4">
        <div>Họ và tên bệnh nhân: <strong className="uppercase font-bold text-sm">{patient.fullName}</strong></div>
        <div>Năm sinh / Tuổi: <strong>{patient.birthYear} ({patient.age} tuổi)</strong> - Giới tính: <strong>{patient.gender}</strong></div>
        <div>Số điện thoại: <strong>{patient.phone}</strong></div>
        <div>Số thẻ BHYT: <strong>{patient.insuranceNumber}</strong></div>
        <div className="col-span-2">Địa chỉ: <strong>{patient.address}</strong></div>
        <div>Khoa phòng chỉ định: <strong>{patient.clinicRoom}</strong></div>
        <div>Bác sĩ chỉ định: <strong>{patient.doctorName}</strong></div>
        <div>Thời gian lấy mẫu: <strong>{patient.samplingTime}</strong></div>
        <div>Thời gian trả kết quả: <strong>{patient.completedTime}</strong></div>
        <div className="col-span-2">Chẩn đoán lâm sàng: <em>{patient.clinicalDiagnosis}</em></div>
      </div>

      {/* 1. Hematology Table */}
      {hematologyCategory && (
        <div className="mb-4">
          <div className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-1 border border-black">
            I. HUYẾT HỌC - TỔNG PHÂN TÍCH TẾ BÀO MÁU NGOẠI VI
          </div>
          <table className="w-full text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-center font-bold">
                <th className="border border-black p-1 text-left">Tên xét nghiệm</th>
                <th className="border border-black p-1">Kết quả</th>
                <th className="border border-black p-1">Đơn vị</th>
                <th className="border border-black p-1">Khoảng tham chiếu</th>
                <th className="border border-black p-1">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {hematologyCategory.results.map((r, i) => (
                <tr key={i} className="border-b border-black text-center">
                  <td className="border border-black p-1 text-left font-medium">{r.name} ({r.code})</td>
                  <td className="border border-black p-1 font-bold">{r.value}</td>
                  <td className="border border-black p-1">{r.unit}</td>
                  <td className="border border-black p-1">{r.ref}</td>
                  <td className="border border-black p-1">{r.status === 'NORMAL' ? 'Bình thường' : r.status === 'HIGH' ? 'CAO ↑' : 'THẤP ↓'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Biochemistry Table */}
      {biochemistryCategory && (
        <div className="mb-4">
          <div className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-1 border border-black">
            II. SINH HÓA MÁU & CHỨC NĂNG CHUYỂN HÓA
          </div>
          <table className="w-full text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black text-center font-bold">
                <th className="border border-black p-1 text-left">Tên xét nghiệm</th>
                <th className="border border-black p-1">Kết quả</th>
                <th className="border border-black p-1">Đơn vị</th>
                <th className="border border-black p-1">Khoảng tham chiếu</th>
                <th className="border border-black p-1">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {biochemistryCategory.results.map((r, i) => (
                <tr key={i} className={`border-b border-black text-center ${r.status !== 'NORMAL' ? 'font-bold' : ''}`}>
                  <td className="border border-black p-1 text-left">{r.name} ({r.code})</td>
                  <td className="border border-black p-1">{r.value}</td>
                  <td className="border border-black p-1">{r.unit}</td>
                  <td className="border border-black p-1">{r.ref}</td>
                  <td className="border border-black p-1">{r.status === 'NORMAL' ? 'Bình thường' : r.status === 'HIGH' ? 'CAO ↑' : 'THẤP ↓'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Imaging Summary */}
      {imagingCategory && (
        <div className="mb-4">
          <div className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-1 border border-black">
            III. CHẨN ĐOÁN HÌNH ẢNH (X-QUANG & SIÊU ÂM)
          </div>
          <div className="border border-black p-2 text-xs space-y-2">
            {imagingCategory.results.map((img, i) => (
              <div key={i} className="border-b border-gray-300 pb-2 last:border-none last:pb-0">
                <div className="font-bold">{img.title} ({img.performedTime}):</div>
                <div>- Mô tả: {img.description}</div>
                <div>- <strong>Kết luận:</strong> {img.conclusion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Automated Clinical Summary */}
      {patient.riskSummary && (
        <div className="border border-black p-2.5 text-xs mb-6 bg-gray-50">
          <div className="font-bold uppercase text-[11px] mb-1">
            IV. TÓM TẮT DẤU HIỆU BẤT THƯỜNG & KHUYẾN NGHỊ CHUYÊN KHOA
          </div>
          <div className="space-y-1">
            <div>- <strong>Đánh giá rủi ro:</strong> {patient.riskSummary.riskLabel} ({patient.riskSummary.abnormalCount} chỉ số lệch chuẩn).</div>
            <div>- <strong>Chuyên khoa đề nghị khám tiếp:</strong> {patient.riskSummary.recommendedDepartments.map(d => d.name).join(', ')}.</div>
          </div>
        </div>
      )}

      {/* Doctor Signatures */}
      <div className="grid grid-cols-2 text-center text-xs mt-6 pt-2">
        <div>
          <div className="font-bold uppercase">BÁC SĨ CHỈ ĐỊNH</div>
          <div className="italic text-[11px]">(Ký và ghi rõ họ tên)</div>
          <div className="h-16"></div>
          <div className="font-bold">{patient.doctorName}</div>
        </div>

        <div>
          <div className="font-bold uppercase">TRƯỞNG KHOA XÉT NGHIỆM</div>
          <div className="italic text-[11px]">(Đã ký số điện tử bệnh viện)</div>
          <div className="h-16 flex items-center justify-center">
            <span className="border-2 border-red-600 text-red-600 font-bold px-2 py-1 rounded rotate-[-5deg] text-[10px]">
              DIGITAL SIGNED: TS.BS TRẦN MINH QUÂN
            </span>
          </div>
          <div className="font-bold">{patient.reviewerDoctor}</div>
        </div>
      </div>

    </div>
  );
}
