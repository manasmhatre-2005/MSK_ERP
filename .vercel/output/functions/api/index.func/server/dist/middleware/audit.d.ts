import { AuthRequest } from './auth.js';
export declare function logAudit({ action, entityType, entityId, details, oldValues, newValues, req, userId, userName, }: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OVERRIDE' | 'FINALIZE' | 'SEND_WHATSAPP' | 'SEND_EMAIL' | 'PAYMENT_RECORDED' | 'CANCEL';
    entityType: 'PARTY' | 'INVOICE' | 'CONTAINER' | 'JOB' | 'CHARGE' | 'PAYMENT' | 'SETTINGS' | 'EXPORTER' | 'DATA_ENTRY_RECORD' | 'CARTING_RECORD';
    entityId: string;
    details: string;
    oldValues?: any;
    newValues?: any;
    req?: AuthRequest;
    userId?: string;
    userName?: string;
}): Promise<void>;
