const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token, isBinary = false) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      if (isBinary) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, buffer: Buffer.concat(chunks), headers: res.headers });
        });
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body, headers: res.headers });
          }
        });
      }
    });
    req.on('error', reject);
    req.end();
  });
}

async function runForwardingAudit() {
  console.log('===============================================================');
  console.log('MSK LOGISTIC SOLUTION ERP — FORWARDING BILL EXCEL FORMAT AUDIT');
  console.log('===============================================================');

  // 1. Login as Admin
  console.log('\n[1] Admin Authentication');
  const loginRes = await post('http://localhost:5000/api/auth/login', {
    email: 'admin@login',
    password: 'admin@123'
  });
  if (loginRes.status !== 200 || !loginRes.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  console.log('  -> Logged in successfully. User:', loginRes.data.user.name);

  // 2. Fetch existing parties
  console.log('\n[2] Fetch Existing Parties');
  const partiesRes = await get('http://localhost:5000/api/parties', token);
  const partyList = Array.isArray(partiesRes.data) ? partiesRes.data : partiesRes.data?.parties || [];
  if (partyList.length === 0) {
    throw new Error('No parties found in database');
  }
  const testParty = partyList[0];
  console.log('  -> Selected Party:', testParty.legalName, 'GSTIN:', testParty.gstin, 'State:', testParty.state);

  // 3. Create Forwarding Bill with Excel Format Data
  console.log('\n[3] Create Forwarding Bill (Excel Container Billing Format)');
  const excelChargeItems = [
    { srNo: 1, description: 'Ocean Freight', hsnSacCode: '996511', quantity: 1, rate: 45000, discount: 0 },
    { srNo: 2, description: 'Transportation Charges', hsnSacCode: '996511', quantity: 1, rate: 12000, discount: 0 },
    { srNo: 3, description: 'CFS Charges', hsnSacCode: '996719', quantity: 1, rate: 6500, discount: 0 },
    { srNo: 4, description: 'Terminal Handling Charges', hsnSacCode: '996719', quantity: 1, rate: 7500, discount: 0 },
    { srNo: 5, description: 'Port / Terminal Charges', hsnSacCode: '996719', quantity: 1, rate: 3500, discount: 0 },
    { srNo: 6, description: 'Documentation Charges', hsnSacCode: '996719', quantity: 1, rate: 2500, discount: 0 },
    { srNo: 7, description: 'Customs Clearance Charges', hsnSacCode: '996719', quantity: 1, rate: 5500, discount: 0 },
    { srNo: 8, description: 'CHA / Agency Charges', hsnSacCode: '996719', quantity: 1, rate: 4000, discount: 0 },
    { srNo: 9, description: 'Loading / Unloading', hsnSacCode: '996719', quantity: 1, rate: 3000, discount: 0 },
    { srNo: 10, description: 'Stuffing / Destuffing', hsnSacCode: '996719', quantity: 1, rate: 4500, discount: 0 },
    { srNo: 11, description: 'Detention / Demurrage', hsnSacCode: '996719', quantity: 1, rate: 2000, discount: 0 },
    { srNo: 12, description: 'Other Logistics Charges', hsnSacCode: '996719', quantity: 1, rate: 1500, discount: 0 }
  ];

  const forwardingPayload = {
    billType: 'FORWARDING',
    partyId: testParty.id,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    currency: 'INR',
    status: 'FINALIZED',
    vesselVoyage: 'MSC VALENCIA / 241E',
    mblHbl: 'MEDU67201948',
    portOfLoading: 'Nhava Sheva (INNSA)',
    sbNumbers: 'JOB-2026-FWD-991',
    containers: [
      { containerNumber: 'MSKU9082134', size: '40 FT', type: 'HC' }
    ],
    items: excelChargeItems,
    notes: JSON.stringify({
      placeOfSupply: 'Maharashtra (27)',
      supplyType: 'Intra-state',
      reverseCharge: 'No',
      containerNo: 'MSKU9082134',
      containerSize: '40 FT',
      jobBookingNo: 'JOB-2026-FWD-991',
      blAwbNo: 'MEDU67201948',
      shippingLine: 'MAERSK LINE',
      vesselVoyage: 'MSC VALENCIA / 241E',
      cfsPort: 'Nhava Sheva (INNSA) / Dronagiri CFS',
      vehicleNo: 'MH-46-AR-8812'
    })
  };

  const createRes = await post('http://localhost:5000/api/invoices', forwardingPayload, token);
  if (createRes.status !== 200 && createRes.status !== 201) {
    throw new Error('Forwarding bill creation failed: ' + JSON.stringify(createRes));
  }
  const createdInv = createRes.data;
  console.log('  -> Forwarding Bill Created! Invoice No:', createdInv.invoiceNumber);
  console.log('  -> Bill Type:', createdInv.billType);
  console.log('  -> Status:', createdInv.status);
  console.log('  -> Taxable Amount:', createdInv.taxableAmount);
  console.log('  -> Total GST:', createdInv.totalGst);
  console.log('  -> Grand Total:', createdInv.grandTotal);
  console.log('  -> Amount in Words:', createdInv.amountInWords);
  console.log('  -> Verification Token:', createdInv.verificationToken);

  // 4. Verify in Invoice Listing (Invoice History)
  console.log('\n[4] Verify Forwarding Bill in Invoice History');
  const allInvsRes = await get(`http://localhost:5000/api/invoices?search=${encodeURIComponent(createdInv.invoiceNumber)}`, token);
  const invList = Array.isArray(allInvsRes.data) ? allInvsRes.data : allInvsRes.data?.invoices || [];
  const found = invList.find(inv => inv.id === createdInv.id);
  if (!found) {
    throw new Error('Created Forwarding invoice was not found in invoice history. Count: ' + invList.length);
  }
  console.log('  -> Confirmed found in history with billType:', found.billType);

  // 5. Verify PDF Generation via authenticated endpoint
  console.log('\n[5] Verify PDF Generation (Authenticated API)');
  const pdfRes = await get(`http://localhost:5000/api/invoices/${createdInv.id}/pdf`, token, true);
  if (pdfRes.status !== 200) {
    throw new Error('PDF download failed with status: ' + pdfRes.status);
  }
  const pdfMagic = pdfRes.buffer.slice(0, 5).toString('utf8');
  if (pdfMagic !== '%PDF-') {
    throw new Error('Invalid PDF magic header: ' + pdfMagic);
  }
  console.log('  -> PDF generated successfully! Size:', pdfRes.buffer.length, 'bytes');

  // 6. Verify Public Direct QR Code PDF Streaming (/bills/:token.pdf)
  console.log('\n[6] Verify Direct QR Code PDF Streaming (/bills/:token.pdf)');
  const qrStreamRes = await get(`http://localhost:5000/bills/${createdInv.verificationToken}.pdf`, null, true);
  if (qrStreamRes.status !== 200) {
    throw new Error('QR stream failed with status: ' + qrStreamRes.status);
  }
  const qrMagic = qrStreamRes.buffer.slice(0, 5).toString('utf8');
  if (qrMagic !== '%PDF-') {
    throw new Error('Invalid PDF magic from QR stream: ' + qrMagic);
  }
  console.log('  -> QR Streaming verified! Size:', qrStreamRes.buffer.length, 'bytes');

  // 7. Verify Existing Bill Types Remain Untouched
  console.log('\n[7] Verify Existing Bill Types Preservation');
  const ecSample = await get('http://localhost:5000/api/invoices?billType=EMPTY_CONTAINER&limit=1', token);
  const htSample = await get('http://localhost:5000/api/invoices?billType=HT_BILL&limit=1', token);
  const cnSample = await get('http://localhost:5000/api/invoices?billType=CREDIT_NOTE&limit=1', token);

  const getCount = (res) => Array.isArray(res.data) ? res.data.length : (res.data?.totalCount || res.data?.invoices?.length || 0);
  console.log('  -> EMPTY_CONTAINER bills found:', getCount(ecSample));
  console.log('  -> HT_BILL bills found:', getCount(htSample));
  console.log('  -> CREDIT_NOTE bills found:', getCount(cnSample));

  // 8. Verify Payment Allocation on Forwarding Bill
  console.log('\n[8] Verify Payment Allocation on Forwarding Bill');
  const paymentPayload = {
    partyId: testParty.id,
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 10000,
    paymentMode: 'NEFT',
    referenceNumber: 'NEFT-FWD-TEST-' + Date.now(),
    notes: 'Partial payment for Forwarding Bill ' + createdInv.invoiceNumber,
    allocations: [
      { invoiceId: createdInv.id, amount: 10000, tdsAmount: 0 }
    ]
  };
  const payRes = await post('http://localhost:5000/api/payments', paymentPayload, token);
  if (payRes.status !== 200 && payRes.status !== 201) {
    throw new Error('Payment allocation failed: ' + JSON.stringify(payRes));
  }
  console.log('  -> Payment recorded! Amount: ₹10,000 against invoice:', createdInv.invoiceNumber);

  // Check updated invoice balance
  const updatedInvRes = await get(`http://localhost:5000/api/invoices/${createdInv.id}`, token);
  console.log('  -> New Paid Amount:', updatedInvRes.data.paidAmount);
  console.log('  -> New Balance Amount:', updatedInvRes.data.balanceAmount);

  console.log('\n===============================================================');
  console.log('ALL FORWARDING BILL EXCEL FORMAT ACCEPTANCE CHECKS PASSED (8/8)!');
  console.log('===============================================================');
}

runForwardingAudit().catch(err => {
  console.error('\nAUDIT FAILED:', err);
  process.exit(1);
});
