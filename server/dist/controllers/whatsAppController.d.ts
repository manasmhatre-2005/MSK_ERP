import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class WhatsAppController {
    static sendMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listMessages(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listTemplates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static testConnection(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static webhookGet(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static webhookPost(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
