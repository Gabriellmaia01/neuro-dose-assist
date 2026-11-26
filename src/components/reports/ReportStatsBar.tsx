import { Activity, Brain, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportStatsBar({
    totalDoses,
    avgEfficacy,
    uniqueMedications,
    lowMoodCount,
}: {
    totalDoses: number;
    avgEfficacy: number;
    uniqueMedications: number;
    lowMoodCount: number;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="nd-card p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Total de doses</p>
                    <Pill className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{totalDoses}</p>
            </div>
            <div className="nd-card p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Eficácia média</p>
                    <Activity className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className={cn(
                    "text-[24px] font-semibold tracking-[-0.02em] mt-2 nd-tabular",
                    avgEfficacy > 70 ? "text-[var(--nd-success)]" : avgEfficacy > 50 ? "text-[var(--nd-warning)]" : "text-[var(--nd-error)]"
                )}>
                    {avgEfficacy}%
                </p>
            </div>
            <div className="nd-card p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Medicamentos</p>
                    <Brain className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{uniqueMedications}</p>
            </div>
            <div className="nd-card p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Alertas</p>
                    <Activity className="w-4 h-4 text-[var(--nd-warning)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <p className={cn(
                    "text-[24px] font-semibold tracking-[-0.02em] mt-2 nd-tabular",
                    lowMoodCount > 0 ? "text-[var(--nd-warning)]" : "text-[var(--nd-text)]"
                )}>
                    {lowMoodCount}
                </p>
            </div>
        </div>
    );
}
