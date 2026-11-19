import { MainLayout } from "@/components/layout/MainLayout";
import { EfficacyChart } from "@/components/dashboard/EfficacyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { CabecalhoPainel } from "@/components/painel/CabecalhoPainel";
import { GradeMetricas } from "@/components/painel/GradeMetricas";
import { SecaoConsultas } from "@/components/painel/SecaoConsultas";
import { SecaoUltimaDose } from "@/components/painel/SecaoUltimaDose";
import { useDadosPainel } from "@/hooks/useDadosPainel";

/**
 * Página principal do painel de controle.
 * Componente fino de composição — delega lógica para useDadosPainel
 * e renderização para subcomponentes especializados.
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
      <div className="space-y-6 pb-8">
        {/* 1. Cabeçalho simples da página */}
        <CabecalhoPainel estatisticas={estatisticas} />

        {/* 2. Atalhos rápidos */}
        <QuickActions />

        {/* 3. KPIs */}
        {carregando ? (
          <div
            aria-label="Carregando indicadores clínicos"
            className="grid grid-cols-1 min-[900px]:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nd-card p-5 space-y-3">
                <div className="nd-skeleton h-4 w-28" />
                <div className="nd-skeleton h-8 w-16" />
                <div className="nd-skeleton h-3.5 w-32" />
                <div className="pt-3 border-t border-[var(--nd-border)]">
                  <div className="nd-skeleton h-3.5 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <GradeMetricas estatisticas={estatisticas} />
        )}

        {/* 4. Gráfico (8 cols) + Última aplicação (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className="xl:col-span-8 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4">
                <div className="nd-skeleton h-5 w-56" />
                <div className="nd-skeleton h-64 w-full" />
              </div>
            ) : (
              <EfficacyChart data={dadosGraficoAdaptados} className="h-full" />
            )}
          </div>
          <div className="xl:col-span-4 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-32" />
                <div className="nd-skeleton h-14 w-full" />
                <div className="nd-skeleton h-32 w-full" />
              </div>
            ) : (
              <SecaoUltimaDose ultimaDose={ultimaDose} />
            )}
          </div>
        </div>

        {/* 5. Pacientes recentes (8 cols) + Alertas e Agenda (4 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4">
                <div className="nd-skeleton h-5 w-44" />
                <div className="nd-skeleton h-16 w-full" />
                <div className="nd-skeleton h-16 w-full" />
              </div>
            ) : (
              <RecentPatients patients={pacientesRecentes} />
            )}
          </div>

          <div className="xl:col-span-4 space-y-6 min-w-0">
            <AlertsCard alerts={alertas} />
            <SecaoConsultas consultas={consultas} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
