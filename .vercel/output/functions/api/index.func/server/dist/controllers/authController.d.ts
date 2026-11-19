import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class AuthController {
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static logout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listUsers(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static changePassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
