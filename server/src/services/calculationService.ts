import prisma from '../prisma.js';

export interface ContainerDateCalculation {
  emptyGroundRentDays: number;
  daysAfterCarting: number;
  loadedGroundDays: number;
  explanation: {
    emptyRentFormula: string;
    cartingDaysFormula: string;
    loadedRentFormula: string;
  };
}

export interface TaxCalculationResult {
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  isInterState: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGst: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}

export interface TaxCalculationOptions {
  customCgstRate?: number;
  customSgstRate?: number;
  customIgstRate?: number;
  customTotalGstRate?: number;
  forceInterState?: boolean;
}

export class CalculationService {
  /**
   * Calculate difference in full calendar days between two dates, INCLUSIVE of both start and end date (+1 day).
   * Validates date presence and order. Returns 0 if either date is missing or invalid, or if end < start.
   */
  static getInclusiveDaysDifference(start?: Date | string | null, end?: Date | string | null): number {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    // Normalize to midnight UTC for pure day count without DST/timezone skew
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    if (utc2 < utc1) return 0;
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Calculate difference in full calendar days between two dates
   */
  static getDaysDifference(start?: Date | string | null, end?: Date | string | null): number {
    return this.getInclusiveDaysDifference(start, end);
  }

  /**
   * Calculate Container Operational Days based on configured client business rules:
   * 1. Empty Ground Rent Days = Stuffing Date - Empty Container In Date + 1 (inclusive)
   * 2. Carting Days = Stuffing Date - Carting Date + 1 (inclusive)
   * 3. Loaded Container Ground Rent Days = Loaded Container Out Date - Stuffing Date + 1 (inclusive)
   */
  static async calculateContainerDays(
    cartingDate?: Date | string | null,
    emptyGateInDate?: Date | string | null,
    stuffingDate?: Date | string | null,
    lddOutDate?: Date | string | null,
    manualEmptyDays?: number | null,
    manualCartingDays?: number | null,
    manualLoadedDays?: number | null,
    isOverride?: boolean
  ): Promise<ContainerDateCalculation> {
    // 1. Empty Ground Rent Days: From Empty Container In Date to Stuffing Date (+1 inclusive)
    const computedEmptyDays = (emptyGateInDate && stuffingDate)
      ? this.getInclusiveDaysDifference(emptyGateInDate, stuffingDate)
      : 0;

    // 2. Carting Days: From Carting Date to Stuffing Date (+1 inclusive)
    const computedCartingDays = (cartingDate && stuffingDate)
      ? this.getInclusiveDaysDifference(cartingDate, stuffingDate)
      : 0;

    // 3. Loaded Container Ground Rent Days: From Stuffing Date to Loaded Container Out Date (+1 inclusive)
    const computedLoadedDays = (stuffingDate && lddOutDate)
      ? this.getInclusiveDaysDifference(stuffingDate, lddOutDate)
      : 0;

    return {
      emptyGroundRentDays: isOverride && manualEmptyDays !== undefined && manualEmptyDays !== null ? manualEmptyDays : computedEmptyDays,
      daysAfterCarting: isOverride && manualCartingDays !== undefined && manualCartingDays !== null ? manualCartingDays : computedCartingDays,
      loadedGroundDays: isOverride && manualLoadedDays !== undefined && manualLoadedDays !== null ? manualLoadedDays : computedLoadedDays,
      explanation: {
        emptyRentFormula: `Empty In to Stuffing (inclusive +1 day) = ${computedEmptyDays} days`,
        cartingDaysFormula: `Carting to Stuffing (inclusive +1 day) = ${computedCartingDays} days`,
        loadedRentFormula: `Stuffing to Loaded Out (inclusive +1 day) = ${computedLoadedDays} days`,
      },
    };
  }

  /**
   * Calculate Invoice Totals and Taxes based on party state vs company state
   */
  static async calculateInvoiceTaxes(
    items: Array<{
      quantity: number;
      rate: number;
      discount?: number;
      amount?: number;
      hsnSacCode?: string;
    }>,
    partyStateCode: string,
    invoiceLevelDiscount = 0,
    currency = 'INR',
    options?: TaxCalculationOptions
  ): Promise<TaxCalculationResult> {
    let companyStateCode = '27';
    let defaultCgstRate = 9.0;
    let defaultSgstRate = 9.0;
    let defaultIgstRate = 18.0;

    if (process.env.DATABASE_URL) {
      try {
        const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
        if (settings) {
          companyStateCode = settings.stateCode || '27';
          defaultCgstRate = settings.cgstDefaultRate ?? 9.0;
          defaultSgstRate = settings.sgstDefaultRate ?? 9.0;
          defaultIgstRate = settings.igstDefaultRate ?? 18.0;
        }
      } catch (err) {
        // fallback to standard defaults
      }
    }

    const isInterState = options?.forceInterState !== undefined
      ? options.forceInterState
      : partyStateCode.trim() !== companyStateCode.trim();

    let subtotal = 0;
    let itemDiscountsTotal = 0;

    for (const item of items) {
      const lineAmt = Number(item.quantity || 0) * Number(item.rate || 0);
      const lineDisc = Number(item.discount || 0);
      subtotal += lineAmt;
      itemDiscountsTotal += lineDisc;
    }

    const totalDiscount = itemDiscountsTotal + Number(invoiceLevelDiscount || 0);
    const taxableAmount = Math.max(0, subtotal - totalDiscount);

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isInterState) {
      // Inter-state: IGST only
      if (options?.customIgstRate !== undefined && !isNaN(options.customIgstRate)) {
        igstRate = Number(options.customIgstRate);
      } else if (options?.customTotalGstRate !== undefined && !isNaN(options.customTotalGstRate)) {
        igstRate = Number(options.customTotalGstRate);
      } else {
        igstRate = defaultIgstRate;
      }
      igstAmount = Math.round(taxableAmount * (igstRate / 100) * 100) / 100;
    } else {
      // Intra-state: CGST + SGST
      if (options?.customCgstRate !== undefined && !isNaN(options.customCgstRate)) {
        cgstRate = Number(options.customCgstRate);
      } else if (options?.customTotalGstRate !== undefined && !isNaN(options.customTotalGstRate)) {
        cgstRate = Number(options.customTotalGstRate) / 2;
      } else {
        cgstRate = defaultCgstRate;
      }

      if (options?.customSgstRate !== undefined && !isNaN(options.customSgstRate)) {
        sgstRate = Number(options.customSgstRate);
      } else if (options?.customTotalGstRate !== undefined && !isNaN(options.customTotalGstRate)) {
        sgstRate = Number(options.customTotalGstRate) / 2;
      } else {
        sgstRate = defaultSgstRate;
      }

      cgstAmount = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
      sgstAmount = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
    }

    const totalGst = Math.round((cgstAmount + sgstAmount + igstAmount) * 100) / 100;
    const rawGrandTotal = taxableAmount + totalGst;
    let grandTotal = rawGrandTotal;
    let roundOff = 0;

    if (currency === 'INR') {
      grandTotal = Math.round(rawGrandTotal);
      roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;
    } else {
      // For USD, maintain standard 2 decimal places precision (exact cents)
      grandTotal = Math.round(rawGrandTotal * 100) / 100;
      roundOff = 0;
    }

    const amountInWords = this.numberToWords(grandTotal, currency);

    return {
      currency,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(totalDiscount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      isInterState,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGst,
      roundOff,
      grandTotal,
      amountInWords,
    };
  }

  /**
   * Universal currency words converter
   */
  static numberToWords(num: number, currency = 'INR'): string {
    if (currency === 'USD') {
      return this.numberToUSDWords(num);
    }
    return this.numberToIndianWords(num);
  }

  /**
   * Convert number to USD Currency words (e.g., US Dollars One Thousand Two Hundred Fifty and 50/100 Only)
   */
  static numberToUSDWords(num: number): string {
    if (num === 0) return 'US Dollars Zero Only';
    if (isNaN(num)) return '';

    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const formatHundreds = (n: number): string => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10].trim() + ' ' : ' ');
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    const absNum = Math.abs(num);
    let integerPart = Math.floor(absNum);
    const cents = Math.round((absNum - integerPart) * 100);

