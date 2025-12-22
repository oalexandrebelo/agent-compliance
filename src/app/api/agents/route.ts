import { successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const agents = await prisma.agent.findMany({
        include: { organization: true }
    });
    return successResponse(agents);
}

export async function POST() {
    // Agent creation logic
    return successResponse({ id: 'agent_placeholder' });
}
