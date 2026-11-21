import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
export let isDbConnected = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'saharamedcare_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000
  });
} catch (err) {
  console.warn(`[Database] Error initializing MySQL pool: ${err.message}`);
}

export async function checkDbConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isDbConnected = true;
    console.log(`[Database] MySQL Connected successfully to database: ${process.env.DB_NAME || 'saharamedcare_db'}`);
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`[Database] MySQL not reachable (${error.code || error.message}). Running in High-Fidelity Clinical Mock Data Mode.`);
    return false;
  }
}

export async function closePool() {
  if (pool) {
    try {
      await pool.end();
    } catch (e) {}
  }
}

export default pool;
