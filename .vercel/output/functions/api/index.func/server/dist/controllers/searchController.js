import prisma from '../prisma.js';
export class SearchController {
    static async globalSearch(req, res) {
        try {
            const q = (req.query.q || '').trim();
            if (!q || q.length < 2) {
                return res.json({ parties: [], invoices: [], containers: [], jobs: [] });
            }
            const [parties, invoices, containers, jobs] = await Promise.all([
                prisma.party.findMany({
                    where: {
                        OR: [
                            { legalName: { contains: q } },
                            { gstin: { contains: q } },
                            { mobile: { contains: q } },
                            { city: { contains: q } },
                        ],
                    },
                    take: 5,
                }),
                prisma.invoice.findMany({
                    where: {
                        OR: [
                            { invoiceNumber: { contains: q } },
                            { billToName: { contains: q } },
                            { billToGstin: { contains: q } },
                            { sbNumbers: { contains: q } },
                        ],
                    },
                    take: 5,
                }),
                prisma.container.findMany({
                    where: {
                        containerNumber: { contains: q },
                    },
                    include: {
                        party: { select: { legalName: true } },
                    },
                    take: 5,
                }),
                prisma.job.findMany({
                    where: {
                        OR: [
                            { jobNumber: { contains: q } },
                            { sbNumber: { contains: q } },
                            { bookingDetails: { contains: q } },
                        ],
                    },
                    include: {
                        party: { select: { legalName: true } },
                    },
                    take: 5,
                }),
            ]);
            return res.json({
                parties,
                invoices,
                containers,
                jobs,
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
