import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

// Initialize the Circle Web SDK
// In a real app, this runs on the client to facilitate PIN entry and challenge handling
class CircleWalletClient {
    private sdk: W3SSdk | null = null;
    private appId: string;

    constructor() {
        this.appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '';
    }

    public init() {
        if (typeof window !== 'undefined' && !this.sdk) {
            this.sdk = new W3SSdk();
            this.sdk.setAppSettings({
                appId: this.appId,
            });
        }
    }

    // Mock wrapper for creating an agent wallet (Server-side simulation for this hackathon)
    // The actual W3S SDK is client-side for user-controlled wallets.
    // Developer-controlled wallets are handled via REST API.
    public async createAgentWallet() {
        // This simulates the REST API call to Circle's Developer Controlled Wallets

        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            walletId: `cw_${Math.random().toString(36).substring(7)}`,
            address: `0x${Math.random().toString(16).substring(2, 42)}`,
            status: 'ACTIVE'
        };
    }

    public async signMessage(message: string): Promise<string> {
        // Mock signature for demo purposes until full challenge flow is implemented
        return `0x${Buffer.from(`signed:${message}`).toString('hex')}`;
    }

    public async get<T>(url: string): Promise<{ data: { data: T } }> {
        // Mock implementation or real axios call
        // For demo, we return mock data if not implemented
        console.log(`Mock GET: ${url}`);
        return { data: { data: {} as T } };
    }

    public async post<T>(url: string, data: unknown): Promise<{ data: { data: T } }> {
        // Mock implementation
        console.log(`Mock POST: ${url}`, data);
        return { data: { data: {} as T } };
    }
}

export const circleClient = new CircleWalletClient();
