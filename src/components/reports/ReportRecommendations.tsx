import { cn } from "@/lib/utils";
import type { ReportRecommendationItem } from "@/lib/reportExports";

const DOT_TONE: Record<ReportRecommendationItem["severity"], string> = {
    info: "bg-[var(--nd-primary)]",
    warning: "bg-[var(--nd-warning)]",
    error: "bg-[var(--nd-error)]",
};

const TITLE_TONE: Record<ReportRecommendationItem["severity"], string> = {
    info: "text-[var(--nd-text)]",
    warning: "text-[var(--nd-warning)]",
    error: "text-[var(--nd-error)]",
};

export function ReportRecommendations({
    recommendations,
}: {
    recommendations: ReportRecommendationItem[];
}) {
    if (recommendations.length === 0) return null;

    return (
        <section className="py-6 border-b border-[var(--nd-border)]">
            <h3 className="text-[15px] font-semibold text-[var(--nd-text)] mb-4">
                Notas e Recomendações Clínicas
            </h3>
            <ul className="space-y-4">
                {recommendations.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                        <span
                            className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                DOT_TONE[item.severity]
                            )}
                            aria-hidden="true"
                        />
                        <div className="min-w-0 space-y-0.5">
                            <p className={cn("text-[14px] font-semibold", TITLE_TONE[item.severity])}>
                                {item.title}
                            </p>
                            <p className="text-[13px] text-[var(--nd-text-secondary)] leading-relaxed max-w-[65ch]">
                                {item.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
