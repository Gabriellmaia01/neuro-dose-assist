import { Clock, Pill, AlertTriangle, Activity } from "lucide-react";
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
 * LastDoseCard - Cartão de Detalhes da Última Dose (Swiss Clinical Minimalist).
 * Padrão Awwwards: Layout assimétrico, indicador de risco farmacológico e anel de eficácia.
 */
export function LastDoseCard({
  medication,
  dose,
  time,
  efficacy,
  riskLevel,
  className,
}: LastDoseCardProps) {
  const riskStyles = {
    low: {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
      label: "Risco Mínimo",
    },
    medium: {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
      label: "Risco Moderado",
    },
    high: {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-rose-400",
      label: "Risco Elevado",
    },
  };

  const risk = riskStyles[riskLevel];

  return (
    <div
      className={cn(
        "rounded-2xl bg-card/90 dark:bg-slate-900/70 border border-border/80 dark:border-slate-800/90 backdrop-blur-xl p-5 sm:p-6 shadow-sm relative overflow-hidden",
        className
      )}
    >
      {/* Luz ambiente no canto */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Última Aplicação
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Pill className="w-4 h-4 text-teal-400 shrink-0" />
              <h3 className="font-semibold text-base text-foreground truncate">
                {medication}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <EfficacyRing value={efficacy} size="md" />
        </div>
      </div>

      {/* Linhas de Telemetria Posológica */}
      <div className="space-y-2 relative z-10 font-mono text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 dark:bg-slate-950/40 border border-border/40 dark:border-slate-800/60">
          <span className="text-muted-foreground uppercase text-[10px]">Posologia</span>
          <span className="font-semibold text-foreground">{dose}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 dark:bg-slate-950/40 border border-border/40 dark:border-slate-800/60">
          <span className="text-muted-foreground uppercase text-[10px]">Horário</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 dark:bg-slate-950/40 border border-border/40 dark:border-slate-800/60">
          <span className="text-muted-foreground uppercase text-[10px]">Efeito Adverso</span>
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px]", risk.bg)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", risk.dot)} />
            <span>{risk.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
