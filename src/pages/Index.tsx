import { useMemo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
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
 * Página principal do painel de controle em layout bento clínico institucional.
 * Mantém colunas confortáveis em 1280px (2-up) e expande para grade 12-col em telas amplas (2xl).
 */
export default function PainelDeControle() {
  const {
    carregando,
    erro,
    recarregar,
    estatisticas,
    dadosGrafico,
    pacientesRecentes,
    ultimaDose,
    alertas,
    consultas,
  } = useDadosPainel();

  const dadosGraficoAdaptados = useMemo(
    () =>
      dadosGrafico.map((ponto) => ({
        date: ponto.data,
        efficacy: ponto.eficacia,
        dose: ponto.dose,
      })),
    [dadosGrafico]
  );

  return (
    <MainLayout>
      <div className="space-y-5 pb-8">
        {/* 1. Cabeçalho bento com 1 CTA primário e atalhos secundários */}
        <CabecalhoPainel estatisticas={estatisticas} />

        {/* Banner de erro real com recuperação explícita (nunca mascara falha como normalidade) */}
        {erro && !carregando && (
          <div
            role="alert"
            className="rounded-[20px] bg-[var(--nd-error-bg)] border border-[var(--nd-error)]/25 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <AlertCircle
                className="w-5 h-5 text-[var(--nd-error)] shrink-0 mt-0.5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[var(--nd-text)]">
                  Falha ao sincronizar dados clínicos
                </p>
                <p className="text-[13px] text-[var(--nd-label)] mt-0.5">
                  {erro}
                </p>
              </div>
            </div>
            {recarregar && (
              <button
                type="button"
                onClick={recarregar}
                className="nd-btn-outline-pill shrink-0 self-start sm:self-auto"
              >
                <RefreshCw className="w-4 h-4 text-[var(--nd-primary)]" strokeWidth={1.75} aria-hidden="true" />
                <span>Tentar novamente</span>
              </button>
            )}
          </div>
        )}

        {/* 2. Grade dos 4 KPIs sem duplicação de métricas */}
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
          <GradeMetricas
            estatisticas={estatisticas}
            alertasAtivos={alertas.length}
          />
        )}

        {/* 3. Faixa intermediária: Telemetria (full em lg/xl, 6 cols em 2xl) + Próxima Consulta + Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-2 2xl:col-span-6 min-w-0">
            {carregando ? (
              <div className="nd-card p-6 space-y-4 h-full">
                <div className="nd-skeleton h-5 w-52" />
                <div className="nd-skeleton h-56 w-full" />
              </div>
            ) : (
              <EfficacyChart data={dadosGraficoAdaptados} className="h-full" />
            )}
          </div>

          <div className="2xl:col-span-3 min-w-0">
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

          <div className="2xl:col-span-3 min-w-0">
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

        {/* 4. Faixa inferior: Pacientes Recentes + Índice Semicircular único de Eficácia + Última Aplicação */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-2 2xl:col-span-5 min-w-0">
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

          <div className="2xl:col-span-4 min-w-0">
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

          <div className="2xl:col-span-3 min-w-0">
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
