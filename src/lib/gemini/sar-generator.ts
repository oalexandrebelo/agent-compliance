import { geminiModel } from './client';
import { prisma } from '@/lib/prisma';

export interface SARSuggestion {
    suspicionType: 'structuring' | 'identity' | 'laundering' | 'sanctions';
    narrative: string;
    action: 'FREEZE' | 'REPORT' | 'MONITOR';
}

export async function generateSARReport(agentId: string, walletAddress: string, date: string): Promise<SARSuggestion> {

    // Fetch context about the agent
    const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: {
            organization: true,
            alerts: {
                where: { status: 'RESOLVED' },
                take: 5
            }
        }
    });

    const prompt = `
    You are a Senior Compliance Officer for a crypto exchange. 
    Draft a Suspicious Activity Report (SAR) narrative based on the following subject.

    Subject Details:
    - Agent ID: ${agentId}
    - Wallet: ${walletAddress}
    - Organization: ${agent?.organization?.name || 'Unknown'}
    - Activity Date: ${date}
    - Past Alerts: ${agent?.alerts.length || 0} prior resolved cases.

    Task:
    1. Select the most likely suspicion type from: 'structuring', 'identity', 'laundering', 'sanctions'.
    2. Write a 200-word professional narrative in the "Who, What, Where, When, Why, How" format compliant with FinCEN guidelines.
    3. Recommend an action (FREEZE, REPORT, or MONITOR).

    Output JSON only:
    {
        "suspicionType": "string",
        "narrative": "string",
        "action": "string"
    }
    `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini SAR Generation Failed:', error);
        return {
            suspicionType: 'laundering',
            narrative: `Manual review required. AI generation failed for Agent ${agentId}. Please investigate suspicious transaction volume at wallet ${walletAddress} on ${date}.`,
            action: 'REPORT'
        };
    }
}
