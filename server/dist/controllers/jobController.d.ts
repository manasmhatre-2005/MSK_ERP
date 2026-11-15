import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class JobController {
    /**
     * Preview next job number without allocating or incrementing
     */
    static getNextNumber(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
