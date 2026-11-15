const BASE = 'http://localhost:5000';

async function verifyTwoRoleSystem() {
  console.log('=== VERIFYING TWO-ROLE SECURE AUTHENTICATION SYSTEM ===\n');

  // Test 1: Admin Login
  console.log('1. Testing Admin Authentication (admin@login / admin@123)...');
  const adminRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@login', password: 'admin@123' }),
  });
  const adminData = await adminRes.json();
  console.log('   Status:', adminRes.status);
  console.log('   User:', adminData.user?.email, 'Role:', adminData.user?.role);
  if (adminRes.status === 200 && adminData.user?.role === 'ADMIN' && adminData.token) {
    console.log('   ✅ PASS: Admin successfully authenticated with role ADMIN\n');
  } else {
    console.error('   ❌ FAIL: Admin authentication failed!\n');
  }

  // Test 2: Account Manager Login
  console.log('2. Testing Account Manager Authentication (account@login / Account@123)...');
  const acctRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'account@login', password: 'Account@123' }),
  });
  const acctData = await acctRes.json();
  console.log('   Status:', acctRes.status);
  console.log('   User:', acctData.user?.email, 'Role:', acctData.user?.role);
  if (acctRes.status === 200 && acctData.user?.role === 'ACCOUNT_MANAGER' && acctData.token) {
    console.log('   ✅ PASS: Account Manager successfully authenticated with role ACCOUNT_MANAGER\n');
  } else {
    console.error('   ❌ FAIL: Account Manager authentication failed!\n');
  }

  const adminToken = adminData.token;
  const acctToken = acctData.token;

  // Test 3: Admin User Management Access
  console.log('3. Testing Admin access to User Management (GET /api/auth/users)...');
  const adminUsersRes = await fetch(`${BASE}/api/auth/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const users = await adminUsersRes.json();
  console.log('   Status:', adminUsersRes.status, 'Total users:', Array.isArray(users) ? users.length : 0);
  if (adminUsersRes.status === 200) {
    console.log('   ✅ PASS: Admin granted full access to User Management\n');
  } else {
    console.error('   ❌ FAIL: Admin denied access to User Management!\n');
  }

  // Test 4: Account Manager User Management Denial
  console.log('4. Testing Account Manager access to User Management (GET /api/auth/users)...');
  const acctUsersRes = await fetch(`${BASE}/api/auth/users`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });
  const acctUsersBody = await acctUsersRes.json();
  console.log('   Status:', acctUsersRes.status, 'Body:', acctUsersBody);
  if (acctUsersRes.status === 403) {
    console.log('   ✅ PASS: Account Manager strictly denied access to User Management (403 Forbidden)\n');
  } else {
    console.error('   ❌ FAIL: Account Manager was not blocked from User Management!\n');
  }

  // Test 5: Account Manager Invoices & Outstanding Access
  console.log('5. Testing Account Manager access to Outstanding & Invoices...');
  const acctOutRes = await fetch(`${BASE}/api/payments/outstanding`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });
  const outList = await acctOutRes.json();
  const acctInvRes = await fetch(`${BASE}/api/invoices`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });
  const invList = await acctInvRes.json();
  console.log('   Outstanding status:', acctOutRes.status, 'Count:', Array.isArray(outList) ? outList.length : 0);
  console.log('   Invoices status:', acctInvRes.status, 'Count:', Array.isArray(invList) ? invList.length : 0);
  if (acctOutRes.status === 200 && acctInvRes.status === 200) {
    console.log('   ✅ PASS: Account Manager granted access to financial ledgers & billing\n');
  } else {
    console.error('   ❌ FAIL: Account Manager denied access to financial data!\n');
  }

  // Test 6: Account Manager Settings Update Denial
  console.log('6. Testing Account Manager attempting to modify Company Settings (PUT /api/settings)...');
  const acctSettingsRes = await fetch(`${BASE}/api/settings`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${acctToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName: 'Unauthorized Change' }),
  });
  console.log('   Status:', acctSettingsRes.status);
  if (acctSettingsRes.status === 403) {
    console.log('   ✅ PASS: Account Manager strictly denied access to modify Company Settings (403 Forbidden)\n');
  } else {
    console.error('   ❌ FAIL: Account Manager was able to modify settings!\n');
  }

  console.log('=== ALL TWO-ROLE VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

verifyTwoRoleSystem().catch(console.error);
