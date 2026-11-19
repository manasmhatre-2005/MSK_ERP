import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class CartingController {
    /**
     * Reference data for Carting Details dropdowns and autocompletes
     */
    static getReferenceData(_req: AuthRequest, res: Response): Promise<void>;
    /**
     * Peek next sequential reference number: CRT-YYYY-XXXX
     */
    static getNextSrNo(_req: AuthRequest, res: Response): Promise<void>;
    /**
     * List all Carting Details records with Search & Filter
     */
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Get single Carting Details record by ID
     */
    static getById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Create a new Carting Details record with full field validation
     */
    static create(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Update an existing Carting Details record
     */
    static update(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Delete Carting Details record
     */
    static delete(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Export Carting Details to CSV
     */
    static exportCsv(req: AuthRequest, res: Response): Promise<void>;
}
