import { MetricCard } from "@/components/dashboard/MetricCard";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesGradeMetricas {
  estatisticas: EstatisticasPainel;
  alertasAtivos?: number;
}

/**
 * GradeMetricas - Grade dos 4 KPIs distintos do painel (sem duplicar o Índice de Eficácia do mostrador inferior).
 */
export function GradeMetricas({
  estatisticas,
  alertasAtivos = 0,
}: PropriedadesGradeMetricas) {
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
          title="Análises pós-dose"
          value={estatisticas.inferenciasIA.toString()}
          subtitle="Avaliações clínicas processadas"
          trend={{ value: estatisticas.tendenciaIA, label: "vs. semana anterior" }}
        />

        <MetricCard
          href="/medications"
          title="Alertas ativos"
          value={alertasAtivos.toString()}
          subtitle={
            alertasAtivos > 0
              ? "Interações e sinais em revisão"
              : "Nenhum alerta pendente"
          }
          footerLabel={alertasAtivos > 0 ? "Revisar interações" : "Monitoramento ativo"}
        />
      </div>
    </section>
  );
}
