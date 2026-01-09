"use client";

import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { toast } = useToast();

    const handleSaveSettings = () => {
        toast({
            title: "Settings Updated",
            description: "Your compliance settings have been saved successfully.",
            variant: "default",
        });
    };

    return (
        <AgentCommandShell>
            <div className="max-w-4xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Settings</h1>
                    <p className="text-muted-foreground">Configure automated risk rules and notification preferences.</p>
                </div>

                {/* Risk Thresholds */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Automated Risk Rules</CardTitle>
                        </div>
                        <CardDescription>Define thresholds for auto-approval and blocking.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Auto-Block Threshold (Risk Score 0-1)</Label>
                                <p className="text-sm font-medium leading-none">High Risk &quot;Auto-Block&quot;</p>
                                <p className="text-sm text-muted-foreground">Automatically freeze wallets with risk score &gt; 90.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Auto-Approve Threshold</Label>
                                <Input type="number" defaultValue="0.20" />
                                <p className="text-xs text-muted-foreground">Transactions below 0.20 are approved without review.</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Gemini &quot;Circuit Breaker&quot;</Label>
                                <p className="text-xs text-muted-foreground">Pause all agents if &gt;5 critical alerts occur in 1 hour.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Limits */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <CardTitle>Global Limits</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Max Daily Spend (USDC)</Label>
                            <Input defaultValue="100,000" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Require Multi-Sig &gt; $50k</Label>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Email on Critical Alerts</Label>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Slack Webhook Integration</Label>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
            </div>
        </AgentCommandShell>
    );
}
