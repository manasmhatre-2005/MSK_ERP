const BASE = 'http://127.0.0.1:5005';

async function testAccountRole() {
  console.log('Testing Account Role permissions...');
  // 1. Authenticate Account Manager
  const acctRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'account@login', password: 'Account@123' }),
  });
  const acctData = await acctRes.json();
  const token = acctData.token;

  // 2. Allowed Financial Endpoints
  const allowed = [
    { name: 'Invoices API', url: `${BASE}/api/invoices` },
    { name: 'Payments API', url: `${BASE}/api/payments` },
    { name: 'Outstanding Balances', url: `${BASE}/api/payments/outstanding` },
    { name: 'Reports Dashboard', url: `${BASE}/api/reports/dashboard` },
    { name: 'Parties API', url: `${BASE}/api/parties` },
  ];

  for (const ep of allowed) {
    const res = await fetch(ep.url, { headers: { Authorization: `Bearer ${token}` } });
    console.log(`   ${ep.name}: Status ${res.status} ${res.status === 200 ? '✅ (AUTHORIZED 200)' : '❌ (FAILED)'}`);
    if (res.status !== 200) throw new Error(`Account Manager unexpectedly blocked from ${ep.name}`);
  }

  // 3. Prohibited Admin-Only Endpoints
  const forbidden = [
    { name: 'Users Management (GET /api/auth/users)', url: `${BASE}/api/auth/users`, method: 'GET' },
    { name: 'Company Settings Update (PUT /api/settings)', url: `${BASE}/api/settings`, method: 'PUT', body: JSON.stringify({ companyName: 'HACKED' }) },
    { name: 'Audit Logs (GET /api/audit)', url: `${BASE}/api/audit`, method: 'GET' },
  ];

  for (const ep of forbidden) {
    const res = await fetch(ep.url, {
      method: ep.method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: ep.body,
    });
    console.log(`   ${ep.name}: Status ${res.status} ${res.status === 403 ? '✅ (STRICTLY FORBIDDEN 403)' : '❌ (LEAKED!)'}`);
    if (res.status !== 403) throw new Error(`Security breach! Account Manager was not blocked from ${ep.name}`);
  }

  console.log('✅ ALL ACCOUNT ROLE PERMISSION CHECKS PASSED PERFECTLY!');
}

testAccountRole().catch(err => {
  console.error('Account test failed:', err);
  process.exit(1);
});
