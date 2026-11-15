const dotenv = require('dotenv');
dotenv.config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const QRCode = require('qrcode');

async function testQrAndVerification() {
  console.log('Testing QR Code generation and Bill verification...');
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { verificationToken: { not: null } },
      select: { id: true, invoiceNumber: true, verificationToken: true, billType: true, grandTotal: true },
    });

    if (!invoice) {
      console.log('No existing invoice with verification token found.');
      return;
    }

    console.log(`Found invoice: ${invoice.invoiceNumber} [Token: ${invoice.verificationToken}]`);

    // 1. Test QR Code generation
    const qrTargetUrl = `https://app.msklogisticsolution.com/bills/${invoice.verificationToken}`;
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, { width: 256, margin: 1 });
    console.log('✅ QR Code generated successfully as data URL. Prefix:', qrDataUrl.slice(0, 30));

    // 2. Test Verification Lookup via Token
    const verifiedInvoice = await prisma.invoice.findFirst({
      where: { verificationToken: invoice.verificationToken },
      include: { party: true, items: true, containers: true },
    });

    if (verifiedInvoice && verifiedInvoice.id === invoice.id) {
      console.log(`✅ Bill correctly retrieved via verificationToken: ${verifiedInvoice.invoiceNumber}`);
      console.log(`   Items: ${verifiedInvoice.items.length}, Containers: ${verifiedInvoice.containers.length}, Total: ₹${verifiedInvoice.grandTotal}`);
    } else {
      throw new Error('Token verification failed');
    }

    console.log('✅ QR CODE & VERIFICATION SUBSYSTEM TEST PASSED!');
  } catch (err) {
    console.error('QR test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testQrAndVerification();
