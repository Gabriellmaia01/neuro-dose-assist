import { Users, Pill, Activity, Brain } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesGradeMetricas {
  estatisticas: EstatisticasPainel;
}

/**
 * Grid dos 4 cards de métricas do painel.
 * Responsabilidade única: renderizar o grid de métricas.
 * Aberto para extensão: basta adicionar novos MetricCards sem modificar os existentes.
 */
export function GradeMetricas({ estatisticas }: PropriedadesGradeMetricas) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="animate-fade-up stagger-1">
        <MetricCard
          title="Pacientes Ativos"
          value={estatisticas.pacientesAtivos.toString()}
          subtitle={
            estatisticas.pacientesAtivosNovos > 0
              ? `+${estatisticas.pacientesAtivosNovos} novos (30d)`
              : "Sem novos"
          }
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: estatisticas.tendenciaPacientes, label: "vs. mês anterior" }}
        />
      </div>
      <div className="animate-fade-up stagger-2">
        <MetricCard
          title="Doses Registradas"
          value={estatisticas.dosesUltimos7Dias.toString()}
          subtitle="Últimos 7 dias"
          icon={<Pill className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: estatisticas.tendenciaDoses, label: "vs. semana anterior" }}
          variant="success"
        />
      </div>
      <div className="animate-fade-up stagger-3">
        <MetricCard
          title="Eficácia Média"
          value={`${estatisticas.eficaciaMedia}%`}
          subtitle="Geral"
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: estatisticas.tendenciaEficacia, label: "vs. semana anterior" }}
        />
      </div>
      <div className="animate-fade-up stagger-4">
        <MetricCard
          title="Inferências IA"
          value={estatisticas.inferenciasIA.toString()}
          subtitle="Total processado"
          icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6" />}
          trend={{ value: estatisticas.tendenciaIA, label: "vs. semana anterior" }}
          variant="warning"
        />
      </div>
    </div>
  );
}
