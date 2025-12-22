import { geminiModel } from './client';

export type RiskAnalysisResult = {
    score: number; // 0.0 to 1.0
    explanation: string;
    reasons: string[];
};

export async function calculateRiskScore(transactionData: unknown): Promise<RiskAnalysisResult> {
    const prompt = `
    You are an AI Compliance Officer for a crypto platform. 
    Analyze the following transaction for AML/KYC risks.
    
    Transaction Data:
    ${JSON.stringify(transactionData, null, 2)}
    
    Context:
    - Typical transaction amount for this agent: $50-500
    - Typical hours: 09:00 - 18:00 UTC
    
    Task:
    1. Assign a risk score from 0.0 (Safe) to 1.0 (Critical Risk).
    2. Provide a brief explanation (1-2 sentences).
    3. List 1-3 key reasons for the score.

    Output format (JSON only):
    {
      "score": <number>,
      "explanation": "<string>",
      "reasons": ["<reason1>", "<reason2>"]
    }
  `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Simple parsing - ideally use a more robust parser or structured output mode if available
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        return {
            score: data.score,
            explanation: data.explanation,
            reasons: data.reasons || []
        };
    } catch (error) {
        console.error('Gemini Risk Scoring Failed:', error);
        // Fallback safe defaults if AI fails
        return {
            score: 0.5,
            explanation: "Risk analysis unavailable due to service error. Manual review recommended.",
            reasons: ["SERVICE_ERROR"]
        };
    }
}
