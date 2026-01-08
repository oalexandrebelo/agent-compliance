import { successResponse, errorResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const alerts = await prisma.alert.findMany({
            include: {
                agent: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return successResponse(alerts);
    } catch (error) {
        console.error('Failed to fetch alerts:', error);
        return errorResponse('Failed to fetch alerts', 500);
    }
}
