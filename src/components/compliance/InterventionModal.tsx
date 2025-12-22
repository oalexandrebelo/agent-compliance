"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Lock } from "lucide-react";

export function InterventionModal({ trigger }: { trigger: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFreeze = async () => {
        setIsSubmitting(true);
        // Simulate API call to Circle & Smart Contract
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsOpen(false);
        // toast({ title: "Agent Freezed", description: "Audit log #0x82...99 created on Arc Network." });

    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-red-500/20">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Emergency Intervention</DialogTitle>
                    </div>
                    <DialogDescription>
                        You are about to freeze the programmable wallet for this agent. This action is recorded on the AuditLog contract.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Enter audit reason (required for immutable log)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleFreeze}
                        disabled={!reason || isSubmitting}
                    >
                        {isSubmitting ? "Executing..." : (
                            <>
                                <Lock className="mr-2 h-4 w-4" /> Freeze Funds
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
