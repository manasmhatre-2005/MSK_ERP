import { Request, Response } from 'express';
export declare class GSTController {
    static lookup(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
