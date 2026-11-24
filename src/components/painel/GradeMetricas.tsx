import { Users, Pill, Activity, Brain } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesGradeMetricas {
  estatisticas: EstatisticasPainel;
}

/**
 * GradeMetricas - Grade dos 4 KPIs principais do painel.
 * 4 colunas em >=1280px, 2 colunas entre 900px e 1279px, 1 coluna abaixo de 900px.
 */
export function GradeMetricas({ estatisticas }: PropriedadesGradeMetricas) {
  return (
    <section aria-label="Indicadores clínicos">
      <div className="grid grid-cols-1 min-[900px]:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Pacientes ativos"
          value={estatisticas.pacientesAtivos.toString()}
          subtitle={
            estatisticas.pacientesAtivosNovos > 0
              ? `+${estatisticas.pacientesAtivosNovos} novos (30d)`
              : "Sem novos cadastros"
          }
          icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
          trend={{ value: estatisticas.tendenciaPacientes, label: "vs. mês anterior" }}
        />

        <MetricCard
          title="Doses registradas"
          value={estatisticas.dosesUltimos7Dias.toString()}
          subtitle="Últimos 7 dias"
          icon={<Pill className="w-4 h-4" strokeWidth={1.5} />}
          trend={{ value: estatisticas.tendenciaDoses, label: "vs. semana anterior" }}
        />

        <MetricCard
          title="Eficácia média"
          value={`${estatisticas.eficaciaMedia}%`}
          subtitle="Índice clínico geral"
          icon={<Activity className="w-4 h-4" strokeWidth={1.5} />}
          trend={{ value: estatisticas.tendenciaEficacia, label: "vs. semana anterior" }}
        />

        <MetricCard
          title="Inferências IA"
          value={estatisticas.inferenciasIA.toString()}
          subtitle="Total processado"
          icon={<Brain className="w-4 h-4" strokeWidth={1.5} />}
          trend={{ value: estatisticas.tendenciaIA, label: "vs. semana anterior" }}
        />
      </div>
    </section>
  );
}
