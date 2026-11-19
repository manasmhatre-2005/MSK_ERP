export type BillFormatId = 'format-1' | 'format-2' | 'format-3' | 'format-4' | 'format-5';
export interface PDFGenerationOptions {
    templateId?: BillFormatId | string;
}
export declare class PDFService {
    /**
     * Generate A4 Tax Invoice PDF buffer following the exact MSK Logistic Solution sample invoice layout (Image 3)
     * Supports 5 template slots: format-1 (exact Image 3), format-2, format-3, format-4, format-5
     */
    static generateInvoicePDF(invoiceOrId: string | any, providedSettings?: any, options?: PDFGenerationOptions): Promise<Buffer>;
    /**
     * Generate A4 Credit Note PDF buffer with QR verification code
     * Exactly matching the Credit Note layout format
     */
    static generateCreditNotePDF(invoice: any, settings: any): Promise<Buffer>;
    /**
     * Generate A4 Empty Container Bill PDF buffer
     * Strictly fitted to ONE single A4 portrait page with QR verification code
     * Exactly matching the Empty Container Bill layout format
     */
    static generateEmptyContainerPDF(invoice: any, settings: any): Promise<Buffer>;
    /**
     * Generate A4 H & T Bill (Handling & Transportation Tax Invoice) PDF buffer
     * Strictly fitted to ONE single A4 portrait page with QR verification code
     * Exactly matching the uploaded Reference Images 1 & 2 layout format
     */
    static generateHtBillPDF(invoice: any, settings: any): Promise<Buffer>;
    /**
     * Dedicated PDF Generator for Forwarding Bill matching the Excel Container Billing Format
     * (Professional_Container_Billing_Format-2.xlsx)
     */
    static generateForwardingBillPDF(invoice: any, settings: any): Promise<Buffer>;
}
