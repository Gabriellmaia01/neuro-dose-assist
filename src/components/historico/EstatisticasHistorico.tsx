import { Clock, Brain, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstatisticasHistorico } from "@/lib/tiposHistorico";

/**
 * Cards de estatísticas do histórico.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas exibição de métricas
 *  - Segregação de Interfaces (I): recebe apenas as estatísticas calculadas
 */

interface PropriedadesEstatisticas {
  estatisticas: EstatisticasHistorico;
}

export function EstatisticasHistoricoComp({ estatisticas }: PropriedadesEstatisticas) {
  const { totalFiltrado, pacientesUnicos, eficaciaMedia, quantidadeAlertas } =
    estatisticas;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
            Registros
          </p>
          <Clock className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">
          {totalFiltrado}
        </p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
            Pacientes
          </p>
          <Brain className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">
          {pacientesUnicos}
        </p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
            Eficácia média
          </p>
          <Activity className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p
          className={cn(
            "text-[24px] font-semibold tracking-[-0.02em] mt-2 nd-tabular",
            eficaciaMedia >= 70
              ? "text-[var(--nd-success)]"
              : eficaciaMedia >= 50
              ? "text-[var(--nd-warning)]"
              : "text-[var(--nd-error)]"
          )}
        >
          {eficaciaMedia}%
        </p>
      </div>
      <div className="nd-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">
            Alertas
          </p>
          <AlertTriangle className="w-4 h-4 text-[var(--nd-warning)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p
          className={cn(
            "text-[24px] font-semibold tracking-[-0.02em] mt-2 nd-tabular",
            quantidadeAlertas > 0 ? "text-[var(--nd-warning)]" : "text-[var(--nd-text)]"
          )}
        >
          {quantidadeAlertas}
        </p>
      </div>
    </div>
  );
}
