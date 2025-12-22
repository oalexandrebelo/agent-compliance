
import { circleClient } from './client';
import { v4 as uuidv4 } from 'uuid';

export async function createWallet(description: string): Promise<string> {
    const idempotencyKey = uuidv4();
    try {
        const response = await circleClient.post<{ walletId: string }>('/wallets', {
            idempotencyKey,
            description,
        });
        return response.data.data.walletId;
    } catch (error: unknown) {
        throw new Error(`Failed to create wallet: ${(error as Error).message} `);
    }
}

export async function getWalletBalance(walletId: string) {
    try {
        const response = await circleClient.get(`/ wallets / ${walletId}/balances`);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(`Failed to get wallet balance: ${(error as Error).message}`);
    }
}

export async function createTransaction(walletId: string, destinationAddress: string, amount: string) {
    const idempotencyKey = uuidv4();
    try {
        const response = await circleClient.post('/transfers', {
            idempotencyKey,
            amount: {
                amount: amount,
                currency: 'USD'
            }
        });
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(`Failed to create transaction: ${(error as Error).message}`);
    }
}
