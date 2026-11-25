import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let currentPool = null;
export let isDbConnected = false;
export let activePort = Number(process.env.DB_PORT) || 3307;

const initialConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saharamedcare_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000
};

try {
  currentPool = mysql.createPool(initialConfig);
} catch (err) {
  console.warn(`[Database] Error initializing MySQL pool: ${err.message}`);
}

/**
 * Proxy đối tượng pool để tự động chuyển tiếp mọi câu query đến pool đang hoạt động
 */
const poolProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    if (!currentPool) return undefined;
    const value = currentPool[prop];
    return typeof value === 'function' ? value.bind(currentPool) : value;
  }
});

/**
 * Hàm kiểm tra kết nối và tự động dò tìm cổng MySQL khả dụng (3306 hoặc 3307)
 */
export async function checkDbConnection() {
  const envPort = Number(process.env.DB_PORT) || 3307;
  const envPassword = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const database = process.env.DB_NAME || 'saharamedcare_db';
  const user = process.env.DB_USER || 'root';

  // Danh sách các tổ hợp cấu hình thường gặp trong team (cổng 3307 XAMPP, cổng 3306 mặc định)
  const candidateConfigs = [
    { port: envPort, password: envPassword },
    { port: 3307, password: '' },
    { port: 3306, password: '' },
    { port: 3306, password: '123456' },
    { port: 3307, password: 'root' },
    { port: 3306, password: 'root' }
  ];

  for (const cfg of candidateConfigs) {
    try {
      const conn = await mysql.createConnection({
        host,
        port: cfg.port,
        user,
        password: cfg.password,
        database,
        connectTimeout: 1000
      });

      await conn.ping();
      await conn.end();

      // Nếu cấu hình này khác với pool ban đầu, tạo lại pool theo cấu hình hoạt động
      if (!currentPool || cfg.port !== initialConfig.port || cfg.password !== initialConfig.password) {
        if (currentPool) {
          try { await currentPool.end(); } catch {}
        }
        currentPool = mysql.createPool({
          host,
          port: cfg.port,
          user,
          password: cfg.password,
          database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
      }

      isDbConnected = true;
      activePort = cfg.port;
      console.log(`[Database] MySQL Connected successfully on Port ${cfg.port} to database: "${database}"`);
      return true;
    } catch (err) {
      // Tiếp tục thử ứng viên tiếp theo
    }
  }

  isDbConnected = false;
  console.warn(`[Database] MySQL not reachable on Port 3306/3307. Running in High-Fidelity Clinical Mock Data Mode.`);
  return false;
}

export async function closePool() {
  if (currentPool) {
    try {
      await currentPool.end();
    } catch (e) {}
  }
}

export default poolProxy;
