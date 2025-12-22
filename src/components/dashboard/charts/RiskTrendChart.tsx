"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskData {
    time: string;
    risk: number;
}

interface RiskTrendChartProps {
    data: RiskData[];
}

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No trend data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
