import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';
import { Agent, Transaction, Alert } from '@prisma/client';

// Fetcher adapter for SWR to use our class-based client
// We cast to any here to satisfy SWR's strictly typed generic overloads.
// The app safety comes from useSWR<T> generics.
export const fetcher = <T>(url: string) => apiClient.get<T>(url);

export function useAgents() {
    const { data, error, isLoading, mutate } = useSWR<Agent[]>('/api/agents', fetcher, {
        refreshInterval: 5000,
    });

    return {
        agents: data || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useTransactions() {
    const { data, error, isLoading, mutate } = useSWR<Transaction[]>('/api/transactions', fetcher, {
        refreshInterval: 2000,
    });

    return {
        transactions: data || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useAlerts() {
    const { data, error, isLoading, mutate } = useSWR<Alert[]>('/api/alerts', fetcher);

    return {
        alerts: data || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useStats() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, isLoading, mutate } = useSWR<any>('/api/stats', fetcher);

    return {
        stats: data || {
            totalVolume: 0,
            activeAgents: 0,
            avgRiskScore: 0,
            blockedCount: 0,
            riskTrend: []
        },
        isLoading,
        isError: error,
        mutate
    };
}


