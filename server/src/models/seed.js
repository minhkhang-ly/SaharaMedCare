/**
 * SaharaMedCare - Database Initialization & Seed Script
 * Run with: npm run db:init (or npm run db:seed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findWorkingConnection() {
  const envPort = Number(process.env.DB_PORT) || 3307;
  const envPassword = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';

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
        multipleStatements: true,
        connectTimeout: 1500
      });
      await conn.ping();
      console.log(`[DB Init] Connected successfully to MySQL on Port ${cfg.port} (user: ${user})`);
      return conn;
    } catch (err) {
      // Thử cấu hình tiếp theo
    }
  }

  throw new Error('Could not connect to MySQL on port 3306 or 3307. Please ensure MySQL/XAMPP is running.');
}

async function initDatabase() {
  console.log('[DB Init] Connecting to MySQL server with multi-port auto-detection...');
  let connection;
  try {
    connection = await findWorkingConnection();

    console.log('[DB Init] Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('[DB Init] Schema created / verified successfully.');

    console.log('[DB Init] Reading seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('[DB Init] Realistic clinical seed data populated successfully!');

    await connection.end();
    console.log('[DB Init] Database initialization complete.');
    process.exit(0);
  } catch (error) {
    console.error(`[DB Init] Error initializing database: ${error.message}`);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();
