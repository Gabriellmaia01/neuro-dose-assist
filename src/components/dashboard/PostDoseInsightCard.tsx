import { Clock, Utensils, AlertTriangle, Moon, Activity, CheckCircle, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostDoseInsight } from "@/services/aiService";

interface PostDoseInsightCardProps {
    insights: PostDoseInsight[];
    className?: string;
    compact?: boolean;
}

const iconMap = {
    clock: Clock,
    food: Utensils,
    alert: AlertTriangle,
    sleep: Moon,
    activity: Activity,
    check: CheckCircle,
    droplet: Droplet,
};

const priorityStyles = {
    info: {
        icon: "text-[var(--nd-primary)]",
        label: "text-[var(--nd-text-secondary)]",
    },
    warning: {
        icon: "text-[var(--nd-warning)]",
        label: "text-[var(--nd-warning)]",
    },
    success: {
        icon: "text-[var(--nd-success)]",
        label: "text-[var(--nd-success)]",
    },
};

const priorityLabels = {
    info: "Orientação",
    warning: "Atenção",
    success: "Adequado",
};

export function PostDoseInsightCard({
    insights,
    className,
    compact = false,
}: PostDoseInsightCardProps) {
    if (!insights || insights.length === 0) return null;

    // Ordenar: warnings primeiro, depois info, depois success
    const sortedInsights = [...insights].sort((a, b) => {
        const order = { warning: 0, info: 1, success: 2 };
        return order[a.priority] - order[b.priority];
    });

    // ── Compact mode: lista limpa com divisórias finas para diálogos (zero nested cards) ──
    if (compact) {
        return (
            <div className={cn("space-y-2.5", className)}>
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nd-text-secondary)]">
                        Orientações Clínicas
                    </h4>
                    <span className="text-[11px] text-[var(--nd-text-secondary)] tabular-nums">
                        {sortedInsights.length} itens
                    </span>
                </div>
                <ul className="divide-y divide-[var(--nd-border)]">
                    {sortedInsights.map((insight, index) => {
                        const Icon = iconMap[insight.icon] || CheckCircle;
                        const style = priorityStyles[insight.priority];
                        return (
                            <li
                                key={index}
                                className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0 text-xs"
                            >
                                <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", style.icon)} aria-hidden="true" />
                                <div className="min-w-0">
                                    <span className="font-medium text-[var(--nd-text)]">{insight.title}</span>
                                    <span className="text-[var(--nd-text-secondary)]"> — {insight.description}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    // ── Full mode: grade editorial limpa com divisórias finas (zero nested cards) ──
    return (
        <div className={cn("space-y-5", className)}>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                    <h3 className="font-display font-semibold text-[18px] text-[var(--nd-text)]">
                        Orientações Pós-Dose
                    </h3>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                        Pontos de acompanhamento farmacológico baseados na classe terapêutica e no estado subjetivo.
                    </p>
                </div>
                <span className="text-[12px] text-[var(--nd-text-secondary)] tabular-nums shrink-0">
                    {sortedInsights.length} observações
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {sortedInsights.map((insight, index) => {
                    const Icon = iconMap[insight.icon] || CheckCircle;
                    const style = priorityStyles[insight.priority];

                    return (
                        <div
                            key={index}
                            className="py-4 border-t border-[var(--nd-border)] flex items-start gap-3"
                        >
                            <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", style.icon)} aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="font-medium text-[14px] text-[var(--nd-text)] leading-snug">
                                        {insight.title}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-[11px] font-semibold uppercase tracking-[0.05em] shrink-0",
                                            style.label
                                        )}
                                    >
                                        {priorityLabels[insight.priority]}
                                    </span>
                                </div>
                                <p className="text-[13px] text-[var(--nd-text-secondary)] leading-relaxed mt-1">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
