/**
 * SaharaMedCare - API Integration Self-Test Suite
 * Runs against the Express server to verify all Phase 1 & Authentication endpoints
 */

process.env.NODE_ENV = 'test';

import { app } from '../src/server.js';
import pool, { closePool } from '../src/config/db.js';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting SaharaMedCare Phase 1 & Auth API Verification Suite...\n');

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
  const port = testServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;
  let doctorToken = '';
  let patientToken = '';

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await assertTest('GET /api/health should return status OK', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (json.status !== 'OK') throw new Error(`Expected status OK, got ${json.status}`);
    });

    // 2. Doctor Login (BS-001)
    await assertTest('POST /api/auth/login for Doctor BS-001 should return JWT token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'DOCTOR',
          identifier: 'BS-001',
          password: '123456'
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.token) throw new Error('Missing token in response');
      if (json.user.role !== 'DOCTOR') throw new Error(`Expected DOCTOR role, got ${json.user.role}`);
      doctorToken = json.token;
    });

    // 3. Patient Login (0912345678 / BN2026-089)
    await assertTest('POST /api/auth/login for Patient 0912345678 should succeed', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PATIENT',
          identifier: '0912345678',
          password: '123456'
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.token) throw new Error('Missing token');
      patientToken = json.token;
    });

    // 4. Invalid Login (Wrong password)
    await assertTest('POST /api/auth/login with wrong password should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PATIENT',
          identifier: '0912345678',
          password: 'wrong_password_xyz'
        })
      });
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      const json = await res.json();
      if (json.success !== false) throw new Error('Expected success false');
    });

    // 5. Patient Registration
    const newPhone = `099${Math.floor(1000000 + Math.random() * 8999999)}`;
    await assertTest('POST /api/auth/register should create new patient and account', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PATIENT',
          fullName: 'Lê Thùy Dương',
          phoneNumber: newPhone,
          dateOfBirth: '1996-03-22',
          gender: 'Nữ',
          nationalId: '079196001122',
          healthInsuranceNumber: 'GD 4 79 79 33445566',
          address: 'Quận 1, TP. Hồ Chí Minh',
          password: 'password123'
        })
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.token) throw new Error('Registration failed');
      if (json.user.fullName !== 'Lê Thùy Dương') throw new Error(`Wrong fullName: ${json.user.fullName}`);
    });

    // 6. Duplicate Registration should return 409
    await assertTest('POST /api/auth/register with existing phone should return 409', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'PATIENT',
          fullName: 'Trùng Số Điện Thoại',
          phoneNumber: newPhone,
          dateOfBirth: '1996-03-22',
          gender: 'Nữ',
          password: 'password123'
        })
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    });

    // 7. GET /api/auth/me
    await assertTest('GET /api/auth/me should return current user info from JWT', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || json.user.role !== 'DOCTOR') throw new Error('Invalid user info');
    });

    // 8. Patient lookup (Public endpoint)
    await assertTest('POST /api/patients/lookup should find BN2026-089 without auth', async () => {
      const res = await fetch(`${baseUrl}/api/patients/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCode: 'BN2026-089', phone: '0912345678' })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Lookup failed');
      if (json.data.patientId !== 'BN2026-089') throw new Error(`Wrong patientId`);
    });

    // 9. Lab Results by patientId (Public endpoint)
    await assertTest('GET /api/lab-results/BN2026-089 should return full clinical data', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/BN2026-089`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Invalid response');
      if (json.data.currentStatus !== 'COMPLETED' || json.data.currentStep !== 3) {
        throw new Error('Expected COMPLETED/3');
      }
    });

    // 10. Lab Results for PROCESSING patient (BN2026-105)
    await assertTest('GET /api/lab-results/BN2026-105 should show PROCESSING state', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/BN2026-105`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (json.data.currentStatus !== 'PROCESSING' || json.data.currentStep !== 2) {
        throw new Error('Expected PROCESSING & step 2');
      }
    });

    // 11. Patient list
    await assertTest('GET /api/patients should list registered patients', async () => {
      const res = await fetch(`${baseUrl}/api/patients`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Patients array empty');
    });

    // 12. Doctor list
    await assertTest('GET /api/doctors should return list of clinical doctors', async () => {
      const res = await fetch(`${baseUrl}/api/doctors`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Doctors array empty');
    });

    // 13. Test Catalog & BHYT
    await assertTest('GET /api/catalog/tests should return standard lab tests with BHYT', async () => {
      const res = await fetch(`${baseUrl}/api/catalog/tests`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Test catalog empty');
    });

    // 14. Access Control: Write without token should return 401
    await assertTest('PATCH /api/lab-results/orders/:id/status without token should return 401', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/orders/CLS2026-1119-105/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    // 15. Access Control: Write with Patient token should return 403 Forbidden
    await assertTest('PATCH /api/lab-results/orders/:id/status with Patient token should return 403', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/orders/CLS2026-1119-105/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patientToken}`
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 16. Doctor Update Lab status (With Doctor Token)
    await assertTest('PATCH /api/lab-results/orders/:id/status with Doctor token should succeed', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/orders/CLS2026-1119-105/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctorToken}`
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          step: 3,
          statusText: 'Đã hoàn tất phân tích mẫu'
        })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.status !== 'COMPLETED') {
        throw new Error('Status not updated properly');
      }
    });

    // 17. Doctor Create Patient (With Doctor Token)
    await assertTest('POST /api/patients with Doctor token should successfully register patient', async () => {
      const testId = `BN-TEST-${Date.now().toString().slice(-4)}`;
      const res = await fetch(`${baseUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${doctorToken}`
        },
        body: JSON.stringify({
          patientId: testId,
          fullName: 'NGUYỄN VĂN TEST',
          dateOfBirth: '1995-10-15',
          gender: 'Nam',
          phoneNumber: `098${Math.floor(1000000 + Math.random() * 8999999)}`,
          nationalId: '079095009999',
          healthInsuranceNumber: 'GD 4 79 79 99998888',
          address: 'TP. Hồ Chí Minh'
        })
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to create patient');
    });

  } finally {
    await new Promise((resolve) => testServer.close(resolve));
    await closePool();
  }

  console.log(`\n======================================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
