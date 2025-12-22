"use client";

import { AgentCommandShell } from '@/components/layout/AgentCommandShell';
import { AuditLogViewer } from '@/components/compliance/AuditLogViewer';

export default function AuditPage() {
    return (
        <AgentCommandShell>
            <div className="h-[calc(100vh-100px)]">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Audit</h1>
                    <p className="text-muted-foreground">View and verify immutable system logs.</p>
                </div>
                <AuditLogViewer />
            </div>
        </AgentCommandShell>
    );
}
