export declare class DocumentService {
    private static get storageBaseDir();
    /**
     * Ensure storage directory exists
     */
    private static ensureStorageDir;
    /**
     * Save a generated invoice document with persistent DB metadata
     */
    static saveInvoiceDocument(invoiceId: string, invoiceNumber: string, billType: string, pdfBuffer: Buffer, metadata?: any): Promise<{
        documentId: string;
        storageKey: string;
        filePath: string;
        checksum: string;
    }>;
    /**
     * Retrieve document by invoiceId
     */
    static getInvoiceDocument(invoiceId: string): Promise<{
        buffer: Buffer;
        fileName: string;
        mimeType: string;
    } | null>;
}
