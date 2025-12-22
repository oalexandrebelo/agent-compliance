"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Box } from "lucide-react";

interface Transaction {
    id: string;
    agent: {
        name: string;
        walletId: string;
    };
    amount: string;
    currency: string;
    toAddress: string;
    riskScore: number | null;
    status: string;
    createdAt: string;
}

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((tx) => (
                    <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                                    <Box className="h-3 w-3 text-primary" />
                                </div>
                                {tx.agent.name}
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {tx.toAddress.substring(0, 6)}...{tx.toAddress.substring(38)}
                            </div>
                        </TableCell>
                        <TableCell>
                            {parseFloat(tx.amount).toLocaleString()} <span className="text-xs text-muted-foreground">{tx.currency}</span>
                        </TableCell>
                        <TableCell>
                            <RiskBadge score={tx.riskScore || 0} />
                        </TableCell>
                        <TableCell>
                            <Badge variant={tx.status === 'APPROVED' ? 'default' : tx.status === 'BLOCKED' ? 'destructive' : 'secondary'} className="text-[10px]">
                                {tx.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
