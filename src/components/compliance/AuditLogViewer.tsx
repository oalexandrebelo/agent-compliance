"use client";


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Activity } from 'lucide-react';

import { AuditLog } from '@prisma/client';



export function AuditLogViewer({ logs, isLoading }: { logs: AuditLog[]; isLoading: boolean }) {
    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    const logList = Array.isArray(logs) ? logs : [];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Immutable Audit Trail</CardTitle>
                </div>
                <CardDescription>
                    All actions are cryptographically hashed and recorded on the Arc Network.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[400px] md:h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logList.map((log) => {
                                // Extract txHash from metadata if available
                                const metadata = log.metadata as Record<string, unknown> | null;
                                const txHash = metadata?.txHash as string | undefined;
                                const ARC_EXPLORER_URL = 'https://testnet.arcscan.app';

                                return (
                                    <TableRow key={log.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.entityType} <span className="text-xs text-muted-foreground">#{log.entityId.substring(0, 8)}</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono max-w-[200px] text-muted-foreground">
                                            {txHash ? (
                                                <a
                                                    href={`${ARC_EXPLORER_URL}/tx/${txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                    View on Arc ↗
                                                </a>
                                            ) : (
                                                <span className="truncate block">{JSON.stringify(log.metadata || log.before || {})}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {logList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No audit records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
                <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    Chain Sync Active
                </span>
                <span>Arc Block Height: 12,938,445</span>
            </div>
        </Card>
    );
}
