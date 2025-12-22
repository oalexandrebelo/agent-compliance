"use client";

import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { InterventionModal } from '@/components/compliance/InterventionModal';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const mockAlerts = [
    { id: '1', title: 'Structuring / Layering Attempt', severity: 'CRITICAL', agent: 'Agent_007', time: '10 mins ago', status: 'PENDING' },
    { id: '2', title: 'High Velocity Trading', severity: 'HIGH', agent: 'Sniper_Bot_X', time: '1 hour ago', status: 'REVIEWING' },
    { id: '3', title: 'New Unverified Counterparty', severity: 'MEDIUM', agent: 'AlphaTrade_01', time: '3 hours ago', status: 'RESOLVED' },
];

export default function AlertsPage() {
    const { toast } = useToast();
    const [alerts, setAlerts] = useState(mockAlerts);

    const handleApprove = (alertId: string) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
        toast({
            title: "Alert Approved",
            description: "Transaction has been approved and executed.",
            variant: "default",
        });
    };

    const handleBlock = (alertId: string) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
        toast({
            title: "Transaction Blocked",
            description: "Agent wallet has been quarantined for review.",
            variant: "destructive",
        });
    };

    return (
        <AgentCommandShell>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Alerts</h1>
                    <p className="text-muted-foreground">Review and adjudicate suspicious activity detected by Gemini AI.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search alerts..." className="pl-8" />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More Filters</Button>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className="border-l-4 border-l-red-500">
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                                            {alert.severity}
                                        </Badge>
                                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Triggered by <span className="text-foreground font-medium">{alert.agent}</span> • {alert.time}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <InterventionModal trigger={
                                        <Button variant="outline" className="text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
                                            Freeze Wallet
                                        </Button>
                                    } />

                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => handleApprove(alert.id)}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleBlock(alert.id)}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" /> Block
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AgentCommandShell>
    );
}
