import { Prisma } from '@prisma/client';
export declare class SequenceService {
    /**
     * Determine Indian Financial Year (e.g. April 2026 - March 2027 => "2026-27")
     */
    static getFinancialYear(date?: Date): string;
    /**
     * Get standard prefix for bill type
     */
    static getPrefixForBillType(billType: string, companyPrefix?: string): string;
    /**
     * Atomically generate a concurrency-safe, gapless, conflict-free sequence number
     * inside an active Prisma transaction.
     */
    static getNextInvoiceNumber(tx: Prisma.TransactionClient, billType: string, invoiceDate?: Date, companyPrefix?: string): Promise<string>;
    /**
     * Preview the next invoice sequence number without incrementing or locking
     */
    static peekNextInvoiceNumber(billType: string, invoiceDate?: Date, companyPrefix?: string): Promise<string>;
}
