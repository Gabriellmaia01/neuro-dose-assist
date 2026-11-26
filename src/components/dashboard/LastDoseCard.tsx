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
 * LastDoseCard - Card bento escuro de foco (estilo Time Tracker em azul-marinho/teal clínico).
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
      bg: "bg-white/15 text-white",
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
      {/* Ondas topográficas orgânicas sutis (identidade marítima clínica) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 280 220"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-25"
        preserveAspectRatio="none"
      >
        <path
          d="M-20 175 C 45 110, 140 215, 300 95"
          fill="none"
          stroke="var(--nd-dark-accent-soft)"
          strokeWidth="1.5"
        />
        <path
          d="M-20 198 C 60 135, 165 232, 300 128"
          fill="none"
          stroke="var(--nd-dark-title-accent)"
          strokeWidth="1.2"
        />
        <path
          d="M-20 148 C 35 88, 125 182, 300 62"
          fill="none"
          stroke="var(--nd-dark-accent-soft)"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-white/80">
          Última aplicação
        </p>
        <span className="inline-flex items-center gap-1 text-[12px] text-white/80 nd-tabular">
          <Clock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>{time}</span>
        </span>
      </div>

      {/* Leitura central tabular em destaque */}
      <div className="relative z-10 my-5">
        <p className="text-[32px] font-semibold tracking-[-0.03em] leading-none text-white nd-tabular">
          {formatDoseDisplay(dose)}
        </p>
        <h2 className="mt-2 text-[16px] font-medium text-white/95 truncate">
          {medication}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[12px] font-medium nd-tabular">
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
        className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-11 rounded-full bg-white text-[var(--nd-primary-deep)] text-[14px] font-semibold hover:bg-[var(--nd-accent-soft)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>Nova aplicação</span>
      </Link>
    </section>
  );
}
