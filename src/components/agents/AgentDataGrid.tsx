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
    model: string; // e.g., GPT-4o
    purpose: string;
    status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED';
    complianceScore: number; // 0-100
    walletAddress: string;
}

export function AgentDataGrid({ agents, onDeepScan }: { agents: Agent[], onDeepScan: (agent: Agent) => void }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Identity</TableHead>
                    <TableHead>Brain Model</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Compliance Status</TableHead>
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
                            <Badge variant="outline" className="font-mono text-xs">{agent.model}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{agent.purpose}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {agent.status === 'ACTIVE' ? (
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                )}
                                <span className={agent.status === 'ACTIVE' ? "text-emerald-500" : "text-amber-500"}>
                                    {agent.status} ({agent.complianceScore}%)
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
