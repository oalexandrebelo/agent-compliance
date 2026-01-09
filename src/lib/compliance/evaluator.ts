import { prisma } from '@/lib/prisma';
import { calculateRiskScore } from '@/lib/gemini/risk-engine';
import { ComplianceDecision, TransactionStatus } from '@prisma/client';

export async function evaluateTransaction(transactionId: string) {
    // 1. Fetch Transaction
    const tx = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { agent: true }
    });

    if (!tx) throw new Error('Transaction not found');

    // 2. Calculate Risk
    const riskAnalysis = await calculateRiskScore({
        amount: tx.amount,
        currency: tx.currency,
        destination: tx.toAddress,
        agentId: tx.agentId,
        timestamp: new Date().toISOString()
    });

    // 3. Apply Rules
    let decision = 'PENDING';
    let status = 'PENDING';

    if (riskAnalysis.score < 0.3) {
        decision = 'AUTO_APPROVE';
        status = 'APPROVED';
    } else if (riskAnalysis.score > 0.7) {
        decision = 'AUTO_BLOCK';
        status = 'BLOCKED';
    } else {
        decision = 'PENDING'; // Needs manual review
        status = 'QUARANTINE';
    }

    // 4. Update Database
    await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            riskScore: riskAnalysis.score,
            decision: decision as ComplianceDecision,
            status: status as TransactionStatus,
            riskAnalysis: {
                create: {
                    overallScore: riskAnalysis.score,
                    confidence: 0.9,
                    aiExplanation: riskAnalysis.explanation,
                    reasons: riskAnalysis.flags,
                    agentId: tx.agentId
                }
            }
        }
    });

    // 5. Create Alert if High Risk
    if (riskAnalysis.score >= 0.5) {
        await prisma.alert.create({
            data: {
                transactionId: tx.id,
                agentId: tx.agentId,
                organizationId: tx.organizationId,
                severity: riskAnalysis.score > 0.8 ? 'CRITICAL' : 'HIGH',
                status: 'PENDING',
                reasons: riskAnalysis.flags,
                aiExplanation: riskAnalysis.explanation
            }
        });
    }

    return { status, decision, riskAnalysis };
}
