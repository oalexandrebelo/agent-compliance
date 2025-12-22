"use client";

import useSWR from 'swr';
import { fetcher } from '@/hooks/use-dashboard-data';
import { AuditLog } from '@prisma/client';
import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { AuditLogViewer } from '@/components/compliance/AuditLogViewer';

export default function AuditPage() {
    const { data: logs, isLoading } = useSWR<AuditLog[]>('/api/audit-logs', fetcher);

    return (
        <AgentCommandShell>
            <div className="h-[calc(100vh-100px)]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Audit</h1>
                    <p className="text-muted-foreground">View and verify immutable system logs.</p>
                </div>
                <AuditLogViewer logs={logs || []} isLoading={isLoading} />
            </div>
        </AgentCommandShell>
    );
}
