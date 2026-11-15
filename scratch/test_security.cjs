async function runSecurityTests() {
  const BASE = 'http://localhost:5000';
  console.log('--- STARTING MSK ERP SECURITY HARDENING VERIFICATION ---');

  // Test 1: Health check & Security Headers
  const healthRes = await fetch(`${BASE}/api/health`);
  console.log('1. Health Check status:', healthRes.status);
  console.log('   Security Headers:');
  console.log('   - x-content-type-options:', healthRes.headers.get('x-content-type-options'));
  console.log('   - x-frame-options:', healthRes.headers.get('x-frame-options'));
  console.log('   - content-security-policy:', !!healthRes.headers.get('content-security-policy'));

  // Test 2: Unauthenticated Request to Protected Route (Must be 401)
  const unauthRes = await fetch(`${BASE}/api/parties`);
  console.log('2. Unauthenticated GET /api/parties status:', unauthRes.status);
  const unauthBody = await unauthRes.json();
  console.log('   Response body:', unauthBody);
  if (unauthRes.status === 401) {
    console.log('   ✅ PASS: Unauthenticated access properly rejected (No Admin fallback)');
  } else {
    console.error('   ❌ FAIL: Protected route did not return 401!');
  }

  // Test 3: Account Enumeration Prevention (Non-existent user vs Wrong password)
  const wrongUserRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@msk.com', password: 'wrongpassword' }),
  });
  const wrongUserBody = await wrongUserRes.json();
  console.log('3a. Non-existent user login response:', wrongUserRes.status, wrongUserBody);

  const wrongPassRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@logibill.com', password: 'wrongpassword' }),
  });
  const wrongPassBody = await wrongPassRes.json();
  console.log('3b. Wrong password login response:', wrongPassRes.status, wrongPassBody);

  if (wrongUserBody.error === wrongPassBody.error) {
    console.log('   ✅ PASS: Constant error message prevents user account enumeration');
  } else {
    console.error('   ❌ FAIL: Error messages differ, leaking user existence!');
  }

  // Test 4: Admin Login
  const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@logibill.com', password: 'admin123' }),
  });
  const adminLoginBody = await adminLoginRes.json();
  console.log('4. Admin Login status:', adminLoginRes.status, 'role:', adminLoginBody.user?.role);
  const adminToken = adminLoginBody.token;

  // Test 5: Admin access to protected /api/parties
  const partiesRes = await fetch(`${BASE}/api/parties`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const parties = await partiesRes.json();
  console.log('5. Admin GET /api/parties status:', partiesRes.status, 'Parties count:', parties.length);
  if (partiesRes.status === 200 && Array.isArray(parties)) {
    console.log('   ✅ PASS: Authenticated party data retrieved successfully');
  }

  // Test 6: Viewer Login & RBAC enforcement on User Management
  const viewerLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'viewer@logibill.com', password: 'viewer123' }),
  });
  const viewerLoginBody = await viewerLoginRes.json();
  const viewerToken = viewerLoginBody.token;
  console.log('6. Viewer Login status:', viewerLoginRes.status, 'role:', viewerLoginBody.user?.role);

  // Viewer accessing /api/auth/users (Must be 403 Forbidden)
  const viewerUsersRes = await fetch(`${BASE}/api/auth/users`, {
    headers: { Authorization: `Bearer ${viewerToken}` },
  });
  console.log('7. Viewer GET /api/auth/users status:', viewerUsersRes.status);
  const viewerUsersBody = await viewerUsersRes.json();
  console.log('   Response:', viewerUsersBody);
  if (viewerUsersRes.status === 403) {
    console.log('   ✅ PASS: Viewer denied access to sensitive user administration');
  } else {
    console.error('   ❌ FAIL: Non-admin was allowed to access /auth/users!');
  }

  // Admin accessing /api/auth/users (Must be 200 OK)
  const adminUsersRes = await fetch(`${BASE}/api/auth/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminUsers = await adminUsersRes.json();
  console.log('8. Admin GET /api/auth/users status:', adminUsersRes.status, 'Users count:', adminUsers.length);
  if (adminUsersRes.status === 200 && Array.isArray(adminUsers)) {
    console.log('   ✅ PASS: Admin granted access to user administration');
  }

  // Test 9: Public QR Verification Endpoints (Must be accessible without token)
  const qrRes = await fetch(`${BASE}/api/invoices/verify/test-token`);
  console.log('9. Public QR Verification GET /api/invoices/verify/test-token status:', qrRes.status);
  if (qrRes.status !== 401) {
    console.log('   ✅ PASS: Public QR verification remains accessible without login');
  } else {
    console.error('   ❌ FAIL: QR verification unexpectedly requires auth!');
  }

  console.log('--- ALL SECURITY HARDENING TESTS COMPLETED ---');
}

runSecurityTests().catch(console.error);
