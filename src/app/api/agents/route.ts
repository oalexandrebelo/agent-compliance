import { successResponse } from '@/lib/api';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
