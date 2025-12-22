import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
    try {
        // Parallelize queries for performance
        const [
            totalVolumeResult,
            activeAgentsCount,
            blockedCount
        ] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Last 24h
            }),
            prisma.agent.count({
                where: { status: 'ACTIVE' }
            }),
            prisma.transaction.count(),
            prisma.transaction.count({
                where: { status: 'BLOCKED' }
            })
        ]);

        // Calculate dummy risk trend for chart (real implementation would group by hour)
        // For now, we mock the chart data structure but using real aggregates if possible
        // or just return a static structure compliant with the UI needs since SQLite doesn't support complex time-series aggregation easily in Prisma
        const riskTrend = [
            { time: '00:00', risk: 10 },
            { time: '04:00', risk: 25 },
            { time: '08:00', risk: 45 },
            { time: '12:00', risk: 30 },
            { time: '16:00', risk: 20 },
            { time: '20:00', risk: 65 },
            { time: '24:00', risk: 40 },
        ];

        return successResponse({
            totalVolume: totalVolumeResult._sum.amount?.toString() || '0',
            activeAgents: activeAgentsCount,
            avgRiskScore: 0.15, // Placeholder requiring complex avg query
            blockedCount: blockedCount,
            riskTrend
        });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
