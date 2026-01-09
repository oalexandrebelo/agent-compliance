import axios, { AxiosInstance } from 'axios';

/**
 * Production Circle API Client
 * Implements real Circle Developer-Controlled Wallets API calls
 * Documentation: https://developers.circle.com/wallets/dev-controlled
 */

interface CircleConfig {
    apiKey: string;
    baseURL: string;
    walletSetId: string;
}

interface CreateWalletRequest {
    walletSetId: string;
    blockchains: string[];
    count: number;
    metadata?: Array<{ name: string; refId?: string }>;
}

interface CreateWalletResponse {
    data: {
        wallets: Array<{
            id: string;
            state: string;
            walletSetId: string;
            custodyType: string;
            address: string;
            blockchain: string;
            accountType: string;
            updateDate: string;
            createDate: string;
        }>;
    };
}

interface GetBalanceResponse {
    data: {
        tokenBalances: Array<{
            token: {
                id: string;
                blockchain: string;
                name: string;
                symbol: string;
                decimals: number;
            };
            amount: string;
            updateDate: string;
        }>;
    };
}

interface InitiateTransferRequest {
    source: {
        type: 'wallet';
        id: string;
    };
    destination: {
        type: 'blockchain';
        address: string;
        chain: string;
    };
    amounts: string[];
    tokenId: string;
    fee?: {
        type: 'level';
        config: {
            feeLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        };
    };
}

interface InitiateTransferResponse {
    data: {
        id: string;
        source: {
            type: string;
            id: string;
        };
        destination: {
            type: string;
            address: string;
            chain: string;
        };
        amounts: string[];
        nftTokenIds: string[];
        transactionType: string;
        custodyType: string;
        state: string;
        userId: string;
        createDate: string;
        updateDate: string;
    };
}

export class CircleAPIClient {
    private client: AxiosInstance;
    private walletSetId: string;

    constructor(config: CircleConfig) {
        this.walletSetId = config.walletSetId;
        this.client = axios.create({
            baseURL: config.baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('Circle API Error:', {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    code: error.response?.data?.code,
                });
                throw error;
            }
        );
    }

    /**
     * Create a new wallet for an agent
     * @param metadata - Agent metadata (name, refId)
     * @param blockchain - Blockchain to create wallet on (default: ARB-SEPOLIA for Arc)
     */
    async createWallet(
        metadata: { name: string; refId?: string },
        blockchain: string = 'ARB-SEPOLIA'
    ): Promise<CreateWalletResponse['data']['wallets'][0]> {
        const request: CreateWalletRequest = {
            walletSetId: this.walletSetId,
            blockchains: [blockchain],
            count: 1,
            metadata: [metadata],
        };

        const response = await this.client.post<CreateWalletResponse>(
            '/w3s/developer/wallets',
            request
        );

        return response.data.data.wallets[0];
    }

    /**
     * Get wallet balance
     * @param walletId - Circle wallet ID
     */
    async getBalance(walletId: string): Promise<GetBalanceResponse['data']['tokenBalances']> {
        const response = await this.client.get<GetBalanceResponse>(
            `/w3s/wallets/${walletId}/balances`
        );

        return response.data.data.tokenBalances;
    }

    /**
     * Initiate a transfer from a wallet
     * @param fromWalletId - Source wallet ID
     * @param toAddress - Destination blockchain address
     * @param amount - Amount to transfer (in token units, e.g., "10.50" for 10.50 USDC)
     * @param tokenId - Token ID (get from getBalance response)
     * @param chain - Destination chain
     */
    async initiateTransfer(
        fromWalletId: string,
        toAddress: string,
        amount: string,
        tokenId: string,
        chain: string = 'ARB-SEPOLIA'
    ): Promise<InitiateTransferResponse['data']> {
        const request: InitiateTransferRequest = {
            source: {
                type: 'wallet',
                id: fromWalletId,
            },
            destination: {
                type: 'blockchain',
                address: toAddress,
                chain: chain,
            },
            amounts: [amount],
            tokenId: tokenId,
            fee: {
                type: 'level',
                config: {
                    feeLevel: 'MEDIUM',
                },
            },
        };

        const response = await this.client.post<InitiateTransferResponse>(
            '/w3s/developer/transactions/transfer',
            request
        );

        return response.data.data;
    }

    /**
     * Get wallet details
     * @param walletId - Circle wallet ID
     */
    async getWallet(walletId: string) {
        const response = await this.client.get(`/w3s/wallets/${walletId}`);
        return response.data.data.wallet;
    }

    /**
     * List all wallets in the wallet set
     */
    async listWallets() {
        const response = await this.client.get('/w3s/wallets', {
            params: {
                walletSetId: this.walletSetId,
            },
        });
        return response.data.data.wallets;
    }
}

// Singleton instance
let circleClient: CircleAPIClient | null = null;

export function getCircleClient(): CircleAPIClient {
    if (!circleClient) {
        const apiKey = process.env.CIRCLE_API_KEY;
        const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
        const baseURL = process.env.CIRCLE_API_BASE_URL || 'https://api.circle.com/v1';

        if (!apiKey || !walletSetId) {
            throw new Error(
                'Circle API credentials not configured. Please set CIRCLE_API_KEY and CIRCLE_WALLET_SET_ID in .env'
            );
        }

        circleClient = new CircleAPIClient({
            apiKey,
            baseURL,
            walletSetId,
        });
    }

    return circleClient;
}

export const circleAPI = {
    createWallet: (metadata: { name: string; refId?: string }, blockchain?: string) =>
        getCircleClient().createWallet(metadata, blockchain),
    getBalance: (walletId: string) => getCircleClient().getBalance(walletId),
    initiateTransfer: (
        fromWalletId: string,
        toAddress: string,
        amount: string,
        tokenId: string,
        chain?: string
    ) => getCircleClient().initiateTransfer(fromWalletId, toAddress, amount, tokenId, chain),
    getWallet: (walletId: string) => getCircleClient().getWallet(walletId),
    listWallets: () => getCircleClient().listWallets(),
};
