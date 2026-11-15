import prisma from '../prisma.js';
export async function logAudit({ action, entityType, entityId, details, oldValues, newValues, req, userId, userName, }) {
    try {
        const activeUserId = userId || req?.user?.id;
        const activeUserName = userName || req?.user?.name || 'System';
        const ipAddress = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
        await prisma.auditLog.create({
            data: {
                userId: activeUserId,
                userName: activeUserName,
                action,
                entityType,
                entityId,
                details,
                oldValuesJson: oldValues ? JSON.stringify(oldValues) : null,
                newValuesJson: newValues ? JSON.stringify(newValues) : null,
                ipAddress: String(ipAddress),
            },
        });
    }
    catch (error) {
        console.error('Audit log error:', error);
    }
}
