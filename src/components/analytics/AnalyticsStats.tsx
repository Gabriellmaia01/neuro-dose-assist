import { Activity, Brain, Minus, Pill, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { AnalyticsMetrics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function AnalyticsStatCard({
    label,
    value,
    icon,
    borderColor,
}: {
    label: string;
    value: ReactNode;
    icon: ReactNode;
    borderColor: string;
}) {
    return (
        <div className={cn("glass-card rounded-xl p-4 border-l-4", borderColor)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {label}
                    </p>
                    <div className="mt-1">{value}</div>
                </div>
                {icon}
            </div>
        </div>
    );
}

function getTrendContent(direction: "up" | "down" | "stable") {
    const trend = {
        up: {
            icon: <TrendingUp className="w-4 h-4 text-success" />,
            text: "Alta",
            textColor: "text-success",
        },
        down: {
            icon: <TrendingDown className="w-4 h-4 text-destructive" />,
            text: "Queda",
            textColor: "text-destructive",
        },
        stable: {
            icon: <Minus className="w-4 h-4 text-muted-foreground" />,
            text: "Estável",
            textColor: "text-muted-foreground",
        },
    };
    return trend[direction];
}

function getThresholdColor(value: number, highThreshold: number, mediumThreshold: number) {
    if (value >= highThreshold) return "text-success";
    if (value >= mediumThreshold) return "text-warning";
    return "text-destructive";
}

export function AnalyticsStats({ metrics }: { metrics: AnalyticsMetrics }) {
    const trend = getTrendContent(metrics.trendDirection);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnalyticsStatCard
                label="Total Doses"
                value={<p className="text-2xl font-display font-bold">{metrics.totalDoses}</p>}
                icon={<Pill className="w-8 h-8 text-primary/60" />}
                borderColor="border-l-primary"
            />
            <AnalyticsStatCard
                label="Pacientes"
                value={<p className="text-2xl font-display font-bold">{metrics.totalPatients}</p>}
                icon={<Users className="w-8 h-8 text-info/60" />}
                borderColor="border-l-info"
            />
            <AnalyticsStatCard
                label="Eficácia"
                value={
                    <p className={cn("text-2xl font-display font-bold", getThresholdColor(metrics.avgEfficacy, 70, 50))}>
                        {metrics.avgEfficacy}%
                    </p>
                }
                icon={<Activity className="w-8 h-8 text-success/60" />}
                borderColor="border-l-success"
            />
            <AnalyticsStatCard
                label="Adesão"
                value={
                    <p className={cn("text-2xl font-display font-bold", getThresholdColor(metrics.adherenceRate, 80, 60))}>
                        {metrics.adherenceRate}%
                    </p>
                }
                icon={<Brain className="w-8 h-8 text-purple-500/60" />}
                borderColor="border-l-purple-500"
            />
            <AnalyticsStatCard
                label="Alertas"
                value={
                    <p className={cn(
                        "text-2xl font-display font-bold",
                        metrics.riskAlerts > 0 ? "text-warning" : "text-success"
                    )}>
                        {metrics.riskAlerts}
                    </p>
                }
                icon={<Sparkles className="w-8 h-8 text-warning/60" />}
                borderColor="border-l-warning"
            />
            <AnalyticsStatCard
                label="Tendência"
                value={
                    <div className="flex items-center gap-2">
                        {trend.icon}
                        <span className={cn("text-lg font-display font-bold", trend.textColor)}>
                            {trend.text}
                        </span>
                    </div>
                }
                icon={null}
                borderColor="border-l-accent"
            />
        </div>
    );
}
