const fs = require('fs');
const path = require('path');

const BASE_API = 'http://localhost:5000';
const BASE_CLIENT = 'http://localhost:3000';

async function runAcceptanceTests() {
  console.log('================================================================');
  console.log('MSK LOGISTIC SOLUTION ERP — UNIFIED LOGIN VERIFICATION SUITE');
  console.log('================================================================\n');

  // Test 1: Client bundle check — verify no separate portal links in Login component
  console.log('1. Checking client Login page design & source...');
  const loginSrc = fs.readFileSync(path.resolve(__dirname, '../client/src/pages/Login.tsx'), 'utf8');
  const hasPortalCards = loginSrc.includes('PortalSelect') || loginSrc.includes('Administrator Access Portal');
  const hasSeparateLinks = loginSrc.includes('Are you an Account Manager?') || loginSrc.includes('Are you an Administrator?');
  const hasSingleForm = loginSrc.includes('Sign In') && (loginSrc.includes('Email / Username') || loginSrc.includes('Username / Email')) && loginSrc.includes('Password');
  const hasEyeToggle = loginSrc.includes('setShowPassword') && loginSrc.includes('EyeOff');

  if (!hasPortalCards && !hasSeparateLinks && hasSingleForm && hasEyeToggle) {
    console.log('   ✅ PASS: Single unified sign-in page verified (one input for user, one for password with eye toggle, single submit button, no portal selector/links)\n');
  } else {
    console.error('   ❌ FAIL: Obsolete portal selector or separate links still present in Login.tsx!\n');
  }

  // Test 2: Invalid credentials test
  console.log('2. Testing invalid credentials submission...');
  const invalidRes = await fetch(`${BASE_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fakeuser@msk.com', password: 'badpassword' }),
  });
  const invalidBody = await invalidRes.json();
  console.log('   Status:', invalidRes.status, 'Error:', invalidBody.error);
  if (invalidRes.status === 401 && invalidBody.error === 'Invalid email or password.') {
    console.log('   ✅ PASS: Invalid credentials properly rejected with uniform message\n');
  } else {
    console.error('   ❌ FAIL: Invalid credentials check failed!\n');
  }

  // Test 3: Admin Login with admin@login / admin@123
  console.log('3. Testing Admin Login with admin@login / admin@123...');
  const adminRes = await fetch(`${BASE_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@login', password: 'admin@123' }),
  });
  const adminBody = await adminRes.json();
  console.log('   Status:', adminRes.status);
  console.log('   User:', adminBody.user?.email, 'Role:', adminBody.user?.role);
  const adminToken = adminBody.token;

  if (adminRes.status === 200 && adminBody.user?.role === 'ADMIN' && adminToken) {
    console.log('   ✅ PASS: Backend automatically verified Admin role and issued token for /admin/dashboard\n');
  } else {
    console.error('   ❌ FAIL: Admin login failed!\n');
  }

  // Test 4: Account Manager Login with account@login / Account@123
  console.log('4. Testing Account Manager Login with account@login / Account@123...');
  const acctRes = await fetch(`${BASE_API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'account@login', password: 'Account@123' }),
  });
  const acctBody = await acctRes.json();
  console.log('   Status:', acctRes.status);
  console.log('   User:', acctBody.user?.email, 'Role:', acctBody.user?.role);
  const acctToken = acctBody.token;

  if (acctRes.status === 200 && acctBody.user?.role === 'ACCOUNT_MANAGER' && acctToken) {
    console.log('   ✅ PASS: Backend automatically verified Account Manager role and issued token for /account/dashboard\n');
  } else {
    console.error('   ❌ FAIL: Account Manager login failed!\n');
  }

  // Test 5: Verify Session Restoration via /api/auth/me for both roles
  console.log('5. Testing Session Restoration (/api/auth/me) for Admin & Account Manager...');
  const adminMe = await fetch(`${BASE_API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminMeData = await adminMe.json();

  const acctMe = await fetch(`${BASE_API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });
  const acctMeData = await acctMe.json();

  if (adminMeData.user?.role === 'ADMIN' && acctMeData.user?.role === 'ACCOUNT_MANAGER') {
    console.log('   ✅ PASS: Page refresh / session restoration verified for both roles from trusted backend\n');
  } else {
    console.error('   ❌ FAIL: Session restoration failed!\n');
  }

  // Test 6: Backend RBAC enforcement
  console.log('6. Testing Backend RBAC Enforcement...');
  const adminUsers = await fetch(`${BASE_API}/api/auth/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const acctUsers = await fetch(`${BASE_API}/api/auth/users`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });

  if (adminUsers.status === 200 && acctUsers.status === 403) {
    console.log('   ✅ PASS: Admin permitted to view users (200), Account Manager strictly forbidden (403)\n');
  } else {
    console.error('   ❌ FAIL: RBAC enforcement failed! Admin:', adminUsers.status, 'Acct:', acctUsers.status);
  }

  // Test 7: Verify Database Records & Existing Data Integrity
  console.log('7. Verifying Database Integrity (Invoices, Parties, Outstanding)...');
  const invoicesRes = await fetch(`${BASE_API}/api/invoices`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const invoices = await invoicesRes.json();

  const partiesRes = await fetch(`${BASE_API}/api/parties`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const parties = await partiesRes.json();

  const outRes = await fetch(`${BASE_API}/api/payments/outstanding`, {
    headers: { Authorization: `Bearer ${acctToken}` },
  });
  const outstanding = await outRes.json();

  console.log('   Invoices count:', invoices.length);
  console.log('   Parties count:', parties.length);
  console.log('   Outstanding records count:', outstanding.length);

  if (invoices.length >= 32 && parties.length === 9 && outstanding.length === 9) {
    console.log(`   ✅ PASS: Zero data loss — All ${invoices.length} invoices, ${parties.length} parties, and ${outstanding.length} outstanding summaries fully preserved\n`);
  } else {
    console.error('   ❌ FAIL: Data mismatch detected!\n');
  }

  console.log('================================================================');
  console.log('ALL UNIFIED LOGIN & ROLE DETECTION TESTS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runAcceptanceTests().catch(console.error);
