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
                    <h4 className="font-display font-semibold text-sm">Insights da IA</h4>
                    <span className="text-[10px] text-muted-foreground">({sortedInsights.length})</span>
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
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-sm">
                    <Brain className="w-4.5 h-4.5 text-primary-foreground" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="font-display font-semibold text-base">
                        Insights Pós-Dose
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Gerado pela IA com base no seu medicamento e estado atual
                    </p>
                </div>
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
                                "relative p-4 rounded-xl border transition-all duration-200",
                                "hover:shadow-md hover:-translate-y-0.5",
                                style.bg,
                                style.border
                            )}
                            style={{
                                animationDelay: `${index * 80}ms`,
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        style.bg
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", style.icon)} aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm leading-tight">
                                            {insight.title}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0",
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
