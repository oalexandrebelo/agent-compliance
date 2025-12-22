import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geminiModel } from '@/lib/gemini/client';
import { successResponse, errorResponse } from '@/lib/api';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: agentId } = await params;

        // 1. Fetch Agent & Recent History
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { transactions: { take: 20, orderBy: { createdAt: 'desc' } } }
        });

        if (!agent) return errorResponse('Agent not found', 404);

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

        // 3. Call Gemini
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse JSON (Robustness handling)
        let analysis;
        try {
            const jsonBlock = text.match(/\{[\s\S]*\}/);
            analysis = jsonBlock ? JSON.parse(jsonBlock[0]) : { riskScore: 0.5, explanation: "AI parsing error", flags: [] };
        } catch {
            analysis = { riskScore: 0.5, explanation: "AI response format error", flags: [] };
        }

        // 5. Update Trust Score in DB (Inverse of Risk)
        // Schema has 'trustScore', so we do 1 - riskScore
        await prisma.agent.update({
            where: { id: agentId },
            data: { trustScore: 1 - analysis.riskScore }
        });

        return successResponse(analysis);

    } catch (error) {
        console.error('Deep Scan failed:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
