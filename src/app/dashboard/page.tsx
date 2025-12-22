"use client";

import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { Activity, ShieldAlert, Wallet, Users, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats, useTransactions } from '@/hooks/use-dashboard-data';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy chart component
const RiskTrendChart = dynamic(() => import('@/components/dashboard/charts/RiskTrendChart'), {
    loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
    ssr: false // Recharts often causes hydration mismatch, so we disable SSR for it
});

export default function Dashboard() {
    const { stats, isLoading: statsLoading, mutate: mutateStats } = useStats();
    const { transactions, isLoading: txLoading, mutate: mutateTx } = useTransactions();

    useEffect(() => {
        const eventSource = new EventSource('/api/stream');

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);

                if (parsed.type === 'NEW_TRANSACTION') {
                    mutateTx(); // Refresh transactions
                    mutateStats(); // Refresh stats
                }
                else if (parsed.type === 'ALERT') {
                    toast.error(parsed.data.title, {
                        description: parsed.data.message
                    });
                }
            } catch (e) {
                console.error('SSE Error', e);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [mutateTx, mutateStats]);

    if (statsLoading) {
        return (
            <AgentCommandShell>
                <DashboardSkeleton />
            </AgentCommandShell>
        );
    }

    return (
        <AgentCommandShell>
            <div className="flex flex-col gap-6">
                {/* Rest of the dashboard content... this edit assumes we wrap the existing return or just replacing the initial check, 
                   but actually replacing the whole file is safer or referencing the existing structure. 
                   Let's assume I am replacing the render part primarily but retaining the imports above. 
                   Wait, I should import DashboardSkeleton first. */}

                {/* The Pulse: Anomaly Detection */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    {/* ... components ... */}
                    <Card className="lg:col-span-3 border-amber-500/20 bg-amber-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-amber-500 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Gemini Sentinel: Active Analysis
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">View Report</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-foreground">
                                    3 Suspicious Patterns
                                </div>
                                <span className="text-muted-foreground text-sm">detection active on mainnet</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                AI has flagged unusual velocity from <strong>High_Risk_Bot</strong>. Risk scores elevated by 15% in the last hour.
                            </p>
                        </CardContent>
                    </Card>

                    <StatCard
                        title="Protocol Pause"
                        value="Active"
                        icon={ShieldAlert}
                        description="System Operational"
                    />
                </div>

                {/* KPI Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Volume (24h)"
                        value={`$${parseInt(stats.totalVolume).toLocaleString()}`}
                        icon={Wallet}
                        trend={{ value: 12, positive: true }}
                    />
                    <StatCard
                        title="Active Agents"
                        value={stats.activeAgents.toString()}
                        icon={Users}
                        trend={{ value: 4, positive: true }}
                    />
                    <StatCard
                        title="Avg Risk Score"
                        value={stats.avgRiskScore.toString()}
                        icon={Activity}
                        trend={{ value: 2, positive: false }}
                    />
                    <StatCard
                        title="Blocked Txs"
                        value={stats.blockedCount.toString()}
                        icon={ShieldAlert}
                        description="Interventions"
                    />
                </div>

                {/* Charts & Tables */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                    {/* Live Chart */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Network Risk Intensity</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <RiskTrendChart data={stats?.riskTrend} />
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Live Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {txLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            ) : (
                                <TransactionTable transactions={transactions?.slice(0, 5)} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AgentCommandShell>
    );
}
