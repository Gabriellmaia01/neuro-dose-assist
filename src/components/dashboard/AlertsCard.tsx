import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
 * AlertsCard - Central sóbria de alertas farmacológicos.
 * Severidade comunicada por ícone, texto e faixa discreta de 2px à esquerda.
 */
export function AlertsCard({ alerts, className }: AlertsCardProps) {
  const navigate = useNavigate();

  const severityConfig = {
    warning: {
      bar: "border-l-[#B54708]",
      iconColor: "text-[var(--nd-warning)]",
      icon: AlertTriangle,
      label: "Atenção",
    },
    danger: {
      bar: "border-l-[#B42318]",
      iconColor: "text-[var(--nd-error)]",
      icon: AlertCircle,
      label: "Crítico",
    },
    info: {
      bar: "border-l-[#5B6B7A]",
      iconColor: "text-[var(--nd-text-secondary)]",
      icon: Info,
      label: "Informativo",
    },
  };

  const countLabel =
    alerts.length === 1
      ? "1 notificação"
      : `${alerts.length} notificações`;

  return (
    <section
      aria-label="Alertas farmacológicos"
      className={cn("nd-card overflow-hidden", className)}
    >
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3 border-b border-[var(--nd-border)]">
        <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--nd-text)]">
          Alertas farmacológicos
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] bg-[var(--nd-muted)] text-[var(--nd-label)] text-[12px] font-medium nd-tabular shrink-0">
          {countLabel}
        </span>
      </div>

      {/* Lista de alertas ou estado vazio */}
      {alerts.length === 0 ? (
        <div className="px-6 py-8 flex items-center justify-center gap-2 text-[14px] text-[var(--nd-text-secondary)]">
          <CheckCircle2
            className="w-4 h-4 text-[var(--nd-success)] shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span>Parâmetros dentro da normalidade</span>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--nd-border)]">
          {alerts.slice(0, 3).map((alert) => {
            const config = severityConfig[alert.type];
            const SeverityIcon = config.icon;

            return (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className={cn(
                    "nd-list-row px-5 py-4 border-l-2 items-start gap-3",
                    config.bar
                  )}
                >
                  <SeverityIcon
                    className={cn("w-4 h-4 mt-0.5 shrink-0", config.iconColor)}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[14px] font-semibold text-[var(--nd-text)] leading-[1.35] truncate">
                        <span className="sr-only">{config.label}: </span>
                        {alert.title}
                      </p>
                      <span className="text-[12px] text-[var(--nd-text-secondary)] shrink-0 nd-tabular">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--nd-text-secondary)] leading-[1.45] mt-1">
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