    let str = '';

    const billions = Math.floor(integerPart / 1000000000);
    integerPart %= 1000000000;
    if (billions > 0) {
      str += formatHundreds(billions) + 'Billion ';
    }

    const millions = Math.floor(integerPart / 1000000);
    integerPart %= 1000000;
    if (millions > 0) {
      str += formatHundreds(millions) + 'Million ';
    }

    const thousands = Math.floor(integerPart / 1000);
    integerPart %= 1000;
    if (thousands > 0) {
      str += formatHundreds(thousands) + 'Thousand ';
    }

    if (integerPart > 0) {
      str += formatHundreds(integerPart);
    }

    const dollarsPart = str.trim() ? str.trim() : 'Zero';
    if (cents > 0) {
      return `US Dollars ${dollarsPart} and ${cents}/100 Only`;
    }
    return `US Dollars ${dollarsPart} Only`;
  }

  /**
   * Convert number to Indian Currency words (e.g., INR One Lakh Forty-Five Thousand...)
   */
  static numberToIndianWords(num: number): string {
    if (num === 0) return 'INR Zero Only';
    if (isNaN(num)) return '';

    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const formatHundreds = (n: number): string => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10].trim() + ' ' : ' ');
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    const absNum = Math.abs(num);
    let integerPart = Math.floor(absNum);
    const paise = Math.round((absNum - integerPart) * 100);

    let str = '';

    const crores = Math.floor(integerPart / 10000000);
    integerPart %= 10000000;
    if (crores > 0) {
      str += formatHundreds(crores) + 'Crore ';
    }

    const lakhs = Math.floor(integerPart / 100000);
    integerPart %= 100000;
    if (lakhs > 0) {
      str += formatHundreds(lakhs) + 'Lakh ';
    }

    const thousands = Math.floor(integerPart / 1000);
    integerPart %= 1000;
    if (thousands > 0) {
      str += formatHundreds(thousands) + 'Thousand ';
    }

    if (integerPart > 0) {
      str += formatHundreds(integerPart);
    }

    const inrPart = str.trim() ? str.trim() : 'Zero';
    if (paise > 0) {
      return `INR ${inrPart} and ${paise}/100 Only`;
    }
    return `INR ${inrPart} Only`;
  }
}
