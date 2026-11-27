import { cn } from "@/lib/utils";
import { PatientAnalytics } from "@/lib/analytics";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PatientInsightsProps {
    analytics: PatientAnalytics[];
    className?: string;
    maxVisible?: number;
}

const trendIcons = {
    improving: TrendingUp,
    declining: TrendingDown,
    stable: Minus,
};

const trendLabels = {
    improving: "Melhorando",
    declining: "Declinando",
    stable: "Estável",
};

const trendColors = {
    improving: "text-[var(--nd-success)]",
    declining: "text-[var(--nd-error)]",
    stable: "text-[var(--nd-text-secondary)]",
};

const riskDots = {
    low: { dot: "bg-[var(--nd-success)]", label: "Baixo risco" },
    medium: { dot: "bg-[var(--nd-warning)]", label: "Atenção" },
    high: { dot: "bg-[var(--nd-error)]", label: "Risco elevado" },
};

export function PatientInsights({
    analytics,
    className,
    maxVisible = 6,
}: PatientInsightsProps) {
    const visiblePatients = analytics.slice(0, maxVisible);

    if (analytics.length === 0) {
        return (
            <section className={cn("rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6", className)}>
                <h2 className="text-[16px] font-semibold text-[var(--nd-text)]">
                    Desempenho por Paciente
                </h2>
                <p className="text-[14px] text-[var(--nd-text-secondary)] mt-4">
                    Nenhum paciente com registros suficientes no período.
                </p>
            </section>
        );
    }

    return (
        <section className={cn("rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6", className)}>
            <div className="flex items-baseline justify-between gap-3 pb-4 border-b border-[var(--nd-border)]">
                <div>
                    <h2 className="text-[16px] font-semibold text-[var(--nd-text)]">
                        Desempenho por Paciente
                    </h2>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5">
                        {analytics.length} {analytics.length === 1 ? "paciente analisado" : "pacientes analisados"}
                    </p>
                </div>
            </div>

            <ul className="divide-y divide-[var(--nd-border)]">
                {visiblePatients.map((patient) => {
                    const TrendIcon = trendIcons[patient.trend];
                    const riskInfo = riskDots[patient.riskLevel];

                    return (
                        <li
                            key={patient.patientId}
                            className="py-4 grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(72px,auto))_auto] gap-3 md:gap-5 items-start md:items-center"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn("w-2 h-2 rounded-full shrink-0", riskInfo.dot)}
                                        aria-hidden="true"
                                    />
                                    <p className="text-[14px] font-semibold text-[var(--nd-text)] truncate">
                                        {patient.patientName}
                                    </p>
                                </div>
                                <p className="text-[12px] text-[var(--nd-text-secondary)] mt-0.5 nd-tabular">
                                    {patient.totalDoses} {patient.totalDoses === 1 ? "dose" : "doses"} · {riskInfo.label}
                                    {patient.bestDoseTime ? ` · Melhor horário ${patient.bestDoseTime}` : ""}
                                </p>
                            </div>

                            <div className="nd-tabular">
                                <span className="block text-[11px] text-[var(--nd-text-secondary)]">Eficácia</span>
                                <span
                                    className={cn(
                                        "text-[14px] font-semibold",
                                        patient.avgEfficacy >= 70
                                            ? "text-[var(--nd-success)]"
                                            : patient.avgEfficacy >= 50
                                            ? "text-[var(--nd-warning)]"
                                            : "text-[var(--nd-error)]"
                                    )}
                                >
                                    {patient.avgEfficacy}%
                                </span>
                            </div>

                            <div className="nd-tabular">
                                <span className="block text-[11px] text-[var(--nd-text-secondary)]">Humor</span>
                                <span className="text-[14px] font-semibold text-[var(--nd-text)]">
                                    {patient.avgMood}/5
                                </span>
                            </div>

                            <div className="nd-tabular">
                                <span className="block text-[11px] text-[var(--nd-text-secondary)]">Adesão</span>
                                <span
                                    className={cn(
                                        "text-[14px] font-semibold",
                                        patient.adherenceRate >= 80
                                            ? "text-[var(--nd-success)]"
                                            : patient.adherenceRate >= 60
                                            ? "text-[var(--nd-warning)]"
                                            : "text-[var(--nd-error)]"
                                    )}
                                >
                                    {patient.adherenceRate}%
                                </span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 text-[12px] font-medium md:justify-end">
                                <TrendIcon className={cn("w-3.5 h-3.5", trendColors[patient.trend])} aria-hidden="true" />
                                <span className={trendColors[patient.trend]}>
                                    {trendLabels[patient.trend]}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {analytics.length > maxVisible && (
                <p className="text-[13px] text-center text-[var(--nd-text-secondary)] pt-4 border-t border-[var(--nd-border)]">
                    +{analytics.length - maxVisible} outros pacientes no período
                </p>
            )}
        </section>
    );
}
