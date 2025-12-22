import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        // const agentId = searchParams.get('agentId'); // Optional filters

        const logs = await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                organization: { select: { name: true } },
                // user: { select: { name: true } } // User might be null
            }
        });

        return successResponse(logs);
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
