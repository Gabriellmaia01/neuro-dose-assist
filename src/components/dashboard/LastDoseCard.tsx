import { Check, AlertTriangle, AlertCircle, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LastDoseCardProps {
  medication: string;
  dose: string;
  time: string;
  efficacy: number;
  riskLevel: "low" | "medium" | "high";
  className?: string;
}

/**
 * Normaliza a exibição da posologia garantindo unidade (ex.: "5mg" -> "5 mg", "5" -> "5 mg").
 */
function formatDoseDisplay(dose: string): string {
  const trimmed = dose.trim();
  if (!trimmed) return "—";
  if (/^\d+([.,]\d+)?$/.test(trimmed)) return `${trimmed} mg`;
  return trimmed.replace(/^(\d+(?:[.,]\d+)?)(mg|mcg|ml|g)$/i, "$1 $2");
}

/**
 * LastDoseCard - Card institucional de última aplicação em Ink Navy sólido com alto contraste.
 */
export function LastDoseCard({
  medication,
  dose,
  time,
  efficacy,
  riskLevel,
  className,
}: LastDoseCardProps) {
  const riskConfig = {
    low: {
      bg: "bg-[var(--nd-dark-surface)] text-[var(--nd-dark-text)] border border-[var(--nd-dark-border)]",
      icon: Check,
      label: "Risco mínimo",
    },
    medium: {
      bg: "bg-[var(--nd-warning-bg)] text-[var(--nd-warning)]",
      icon: AlertTriangle,
      label: "Risco moderado",
    },
    high: {
      bg: "bg-[var(--nd-error-bg)] text-[var(--nd-error)]",
      icon: AlertCircle,
      label: "Risco elevado",
    },
  };

  const risk = riskConfig[riskLevel];
  const RiskIcon = risk.icon;

  return (
    <section
      aria-label="Última aplicação"
      className={cn(
        "nd-card-hero relative overflow-hidden p-6 flex flex-col justify-between h-full",
        className
      )}
    >
      <div className="relative z-10 flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-medium text-[var(--nd-dark-text)]">
          Última aplicação
        </h2>
        <span className="inline-flex items-center gap-1 text-[12px] text-[var(--nd-dark-text-secondary)] nd-tabular">
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>{time}</span>
        </span>
      </div>

      {/* Leitura central tabular em destaque (rampa 38px) */}
      <div className="relative z-10 my-5">
        <p className="text-[38px] font-semibold tracking-[-0.03em] leading-none text-[var(--nd-surface)] nd-tabular">
          {formatDoseDisplay(dose)}
        </p>
        <p className="mt-2.5 text-[16px] font-medium text-[var(--nd-dark-text)] truncate">
          {medication}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--nd-dark-surface)] border border-[var(--nd-dark-border)] text-[var(--nd-dark-text)] text-[12px] font-medium nd-tabular">
            Eficácia {Math.round(efficacy)}%
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium",
              risk.bg
            )}
          >
            <RiskIcon className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{risk.label}</span>
          </span>
        </div>
      </div>

      <Link
        to="/dose"
        className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-[var(--nd-surface)] text-[var(--nd-primary-deep)] text-[14px] font-semibold hover:bg-[var(--nd-accent-soft)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-dark-accent-soft)]"
      >
        <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>Nova aplicação</span>
      </Link>
    </section>
  );
}
