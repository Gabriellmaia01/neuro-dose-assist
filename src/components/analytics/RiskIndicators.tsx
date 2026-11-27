import { useState } from "react";
import { cn } from "@/lib/utils";
import { RiskAlert } from "@/lib/analytics";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    TrendingDown,
    Clock,
    Activity,
    Brain,
    CheckCircle2,
    XCircle,
    ChevronRight,
    User,
    ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RiskIndicatorsProps {
    alerts: RiskAlert[];
    className?: string;
    maxVisible?: number;
}

const riskIcons = {
    low_efficacy: Activity,
    low_mood: Brain,
    irregular_doses: Clock,
    low_adherence: AlertTriangle,
    declining_trend: TrendingDown
};

const riskLabels = {
    low_efficacy: "Eficácia Baixa",
    low_mood: "Humor Baixo",
    irregular_doses: "Doses Irregulares",
    low_adherence: "Adesão Baixa",
    declining_trend: "Tendência de Queda"
};

const severityStyles = {
    low: {
        bg: "bg-[var(--nd-muted)]/70",
        border: "border-[var(--nd-border)]",
        icon: "text-[var(--nd-primary)]",
        badge: "bg-primary/10 text-primary"
    },
    medium: {
        bg: "bg-[var(--nd-warning-bg)]",
        border: "border-[var(--nd-warning)]/25",
        icon: "text-[var(--nd-warning)]",
        badge: "bg-[var(--nd-warning)]/15 text-[var(--nd-warning)]"
    },
    high: {
        bg: "bg-[var(--nd-error-bg)]",
        border: "border-[var(--nd-error)]/25",
        icon: "text-[var(--nd-error)]",
        badge: "bg-[var(--nd-error)]/15 text-[var(--nd-error)]"
    }
};

function AlertCard({ alert }: { alert: RiskAlert }) {
    const style = severityStyles[alert.severity];
    const dotClass =
        alert.severity === "high"
            ? "bg-[var(--nd-error)]"
            : alert.severity === "medium"
            ? "bg-[var(--nd-warning)]"
            : "bg-[var(--nd-primary)]";

    return (
        <div className="flex items-start justify-between gap-3 py-3.5">
            <div className="flex items-start gap-2.5 min-w-0">
                <span
                    className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", dotClass)}
                    aria-hidden="true"
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[14px] text-[var(--nd-text)]">
                            {riskLabels[alert.type]}
                        </span>
                        <span className={cn("text-[11px] font-semibold", style.icon)}>
                            {alert.severity === "high"
                                ? "Alto"
                                : alert.severity === "medium"
                                ? "Médio"
                                : "Baixo"}
                        </span>
                    </div>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] mt-0.5 break-words">
                        {alert.message}
                    </p>
                    {alert.patientName && (
                        <p className="text-[12px] font-medium text-[var(--nd-text-secondary)] mt-1">
                            {alert.patientName}
                        </p>
                    )}
                </div>
            </div>

            <span className="text-[12px] text-[var(--nd-text-secondary)] shrink-0 nd-tabular">
                {format(new Date(alert.timestamp), "HH:mm", { locale: ptBR })}
            </span>
        </div>
    );
}

export function RiskIndicators({
    alerts,
    className,
    maxVisible = 5
}: RiskIndicatorsProps) {
    const [isAllAlertsOpen, setIsAllAlertsOpen] = useState(false);
    const visibleAlerts = alerts.slice(0, maxVisible);
    const hasMore = alerts.length > maxVisible;
    const remainingCount = alerts.length - maxVisible;

    const highCount = alerts.filter(a => a.severity === "high").length;
    const mediumCount = alerts.filter(a => a.severity === "medium").length;
    const lowCount = alerts.filter(a => a.severity === "low").length;

    return (
        <>
            <div className={cn("rounded-2xl border border-[var(--nd-border)] bg-[var(--nd-surface)] p-6", className)}>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--nd-border)]">
                    <div>
                        <h2 className="text-[16px] font-semibold text-[var(--nd-text)]">Indicadores de Risco</h2>
                        <p className="text-[12px] text-[var(--nd-text-secondary)] mt-0.5">
                            {alerts.length} {alerts.length === 1 ? "alerta identificado" : "alertas identificados"}
                        </p>
                    </div>

                    {alerts.length > 0 && (
                        <span className={cn(
                            "text-[12px] font-semibold",
                            alerts.some(a => a.severity === "high")
                                ? "text-[var(--nd-error)]"
                                : alerts.some(a => a.severity === "medium")
                                    ? "text-[var(--nd-warning)]"
                                    : "text-[var(--nd-primary)]"
                        )}>
                            {highCount > 0
                                ? `${highCount} crítico(s)`
                                : mediumCount > 0
                                    ? `${mediumCount} médio(s)`
                                    : "Apenas avisos"}
                        </span>
                    )}
                </div>

                {alerts.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-[14px] font-semibold text-[var(--nd-success)]">Nenhum risco identificado</p>
                        <p className="text-[13px] text-[var(--nd-text-secondary)] mt-1">
                            Todos os indicadores estão dentro do esperado.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--nd-border)]">
                        {visibleAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}

                        {hasMore && (
                            <button
                                type="button"
                                onClick={() => setIsAllAlertsOpen(true)}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 pt-3 pb-1",
                                    "text-[13px] font-medium text-[var(--nd-primary)]",
                                    "hover:underline transition-colors",
                                    "cursor-pointer group"
                                )}
                            >
                                <span>+{remainingCount} {remainingCount === 1 ? "outro alerta" : "outros alertas"}</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal com todos os alertas */}
            <Dialog open={isAllAlertsOpen} onOpenChange={setIsAllAlertsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    {/* Header com gradiente */}
                    <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-b from-destructive/5 to-transparent">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <DialogTitle className="font-display text-xl">
                                        Todos os Alertas
                                    </DialogTitle>
                                    <DialogDescription className="text-sm">
                                        {alerts.length} {alerts.length === 1 ? "alerta identificado" : "alertas identificados"} no sistema
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Resumo de severidades */}
                        <div className="flex items-center gap-2 mt-4">
                            {highCount > 0 && (
                                <Badge variant="outline" className="bg-[var(--nd-error-bg)] text-[var(--nd-error)] border-[var(--nd-error)]/25 text-xs">
                                    {highCount} Crítico{highCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {mediumCount > 0 && (
                                <Badge variant="outline" className="bg-[var(--nd-warning-bg)] text-[var(--nd-warning)] border-[var(--nd-warning)]/25 text-xs">
                                    {mediumCount} Médio{mediumCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {lowCount > 0 && (
                                <Badge variant="outline" className="bg-[var(--nd-muted)] text-[var(--nd-primary)] border-[var(--nd-border)] text-xs">
                                    {lowCount} Baixo{lowCount > 1 ? "s" : ""}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Lista de alertas scrollável */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        {alerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                        <Button
                            variant="outline"
                            className="w-full h-11"
                            onClick={() => setIsAllAlertsOpen(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
