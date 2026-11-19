import prisma from '../prisma.js';
export class AuditController {
    static async list(req, res) {
        try {
            const { entityType, entityId } = req.query;
            const where = {};
            if (entityType)
                where.entityType = String(entityType);
            if (entityId)
                where.entityId = String(entityId);
            const logs = await prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
            return res.json(logs);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
