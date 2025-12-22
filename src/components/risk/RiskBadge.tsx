import { Badge } from "@/components/ui/badge";

export type RiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const riskMap: Record<RiskLevel, { color: string, label: string }> = {
    SAFE: { color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25", label: "Safe" },
    LOW: { color: "bg-blue-500/15 text-blue-500 border-blue-500/20 hover:bg-blue-500/25", label: "Low" },
    MEDIUM: { color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/25", label: "Medium" },
    HIGH: { color: "bg-orange-500/15 text-orange-500 border-orange-500/20 hover:bg-orange-500/25", label: "High" },
    CRITICAL: { color: "bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25", label: "Critical" },
};

export function RiskBadge({ score }: { score: number }) {
    let level: RiskLevel = "SAFE";
    if (score > 0.9) level = "CRITICAL";
    else if (score > 0.7) level = "HIGH";
    else if (score > 0.4) level = "MEDIUM";
    else if (score > 0.1) level = "LOW";

    const config = riskMap[level];

    return (
        <Badge variant="outline" className={`${config.color} uppercase text-[10px] tracking-wider font-bold px-2 py-0.5`}>
            {level} ({Math.round(score * 100)})
        </Badge>
    );
}
