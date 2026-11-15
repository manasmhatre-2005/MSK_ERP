const { CalculationService } = require('../server/dist/services/calculationService.js');

async function testCalculations() {
  console.log('--- Testing GST & Tax Calculations ---');
  // 1. Intra-state Maharashtra (State Code 27) -> CGST 9% + SGST 9%
  const items = [{ quantity: 10, rate: 1000 }];
  const intraState = await CalculationService.calculateInvoiceTaxes(items, '27', 0, 'INR');
  console.log('Intra-state (27 -> 27):', {
    taxableAmount: intraState.taxableAmount,
    isInterState: intraState.isInterState,
    cgstAmount: intraState.cgstAmount,
    sgstAmount: intraState.sgstAmount,
    igstAmount: intraState.igstAmount,
    totalGst: intraState.totalGst,
    grandTotal: intraState.grandTotal,
    amountInWords: intraState.amountInWords,
  });

  if (intraState.cgstAmount !== 900 || intraState.sgstAmount !== 900 || intraState.igstAmount !== 0 || intraState.grandTotal !== 11800) {
    throw new Error('Intra-state calculation failed');
  }
  console.log('✅ Intra-state GST (9% CGST + 9% SGST = 18%) PASS');

  // 2. Inter-state Maharashtra to Gujarat (27 -> 24) -> IGST 18%
  const interState = await CalculationService.calculateInvoiceTaxes(items, '24', 0, 'INR');
  console.log('Inter-state (27 -> 24):', {
    taxableAmount: interState.taxableAmount,
    isInterState: interState.isInterState,
    cgstAmount: interState.cgstAmount,
    sgstAmount: interState.sgstAmount,
    igstAmount: interState.igstAmount,
    totalGst: interState.totalGst,
    grandTotal: interState.grandTotal,
  });

  if (interState.cgstAmount !== 0 || interState.sgstAmount !== 0 || interState.igstAmount !== 1800 || interState.grandTotal !== 11800) {
    throw new Error('Inter-state calculation failed');
  }
  console.log('✅ Inter-state GST (18% IGST) PASS');

  // 3. Amount in words test
  console.log('Amount in words test (₹11,800):', intraState.amountInWords);
  if (!intraState.amountInWords.includes('Eleven Thousand Eight Hundred')) {
    throw new Error('Amount in words calculation failed');
  }
  console.log('✅ Amount in words conversion PASS');

  console.log('🎉 ALL TAX AND GST CALCULATION TESTS PASSED CLEANLY!');
}

testCalculations();
