import { GoogleGenerativeAI } from '@google/generative-ai';

// Start Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Model configuration
export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.2, // Low temperature for consistent risk analysis
    }
});
