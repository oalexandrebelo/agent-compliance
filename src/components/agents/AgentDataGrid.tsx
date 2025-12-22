"use client";

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldCheck, ShieldAlert, PauseCircle } from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Agent {
    id: string;
    name: string;
    model?: string; // Optional or mapped
    description: string | null; // was purpose
    status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'QUARANTINE' | 'ARCHIVED'; // Match enum
    riskScore?: number; // was complianceScore (mapped from trustScore?) 
    // Actually schema has trustScore (0.5). High trust = low risk? 
    // Or riskScore? Schema has riskScores relation but Agent has trustScore.
    // Let's use trustScore.
    trustScore: number;
    walletAddress: string;
}

export function AgentDataGrid({ agents, onDeepScan }: { agents: Agent[], onDeepScan: (agent: Agent) => void }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Identity</TableHead>
                    <TableHead>Brain Model</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {agents.map((agent) => (
                    <TableRow key={agent.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`} />
                                    <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{agent.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{agent.walletAddress.substring(0, 6)}...</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">{agent.model || 'Gemini Pro'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{agent.description || 'No description'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {agent.status === 'ACTIVE' ? (
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                )}
                                <span className={agent.status === 'ACTIVE' ? "text-emerald-500" : "text-amber-500"}>
                                    {agent.status} ({Math.round(agent.trustScore * 100)}%)
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onDeepScan(agent)}>
                                        Gemini Deep Scan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">
                                        <PauseCircle className="mr-2 h-4 w-4" /> Freeze Agent
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
