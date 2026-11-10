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
 *
 * Princípios SOLID aplicados:
 * - SRP: cada componente e utilitário tem uma única responsabilidade
 * - OCP: novos cards/seções podem ser adicionados sem modificar os existentes
 * - ISP: cada componente recebe apenas as props que precisa
 * - DIP: o hook depende de abstrações (ServicosPainel), não de implementações concretas
 */
export default function PainelDeControle() {
  const {
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
      <div className="relative z-10 space-y-4 sm:space-y-6 pb-8">
        {/* Cabeçalho Hero */}
        <CabecalhoPainel estatisticas={estatisticas} />

        {/* Ações Rápidas */}
        <QuickActions />

        {/* Grade de Métricas */}
        <GradeMetricas estatisticas={estatisticas} />

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Coluna Esquerda — Gráfico e Pacientes */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <EfficacyChart data={dadosGraficoAdaptados} />
            <RecentPatients patients={pacientesRecentes} />
          </div>

          {/* Coluna Direita — Dose, Alertas e Consultas */}
          <div className="space-y-4 sm:space-y-6">
            <SecaoUltimaDose ultimaDose={ultimaDose} />
            <AlertsCard alerts={alertas} />
            <SecaoConsultas consultas={consultas} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
