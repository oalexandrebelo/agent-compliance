import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, dailyLimit, transactionLimit } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Agent name is required' },
                { status: 400 }
            );
        }

        // 1. Create real Circle wallet for the agent
        let walletAddress: string;
        let walletId: string;
        let circleWalletCreated = false;

        try {
            const { circleAPI } = await import('@/lib/circle/api-client');
            const wallet = await circleAPI.createWallet({
                name: name,
                refId: `agent-${Date.now()}`,
            });

            walletAddress = wallet.address;
            walletId = wallet.id;
            circleWalletCreated = true;
            console.log(`✅ Created Circle wallet: ${walletId} at ${walletAddress}`);
        } catch (circleError: any) {
            // Fallback to mock if Circle API is not configured
            console.warn('Circle API not configured, using mock wallet:', circleError.message);
            walletAddress = `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`;
            walletId = `mock-wallet-${Date.now()}`;
        }

        // 2. Get or create default organization
        let organization = await prisma.organization.findFirst();
        if (!organization) {
            organization = await prisma.organization.create({
                data: {
                    name: 'Default Organization',
                    slug: 'default-org',
                    email: 'admin@agentcompliance.com',
                },
            });
        }

        // 3. Create agent in database
        const agent = await prisma.agent.create({
            data: {
                name,
                description: description || `AI Agent with wallet ${walletAddress}`,
                walletAddress,
                walletId,
                dailyLimit: dailyLimit ? parseFloat(dailyLimit) : null,
                transactionLimit: transactionLimit ? parseFloat(transactionLimit) : null,
                organizationId: organization.id,
                trustScore: 0.5, // Default trust score
                status: 'ACTIVE',
            },
            include: {
                organization: true,
            },
        });

        return NextResponse.json({
            success: true,
            agent,
            circleWalletCreated,
            message: circleWalletCreated
                ? 'Agent created with real Circle wallet'
                : 'Agent created with mock wallet (Circle API not configured)',
        });

    } catch (error: any) {
        console.error('Error creating agent:', error);
        return NextResponse.json(
            {
                error: 'Failed to create agent',
                details: error.message
            },
            { status: 500 }
        );
    }
}
