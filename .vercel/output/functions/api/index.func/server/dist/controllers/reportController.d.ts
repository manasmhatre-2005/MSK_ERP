import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare function invalidateDashboardCache(): void;
export declare class ReportController {
    static getDashboardStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPartyBillingReport(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getGstReport(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
