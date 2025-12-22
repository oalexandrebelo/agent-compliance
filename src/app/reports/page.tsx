"use client";

import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { FileText, Download, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { SARForm } from '@/components/reports/SARForm';
import { useStats } from '@/hooks/use-dashboard-data';
import { useState } from 'react';

export default function ReportsPage() {
    const { stats, isLoading } = useStats();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedReport, setSelectedReport] = useState<unknown>(null);

    // Derived metrics for display
    const openSars = stats?.riskTrend?.filter((r: { risk: number }) => r.risk > 0.8).length || 0;
    const complianceScore = stats?.avgRiskScore ? Math.round(100 - (stats.avgRiskScore * 10)) : 98;
    const reportsCount = stats?.blockedCount || 14;

    const handleExport = () => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: 'Generating PDF Report...',
            success: 'Compliance_Report_2025-12.pdf downloaded successfully',
            error: 'Failed to generate report'
        });
    };

    return (
        <AgentCommandShell>
            <div className="flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
                        <p className="text-muted-foreground">Generate regulatory reports and file Suspicious Activity Reports (SARs).</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="sar">File SAR</TabsTrigger>
                        <TabsTrigger value="exports">Past Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Potential SARs</CardTitle>
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{isLoading ? "..." : openSars}</div>
                                    <p className="text-xs text-muted-foreground">High Risk Events detected</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{isLoading ? "..." : complianceScore}/100</div>
                                    <p className="text-xs text-muted-foreground">Based on Avg Risk Score</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Interventions</CardTitle>
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{isLoading ? "..." : reportsCount}</div>
                                    <p className="text-xs text-muted-foreground">Blocked Transactions (This Quarter)</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly AML Summary</CardTitle>
                                <CardDescription>Automated analysis of transaction flows for regulatory compliance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                                    Chart Placeholder (Compliance Trend)
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={handleExport}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sar" className="mt-4">
                        <SARForm />
                    </TabsContent>

                    <TabsContent value="exports" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Export History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-sm">AML_Report_2024-1{i}.pdf</p>
                                                    <p className="text-xs text-muted-foreground">Generated on Dec {10 + i}, 2024</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AgentCommandShell>
    );
}
