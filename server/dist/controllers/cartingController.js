import prisma from '../prisma.js';
import { logAudit } from '../middleware/audit.js';
export class CartingController {
    /**
     * Reference data for Carting Details dropdowns and autocompletes
     */
    static async getReferenceData(_req, res) {
        try {
            // 1. Fetch registered parties
            const parties = await prisma.party.findMany({
                select: { id: true, legalName: true, tradeName: true, gstin: true },
                orderBy: { legalName: 'asc' },
            });
            // 2. Fetch distinct recent suggestions for shipper, consignee, cha, agent, commodity
            const [distinctShippers, distinctConsignees, distinctChas, distinctAgents, distinctCommodities] = await Promise.all([
                prisma.cartingRecord.findMany({
                    select: { shipper: true },
                    distinct: ['shipper'],
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.cartingRecord.findMany({
                    select: { consignee: true },
                    distinct: ['consignee'],
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.cartingRecord.findMany({
                    select: { cha: true },
                    distinct: ['cha'],
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.cartingRecord.findMany({
                    select: { agent: true },
                    distinct: ['agent'],
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.cartingRecord.findMany({
                    select: { commodity: true },
                    distinct: ['commodity'],
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);
            res.json({
                parties: parties.map((p) => ({
                    id: p.id,
                    name: p.legalName || p.tradeName,
                    gstin: p.gstin,
                })),
                shippers: distinctShippers.map((r) => r.shipper).filter(Boolean),
                consignees: distinctConsignees.map((r) => r.consignee).filter(Boolean),
                chas: distinctChas.map((r) => r.cha).filter(Boolean),
                agents: distinctAgents.map((r) => r.agent).filter(Boolean),
                commodities: distinctCommodities.map((r) => r.commodity).filter(Boolean),
                weightUnits: ['KGS', 'MT', 'LBS', 'CBM'],
            });
        }
        catch (err) {
            console.error('Failed to get carting reference data:', err);
            res.status(500).json({ error: 'Unable to retrieve carting reference data.' });
        }
    }
    /**
     * Peek next sequential reference number: CRT-YYYY-XXXX
     */
    static async getNextSrNo(_req, res) {
        try {
            const currentYear = new Date().getFullYear();
            const countThisYear = await prisma.cartingRecord.count({
                where: {
                    createdAt: {
                        gte: new Date(`${currentYear}-01-01T00:00:00Z`),
                    },
                },
            });
            const nextSeq = countThisYear + 1;
            const nextSrNo = `CRT-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
            res.json({ nextSrNo, nextSeq });
        }
        catch (err) {
            console.error('Failed to get next carting sr no:', err);
            res.status(500).json({ error: 'Failed to preview next Carting reference number.' });
        }
    }
    /**
     * List all Carting Details records with Search & Filter
     */
    static async getAll(req, res) {
        try {
            const { search, jobNo, shippingBillNo, partyName, partyId, agent, dateFrom, dateTo, status, sortBy = 'date', sortOrder = 'desc', page = '1', limit = '50', } = req.query;
            const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
            const pageSize = Math.min(250, Math.max(1, parseInt(String(limit), 10) || 50));
            const skip = (pageNum - 1) * pageSize;
            const where = {};
            if (status && String(status) !== 'ALL') {
                where.status = String(status);
            }
            if (partyId && String(partyId) !== 'ALL') {
                where.partyId = String(partyId);
            }
            else if (partyName && String(partyName) !== 'ALL') {
                where.partyName = { contains: String(partyName), mode: 'insensitive' };
            }
            if (agent && String(agent) !== 'ALL') {
                where.agent = { contains: String(agent), mode: 'insensitive' };
            }
            if (jobNo) {
                where.jobNo = { contains: String(jobNo).trim(), mode: 'insensitive' };
            }
            if (shippingBillNo) {
                where.shippingBillNo = { contains: String(shippingBillNo).trim(), mode: 'insensitive' };
            }
            // Date range filtering
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom) {
                    where.date.gte = new Date(String(dateFrom));
                }
                if (dateTo) {
                    const toDate = new Date(String(dateTo));
                    toDate.setHours(23, 59, 59, 999);
                    where.date.lte = toDate;
                }
            }
            // Global search across jobNo, shippingBillNo, partyName, shipper, consignee, agent, cha, commodity
            if (search) {
                const q = String(search).trim();
                where.OR = [
                    { srNo: { contains: q, mode: 'insensitive' } },
                    { jobNo: { contains: q, mode: 'insensitive' } },
                    { shippingBillNo: { contains: q, mode: 'insensitive' } },
                    { partyName: { contains: q, mode: 'insensitive' } },
                    { shipper: { contains: q, mode: 'insensitive' } },
                    { consignee: { contains: q, mode: 'insensitive' } },
                    { cha: { contains: q, mode: 'insensitive' } },
                    { agent: { contains: q, mode: 'insensitive' } },
                    { commodity: { contains: q, mode: 'insensitive' } },
                ];
            }
            // Sorting
            const validSortFields = ['date', 'srNo', 'jobNo', 'shippingBillNo', 'partyName', 'agent', 'createdAt', 'weight'];
            const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'date';
            const order = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
            const [totalCount, records] = await Promise.all([
                prisma.cartingRecord.count({ where }),
                prisma.cartingRecord.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { [field]: order },
                    include: {
                        party: {
                            select: { id: true, legalName: true, tradeName: true, gstin: true },
                        },
                    },
                }),
            ]);
            res.setHeader('X-Total-Count', String(totalCount));
            res.json({
                records,
                totalCount,
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(totalCount / pageSize) || 1,
            });
        }
        catch (err) {
            console.error('Failed to get carting records:', err);
            res.status(500).json({ error: 'Failed to retrieve Carting Details records.' });
        }
    }
    /**
     * Get single Carting Details record by ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await prisma.cartingRecord.findUnique({
                where: { id },
                include: {
                    party: true,
                },
            });
            if (!record) {
                res.status(404).json({ error: 'Carting record not found.' });
                return;
            }
            res.json(record);
        }
        catch (err) {
            console.error('Failed to get carting record by id:', err);
            res.status(500).json({ error: 'Failed to retrieve Carting record.' });
        }
    }
    /**
     * Create a new Carting Details record with full field validation
     */
    static async create(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { jobNo, shippingBillNo, date, shipper, consignee, cha, packages, weight, weightUnit = 'KGS', commodity, partyName, partyId, agent, remarks, } = req.body;
            // 1. Validation of all 12 requested fields
            if (!jobNo || !String(jobNo).trim()) {
                res.status(400).json({ error: 'Job No. is required.' });
                return;
            }
            if (!shippingBillNo || !String(shippingBillNo).trim()) {
                res.status(400).json({ error: 'Shipping Bill No. is required.' });
                return;
            }
            if (!shipper || !String(shipper).trim()) {
                res.status(400).json({ error: 'Shipper name is required.' });
                return;
            }
            if (!consignee || !String(consignee).trim()) {
                res.status(400).json({ error: 'Consignee name is required.' });
                return;
            }
            if (!cha || !String(cha).trim()) {
                res.status(400).json({ error: 'CHA (Customs House Agent) is required.' });
                return;
            }
            if (!packages || !String(packages).trim()) {
                res.status(400).json({ error: 'Packages (Pkgs) count/description is required.' });
                return;
            }
            const parsedWeight = parseFloat(String(weight));
            if (isNaN(parsedWeight) || parsedWeight < 0) {
                res.status(400).json({ error: 'Weight must be a valid non-negative number.' });
                return;
            }
            if (!commodity || !String(commodity).trim()) {
                res.status(400).json({ error: 'Commodity description is required.' });
                return;
            }
            if (!partyName || !String(partyName).trim()) {
                res.status(400).json({ error: 'Party Name is required.' });
                return;
            }
            if (!agent || !String(agent).trim()) {
                res.status(400).json({ error: 'Agent name is required.' });
                return;
            }
            const cleanJobNo = String(jobNo).trim().toUpperCase();
            const cleanSbNo = String(shippingBillNo).trim().toUpperCase();
            // 2. Prevent accidental duplicate submission within 30 seconds for same Job No & Shipping Bill No
            const recentDuplicate = await prisma.cartingRecord.findFirst({
                where: {
                    jobNo: cleanJobNo,
                    shippingBillNo: cleanSbNo,
                    createdById: req.user.id,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 1000), // last 30 seconds
                    },
                },
            });
            if (recentDuplicate) {
                res.status(409).json({
                    error: `Accidental duplicate submission detected. Job No. ${cleanJobNo} with Shipping Bill ${cleanSbNo} was just recorded moments ago (${recentDuplicate.srNo}).`,
                    existingRecord: recentDuplicate,
                });
                return;
            }
            // 3. Generate sequential unique Sr. No. (CRT-YYYY-XXXX)
            const currentYear = new Date().getFullYear();
            const countThisYear = await prisma.cartingRecord.count({
                where: {
                    createdAt: {
                        gte: new Date(`${currentYear}-01-01T00:00:00Z`),
                    },
                },
            });
            const srNoInt = countThisYear + 1;
            const srNo = `CRT-${currentYear}-${String(srNoInt).padStart(4, '0')}`;
            // 4. Verify partyId if supplied, or lookup by name
            let validPartyId = partyId ? String(partyId) : null;
            if (validPartyId) {
                const partyExists = await prisma.party.findUnique({ where: { id: validPartyId } });
                if (!partyExists) {
                    validPartyId = null;
                }
            }
            // 5. Create Carting Record
            const record = await prisma.cartingRecord.create({
                data: {
                    srNo,
                    srNoInt,
                    jobNo: cleanJobNo,
                    shippingBillNo: cleanSbNo,
                    date: date ? new Date(date) : new Date(),
                    shipper: String(shipper).trim(),
                    consignee: String(consignee).trim(),
                    cha: String(cha).trim(),
                    packages: String(packages).trim(),
                    weight: parsedWeight,
                    weightUnit: String(weightUnit).trim().toUpperCase() || 'KGS',
                    commodity: String(commodity).trim(),
                    partyId: validPartyId,
                    partyName: String(partyName).trim(),
                    agent: String(agent).trim(),
                    remarks: remarks ? String(remarks).trim() : null,
                    createdById: req.user.id,
                    createdByName: req.user.name || 'System User',
                },
                include: {
                    party: {
                        select: { id: true, legalName: true, tradeName: true, gstin: true },
                    },
                },
            });
            // 6. Audit Trail
            await logAudit({
                req,
                action: 'CREATE',
                entityType: 'CARTING_RECORD',
                entityId: record.id,
                details: `Created Carting Record ${record.srNo} (Job: ${record.jobNo}, SB: ${record.shippingBillNo}, Party: ${record.partyName})`,
            });
            res.status(201).json({
                success: true,
                record,
                message: `Carting Details record ${record.srNo} saved successfully.`,
            });
        }
        catch (err) {
            console.error('Failed to create carting record:', err);
            res.status(500).json({ error: err.message || 'Failed to save Carting Details record.' });
        }
    }
    /**
     * Update an existing Carting Details record
     */
    static async update(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { id } = req.params;
            const { jobNo, shippingBillNo, date, shipper, consignee, cha, packages, weight, weightUnit, commodity, partyName, partyId, agent, remarks, status, version, } = req.body;
            const existing = await prisma.cartingRecord.findUnique({ where: { id } });
            if (!existing) {
                res.status(404).json({ error: 'Carting record not found.' });
                return;
            }
            // Optimistic concurrency check
            if (version !== undefined && existing.version !== version) {
                res.status(409).json({
                    error: 'This record was modified by another session. Please reload the latest data before making changes.',
                });
                return;
            }
            // Verify partyId if updated
            let validPartyId = existing.partyId;
            if (partyId !== undefined) {
                if (partyId) {
                    const partyExists = await prisma.party.findUnique({ where: { id: String(partyId) } });
                    validPartyId = partyExists ? partyExists.id : null;
                }
                else {
                    validPartyId = null;
                }
            }
            const updated = await prisma.cartingRecord.update({
                where: { id },
                data: {
                    jobNo: jobNo !== undefined ? String(jobNo).trim().toUpperCase() : existing.jobNo,
                    shippingBillNo: shippingBillNo !== undefined ? String(shippingBillNo).trim().toUpperCase() : existing.shippingBillNo,
                    date: date !== undefined ? new Date(date) : existing.date,
                    shipper: shipper !== undefined ? String(shipper).trim() : existing.shipper,
                    consignee: consignee !== undefined ? String(consignee).trim() : existing.consignee,
                    cha: cha !== undefined ? String(cha).trim() : existing.cha,
                    packages: packages !== undefined ? String(packages).trim() : existing.packages,
                    weight: weight !== undefined ? parseFloat(String(weight)) || 0 : existing.weight,
                    weightUnit: weightUnit !== undefined ? String(weightUnit).trim().toUpperCase() : existing.weightUnit,
                    commodity: commodity !== undefined ? String(commodity).trim() : existing.commodity,
                    partyName: partyName !== undefined ? String(partyName).trim() : existing.partyName,
                    partyId: validPartyId,
                    agent: agent !== undefined ? String(agent).trim() : existing.agent,
                    remarks: remarks !== undefined ? (remarks ? String(remarks).trim() : null) : existing.remarks,
                    status: status !== undefined ? String(status) : existing.status,
                    updatedById: req.user.id,
                    updatedByName: req.user.name || 'System User',
                    version: { increment: 1 },
                },
                include: {
                    party: {
                        select: { id: true, legalName: true, tradeName: true, gstin: true },
                    },
                },
            });
            await logAudit({
                req,
                action: 'UPDATE',
                entityType: 'CARTING_RECORD',
                entityId: updated.id,
                details: `Updated Carting Record ${updated.srNo} (Job: ${updated.jobNo}, SB: ${updated.shippingBillNo})`,
            });
            res.json({
                success: true,
                record: updated,
                message: `Carting record ${updated.srNo} updated successfully.`,
            });
        }
        catch (err) {
            console.error('Failed to update carting record:', err);
            res.status(500).json({ error: err.message || 'Failed to update Carting Details record.' });
        }
    }
    /**
     * Delete Carting Details record
     */
    static async delete(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const { id } = req.params;
            const existing = await prisma.cartingRecord.findUnique({ where: { id } });
            if (!existing) {
                res.status(404).json({ error: 'Carting record not found.' });
                return;
            }
            await prisma.cartingRecord.delete({ where: { id } });
            await logAudit({
                req,
                action: 'DELETE',
                entityType: 'CARTING_RECORD',
                entityId: id,
                details: `Deleted Carting Record ${existing.srNo} (Job: ${existing.jobNo}, SB: ${existing.shippingBillNo})`,
            });
            res.json({
                success: true,
                message: `Carting record ${existing.srNo} has been deleted.`,
            });
        }
        catch (err) {
            console.error('Failed to delete carting record:', err);
            res.status(500).json({ error: err.message || 'Failed to delete Carting Details record.' });
        }
    }
    /**
     * Export Carting Details to CSV
     */
    static async exportCsv(req, res) {
        try {
            const { search, partyName, agent, dateFrom, dateTo } = req.query;
            const where = {};
            if (partyName && String(partyName) !== 'ALL') {
                where.partyName = { contains: String(partyName), mode: 'insensitive' };
            }
            if (agent && String(agent) !== 'ALL') {
                where.agent = { contains: String(agent), mode: 'insensitive' };
            }
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom)
                    where.date.gte = new Date(String(dateFrom));
                if (dateTo) {
                    const toDate = new Date(String(dateTo));
                    toDate.setHours(23, 59, 59, 999);
                    where.date.lte = toDate;
                }
            }
            if (search) {
                const q = String(search).trim();
                where.OR = [
                    { srNo: { contains: q, mode: 'insensitive' } },
                    { jobNo: { contains: q, mode: 'insensitive' } },
                    { shippingBillNo: { contains: q, mode: 'insensitive' } },
                    { partyName: { contains: q, mode: 'insensitive' } },
                    { shipper: { contains: q, mode: 'insensitive' } },
                    { consignee: { contains: q, mode: 'insensitive' } },
                    { cha: { contains: q, mode: 'insensitive' } },
                    { agent: { contains: q, mode: 'insensitive' } },
                    { commodity: { contains: q, mode: 'insensitive' } },
                ];
            }
            const records = await prisma.cartingRecord.findMany({
                where,
                orderBy: { date: 'desc' },
            });
            const headers = [
                'Sr. No.',
                'Job No.',
                'Shipping Bill No.',
                'Date',
                'Shipper',
                'Consignee',
                'CHA',
                'Pkgs',
                'Weight',
                'Weight Unit',
                'Commodity',
                'Party Name',
                'Agent',
                'Remarks',
                'Created By',
                'Created At',
            ];
            const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
            const rows = records.map((r) => [
                escape(r.srNo),
                escape(r.jobNo),
                escape(r.shippingBillNo),
                escape(r.date.toISOString().split('T')[0]),
                escape(r.shipper),
                escape(r.consignee),
                escape(r.cha),
                escape(r.packages),
                r.weight,
                escape(r.weightUnit),
                escape(r.commodity),
                escape(r.partyName),
                escape(r.agent),
                escape(r.remarks || ''),
                escape(r.createdByName),
                escape(r.createdAt.toISOString()),
            ]);
            const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="msk-carting-details-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        }
        catch (err) {
            console.error('Failed to export carting csv:', err);
            res.status(500).json({ error: 'Failed to generate CSV export.' });
        }
    }
}
