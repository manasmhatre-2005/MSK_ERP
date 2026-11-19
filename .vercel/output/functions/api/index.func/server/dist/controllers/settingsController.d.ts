import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class SettingsController {
    static getSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
