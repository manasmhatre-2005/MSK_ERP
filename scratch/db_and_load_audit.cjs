const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

async function runAudit() {
  console.log('================================================================');
  console.log('MSK LOGISTIC ERP — INFRASTRUCTURE, DATABASE & CAPACITY AUDIT');
  console.log('================================================================\n');

  const report = {};

  // 1. Database Version & Connection Engine
  try {
    const versionRes = await prisma.$queryRawUnsafe('SELECT version();');
    report.dbVersion = versionRes[0]?.version || 'Unknown';
    console.log('1. Database Engine:');
    console.log('   Version:', report.dbVersion);

    // Current DB size
    const dbSizeRes = await prisma.$queryRawUnsafe(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty,
             pg_database_size(current_database()) as size_bytes;
    `);
    report.dbSizeBytes = Number(dbSizeRes[0]?.size_bytes || 0);
    report.dbSizePretty = dbSizeRes[0]?.size_pretty || 'Unknown';
    console.log(`   Current Database Size on Disk: ${report.dbSizePretty} (${report.dbSizeBytes} bytes)`);

    // Table Sizes & Row Estimates
    const tableSizes = await prisma.$queryRawUnsafe(`
      SELECT 
        relname AS table_name,
        n_live_tup AS row_estimate,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_size_pretty(pg_relation_size(relid)) AS data_size,
        pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size,
        pg_total_relation_size(relid) AS total_bytes
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC;
    `);
    console.log('\n2. Table Storage Breakdown:');
    console.table(tableSizes);
    report.tableSizes = tableSizes;

  } catch (err) {
    console.warn('   ⚠️ Direct SQL audit note (running offline or restricted):', err.message);
  }

  // 3. Count exact records across all Prisma models
  console.log('\n3. Current Record Counts in MSK ERP:');
  const counts = {};
  try {
    counts.users = await prisma.user.count();
    counts.parties = await prisma.party.count();
    counts.exporters = await prisma.exporter.count();
    counts.jobs = await prisma.job.count();
    counts.containers = await prisma.container.count();
    counts.invoices = await prisma.invoice.count();
    counts.invoiceContainers = await prisma.invoiceContainer.count();
    counts.invoiceItems = await prisma.invoiceItem.count();
    counts.payments = await prisma.payment.count();
    counts.auditLogs = await prisma.auditLog.count();
    counts.chargeMaster = await prisma.chargeMaster.count();
    console.table(counts);
    report.counts = counts;
  } catch (err) {
    console.warn('   Counts query error:', err.message);
  }

  // 4. Performance Benchmark: Bcrypt Hash & Compare Latency
  console.log('\n4. Authentication CPU Load Benchmark (bcrypt salt rounds = 10):');
  const testPassword = 'SecurePassword@123';
  const hashStart = performance.now();
  const testHash = await bcrypt.hash(testPassword, 10);
  const hashDuration = performance.now() - hashStart;

  const compareStart = performance.now();
  await bcrypt.compare(testPassword, testHash);
  const compareDuration = performance.now() - compareStart;

  console.log(`   Hash duration (password hashing): ${hashDuration.toFixed(2)} ms`);
  console.log(`   Compare duration (user login verification): ${compareDuration.toFixed(2)} ms`);
  report.bcrypt = { hashDuration, compareDuration };

  // 5. Performance Benchmark: PDF Generation (In-Memory Buffer)
  console.log('\n5. Document Generation Benchmark (PDFKit in-memory streaming):');
  const pdfTimes = [];
  for (let i = 0; i < 5; i++) {
    const pdfStart = performance.now();
    await new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.length);
      });

      // Render standard MSK Tax Invoice layout
      doc.fontSize(16).text('MSK LOGISTIC SOLUTION - TAX INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text('Invoice No: MSK/EXP/2026/001 | Date: 02/11/2026');
      doc.text('GSTIN: 27AXWPK4562G1ZX | PAN: AXWPK4562G');
      doc.text('Bill To: RELIANCE INDUSTRIES LTD | GSTIN: 27AABCR1234F1Z5');
      doc.moveDown();

      for (let j = 0; j < 10; j++) {
        doc.text(`Item ${j + 1}: CFS GROUND RENT & HANDLING - 40HC DRY CONTAINER (Qty: 2) -> Rate: 12500 -> Taxable: 25000 -> CGST: 2250 -> SGST: 2250 -> Total: 29500`);
      }
      doc.moveDown();
      doc.text('Total Invoice Amount: INR 2,95,000.00');
      doc.text('Authorized Signatory: MSK LOGISTIC SOLUTION');
      doc.end();
    });
    pdfTimes.push(performance.now() - pdfStart);
  }
  const avgPdfTime = pdfTimes.reduce((a, b) => a + b, 0) / pdfTimes.length;
  console.log(`   Average PDF generation time per A4 document: ${avgPdfTime.toFixed(2)} ms`);
  console.log(`   Single-CPU PDF generation throughput: ${(1000 / avgPdfTime).toFixed(1)} invoices/sec`);
  report.pdf = { avgPdfTime, throughputPerCore: 1000 / avgPdfTime };

  // 6. Output complete report JSON
  console.log('\n================================================================');
  console.log('AUDIT COMPLETE');
  console.log('================================================================');
  console.log(JSON.stringify(report, null, 2));

  await prisma.$disconnect();
}

runAudit().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
