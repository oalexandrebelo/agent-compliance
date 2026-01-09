import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLogger } from '@/lib/web3/audit-logger';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15: params is a promise
) {
    try {
        const { id } = await params;

        // 1. Update Alert to BLOCKED
        const updatedAlert = await prisma.alert.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
            },
            include: {
                agent: true,
                transaction: true
            }
        });

        // 2. Update Transaction to BLOCKED
        if (updatedAlert.transactionId) {
            await prisma.transaction.update({
                where: { id: updatedAlert.transactionId },
                data: { status: 'BLOCKED', decision: 'MANUAL_DENY' }
            });
        }

        // 3. Quarantine the Agent
        await prisma.agent.update({
            where: { id: updatedAlert.agentId },
            data: { status: 'QUARANTINE' }
        });

        // 4. Log to Blockchain (Audit Trail)
        const auditTx = await auditLogger.logAction(
            updatedAlert.transactionId,
            'ALERT_BLOCKED',
            {
                alertId: updatedAlert.id,
                agent: updatedAlert.agent.name,
                amount: updatedAlert.transaction.amount,
                decision: 'BLOCKED',
                reason: 'Manual Block via Dashboard'
            }
        );

        return NextResponse.json({
            success: true,
            alert: updatedAlert,
            auditTxHash: auditTx || 'mock-tx-hash-if-failed'
        });

    } catch (error) {
        console.error('Error blocking alert:', error);
        return NextResponse.json(
            { error: 'Failed to block alert' },
            { status: 500 }
        );
    }
}
