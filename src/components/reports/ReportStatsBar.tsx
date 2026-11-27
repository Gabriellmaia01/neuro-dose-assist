import { cn } from "@/lib/utils";

export function ReportStatsBar({
    totalDoses,
    avgEfficacy,
    uniqueMedications,
    lowMoodCount,
    loading = false,
}: {
    totalDoses: number;
    avgEfficacy: number;
    uniqueMedications: number;
    lowMoodCount: number;
    loading?: boolean;
}) {
    if (loading) {
        return (
            <section
                aria-label="Carregando métricas do relatório"
                className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--nd-border)]"
            >
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="px-5 py-4 space-y-2.5">
                        <div className="nd-skeleton h-3.5 w-24 rounded-md" />
                        <div className="nd-skeleton h-7 w-14 rounded-md" />
                    </div>
                ))}
            </section>
        );
    }

    return (
        <section
            aria-label="Resumo do recorte selecionado"
            className="rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--nd-border)]"
        >
            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Doses no recorte
                </p>
                <p className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--nd-text)] mt-1 nd-tabular">
                    {totalDoses}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Eficácia média
                </p>
                <p
                    className={cn(
                        "text-[24px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular",
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
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Medicamentos no período
                </p>
                <p className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--nd-text)] mt-1 nd-tabular">
                    {uniqueMedications}
                </p>
            </div>

            <div className="px-5 py-4">
                <p className="text-[12px] font-medium text-[var(--nd-text-secondary)]">
                    Alertas de humor (≤ 2/5)
                </p>
                <p
                    className={cn(
                        "text-[24px] font-semibold leading-tight tracking-[-0.02em] mt-1 nd-tabular",
                        lowMoodCount > 0 ? "text-[var(--nd-error)]" : "text-[var(--nd-text)]"
                    )}
                >
                    {lowMoodCount}
                </p>
            </div>
        </section>
    );
}
