import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditLogger } from '@/lib/web3/audit-logger';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Next.js 15: params is a promise
) {
    try {
        const { id } = await params;
        const body = await request.json(); // Expecting decision reason or user info if needed

        // 1. Update Database
        const updatedAlert = await prisma.alert.update({
            where: { id },
            data: {
                status: 'RESOLVED', // Or APPROVED based on schema
                resolvedAt: new Date(),
            },
            include: {
                agent: true,
                transaction: true
            }
        });

        // 2. Log to Blockchain (Audit Trail)
        const auditTx = await auditLogger.logAction(
            updatedAlert.transactionId, // Entity ID
            'ALERT_APPROVED',           // Action
            {
                alertId: updatedAlert.id,
                agent: updatedAlert.agent.name,
                amount: updatedAlert.transaction.amount,
                decision: 'APPROVED',
                reason: 'Manual Approval via Dashboard'
            }
        );

        return NextResponse.json({
            success: true,
            alert: updatedAlert,
            auditTxHash: auditTx || 'mock-tx-hash-if-failed'
        });

    } catch (error) {
        console.error('Error approving alert:', error);
        return NextResponse.json(
            { error: 'Failed to approve alert' },
            { status: 500 }
        );
    }
}
