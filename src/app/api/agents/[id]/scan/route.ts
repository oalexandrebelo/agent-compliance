import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geminiModel } from '@/lib/gemini/client';
import { successResponse, errorResponse } from '@/lib/api';
import { circleAPI } from '@/lib/circle/api-client';
import { auditLogger } from '@/lib/web3/audit-logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Compliance check fee in USDC (Pay-per-Check model)
const COMPLIANCE_FEE_USDC = '0.10'; // 10 cents per check for demo (adjust for production)
const TREASURY_ADDRESS = process.env.COMPLIANCE_TREASURY_ADDRESS || '0x94a1d978a5b3f387bc58a8956a15a003a800eac9';

// Risk threshold for automatic alert creation
const HIGH_RISK_THRESHOLD = 0.7;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: agentId } = await params;

        // 1. Fetch Agent & Recent History
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                transactions: { take: 20, orderBy: { createdAt: 'desc' } },
                organization: true
            }
        });

        if (!agent) return errorResponse('Agent not found', 404);

        // ============================================
        // 💰 PAY-PER-CHECK: Charge USDC before analysis
        // ============================================
        let paymentReceipt = null;
        try {
            // Attempt to charge the agent's wallet for compliance check
            // This implements the "Agentic Commerce" theme requirement
            const payment = await circleAPI.initiateTransfer(
                agent.walletId,
                TREASURY_ADDRESS,
                COMPLIANCE_FEE_USDC,
                'usdc', // USDC token
                'ARB-SEPOLIA' // Arc testnet chain
            );
            paymentReceipt = payment;
            console.log(`✅ Compliance fee charged: ${COMPLIANCE_FEE_USDC} USDC from ${agent.name}`);
        } catch (paymentError) {
            // Log but don't block - for demo purposes, continue even if payment fails
            console.warn(`⚠️ Payment failed for ${agent.name}, proceeding with scan:`, paymentError);
            // In production: return errorResponse('Insufficient USDC for compliance check', 402);
        }

        // 2. Prepare Prompt for Gemini
        const historyText = agent.transactions.map(t =>
            `- ${t.amount} ${t.currency} to ${t.toAddress} (Status: ${t.status})`
        ).join('\n');

        const prompt = `
      Analyze the behavior of this autonomous agent based on its recent transaction history.
      Agent Name: ${agent.name}
      Transactions:
      ${historyText}

      Task:
      Determine if there are signs of structuring, wash trading, or interaction with high-risk entities.
      Return a JSON object with:
      - "riskScore": number (0-1)
      - "explanation": string (brief summary)
      - "flags": string[] (list of specific suspicious patterns found)
    `;

        // 3. Call Gemini AI
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON (Robustness handling)
        let analysis: { riskScore: number; explanation: string; flags: string[] };
        try {
            const jsonBlock = text.match(/\{[\s\S]*\}/);
            analysis = jsonBlock ? JSON.parse(jsonBlock[0]) : { riskScore: 0.5, explanation: "AI parsing error", flags: [] };
        } catch {
            analysis = { riskScore: 0.5, explanation: "AI response format error", flags: [] };
        }

        // 5. Update Trust Score in DB (Inverse of Risk)
        await prisma.agent.update({
            where: { id: agentId },
            data: { trustScore: 1 - analysis.riskScore }
        });

        // ============================================
        // 🚨 AUTO-ALERT: Create alert if high risk detected
        // ============================================
        let createdAlert = null;
        if (analysis.riskScore >= HIGH_RISK_THRESHOLD) {
            // Determine severity based on score
            const severity = analysis.riskScore >= 0.9 ? 'CRITICAL' : 'HIGH';

            // Create a dummy transaction to satisfy schema requirement
            const alertTransaction = await prisma.transaction.create({
                data: {
                    agentId: agentId,
                    organizationId: agent.organizationId,
                    fromAddress: agent.walletAddress,
                    toAddress: 'COMPLIANCE_SCAN',
                    amount: 0,
                    currency: 'USDC',
                    status: 'QUARANTINE',
                    decision: 'PENDING',
                    riskScore: analysis.riskScore,
                }
            });

            // Create the alert
            createdAlert = await prisma.alert.create({
                data: {
                    transactionId: alertTransaction.id,
                    agentId: agentId,
                    organizationId: agent.organizationId,
                    severity: severity,
                    status: 'PENDING',
                    reasons: analysis.flags,
                    aiExplanation: analysis.explanation,
                }
            });

            console.log(`🚨 Auto-Alert created for ${agent.name}: ${severity} (score: ${analysis.riskScore})`);

            // Quarantine agent if risk is critical
            if (analysis.riskScore >= 0.9) {
                await prisma.agent.update({
                    where: { id: agentId },
                    data: { status: 'QUARANTINE' }
                });
                console.log(`🔒 Agent ${agent.name} auto-quarantined due to CRITICAL risk`);
            }
        }

        // ============================================
        // 📋 AUDIT LOG: Record on Arc blockchain
        // ============================================
        const auditTxHash = await auditLogger.logAction(
            agentId,
            'COMPLIANCE_CHECK',
            {
                riskScore: analysis.riskScore,
                flags: analysis.flags,
                feeCharged: COMPLIANCE_FEE_USDC,
                paymentId: paymentReceipt?.id || 'FREE_CHECK',
                alertCreated: createdAlert?.id || null,
                timestamp: Date.now()
            }
        );

        return successResponse({
            analysis,
            payPerCheck: {
                feeCharged: COMPLIANCE_FEE_USDC,
                currency: 'USDC',
                paymentStatus: paymentReceipt ? 'PAID' : 'WAIVED',
                paymentId: paymentReceipt?.id || null
            },
            autoAlert: createdAlert ? {
                alertId: createdAlert.id,
                severity: createdAlert.severity,
                status: createdAlert.status
            } : null,
            auditProof: {
                txHash: auditTxHash,
                chain: 'Arc Testnet'
            }
        });

    } catch (error) {
        console.error('Deep Scan failed:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
