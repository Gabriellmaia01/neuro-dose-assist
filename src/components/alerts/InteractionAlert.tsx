import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    InteractionAlert as InteractionAlertType,
    SeverityLevel,
    getSeverityColor,
    getSeverityLabel
} from "@/services/drugInteractions";
import { Button } from "@/components/ui/button";

interface InteractionAlertProps {
    alerts: InteractionAlertType[];
    onDismiss?: (alertId: string) => void;
    title?: string;
    subtitle?: string;
    className?: string;
}

function SeverityIcon({ severity, className }: { severity: SeverityLevel; className?: string }) {
    switch (severity) {
        case 'grave':
            return <AlertTriangle className={cn("w-5 h-5", className)} />;
        case 'moderado':
            return <AlertCircle className={cn("w-5 h-5", className)} />;
        case 'leve':
            return <Info className={cn("w-5 h-5", className)} />;
    }
}

export function InteractionAlertCard({
    alert,
    onDismiss
}: {
    alert: InteractionAlertType;
    onDismiss?: () => void;
}) {
    const colors = getSeverityColor(alert.severity);

    return (
        <div
            className={cn(
                "relative rounded-xl border p-4",
                colors.bg,
                colors.border
            )}
        >
            {onDismiss && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 h-11 w-11 sm:h-7 sm:w-7 opacity-70 hover:opacity-100"
                    onClick={onDismiss}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Fechar</span>
                </Button>
            )}

            <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", colors.text)}>
                    <SeverityIcon severity={alert.severity} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-sm font-semibold", colors.text)}>
                            {getSeverityLabel(alert.severity)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {alert.medicationA} ↔ {alert.medicationB}
                        </span>
                    </div>

                    <p className="text-sm mt-1 text-foreground/90">
                        {alert.description}
                    </p>

                    <p className="text-xs mt-2 text-muted-foreground">
                        <strong>Recomendação:</strong> {alert.recommendation}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function InteractionAlertPanel({
    alerts,
    onDismiss,
    title = "Alertas de Interação Medicamentosa",
    subtitle,
    className
}: InteractionAlertProps) {
    if (alerts.length === 0) {
        return null;
    }

    const graveCount = alerts.filter(a => a.severity === 'grave').length;
    const moderadoCount = alerts.filter(a => a.severity === 'moderado').length;
    const leveCount = alerts.filter(a => a.severity === 'leve').length;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                        <h3 className="font-display font-semibold text-base sm:text-lg">
                            {title}
                        </h3>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                    {graveCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
                            {graveCount} grave{graveCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {moderadoCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
                            {moderadoCount} moderado{moderadoCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {leveCount > 0 && (
                        <span className="px-2 py-1 rounded-full bg-info/10 text-info font-medium">
                            {leveCount} leve{leveCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <InteractionAlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss ? () => onDismiss(alert.id) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

export { type InteractionAlertType };
