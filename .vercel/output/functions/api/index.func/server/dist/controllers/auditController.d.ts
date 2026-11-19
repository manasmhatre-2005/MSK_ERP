import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class AuditController {
    static list(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
