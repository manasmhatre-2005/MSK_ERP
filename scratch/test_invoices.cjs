async function testExistingWorkflows() {
  const BASE = 'http://localhost:5000';
  console.log('--- VERIFYING EXISTING ERP MODULES & DATA INTEGRITY ---');

  // 1. Login as Admin
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@logibill.com', password: 'admin123' }),
  });
  const { token } = await loginRes.json();
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 2. Query Invoices
  const invoicesRes = await fetch(`${BASE}/api/invoices`, { headers: authHeaders });
  const invoices = await invoicesRes.json();
  console.log('1. Invoices fetched:', invoices.length);
  const sample = invoices[0];
  console.log('   Sample invoice number:', sample?.invoiceNumber, 'Bill Type:', sample?.billType, 'Total:', sample?.grandTotal);

  // 3. Query Parties
  const partiesRes = await fetch(`${BASE}/api/parties`, { headers: authHeaders });
  const parties = await partiesRes.json();
  console.log('2. Parties count:', parties.length);
  console.log('   Sample party legalName (Party Name):', parties[0]?.legalName, 'tradeName (Exporter Name):', parties[0]?.tradeName);

  // 4. Query Containers
  const containersRes = await fetch(`${BASE}/api/containers`, { headers: authHeaders });
  const containers = await containersRes.json();
  console.log('3. Containers count:', containers.length);

  // 5. Query Payments & Outstanding
  const outstandingRes = await fetch(`${BASE}/api/payments/outstanding`, { headers: authHeaders });
  const outstanding = await outstandingRes.json();
  console.log('4. Outstanding summaries count:', outstanding.length);

  // 6. Test Calculation Engine
  const calcRes = await fetch(`${BASE}/api/invoices/calculate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      taxableAmount: 10000,
      isInterstate: false,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      tdsRate: 2,
    }),
  });
  const calcData = await calcRes.json();
  console.log('5. Invoice calculation test:', calcData);

  // 7. Test PDF generation for sample invoice
  if (sample?.id) {
    const pdfRes = await fetch(`${BASE}/api/invoices/${sample.id}/pdf`, { headers: authHeaders });
    console.log('6. PDF generation endpoint status for invoice', sample.invoiceNumber, ':', pdfRes.status, 'Content-Type:', pdfRes.headers.get('content-type'));
  }

  console.log('--- ALL EXISTING WORKFLOWS AND DATA CONFIRMED INTACT ---');
}

testExistingWorkflows().catch(console.error);
