import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDadosHistorico } from "@/hooks/useDadosHistorico";
import { useFiltrosHistorico } from "@/hooks/useFiltrosHistorico";
import { exportarHistoricoPdf } from "@/lib/exportarHistoricoPdf";
import { ItemHistorico } from "@/lib/tiposHistorico";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Componentes de apresentação (Princípio S — Responsabilidade Única)
import { CabecalhoHistorico } from "@/components/historico/CabecalhoHistorico";
import { EstatisticasHistoricoComp } from "@/components/historico/EstatisticasHistorico";
import { FiltrosHistorico } from "@/components/historico/FiltrosHistorico";
import { AbasHistorico } from "@/components/historico/AbasHistorico";
import { ListaRegistrosHistorico } from "@/components/historico/ListaRegistrosHistorico";
import { ListaAtividadesHistorico } from "@/components/historico/ListaAtividadesHistorico";
import { DialogoDetalhesRegistro } from "@/components/historico/DialogoDetalhesRegistro";

/**
 * Página de Histórico — Orquestradora.
 *
 * Princípios SOLID aplicados:
 *  - S (Responsabilidade Única): cada hook e componente tem uma única responsabilidade
 *  - O (Aberto/Fechado): novas abas ou filtros não exigem alterar este componente
 *  - I (Segregação de Interfaces): cada componente recebe apenas os props que precisa
 *  - D (Inversão de Dependência): depende de abstrações (hooks), não de serviços concretos
 */
export default function History() {
  // ── Dados (D — Inversão de Dependência) ──────────────────────────────────
  const {
    itensHistorico,
    pacientes,
    logsAtividade,
    carregando,
    erro,
    recarregar,
  } = useDadosHistorico();

  // ── Filtros e estatísticas (S — Responsabilidade Única) ───────────────────
  const { filtros, historicoFiltrado, atividadesFiltradas, estatisticas } =
    useFiltrosHistorico(itensHistorico, logsAtividade, pacientes);

  // ── Estado local de UI ────────────────────────────────────────────────────
  const [itemSelecionado, setItemSelecionado] = useState<ItemHistorico | null>(
    null
  );
  const [exportando, setExportando] = useState(false);

  // ── Exportação PDF (respeitando filtros ativos para privacidade / LGPD) ───
  const handleExportar = () => {
    if (exportando || historicoFiltrado.length === 0) return;
    setExportando(true);
    try {
      const temRecorte =
        filtros.temFiltrosAtivos ||
        (filtros.abaAtiva !== "all" && filtros.abaAtiva !== "activities");
      const descricaoEscopo = temRecorte
        ? `Escopo: ${historicoFiltrado.length} registro(s) conforme filtros aplicados`
        : `Escopo: ${historicoFiltrado.length} registro(s) totais`;

      exportarHistoricoPdf(historicoFiltrado, descricaoEscopo);
      toast({
        title: "Exportação concluída",
        description: `${historicoFiltrado.length} registro(s) exportado(s) em PDF.`,
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        <CabecalhoHistorico
          onExportar={handleExportar}
          carregando={carregando}
          exportando={exportando}
          temItens={historicoFiltrado.length > 0}
        />

        {erro && (
          <div
            role="alert"
            className="nd-card p-5 border-[var(--nd-error)]/30 bg-[var(--nd-error-soft)]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="w-5 h-5 text-[var(--nd-error)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--nd-text)]">
                  Falha ao carregar o histórico
                </p>
                <p className="text-sm text-[var(--nd-text-secondary)] mt-0.5">
                  {erro}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={recarregar}
              className="nd-btn-outline-pill shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Tentar novamente
            </button>
          </div>
        )}

        <EstatisticasHistoricoComp
          estatisticas={estatisticas}
          carregando={carregando}
        />

        <FiltrosHistorico
          termoBusca={filtros.termoBusca}
          onTermoBuscaChange={filtros.setTermoBusca}
          data={filtros.data}
          onDataChange={filtros.setData}
          pacienteIdSelecionado={filtros.pacienteIdSelecionado}
          onPacienteChange={filtros.setPacienteIdSelecionado}
          pacientes={pacientes}
          onLimpar={filtros.limparFiltros}
          temFiltrosAtivos={filtros.temFiltrosAtivos}
          abaAtiva={filtros.abaAtiva}
        />

        <AbasHistorico
          abaAtiva={filtros.abaAtiva}
          onAbaChange={filtros.setAbaAtiva}
        >
          {filtros.abaAtiva !== "activities" ? (
            <ListaRegistrosHistorico
              itens={historicoFiltrado}
              carregando={carregando}
              abaAtiva={filtros.abaAtiva}
              onItemSelecionado={setItemSelecionado}
            />
          ) : (
            <ListaAtividadesHistorico
              logs={atividadesFiltradas}
              carregando={carregando}
            />
          )}
        </AbasHistorico>

        <DialogoDetalhesRegistro
          itemSelecionado={itemSelecionado}
          onFechar={() => setItemSelecionado(null)}
        />
      </div>
    </MainLayout>
  );
}
