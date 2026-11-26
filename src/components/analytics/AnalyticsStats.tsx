import { Activity, Brain, Minus, Pill, Sparkles, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { AnalyticsMetrics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function AnalyticsStatCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon: ReactNode;
}) {
    return (
        <div className="nd-card p-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-[var(--nd-text-secondary)] truncate">
                    {label}
                </p>
                {icon && (
                    <span className="text-[var(--nd-icon)] shrink-0" aria-hidden="true">
                        {icon}
                    </span>
                )}
            </div>
            <div className="mt-2">{value}</div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <AnalyticsStatCard
                label="Total de doses"
                value={<p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] nd-tabular">{metrics.totalDoses}</p>}
                icon={<Pill className="w-4 h-4" strokeWidth={1.5} />}
            />
            <AnalyticsStatCard
                label="Pacientes"
                value={<p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] nd-tabular">{metrics.totalPatients}</p>}
                icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
            />
            <AnalyticsStatCard
                label="Eficácia"
                value={
                    <p className={cn("text-[24px] font-semibold tracking-[-0.02em] nd-tabular", getThresholdColor(metrics.avgEfficacy, 70, 50))}>
                        {metrics.avgEfficacy}%
                    </p>
                }
                icon={<Activity className="w-4 h-4" strokeWidth={1.5} />}
            />
            <AnalyticsStatCard
                label="Adesão"
                value={
                    <p className={cn("text-[24px] font-semibold tracking-[-0.02em] nd-tabular", getThresholdColor(metrics.adherenceRate, 80, 60))}>
                        {metrics.adherenceRate}%
                    </p>
                }
                icon={<Brain className="w-4 h-4" strokeWidth={1.5} />}
            />
            <AnalyticsStatCard
                label="Alertas"
                value={
                    <p className={cn(
                        "text-[24px] font-semibold tracking-[-0.02em] nd-tabular",
                        metrics.riskAlerts > 0 ? "text-warning" : "text-success"
                    )}>
                        {metrics.riskAlerts}
                    </p>
                }
                icon={<Sparkles className="w-4 h-4" strokeWidth={1.5} />}
            />
            <AnalyticsStatCard
                label="Tendência"
                value={
                    <div className="flex items-center gap-1.5">
                        {trend.icon}
                        <span className={cn("text-[18px] font-semibold tracking-[-0.01em]", trend.textColor)}>
                            {trend.text}
                        </span>
                    </div>
                }
                icon={null}
            />
        </div>
    );
}
