const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('===========================================================');
  console.log('STARTING INVOICE WATERMARK COMPREHENSIVE VERIFICATION');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check watermark asset availability
    console.log('--- 1. Testing Watermark Logo Asset Availability ---');
    const assetCandidates = [
      'client/public/images/msk-invoice-watermark.png',
      'server/assets/msk-invoice-watermark.png',
      'server/public/images/msk-invoice-watermark.png',
      'client/public/images/msk-logo.png',
    ];

    for (const a of assetCandidates) {
      const exists = fs.existsSync(a);
      const size = exists ? fs.statSync(a).size : 0;
      assert(exists && size > 500000, `Asset "${a}" exists and is high-definition (${size} bytes)`);
    }

    // 2. Fetch or create sample invoices for all 4 bill types
    console.log('\n--- 2. Fetching Sample Database Invoices for All Bill Types ---');
    let invoice = await prisma.invoice.findFirst({
      where: { billType: 'STANDARD' },
      include: { party: true, exporter: true, job: true, containers: true, items: true },
    });

    if (!invoice) {
      // Find any invoice
      invoice = await prisma.invoice.findFirst({
        include: { party: true, exporter: true, job: true, containers: true, items: true },
      });
    }

    const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });

    assert(!!invoice, `Found sample base invoice: ${invoice?.invoiceNumber}`);

    // Dynamic import of PDFService
    // First compile server if needed or test directly with PDFKit and PDFService
    const { PDFService } = await import('../server/dist/services/pdfService.js');

    // Test 1: Standard Tax Invoice PDF
    console.log('\n--- 3. Testing Standard Tax Invoice PDF Generation with Watermark ---');
    const standardInvoice = { ...invoice, billType: 'STANDARD' };
    const pdfStandard = await PDFService.generateInvoicePDF(standardInvoice, settings);
    assert(Buffer.isBuffer(pdfStandard) && pdfStandard.length > 50000, `Standard Tax Invoice PDF generated successfully (${pdfStandard.length} bytes)`);
    fs.writeFileSync('scratch/test_standard_invoice.pdf', pdfStandard);

    // Test 2: Credit Note Bill PDF
    console.log('\n--- 4. Testing Credit Note Bill PDF Generation with Watermark ---');
    const creditNoteInvoice = { ...invoice, billType: 'CREDIT_NOTE', originalInvoiceNumber: 'MSK/HT/2026-27/0001' };
    const pdfCreditNote = await PDFService.generateCreditNotePDF(creditNoteInvoice, settings);
    assert(Buffer.isBuffer(pdfCreditNote) && pdfCreditNote.length > 50000, `Credit Note Bill PDF generated successfully (${pdfCreditNote.length} bytes)`);
    fs.writeFileSync('scratch/test_credit_note.pdf', pdfCreditNote);

    // Test 3: Empty Container Bill PDF
    console.log('\n--- 5. Testing Empty Container Bill PDF Generation with Watermark ---');
    const emptyContainerInvoice = { ...invoice, billType: 'EMPTY_CONTAINER' };
    const pdfEmptyContainer = await PDFService.generateEmptyContainerPDF(emptyContainerInvoice, settings);
    assert(Buffer.isBuffer(pdfEmptyContainer) && pdfEmptyContainer.length > 50000, `Empty Container Bill PDF generated successfully (${pdfEmptyContainer.length} bytes)`);
    fs.writeFileSync('scratch/test_empty_container.pdf', pdfEmptyContainer);

    // Test 4: H & T Bill PDF
    console.log('\n--- 6. Testing H & T Bill PDF Generation with Watermark ---');
    const htBillInvoice = { ...invoice, billType: 'HT_BILL' };
    const pdfHtBill = await PDFService.generateHtBillPDF(htBillInvoice, settings);
    assert(Buffer.isBuffer(pdfHtBill) && pdfHtBill.length > 50000, `H & T Bill PDF generated successfully (${pdfHtBill.length} bytes)`);
    fs.writeFileSync('scratch/test_ht_bill.pdf', pdfHtBill);

    // Test 5: Forwarding Bill PDF
    console.log('\n--- 7. Testing Forwarding Bill PDF Generation with Watermark ---');
    const forwardingInvoice = { ...invoice, billType: 'FORWARDING' };
    const pdfForwarding = await PDFService.generateInvoicePDF(forwardingInvoice, settings);
    assert(Buffer.isBuffer(pdfForwarding) && pdfForwarding.length > 50000, `Forwarding Bill PDF generated successfully (${pdfForwarding.length} bytes)`);
    fs.writeFileSync('scratch/test_forwarding_bill.pdf', pdfForwarding);

    // 8. Verify React Print View components have InvoiceWatermark imported and mounted
    console.log('\n--- 8. Verifying Frontend Print Views contain Watermark Component ---');
    const printViews = [
      'client/src/components/invoice/InvoicePrintView.tsx',
      'client/src/components/credit-note/CreditNotePrintView.tsx',
      'client/src/components/empty-container/EmptyContainerPrintView.tsx',
      'client/src/components/ht-bill/HtBillPrintView.tsx',
    ];

    for (const pv of printViews) {
      const content = fs.readFileSync(pv, 'utf8');
      assert(content.includes('InvoiceWatermark'), `Print view "${pv}" imports and renders <InvoiceWatermark />`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');
  if (failed > 0) process.exit(1);
}

runTests();
