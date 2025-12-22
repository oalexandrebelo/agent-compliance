import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[140px]" />
            </CardContent>
        </Card>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {/* Pulse / Anomaly Section */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                <Skeleton className="lg:col-span-3 h-[140px] rounded-xl" />
                <Skeleton className="h-[140px] rounded-xl" />
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>

            {/* Charts & Tables */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <Skeleton className="h-[350px] rounded-xl" />
                </div>
                <div className="lg:col-span-3">
                    <Skeleton className="h-[350px] rounded-xl" />
                </div>
            </div>
        </div>
    )
}
