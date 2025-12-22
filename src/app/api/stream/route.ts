import { NextRequest, NextResponse } from 'next/server';

// Server-Sent Events (SSE) Stream
// Architecture Decision: Using direct SSE for low-latency feedback during presentation.
// Scalability Note: Production would upgrade this to Redis Pub/Sub.
let clients: ReadableStreamDefaultController[] = [];

export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            clients.push(controller);

            // Send initial connection message
            const initMsg = `data: ${JSON.stringify({ type: 'CONNECTED', message: 'Stream Active' })}\n\n`;
            controller.enqueue(new TextEncoder().encode(initMsg));

            req.signal.addEventListener('abort', () => {
                clients = clients.filter(c => c !== controller);
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// Helper to broadcast events (to be used by other API routes)
// Note: In Next.js App Router, sharing state like 'clients' array in serverless is tricky.
// For hackathon local dev, this global variable works in 'next dev'.
export function broadcast<T>(event: { type: string, data: T }) {
    const msg = `data: ${JSON.stringify(event)}\n\n`;
    const encoder = new TextEncoder();
    clients.forEach(client => {
        try {
            client.enqueue(encoder.encode(msg));
        } catch (e) {
            console.error('Failed to send to client', e);
        }
    });
}
