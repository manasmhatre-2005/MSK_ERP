import prisma from '../prisma.js';
import { logAudit } from '../middleware/audit.js';
export class SettingsController {
    static async getSettings(req, res) {
        try {
            let settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
            if (!settings) {
                settings = await prisma.companySettings.create({
                    data: { id: 'default' },
                });
            }
            return res.json(settings);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async updateSettings(req, res) {
        try {
            const raw = { ...req.body };
            // Handle field name aliases gracefully
            if (raw.bankAccountNumber && !raw.bankAccountNo) {
                raw.bankAccountNo = raw.bankAccountNumber;
            }
            if (raw.notes && !raw.invoiceNotes) {
                raw.invoiceNotes = raw.notes;
            }
            const allowedFields = [
                'companyName', 'tradeName', 'gstin', 'pan', 'tan', 'address', 'city', 'state', 'stateCode',
                'pincode', 'phone', 'email', 'website', 'logoUrl', 'isoLogoUrl', 'signatureUrl', 'invoiceTitle',
                'invoicePrefix', 'nextInvoiceSeq', 'bankName', 'bankAccountName', 'bankAccountNo', 'bankIfsc',
                'bankBranch', 'termsAndConditions', 'invoiceNotes', 'freeEmptyGroundDays', 'freeLoadedGroundDays',
                'cgstDefaultRate', 'sgstDefaultRate', 'igstDefaultRate', 'whatsappPhoneId', 'whatsappBusinessAccountId',
                'whatsappAccessToken', 'whatsappVerifyToken', 'defaultCurrency'
            ];
            const data = {};
            for (const field of allowedFields) {
                if (raw[field] !== undefined) {
                    data[field] = raw[field];
                }
            }
            if (data.nextInvoiceSeq !== undefined)
                data.nextInvoiceSeq = Number(data.nextInvoiceSeq);
            if (data.freeEmptyGroundDays !== undefined)
                data.freeEmptyGroundDays = Number(data.freeEmptyGroundDays);
            if (data.freeLoadedGroundDays !== undefined)
                data.freeLoadedGroundDays = Number(data.freeLoadedGroundDays);
            if (data.cgstDefaultRate !== undefined)
                data.cgstDefaultRate = Number(data.cgstDefaultRate);
            if (data.sgstDefaultRate !== undefined)
                data.sgstDefaultRate = Number(data.sgstDefaultRate);
            if (data.igstDefaultRate !== undefined)
                data.igstDefaultRate = Number(data.igstDefaultRate);
            const updated = await prisma.companySettings.update({
                where: { id: 'default' },
                data,
            });
            await logAudit({
                action: 'UPDATE',
                entityType: 'SETTINGS',
                entityId: 'default',
                details: 'Updated company & billing configurations',
                newValues: updated,
                req,
            });
            return res.json(updated);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
