import { MetricCard } from "@/components/dashboard/MetricCard";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesGradeMetricas {
  estatisticas: EstatisticasPainel;
}

/**
 * GradeMetricas - Grade bento dos 4 KPIs principais do painel.
 * O primeiro card recebe o destaque hero em gradiente institucional (#1B4965 / #2C7A7B).
 */
export function GradeMetricas({ estatisticas }: PropriedadesGradeMetricas) {
  return (
    <section aria-label="Indicadores clínicos">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard
          featured
          href="/patients"
          title="Pacientes ativos"
          value={estatisticas.pacientesAtivos.toString()}
          subtitle={
            estatisticas.pacientesAtivosNovos > 0
              ? `+${estatisticas.pacientesAtivosNovos} novos nos últimos 30d`
              : "Sem novos cadastros no mês"
          }
          trend={{ value: estatisticas.tendenciaPacientes, label: "vs. mês anterior" }}
        />

        <MetricCard
          href="/history"
          title="Doses registradas"
          value={estatisticas.dosesUltimos7Dias.toString()}
          subtitle="Últimos 7 dias"
          trend={{ value: estatisticas.tendenciaDoses, label: "vs. semana anterior" }}
        />

        <MetricCard
          href="/analytics"
          title="Eficácia média"
          value={`${estatisticas.eficaciaMedia}%`}
          subtitle="Índice clínico geral"
          trend={{ value: estatisticas.tendenciaEficacia, label: "vs. semana anterior" }}
        />

        <MetricCard
          href="/analytics"
          title="Inferências IA"
          value={estatisticas.inferenciasIA.toString()}
          subtitle="Análises processadas"
          trend={{ value: estatisticas.tendenciaIA, label: "vs. semana anterior" }}
        />
      </div>
    </section>
  );
}
