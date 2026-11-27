import { Brain, Clock, Utensils, AlertTriangle, Moon, Activity, CheckCircle, Droplet } from "lucide-react";
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
        bg: "bg-[var(--nd-bg)]",
        border: "border-[var(--nd-border)]",
        icon: "text-[var(--nd-primary)]",
        badge: "bg-[var(--nd-muted)] text-[var(--nd-label)]",
    },
    warning: {
        bg: "bg-[var(--nd-warning-bg)]",
        border: "border-[var(--nd-border)]",
        icon: "text-[var(--nd-warning)]",
        badge: "bg-[var(--nd-warning-bg)] text-[var(--nd-warning)]",
    },
    success: {
        bg: "bg-[var(--nd-success-bg)]",
        border: "border-[var(--nd-border)]",
        icon: "text-[var(--nd-success)]",
        badge: "bg-[var(--nd-success-bg)] text-[var(--nd-success)]",
    },
};

const priorityLabels = {
    info: "Informação",
    warning: "Atenção",
    success: "Positivo",
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

    // ── Compact mode: tight list for dialogs ──
    if (compact) {
        return (
            <div className={cn("space-y-2", className)}>
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" aria-hidden="true" />
                    <h4 className="font-display font-semibold text-sm">Insights Clínicos</h4>
                    <span className="text-[11px] text-muted-foreground nd-tabular">({sortedInsights.length})</span>
                </div>
                <div className="space-y-1.5">
                    {sortedInsights.map((insight, index) => {
                        const Icon = iconMap[insight.icon] || CheckCircle;
                        const style = priorityStyles[insight.priority];
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-2 px-3 py-2 rounded-lg border text-xs",
                                    style.bg,
                                    style.border
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", style.icon)} aria-hidden="true" />
                                <div className="min-w-0">
                                    <span className="font-medium">{insight.title}</span>
                                    <span className="text-muted-foreground"> — {insight.description}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── Full mode: rich card grid ──
    return (
        <div className={cn("space-y-4 animate-fade-up", className)}>
            {/* Header */}
            <div>
                <h3 className="font-display font-semibold text-[16px] text-[var(--nd-text)]">
                    Insights Pós-Dose
                </h3>
                <p className="text-[12px] text-[var(--nd-text-secondary)] mt-0.5">
                    Gerado com base no medicamento administrado e no estado subjetivo atual.
                </p>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedInsights.map((insight, index) => {
                    const Icon = iconMap[insight.icon] || CheckCircle;
                    const style = priorityStyles[insight.priority];

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative p-4 rounded-xl border transition-colors duration-200",
                                style.bg,
                                style.border
                            )}
                            style={{
                                animationDelay: `${index * 80}ms`,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", style.icon)} aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-medium text-sm leading-tight">
                                            {insight.title}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                                                style.badge
                                            )}
                                        >
                                            {priorityLabels[insight.priority]}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
