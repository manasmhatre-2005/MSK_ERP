import { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
export type JobFormatType = 'FORMAT_1' | 'FORMAT_2' | 'FORMAT_3';
export interface JobFormatMeta {
    type: JobFormatType;
    label: string;
    prefix: string;
    example: string;
    resetsWithFY: boolean;
    description: string;
}
export declare const JOB_FORMATS: Record<JobFormatType, JobFormatMeta>;
export declare class JobSequenceService {
    /**
     * Determine Indian Financial Year in 2-digit format, e.g. "26-27"
     * Indian Financial Year spans 1 April through 31 March.
     */
    static getFinancialYearCode(date?: Date): string;
    /**
     * Format a sequential number according to the selected format specifications.
     * Exact formatting requirements:
     * - FORMAT_1: jobNo-0001-26-27
     * - FORMAT_2: JONNo./MSK/0001
     * - FORMAT_3: JOb No/26-27/0001
     */
    static formatJobNumber(formatType: JobFormatType, seq: number, fyCode: string): string;
    /**
     * Scan existing Job records in the database to find the maximum existing sequence number
     * for a given format and financial year. Ensures zero collision with historical data.
     */
    static findMaxExistingSequence(client: Prisma.TransactionClient | typeof prisma, formatType: JobFormatType, fyCode: string): Promise<number>;
    /**
     * Preview the next available job number without incrementing sequence or locking DB rows.
     */
    static peekNextJobNumber(formatType?: JobFormatType, date?: Date): Promise<{
        formatType: JobFormatType;
        nextNumber: string;
        financialYear: string;
    }>;
    /**
     * Atomically generate and increment next sequence under transaction row lock.
     * Concurrency-safe against race conditions and simultaneous job creations.
     */
    static getNextJobNumber(tx: Prisma.TransactionClient, formatType?: JobFormatType, date?: Date): Promise<{
        jobNumber: string;
        sequenceNumber: number;
        financialYear: string;
    }>;
}
