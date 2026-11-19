import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class SearchController {
    static globalSearch(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
