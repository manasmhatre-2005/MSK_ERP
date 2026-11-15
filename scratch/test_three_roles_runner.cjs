const BASE = 'http://127.0.0.1:5005';

async function testRoles() {
  console.log('=== TESTING THREE-ROLE STRICT ACCESS CONTROL ===\n');

  // 1. Login Admin
  console.log('1. Authenticating Admin (admin@login / admin@123)...');
  const adminRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@login', password: 'admin@123' }),
  });
  const adminData = await adminRes.json();
  console.log('   Admin Status:', adminRes.status, 'Role:', adminData.user?.role);
  if (adminRes.status !== 200 || adminData.user?.role !== 'ADMIN') throw new Error('Admin auth failed');

  // 2. Login Account Manager
  console.log('2. Authenticating Account Manager (account@login / Account@123)...');
  const acctRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'account@login', password: 'Account@123' }),
  });
  const acctData = await acctRes.json();
  console.log('   Account Status:', acctRes.status, 'Role:', acctData.user?.role);
  if (acctRes.status !== 200 || acctData.user?.role !== 'ACCOUNT_MANAGER') throw new Error('Account auth failed');

  // 3. Login Data Entry Operator
  console.log('3. Authenticating Data Entry Operator (operator@login / Operator@123)...');
  const opRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'operator@login', password: 'Operator@123' }),
  });
  const opData = await opRes.json();
  console.log('   Operator Status:', opRes.status, 'Role:', opData.user?.role);
  if (opRes.status !== 200 || opData.user?.role !== 'DATA_ENTRY') throw new Error('Operator auth failed');

  const adminToken = adminData.token;
  const acctToken = acctData.token;
  const opToken = opData.token;

  // 4. Operator Data Entry Actions
  console.log('\n4. Testing Operator Data Entry Operations:');
  
  // 4a. Get reference data
  const refRes = await fetch(`${BASE}/api/data-entry/reference-data`, {
    headers: { Authorization: `Bearer ${opToken}` },
  });
  const refData = await refRes.json();
  console.log('   Reference data status:', refRes.status, 'Shipping lines count:', refData.shippingLines?.length);
  if (refRes.status !== 200) throw new Error('Operator failed to get reference data');

  // 4b. Create operational record with all 8 fields
  const testContainerNo = 'MSKU' + Math.floor(1000000 + Math.random() * 9000000);
  const createPayload = {
    operationType: 'STUFFING',
    operationDate: new Date().toISOString(),
    containerType: 'DRY',
    containerSize: '40 FT',
    containerNumber: testContainerNo,
    sealNumber: 'SED-889922',
    movementType: 'IN',
    shippingLine: 'MAERSK LINE',
    exporterName: 'RELIANCE INDUSTRIES LTD',
    remarks: 'Automated test operational record',
  };

  const createRes = await fetch(`${BASE}/api/data-entry`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload),
  });
  const createData = await createRes.json();
  console.log('   Create entry status:', createRes.status, 'EntryRef:', createData.record?.entryNumber);
  if (createRes.status !== 201 || !createData.record?.id) throw new Error('Failed to create entry');
  const entryId = createData.record.id;

  // 4c. List entries (verify operator sees own entry)
  const listRes = await fetch(`${BASE}/api/data-entry`, {
    headers: { Authorization: `Bearer ${opToken}` },
  });
  const listData = await listRes.json();
  console.log('   List entries status:', listRes.status, 'Total entries:', listData.total);
  if (listRes.status !== 200 || !listData.records?.some(r => r.id === entryId)) throw new Error('Created entry not in list');

  // 4d. Update entry
  const updateRes = await fetch(`${BASE}/api/data-entry/${entryId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${opToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sealNumber: 'SED-889922-REVISED', version: createData.record.version }),
  });
  const updateData = await updateRes.json();
  console.log('   Update entry status:', updateRes.status, 'Updated Seal:', updateData.record?.sealNumber);
  if (updateRes.status !== 200) throw new Error('Update entry failed');

  // 4e. Send Email
  const emailRes = await fetch(`${BASE}/api/data-entry/${entryId}/email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientEmail: 'operations@msklogisticsolution.com', customNote: 'Container ready for carting' }),
  });
  const emailData = await emailRes.json();
  console.log('   Email entry status:', emailRes.status, 'Delivery:', emailData.deliveryDetails?.status);
  if (emailRes.status !== 200) throw new Error('Email entry failed');

  // 4f. Export CSV
  const csvRes = await fetch(`${BASE}/api/data-entry/export/csv`, {
    headers: { Authorization: `Bearer ${opToken}` },
  });
  const csvText = await csvRes.text();
  console.log('   CSV export status:', csvRes.status, 'Header:', csvText.split('\n')[0]);
  if (csvRes.status !== 200 || !csvText.includes('Entry Ref')) throw new Error('CSV export failed');

  // 5. Strict Security: Block Operator from All Financial & Admin Endpoints
  console.log('\n5. Verifying Strict Backend Access Denial for Data Entry Operator:');
  const restrictedEndpoints = [
    { name: 'Invoices API (GET /api/invoices)', url: `${BASE}/api/invoices` },
    { name: 'Payments API (GET /api/payments)', url: `${BASE}/api/payments` },
    { name: 'Outstanding Balances (GET /api/payments/outstanding)', url: `${BASE}/api/payments/outstanding` },
    { name: 'Reports Dashboard (GET /api/reports/dashboard)', url: `${BASE}/api/reports/dashboard` },
    { name: 'Settings API (GET /api/settings)', url: `${BASE}/api/settings` },
    { name: 'Users Management (GET /api/auth/users)', url: `${BASE}/api/auth/users` },
    { name: 'Audit Logs (GET /api/audit)', url: `${BASE}/api/audit` },
    { name: 'Parties API (GET /api/parties)', url: `${BASE}/api/parties` },
    { name: 'Charges API (GET /api/charges)', url: `${BASE}/api/charges` },
  ];

  for (const endpoint of restrictedEndpoints) {
    const res = await fetch(endpoint.url, {
      headers: { Authorization: `Bearer ${opToken}` },
    });
    console.log(`   ${endpoint.name}: Status ${res.status} ${res.status === 403 ? '✅ (STRICTLY BLOCKED 403)' : '❌ (LEAKED!)'}`);
    if (res.status !== 403) throw new Error(`Security breach! Operator was not blocked from ${endpoint.name}`);
  }

  // 6. Delete Entry
  console.log('\n6. Testing safe deletion of operational record...');
  const delRes = await fetch(`${BASE}/api/data-entry/${entryId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${opToken}` },
  });
  console.log('   Delete status:', delRes.status);
  if (delRes.status !== 200) throw new Error('Delete failed');

  console.log('\n=== ALL THREE-ROLE BACKEND PERMISSION TESTS PASSED PERFECTLY ===\n');
}

testRoles().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
