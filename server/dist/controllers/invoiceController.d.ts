import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare class InvoiceController {
    static getAll(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getNextInvoiceNumber(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static calculate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static finalize(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancel(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPdf(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static sendEmail(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Unified Public Bill Verification Endpoint
     * Works for all bill types: Forwarding, Tax Invoice, Credit Note, H&T Bill, Empty Container Bill
     * If accessed from a mobile browser (camera QR scan), immediately streams the original PDF directly.
     * If accessed via JSON API fetch, returns document metadata.
     */
    static verifyBill(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Direct Bill PDF Stream for Scannable QR Codes
     * Mobile phone camera / QR scan opens the original bill PDF directly in native viewer
     * No intermediate verification portal, no landing page, no login required
     */
    static streamDirectBillPdf(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static downloadVerifiedPdf(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyCreditNote(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static verifyInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
