import { successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const transactions = await prisma.transaction.findMany({
        include: {
            agent: true,
            riskAnalysis: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    return successResponse(transactions);
}

export async function POST() {
    // const body = await _req.json();
    // Implementation for manual creation if needed
    return successResponse({ received: true });
}
