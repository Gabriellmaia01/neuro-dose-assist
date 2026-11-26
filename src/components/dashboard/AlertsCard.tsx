import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  time: string;
}

interface AlertsCardProps {
  alerts: Alert[];
  className?: string;
}

/**
 * AlertsCard - Lista compacta de alertas farmacológicos em estilo bento com badges circulares.
 */
export function AlertsCard({ alerts, className }: AlertsCardProps) {
  const navigate = useNavigate();

  const severityConfig = {
    warning: {
      chipBg: "bg-[var(--nd-warning-bg)]",
      iconColor: "text-[var(--nd-warning)]",
      icon: AlertTriangle,
      label: "Atenção",
    },
    danger: {
      chipBg: "bg-[var(--nd-error-bg)]",
      iconColor: "text-[var(--nd-error)]",
      icon: AlertCircle,
      label: "Crítico",
    },
    info: {
      chipBg: "bg-[var(--nd-accent-soft)]",
      iconColor: "text-[var(--nd-primary)]",
      icon: Info,
      label: "Informativo",
    },
  };

  return (
    <section
      aria-label="Alertas farmacológicos"
      className={cn("nd-card p-6 flex flex-col justify-between h-full", className)}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-2 pb-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)] truncate">
          Alertas clínicos
        </h2>
        <Link
          to="/medications"
          className="inline-flex items-center min-h-[44px] sm:min-h-[32px] px-3.5 rounded-full border border-[var(--nd-border-input)] text-[12px] font-medium text-[var(--nd-label)] hover:bg-[var(--nd-bg)] transition-colors shrink-0"
        >
          Interações
        </Link>
      </div>

      {/* Lista compacta ou estado vazio */}
      {alerts.length === 0 ? (
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--nd-success-bg)] flex items-center justify-center">
            <CheckCircle2
              className="w-5 h-5 text-[var(--nd-success)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <p className="text-[14px] font-medium text-[var(--nd-text)]">
            Parâmetros dentro da normalidade
          </p>
          <p className="text-[12px] text-[var(--nd-text-secondary)]">
            Nenhum alerta farmacológico ativo no momento.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5 flex-1">
          {alerts.slice(0, 4).map((alert) => {
            const config = severityConfig[alert.type];
            const SeverityIcon = config.icon;

            return (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="nd-list-row p-2.5 -mx-2.5 rounded-xl items-start gap-3"
                >
                  <span
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      config.chipBg
                    )}
                    aria-hidden="true"
                  >
                    <SeverityIcon
                      className={cn("w-4 h-4", config.iconColor)}
                      strokeWidth={1.75}
                    />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-semibold text-[var(--nd-text)] leading-snug truncate">
                        <span className="sr-only">{config.label}: </span>
                        {alert.title}
                      </p>
                      <span className="text-[11px] text-[var(--nd-text-secondary)] shrink-0 nd-tabular">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--nd-text-secondary)] leading-snug mt-0.5 line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
