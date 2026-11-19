import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class ChatController {
    static message(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
