export interface SendWhatsAppParams {
    recipientPhone: string;
    recipientName?: string;
    invoiceId?: string;
    messageType?: 'INVOICE_PDF' | 'INVOICE_NOTIFICATION' | 'PAYMENT_REMINDER' | 'JOB_UPDATE' | 'CONTAINER_UPDATE' | 'CUSTOM';
    templateName?: string;
    parameters?: Record<string, string>;
    customText?: string;
}
export declare class WhatsAppService {
    /**
     * Send WhatsApp notification using Meta Cloud API or Intelligent Mock Provider
     */
    static sendMessage(params: SendWhatsAppParams): Promise<{
        success: boolean;
        messageId: string;
        metaMessageId: any;
        status: string;
        isMock: boolean;
        notice?: undefined;
    } | {
        success: boolean;
        messageId: string;
        metaMessageId: string;
        status: string;
        isMock: boolean;
        notice: string;
    }>;
    /**
     * Test WhatsApp API connection status
     */
    static testConnection(): Promise<{
        connected: boolean;
        mode: string;
        details: any;
        error?: undefined;
    } | {
        connected: boolean;
        mode: string;
        error: any;
        details?: undefined;
    }>;
}
