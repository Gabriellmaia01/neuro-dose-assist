import { useMemo } from "react";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";
import type { ReportRecommendationItem } from "@/lib/reportExports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportMedicationList } from "./ReportMedicationList";
import { ReportRecommendations } from "./ReportRecommendations";

type ChartPoint = {
    date: string;
    efficacy: number;
    dose: number;
};

function formatPeriodSummary(startDate?: Date, endDate?: Date): string {
    if (startDate && endDate) {
        const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
        return `${format(from, "dd/MM/yyyy")} a ${format(to, "dd/MM/yyyy")}`;
    }
    if (startDate) return `A partir de ${format(startDate, "dd/MM/yyyy")}`;
    if (endDate) return `Até ${format(endDate, "dd/MM/yyyy")}`;
    return "Todo o histórico disponível";
}

export function ReportPreview({
    loading,
    selectedPatient,
    patients,
    startDate,
    endDate,
    totalDoses,
    avgEfficacy,
    avgMood,
    avgEnergy,
    chartData,
    includeCharts,
    includeRecommendations,
    recommendations,
    medications,
}: {
    loading: boolean;
    selectedPatient: string;
    patients: Patient[];
    startDate?: Date;
    endDate?: Date;
    totalDoses: number;
    avgEfficacy: number;
    avgMood: number;
    avgEnergy: number;
    chartData: ChartPoint[];
    includeCharts: boolean;
    includeRecommendations: boolean;
    recommendations: ReportRecommendationItem[];
    medications: Medication[];
}) {
    const generatedAtLabel = useMemo(
        () => format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        []
    );

    const patientLabel =
        selectedPatient !== "all"
            ? patients.find((patient) => patient.id === selectedPatient)?.name || "Paciente selecionado"
            : "Todos os pacientes";

    const periodLabel = formatPeriodSummary(startDate, endDate);

    return (
        <article
            aria-label="Prévia do relatório clínico"
            className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6 sm:p-8"
        >
            {loading ? (
                <div className="py-20 flex items-center justify-center gap-3">
                    <Loader2
                        className="w-5 h-5 animate-spin text-[var(--nd-primary)]"
                        aria-hidden="true"
                    />
                    <span className="text-[14px] text-[var(--nd-text-secondary)]">
                        Preparando prévia do relatório clínico…
                    </span>
                </div>
            ) : (
                <>
                    {/* Cabeçalho institucional do documento (sem icon-tile-stack nem kicker acima do h2) */}
                    <header className="pb-5 border-b border-[var(--nd-border)] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="font-display text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-[var(--nd-text)]">
                                Relatório Clínico de Posologia e Eficácia
                            </h2>
                            <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1.5">
                                NeuroDose Assist · {patientLabel} · {periodLabel}
                            </p>
                        </div>
                        <p className="text-[12px] text-[var(--nd-text-secondary)] nd-tabular shrink-0">
                            Emitido em {generatedAtLabel}
                        </p>
                    </header>

                    {/* Resumo executivo tabular (sem cards gradientes aninhados) */}
                    <section className="py-5 border-b border-[var(--nd-border)]">
                        <h3 className="text-[15px] font-semibold text-[var(--nd-text)] mb-4">
                            Indicadores Consolidados
                        </h3>
                        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            <div>
                                <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                                    Doses registradas
                                </dt>
                                <dd className="text-[24px] font-semibold text-[var(--nd-text)] mt-1 nd-tabular">
                                    {totalDoses}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                                    Eficácia média
                                </dt>
                                <dd
                                    className={cn(
                                        "text-[24px] font-semibold mt-1 nd-tabular",
                                        totalDoses === 0
                                            ? "text-[var(--nd-text-secondary)]"
                                            : avgEfficacy >= 70
                                            ? "text-[var(--nd-success)]"
                                            : avgEfficacy >= 50
                                            ? "text-[var(--nd-warning)]"
                                            : "text-[var(--nd-error)]"
                                    )}
                                >
                                    {totalDoses > 0 ? `${avgEfficacy}%` : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                                    Humor médio (1–5)
                                </dt>
                                <dd className="text-[24px] font-semibold text-[var(--nd-text)] mt-1 nd-tabular">
                                    {avgMood > 0 ? `${avgMood}/5` : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                                    Energia média (0–10)
                                </dt>
                                <dd className="text-[24px] font-semibold text-[var(--nd-text)] mt-1 nd-tabular">
                                    {totalDoses > 0 ? `${avgEnergy}/10` : "—"}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* Evolução gráfica */}
                    {includeCharts && (
                        <section className="py-6 border-b border-[var(--nd-border)]">
                            <h3 className="text-[15px] font-semibold text-[var(--nd-text)] mb-4">
                                Evolução da Eficácia
                            </h3>
                            {chartData.length > 0 ? (
                                <EfficacyChart data={chartData} embedded />
                            ) : (
                                <p className="text-[13px] text-[var(--nd-text-secondary)] py-6">
                                    Não há registros suficientes no período selecionado para traçar a curva de eficácia.
                                </p>
                            )}
                        </section>
                    )}

                    {/* Recomendações clínicas */}
                    {includeRecommendations && (
                        <ReportRecommendations recommendations={recommendations} />
                    )}

                    {/* Medicamentos no recorte */}
                    <ReportMedicationList medications={medications} />
                </>
            )}
        </article>
    );
}
