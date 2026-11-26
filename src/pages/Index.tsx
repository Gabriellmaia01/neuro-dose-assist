import { MainLayout } from "@/components/layout/MainLayout";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { EfficacyGaugeCard } from "@/components/dashboard/EfficacyGaugeCard";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { CabecalhoPainel } from "@/components/painel/CabecalhoPainel";
import { GradeMetricas } from "@/components/painel/GradeMetricas";
import { SecaoConsultas } from "@/components/painel/SecaoConsultas";
import { SecaoUltimaDose } from "@/components/painel/SecaoUltimaDose";
import { useDadosPainel } from "@/hooks/useDadosPainel";

/**
 * Página principal do painel de controle em layout bento clínico (#1B4965 / #2C7A7B).
 */
export default function PainelDeControle() {
  const {
    carregando,
    estatisticas,
    dadosGrafico,
    pacientesRecentes,
    ultimaDose,
    alertas,
    consultas,
  } = useDadosPainel();

  // Adapta DadosGrafico → DataPoint esperado pelo EfficacyChart
  const dadosGraficoAdaptados = dadosGrafico.map((ponto) => ({
    date: ponto.data,
    efficacy: ponto.eficacia,
    dose: ponto.dose,
  }));

  return (
    <MainLayout>
      <div className="space-y-5 pb-8">
        {/* 1. Cabeçalho bento com ações rápidas em pílula */}
        <CabecalhoPainel estatisticas={estatisticas} />

        {/* 2. Grade bento dos 4 KPIs (1º card hero em gradiente navy-teal) */}
        {carregando ? (
          <div
            aria-label="Carregando indicadores clínicos"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nd-card p-5 space-y-3">
                <div className="nd-skeleton h-4 w-28" />
                <div className="nd-skeleton h-9 w-16" />
                <div className="nd-skeleton h-3.5 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <GradeMetricas estatisticas={estatisticas} />
        )}

        {/* 3. Faixa bento intermediária: Telemetria (6) + Próxima Consulta (3) + Alertas Clínicos (3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-2 xl:col-span-6 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-52" />
                <div className="nd-skeleton h-56 w-full" />
              </div>
            ) : (
              <EfficacyChart data={dadosGraficoAdaptados} className="h-full" />
            )}
          </div>

          <div className="xl:col-span-3 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-36" />
                <div className="nd-skeleton h-16 w-full" />
                <div className="nd-skeleton h-11 w-full rounded-full" />
              </div>
            ) : (
              <SecaoConsultas consultas={consultas} />
            )}
          </div>

          <div className="xl:col-span-3 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-3 h-full">
                <div className="nd-skeleton h-5 w-32" />
                <div className="nd-skeleton h-12 w-full" />
                <div className="nd-skeleton h-12 w-full" />
              </div>
            ) : (
              <AlertsCard alerts={alertas} />
            )}
          </div>
        </div>

        {/* 4. Faixa bento inferior: Pacientes Recentes (5) + Índice Semicircular (4) + Última Aplicação Escura (3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-2 xl:col-span-5 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-44" />
                <div className="nd-skeleton h-14 w-full" />
                <div className="nd-skeleton h-14 w-full" />
              </div>
            ) : (
              <RecentPatients patients={pacientesRecentes} />
            )}
          </div>

          <div className="xl:col-span-4 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-36" />
                <div className="nd-skeleton h-36 w-full" />
              </div>
            ) : (
              <EfficacyGaugeCard
                efficacy={estatisticas.eficaciaMedia}
                dosesCount={estatisticas.dosesUltimos7Dias}
                inferencesCount={estatisticas.inferenciasIA}
              />
            )}
          </div>

          <div className="xl:col-span-3 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-32" />
                <div className="nd-skeleton h-12 w-24" />
                <div className="nd-skeleton h-11 w-full rounded-full" />
              </div>
            ) : (
              <SecaoUltimaDose ultimaDose={ultimaDose} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
