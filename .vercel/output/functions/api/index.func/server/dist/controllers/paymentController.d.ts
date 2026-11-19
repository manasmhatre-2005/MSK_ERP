import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class PaymentController {
    static getAll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get comprehensive party-wise outstanding balances and invoice details
     */
    static getPartyOutstanding(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Record Customer Payment: Supports single-invoice payment and multi-invoice allocations with TDS
     */
    static record(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
