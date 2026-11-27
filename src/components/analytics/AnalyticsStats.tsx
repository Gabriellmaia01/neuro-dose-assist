import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { AnalyticsMetrics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function getTrendContent(direction: "up" | "down" | "stable") {
    const trend = {
        up: {
            icon: <TrendingUp className="w-4 h-4 text-[var(--nd-success)]" aria-hidden="true" />,
            text: "Alta",
            textColor: "text-[var(--nd-success)]",
        },
        down: {
            icon: <TrendingDown className="w-4 h-4 text-[var(--nd-error)]" aria-hidden="true" />,
            text: "Queda",
            textColor: "text-[var(--nd-error)]",
        },
        stable: {
            icon: <Minus className="w-4 h-4 text-[var(--nd-text-secondary)]" aria-hidden="true" />,
            text: "Estável",
            textColor: "text-[var(--nd-text-secondary)]",
        },
    };
    return trend[direction];
}

function getThresholdColor(value: number, highThreshold: number, mediumThreshold: number) {
    if (value >= highThreshold) return "text-[var(--nd-success)]";
    if (value >= mediumThreshold) return "text-[var(--nd-warning)]";
    return "text-[var(--nd-error)]";
}

export function AnalyticsStats({ metrics }: { metrics: AnalyticsMetrics }) {
    const trend = getTrendContent(metrics.trendDirection);

    return (
        <section
            aria-label="Indicadores analíticos consolidados"
            className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--nd-border)]"
        >
            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Total de doses
                </p>
                <p className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--nd-text)] mt-1 nd-tabular">
                    {metrics.totalDoses}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Pacientes
                </p>
                <p className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--nd-text)] mt-1 nd-tabular">
                    {metrics.totalPatients}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Eficácia
                </p>
                <p className={cn("text-[24px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular", getThresholdColor(metrics.avgEfficacy, 70, 50))}>
                    {metrics.avgEfficacy}%
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Adesão
                </p>
                <p className={cn("text-[24px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular", getThresholdColor(metrics.adherenceRate, 80, 60))}>
                    {metrics.adherenceRate}%
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Alertas
                </p>
                <p className={cn(
                    "text-[24px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular",
                    metrics.riskAlerts > 0 ? "text-[var(--nd-warning)]" : "text-[var(--nd-success)]"
                )}>
                    {metrics.riskAlerts}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Tendência
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                    {trend.icon}
                    <span className={cn("text-[18px] font-semibold leading-tight tracking-[-0.01em]", trend.textColor)}>
                        {trend.text}
                    </span>
                </div>
            </div>
        </section>
    );
}
