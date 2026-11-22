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

async function initDatabase() {
  console.log('[DB Init] Connecting to MySQL server...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

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
