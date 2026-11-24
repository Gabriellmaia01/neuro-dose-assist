import { Check, AlertTriangle, AlertCircle } from "lucide-react";
import { EfficacyRing } from "./EfficacyRing";
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
 * LastDoseCard - Resumo clínico da última aplicação registrada.
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
      bg: "bg-[var(--nd-success-bg)]",
      text: "text-[var(--nd-success)]",
      icon: Check,
      label: "Risco mínimo",
    },
    medium: {
      bg: "bg-[var(--nd-warning-bg)]",
      text: "text-[var(--nd-warning)]",
      icon: AlertTriangle,
      label: "Risco moderado",
    },
    high: {
      bg: "bg-[var(--nd-error-bg)]",
      text: "text-[var(--nd-error)]",
      icon: AlertCircle,
      label: "Risco elevado",
    },
  };

  const risk = riskConfig[riskLevel];
  const RiskIcon = risk.icon;

  return (
    <section
      aria-label="Última aplicação"
      className={cn("nd-card p-6 flex flex-col justify-between h-full", className)}
    >
      {/* Cabeçalho: rótulo + medicamento à esquerda, anel de 56px à direita */}
      <div className="flex items-start justify-between gap-4 pb-5">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
            Última aplicação
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[var(--nd-text)] truncate">
            {medication}
          </h2>
        </div>

        <EfficacyRing value={efficacy} size="md" showLabel />
      </div>

      {/* Lista de detalhes com divisórias finas de 1px */}
      <dl className="divide-y divide-[var(--nd-border)] border-t border-[var(--nd-border)] text-[13px]">
        <div className="flex items-center justify-between gap-4 py-3.5">
          <dt className="font-medium text-[var(--nd-text-secondary)]">
            Posologia
          </dt>
          <dd className="font-medium text-[14px] text-[var(--nd-text)] nd-tabular">
            {formatDoseDisplay(dose)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 py-3.5">
          <dt className="font-medium text-[var(--nd-text-secondary)]">
            Horário
          </dt>
          <dd className="font-medium text-[14px] text-[var(--nd-text)] nd-tabular">
            {time}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3.5">
          <dt className="font-medium text-[var(--nd-text-secondary)]">
            Efeito adverso
          </dt>
          <dd>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--nd-radius)] text-[12px] font-medium",
                risk.bg,
                risk.text
              )}
            >
              <RiskIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>{risk.label}</span>
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
