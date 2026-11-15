export interface SendInvoiceEmailParams {
    invoiceId: string;
    recipientEmail: string;
    recipientName?: string;
    ccEmail?: string;
    subject?: string;
    customMessage?: string;
    templateId?: string;
    userId?: string;
    userName?: string;
}
export interface EmailSendResult {
    success: boolean;
    messageId: string;
    recipient: string;
    cc?: string;
    subject: string;
    invoiceNumber: string;
    pdfFilename: string;
    attachmentSizeBytes: number;
    status: 'DELIVERED' | 'QUEUED' | 'SENT' | 'FAILED';
    isMock: boolean;
    error?: string;
}
export declare class EmailService {
    /**
     * Validate email address syntax
     */
    static validateEmail(email: string): boolean;
    /**
     * Generate clean HTML email body with MSK branding
     */
    static generateEmailHtml(invoice: any, settings: any, customMessage?: string): string;
    /**
     * Send Invoice Email with attached PDF
     */
    static sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<EmailSendResult>;
    /**
     * Dispatch clean operational entry summary to verified email recipient
     * (STRICTLY OPERATIONAL DATA - NO INVOICES OR FINANCIAL DETAILS)
     */
    static sendOperationEntryEmail(params: {
        entry: any;
        recipientEmail: string;
        customNote?: string;
        userId: string;
        userName: string;
    }): Promise<{
        success: boolean;
        messageId: string;
        recipient: string;
        status: 'DELIVERED' | 'FAILED';
        sentAt: string;
    }>;
}
