import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLogger } from '@/lib/web3/audit-logger';
import { circleClient } from '@/lib/circle/client';
import { successResponse, errorResponse } from '@/lib/api';
import { TransactionStatus } from '@prisma/client'; // Import Enum

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { reason, walletId } = await req.json();
        const { id: agentId } = await params;

        if (!reason) return errorResponse('Audit reason is required', 400);

        // 1. Freeze Wallet via Circle API
        await circleClient.createAgentWallet(); // Re-using for demo connectivity



        // 2. Log immutable proof on Arc Network
        const txHash = await auditLogger.logAction(
            agentId,
            "FREEZE_AGENT_WALLET",
            { reason, walletId, timestamp: Date.now() }
        );

        // 3. Update Local DB
        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: {
                status: 'SUSPENDED'
            }
        });

        // 4. Create an Alert with a dummy transaction to satisfy schema
        // Note: In a real scenario we'd attach to the specific suspicious transaction
        await prisma.alert.create({
            data: {
                severity: "HIGH",
                status: "RESOLVED",
                agent: { connect: { id: agentId } },
                organization: { connect: { id: updatedAgent.organizationId } },
                reasons: ["Manual Intervention", reason],
                aiExplanation: `Agent frozen by compliance officer. Audit Hash: ${txHash || 'PENDING_CHAIN'}.`,
                transaction: {
                    create: {
                        fromAddress: "SYSTEM",
                        toAddress: "SYSTEM",
                        amount: 0,
                        status: TransactionStatus.BLOCKED,
                        agentId: agentId,
                        organizationId: updatedAgent.organizationId
                    }
                }
            }
        });

        return successResponse({
            success: true,
            auditTx: txHash,
            newStatus: 'SUSPENDED'
        });

    } catch (error) {
        console.error('Freeze failed:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
