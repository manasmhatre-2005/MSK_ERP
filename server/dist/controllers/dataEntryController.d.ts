import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class DataEntryController {
    /**
     * Reference data for dropdowns / autocompletes
     * STRICTLY OPERATIONAL — NEVER EXPOSES FINANCIAL, GST, OR BANK DETAILS
     */
    static getReferenceData(_req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create a new Data Entry Record
     */
    static create(req: AuthRequest, res: Response): Promise<void>;
    /**
     * List entries with role-based isolation, search, filtering, and pagination
     */
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Retrieve single record by ID with authorization check
     */
    static getById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update record with concurrency check (version) and audit
     */
    static update(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete entry with validation and invoice-safety checks
     */
    static delete(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Export authorized records to CSV (STRICTLY OPERATIONAL DATA)
     */
    static exportCsv(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Send single entry operational summary by Email
     */
    static sendEmail(req: AuthRequest, res: Response): Promise<void>;
}
