/**
 * SaharaMedCare - API Integration Self-Test Suite
 * Runs against the Express server to verify all Phase 1 endpoints
 */

process.env.NODE_ENV = 'test';

import { app } from '../src/server.js';
import pool, { closePool } from '../src/config/db.js';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting SaharaMedCare Phase 1 API Verification Suite...\n');

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
  const port = testServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

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

    // 2. Patient lookup
    await assertTest('POST /api/patients/lookup should find BN2026-089', async () => {
      const res = await fetch(`${baseUrl}/api/patients/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientCode: 'BN2026-089', phone: '0912345678' })
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Response success is false or missing data');
      if (json.data.patientId !== 'BN2026-089') throw new Error(`Wrong patientId: ${json.data.patientId}`);
      if (!json.data.riskSummary || json.data.riskSummary.overallRisk !== 'warning') {
        throw new Error('Risk summary missing or invalid overallRisk');
      }
      if (!Array.isArray(json.data.categories) || json.data.categories.length === 0) {
        throw new Error('Categories list missing or empty');
      }
    });

    // 3. Lab Results by patientId
    await assertTest('GET /api/lab-results/BN2026-089 should return full clinical data', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/BN2026-089`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error('Invalid response');
      const data = json.data;
      if (data.fullName !== 'NGUYỄN VĂN AN') throw new Error(`Expected Nguyễn Văn An, got ${data.fullName}`);
      if (data.currentStatus !== 'COMPLETED' || data.currentStep !== 3) {
        throw new Error(`Expected COMPLETED/3, got ${data.currentStatus}/${data.currentStep}`);
      }
    });

    // 4. Lab Results for PROCESSING patient (BN2026-105)
    await assertTest('GET /api/lab-results/BN2026-105 should show PROCESSING state and step 2', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/BN2026-105`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (json.data.currentStatus !== 'PROCESSING' || json.data.currentStep !== 2) {
        throw new Error(`Expected PROCESSING & step 2, got ${json.data.currentStatus}/${json.data.currentStep}`);
      }
    });

    // 5. Patient list
    await assertTest('GET /api/patients should list registered patients', async () => {
      const res = await fetch(`${baseUrl}/api/patients`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Patients array empty');
    });

    // 6. Doctor list
    await assertTest('GET /api/doctors should return list of clinical doctors', async () => {
      const res = await fetch(`${baseUrl}/api/doctors`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Doctors array empty');
      const leadDoctor = json.data.find(d => d.fullName?.includes('Lê Hoàng Nam') || d.full_name?.includes('Lê Hoàng Nam'));
      if (!leadDoctor) throw new Error('Missing doctor Lê Hoàng Nam');
    });

    // 7. Test Catalog & BHYT
    await assertTest('GET /api/catalog/tests should return standard lab tests with BHYT', async () => {
      const res = await fetch(`${baseUrl}/api/catalog/tests`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Test catalog empty');
    });

    // 8. Sample Guidelines
    await assertTest('GET /api/catalog/guidelines should return patient preparation instructions', async () => {
      const res = await fetch(`${baseUrl}/api/catalog/guidelines`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json.data) || json.data.length === 0) throw new Error('Guidelines empty');
    });

    // 9. Update Lab status
    await assertTest('PATCH /api/lab-results/orders/:orderId/status should update status to COMPLETED', async () => {
      const res = await fetch(`${baseUrl}/api/lab-results/orders/CLS2026-1119-105/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

    // 10. Create new Patient
    await assertTest('POST /api/patients should successfully register a new patient', async () => {
      const testId = `BN-TEST-${Date.now().toString().slice(-4)}`;
      const res = await fetch(`${baseUrl}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: testId,
          fullName: 'NGUYỄN VĂN TEST',
          dateOfBirth: '1995-10-15',
          gender: 'Nam',
          phoneNumber: '0999888777',
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
