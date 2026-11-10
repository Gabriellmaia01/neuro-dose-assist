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
      <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Registros
            </p>
            <p className="text-2xl font-display font-bold mt-1">
              {totalFiltrado}
            </p>
          </div>
          <Clock className="w-8 h-8 text-primary/60" />
        </div>
      </div>
      <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pacientes
            </p>
            <p className="text-2xl font-display font-bold mt-1">
              {pacientesUnicos}
            </p>
          </div>
          <Brain className="w-8 h-8 text-info/60" />
        </div>
      </div>
      <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Eficácia
            </p>
            <p
              className={cn(
                "text-2xl font-display font-bold mt-1",
                eficaciaMedia >= 70
                  ? "text-success"
                  : eficaciaMedia >= 50
                  ? "text-warning"
                  : "text-destructive"
              )}
            >
              {eficaciaMedia}%
            </p>
          </div>
          <Activity className="w-8 h-8 text-success/60" />
        </div>
      </div>
      <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Alertas
            </p>
            <p className="text-2xl font-display font-bold mt-1 text-warning">
              {quantidadeAlertas}
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-warning/60" />
        </div>
      </div>
    </div>
  );
}
