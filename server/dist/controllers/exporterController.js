import prisma from '../prisma.js';
import { logAudit } from '../middleware/audit.js';
export class ExporterController {
    static async getAll(req, res) {
        try {
            const exporters = await prisma.exporter.findMany({
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { jobs: true, containers: true, invoices: true } },
                },
            });
            return res.json(exporters);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async create(req, res) {
        try {
            const { name, gstin, iecCode, address, city, state, stateCode, pincode, contactPerson, phone, email, notes } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Exporter Name is required' });
            }
            const exporter = await prisma.exporter.create({
                data: {
                    name,
                    gstin,
                    iecCode,
                    address,
                    city,
                    state,
                    stateCode,
                    pincode,
                    contactPerson,
                    phone,
                    email,
                    notes,
                },
            });
            await logAudit({
                action: 'CREATE',
                entityType: 'EXPORTER',
                entityId: exporter.id,
                details: `Created exporter: ${exporter.name}`,
                req,
            });
            return res.status(201).json(exporter);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await prisma.exporter.update({
                where: { id },
                data: req.body,
            });
            return res.json(updated);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.exporter.delete({ where: { id } });
            return res.json({ message: 'Exporter deleted successfully' });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
