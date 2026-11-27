import { cn } from "@/lib/utils";
import { PredictiveInsights } from "@/lib/analytics";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
    Tooltip,
} from "recharts";

interface PredictiveCardProps {
    insights: PredictiveInsights;
    className?: string;
}

export function PredictiveCard({ insights, className }: PredictiveCardProps) {
    const getRiskColor = (score: number) => {
        if (score < 30) return "text-[var(--nd-success)]";
        if (score < 60) return "text-[var(--nd-warning)]";
        return "text-[var(--nd-error)]";
    };

    const getRiskLabel = (score: number) => {
        if (score < 30) return "Baixo";
        if (score < 60) return "Moderado";
        return "Elevado";
    };

    const getBarColor = (efficacy: number) => {
        if (efficacy >= 80) return "hsl(var(--success))";
        if (efficacy >= 60) return "hsl(var(--primary))";
        if (efficacy >= 40) return "hsl(var(--warning))";
        return "hsl(var(--destructive))";
    };

    return (
        <section className={cn("rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6 divide-y divide-[var(--nd-border)]", className)}>
            {/* Header */}
            <header className="pb-4">
                <h2 className="text-[16px] font-semibold text-[var(--nd-text)]">
                    Projeção Clínica
                </h2>
                <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                    Estimativa de adesão, risco e resposta terapêutica para os próximos 7 dias.
                </p>
            </header>

            {/* Main metrics (sem cards aninhados) */}
            <dl className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                        Previsão de adesão (7 dias)
                    </dt>
                    <dd className={cn(
                        "text-[28px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular",
                        insights.adherencePrediction >= 80
                            ? "text-[var(--nd-success)]"
                            : insights.adherencePrediction >= 60
                            ? "text-[var(--nd-primary)]"
                            : "text-[var(--nd-warning)]"
                    )}>
                        {insights.adherencePrediction}%
                    </dd>
                </div>

                <div>
                    <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                        Score de risco clínico
                    </dt>
                    <dd className="flex items-baseline gap-2 mt-1">
                        <span className={cn("text-[28px] font-semibold leading-tight tracking-[-0.02em] nd-tabular", getRiskColor(insights.riskScore))}>
                            {insights.riskScore}
                        </span>
                        <span className="text-[13px] text-[var(--nd-text-secondary)]">
                            · {getRiskLabel(insights.riskScore)}
                        </span>
                    </dd>
                </div>
            </dl>

            {/* Weekly Forecast Chart */}
            <div className="py-5">
                <h3 className="text-[14px] font-semibold text-[var(--nd-text)] mb-4">
                    Previsão Semanal de Eficácia
                </h3>

                <ResponsiveContainer width="100%" height={132}>
                    <BarChart data={insights.weeklyForecast} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: 12,
                                color: "hsl(var(--foreground))",
                            }}
                            itemStyle={{
                                color: "hsl(var(--foreground))",
                            }}
                            labelStyle={{
                                color: "hsl(var(--foreground))",
                                fontWeight: 600,
                            }}
                            formatter={(value: number) => [`${value}%`, "Eficácia"]}
                            labelFormatter={(label) => `${label}`}
                        />
                        <Bar dataKey="predictedEfficacy" radius={[4, 4, 0, 0]}>
                            {insights.weeklyForecast.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.predictedEfficacy)}
                                    opacity={0.9}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Suggested Adjustment — only shown when relevant */}
            {insights.suggestedDoseAdjustment && (
                <div className="pt-5">
                    <p className="text-[13px] font-semibold text-[var(--nd-primary)]">
                        Sugestão de Ajuste
                    </p>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1 max-w-[68ch]">
                        {insights.suggestedDoseAdjustment}
                    </p>
                </div>
            )}
        </section>
    );
}
