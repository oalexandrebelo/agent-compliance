"use client";

import { AgentCommandShell } from "@/components/layout/AgentCommandShell";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-dashboard-data";
import { Loader2 } from "lucide-react";

export default function TransactionsPage() {
    const { transactions, isLoading } = useTransactions();

    return (
        <AgentCommandShell>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Transactions</h1>
                    <p className="text-muted-foreground mt-2">
                        Real-time view of all agent transactions across the network
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            Monitor all agent transactions with risk scores and compliance status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <TransactionTable transactions={transactions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AgentCommandShell>
    );
}
