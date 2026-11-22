import pool, { isDbConnected } from '../config/db.js';
import { testPriceCatalog, sampleGuidelines } from '../models/mockData.js';

/**
 * Lấy danh mục xét nghiệm & bảng giá BHYT
 */
export const getTestCatalog = async (req, res) => {
  try {
    const { department, q } = req.query;

    if (isDbConnected && pool) {
      try {
        let sql = `SELECT c.*, cat.category_name, cat.category_code
                   FROM lab_test_catalog c
                   JOIN lab_categories cat ON c.category_id = cat.category_id`;
        const conditions = [];
        const params = [];

        if (department) {
          conditions.push(`c.department LIKE ?`);
          params.push(`%${department}%`);
        }
        if (q) {
          conditions.push(`(c.service_name LIKE ? OR c.service_code LIKE ?)`);
          params.push(`%${q}%`, `%${q}%`);
        }

        if (conditions.length > 0) {
          sql += ` WHERE ` + conditions.join(' AND ');
        }

        sql += ` ORDER BY c.category_id ASC, c.service_code ASC`;

        const [rows] = await pool.query(sql, params);
        return res.json({
          success: true,
          total: rows.length,
          source: 'MySQL',
          data: rows.map(r => ({
            code: r.service_code,
            name: r.service_name,
            department: r.department,
            sampleType: r.sample_type,
            timeMinutes: r.turnaround_time,
            price: r.price_formatted,
            priceNumeric: Number(r.price),
            bhyt: r.bhyt_coverage,
            guide: r.preparation_guide
          }))
        });
      } catch (err) {
        console.warn(`[getTestCatalog DB Error] ${err.message}. Using fallback.`);
      }
    }

    let list = testPriceCatalog;
    if (department) {
      list = list.filter(t => t.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (q) {
      const qLower = q.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(qLower) || t.code.toLowerCase().includes(qLower));
    }

    res.json({
      success: true,
      total: list.length,
      source: 'MockDataStore',
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy danh mục nhóm xét nghiệm (Lab Categories)
 */
export const getCategories = async (req, res) => {
  try {
    if (isDbConnected && pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM lab_categories ORDER BY display_order ASC`);
        return res.json({ success: true, source: 'MySQL', data: rows });
      } catch (err) {
        console.warn(`[getCategories DB Error] ${err.message}. Using fallback.`);
      }
    }

    res.json({
      success: true,
      source: 'MockDataStore',
      data: [
        { category_id: 1, category_code: 'hematology', code_prefix: 'HH', category_name: 'Huyết học (Tổng phân tích tế bào máu)' },
        { category_id: 2, category_code: 'biochemistry', code_prefix: 'SH', category_name: 'Sinh hóa máu & Chức năng chuyển hóa' },
        { category_id: 3, category_code: 'imaging', code_prefix: 'CDHA', category_name: 'Chẩn đoán hình ảnh (X-Quang & Siêu âm)' },
        { category_id: 4, category_code: 'urinalysis', code_prefix: 'NT', category_name: 'Tổng phân tích nước tiểu' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy hướng dẫn chuẩn bị lấy mẫu cho bệnh nhân
 */
export const getSampleGuidelines = async (req, res) => {
  try {
    if (isDbConnected && pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM sample_guidelines ORDER BY display_order ASC`);
        return res.json({ success: true, source: 'MySQL', data: rows });
      } catch (err) {
        console.warn(`[getSampleGuidelines DB Error] ${err.message}. Using fallback.`);
      }
    }

    res.json({
      success: true,
      source: 'MockDataStore',
      data: sampleGuidelines
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
