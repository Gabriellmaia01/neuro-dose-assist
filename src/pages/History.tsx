import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDadosHistorico } from "@/hooks/useDadosHistorico";
import { useFiltrosHistorico } from "@/hooks/useFiltrosHistorico";
import { exportarHistoricoPdf } from "@/lib/exportarHistoricoPdf";
import { ItemHistorico } from "@/lib/tiposHistorico";
import { toast } from "@/hooks/use-toast";

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
  const { itensHistorico, pacientes, logsAtividade, carregando } =
    useDadosHistorico();

  // ── Filtros e estatísticas (S — Responsabilidade Única) ───────────────────
  const { filtros, historicoFiltrado, estatisticas } =
    useFiltrosHistorico(itensHistorico);

  // ── Estado local de UI ────────────────────────────────────────────────────
  const [itemSelecionado, setItemSelecionado] = useState<ItemHistorico | null>(
    null
  );
  const [exportando, setExportando] = useState(false);

  // ── Exportação PDF ────────────────────────────────────────────────────────
  const handleExportar = () => {
    if (exportando || itensHistorico.length === 0) return;
    setExportando(true);
    try {
      exportarHistoricoPdf(itensHistorico);
      toast({
        title: "Exportação concluída",
        description: "O PDF foi baixado com sucesso.",
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
          temItens={itensHistorico.length > 0}
        />

        {!carregando && (
          <EstatisticasHistoricoComp estatisticas={estatisticas} />
        )}

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
        />

        <AbasHistorico
          abaAtiva={filtros.abaAtiva}
          onAbaChange={filtros.setAbaAtiva}
        />

        {filtros.abaAtiva !== "activities" ? (
          <ListaRegistrosHistorico
            itens={historicoFiltrado}
            carregando={carregando}
            abaAtiva={filtros.abaAtiva}
            onItemSelecionado={setItemSelecionado}
          />
        ) : (
          <ListaAtividadesHistorico
            logs={logsAtividade}
            carregando={carregando}
          />
        )}

        <DialogoDetalhesRegistro
          itemSelecionado={itemSelecionado}
          onFechar={() => setItemSelecionado(null)}
        />
      </div>
    </MainLayout>
  );
}
