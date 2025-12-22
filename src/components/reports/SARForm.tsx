"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

const sarSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
    activityDate: z.string().refine((val) => new Date(val) <= new Date(), {
        message: "Activity date cannot be in the future",
    }),
    suspicionType: z.enum(['structuring', 'identity', 'laundering', 'sanctions']),
    narrative: z.string().min(50, "Narrative must be at least 50 characters detailed"),
});

type SARFormData = z.infer<typeof sarSchema>;

export function SARForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SARFormData>({
        resolver: zodResolver(sarSchema)
    });

    const handleAIGenerate = async () => {
        const address = watch('walletAddress');
        const date = watch('activityDate');

        if (!address || !date) {
            toast.error("Please enter Wallet Address and Date first");
            return;
        }

        const toastId = toast.loading("Gemini is analyzing blockchain data...");

        try {
            // In a real app, this calls an API route which calls server-side Gemini
            // For now, we simulate the server response
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Mock AI Response
            setValue('narrative', `SUSPICIOUS ACTIVITY REPORT\n\nSUBJECT: ${address}\nDATE: ${date}\n\nNARRATIVE:\nOn the date specified, the subject address ${address} engaged in patterns consistent with structuring (smurfing). Multiple inbound transactions just below the reporting threshold were detected within a 24-hour window. This behavior is indicative of attempts to evade AML controls.`);
            setValue('suspicionType', 'structuring');

            toast.dismiss(toastId);
            toast.success("SAR Auto-Filled by Gemini");
        } catch {
            toast.dismiss(toastId);
            toast.error("AI Generation Failed");
        }
    };

    const onSubmit = async () => {
        setIsSubmitting(true);

        // Simulate API call and blockchain logging
        try {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Fake network delay
            // In a real app, this would POST to /api/reports/sar with data

            toast.success("SAR-29384 Submitted Successfully", {
                description: "The report has been cryptographically hashed and logged to the Arc Network audit trail."
            });
        } catch {
            toast.error("Submission Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-red-500 flex items-center gap-2">
                            Start New Investigation
                        </CardTitle>
                        <CardDescription>
                            File a Suspicious Activity Report (SAR) with FinCEN. All fields are audited.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAIGenerate} type="button" className="border-amber-500 text-amber-600 hover:bg-amber-50 rounded-full">
                        ✨ Auto-Fill with Gemini
                    </Button>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subject Agent ID / Wallet</Label>
                            <Input
                                placeholder="0x..."
                                {...register('walletAddress')}
                                className={errors.walletAddress ? "border-red-500" : ""}
                            />
                            {errors.walletAddress && <p className="text-xs text-red-500">{errors.walletAddress.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Activity</Label>
                            <Input
                                type="date"
                                {...register('activityDate')}
                                className={errors.activityDate ? "border-red-500" : ""}
                            />
                            {errors.activityDate && <p className="text-xs text-red-500">{errors.activityDate.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Suspicion Type</Label>
                        <Select onValueChange={(val) => setValue('suspicionType', val as "structuring" | "identity" | "laundering" | "sanctions")}>
                            <SelectTrigger className={errors.suspicionType ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="structuring">Structuring / Smurfing</SelectItem>
                                <SelectItem value="identity">Identity Theft / Fraud</SelectItem>
                                <SelectItem value="laundering">Layering / Integration</SelectItem>
                                <SelectItem value="sanctions">Sanctions Evasion</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.suspicionType && <p className="text-xs text-red-500">{errors.suspicionType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Narrative Description</Label>
                        <Textarea
                            className={`min-h-[150px] ${errors.narrative ? "border-red-500" : ""}`}
                            placeholder="Describe the suspicious activity in detail... (Min 50 chars)"
                            {...register('narrative')}
                        />
                        {errors.narrative && <p className="text-xs text-red-500">{errors.narrative.message}</p>}
                        <p className="text-xs text-muted-foreground">
                            Include who, what, where, when, why, and how.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/20 p-4">
                    <Button variant="ghost" type="button">Cancel</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Encrypting...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit to FinCEN
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
