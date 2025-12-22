"use client";

import { useState } from 'react';
import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { AgentDataGrid } from '@/components/agents/AgentDataGrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
// import { Progress } from "@/components/ui/skeleton"; // Removed unused import
import { useAgents } from '@/hooks/use-dashboard-data';

export default function AgentsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const { agents, isLoading } = useAgents();

    return (
        <AgentCommandShell>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Registry</h1>
                    <p className="text-muted-foreground">Manage authorized autonomous agents and their permissions.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Deploy New Agent
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Agents</CardTitle>
                    <CardDescription>Real-time status of all registered agent wallets.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <AgentDataGrid
                            agents={agents}
                            onDeepScan={(agent) => setSelectedAgent(agent)}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Gemini Deep Scan Drawer */}
            <Sheet open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Gemini Deep Scan Analysis</SheetTitle>
                        <SheetDescription>
                            Analyzing behavior patterns for {selectedAgent?.name}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Compliance Trust Score</h4>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${selectedAgent?.riskScore < 0.3 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${(1 - (selectedAgent?.riskScore || 0)) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{Math.round((1 - (selectedAgent?.riskScore || 0)) * 100)}/100 verified on-chain</span>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Gemini Assessment</h4>
                            <div className="p-4 bg-muted/50 rounded-lg text-sm text-foreground space-y-2">
                                <p><strong>Model Behavior:</strong> Agent uses {selectedAgent?.model || 'Standard Model'}. Transaction frequency aligns with expected profile.</p>
                                <p><strong>Risk Factors:</strong> {selectedAgent?.riskScore > 0.5 ? 'High frequency of interactions with unverified pools.' : 'None detected in last 24h.'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                Recent Audit Logs
                                <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1 rounded">ARC NETWORK</span>
                            </h4>
                            <ul className="text-xs space-y-2 text-muted-foreground">
                                <li>• Wallet created {new Date(selectedAgent?.createdAt).toLocaleDateString()}</li>
                            </ul>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </AgentCommandShell>
    );
}
