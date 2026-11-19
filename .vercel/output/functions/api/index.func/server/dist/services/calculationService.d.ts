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
export declare class CalculationService {
    /**
     * Calculate difference in full calendar days between two dates
     */
    static getDaysDifference(start?: Date | string | null, end?: Date | string | null): number;
    /**
     * Calculate Container Operational Days based on configured business rules
     */
    static calculateContainerDays(cartingDate?: Date | string | null, emptyGateInDate?: Date | string | null, stuffingDate?: Date | string | null, lddOutDate?: Date | string | null, manualEmptyDays?: number | null, manualCartingDays?: number | null, manualLoadedDays?: number | null, isOverride?: boolean): Promise<ContainerDateCalculation>;
    /**
     * Calculate Invoice Totals and Taxes based on party state vs company state
     */
    static calculateInvoiceTaxes(items: Array<{
        quantity: number;
        rate: number;
        discount?: number;
        amount?: number;
        hsnSacCode?: string;
    }>, partyStateCode: string, invoiceLevelDiscount?: number, currency?: string, options?: TaxCalculationOptions): Promise<TaxCalculationResult>;
    /**
     * Universal currency words converter
     */
    static numberToWords(num: number, currency?: string): string;
    /**
     * Convert number to USD Currency words (e.g., US Dollars One Thousand Two Hundred Fifty and 50/100 Only)
     */
    static numberToUSDWords(num: number): string;
    /**
     * Convert number to Indian Currency words (e.g., INR One Lakh Forty-Five Thousand...)
     */
    static numberToIndianWords(num: number): string;
}
