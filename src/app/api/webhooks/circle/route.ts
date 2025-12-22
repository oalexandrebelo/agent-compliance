import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateTransaction } from '@/lib/compliance/evaluator';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Verify signature logic would go here (skipped for MVP speed)

        // Check if it's a notification
        if (body.type === 'Notification') {
            const message = JSON.parse(body.Message); // Circle wraps payload in AWS SNS format usually

            if (message.notificationType === 'transfers') { // Example event type
                const transfer = message.transfer;

                // Find related agent
                const agent = await prisma.agent.findFirst({
                    where: { walletId: transfer.source.id }
                });

                if (agent) {
                    // Create Transaction Record
                    const tx = await prisma.transaction.create({
                        data: {
                            agentId: agent.id,
                            organizationId: agent.organizationId,
                            circleTransactionId: transfer.id,
                            amount: transfer.amount.amount,
                            currency: transfer.amount.currency,
                            fromAddress: transfer.source.id, // Wallet ID as address for now
                            toAddress: transfer.destination.address || 'unknown',
                            status: 'PENDING',
                            decision: 'PENDING'
                        }
                    });

                    // Trigger Evaluation Asynchronously
                    // In production use a queue (Bull/Redis). For MVP, just await or fire-and-forget
                    await evaluateTransaction(tx.id);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
