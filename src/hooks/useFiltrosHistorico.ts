import { useState, useMemo } from "react";
import { ItemHistorico, EstatisticasHistorico } from "@/lib/tiposHistorico";

/**
 * Hook responsável por gerenciar filtros e calcular dados derivados do histórico.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas filtragem e estatísticas
 *  - Aberto/Fechado (O): novos filtros podem ser adicionados sem alterar a estrutura
 */

export interface FiltrosHistorico {
  termoBusca: string;
  setTermoBusca: (valor: string) => void;
  data: Date | undefined;
  setData: (valor: Date | undefined) => void;
  pacienteIdSelecionado: string;
  setPacienteIdSelecionado: (valor: string) => void;
  abaAtiva: string;
  setAbaAtiva: (valor: string) => void;
  limparFiltros: () => void;
  temFiltrosAtivos: boolean;
}

export interface RetornoFiltrosHistorico {
  filtros: FiltrosHistorico;
  historicoFiltrado: ItemHistorico[];
  estatisticas: EstatisticasHistorico;
}

export function useFiltrosHistorico(
  itensHistorico: ItemHistorico[]
): RetornoFiltrosHistorico {
  const [termoBusca, setTermoBusca] = useState("");
  const [data, setData] = useState<Date | undefined>(undefined);
  const [pacienteIdSelecionado, setPacienteIdSelecionado] = useState("all");
  const [abaAtiva, setAbaAtiva] = useState("all");

  const temFiltrosAtivos =
    !!termoBusca || !!data || pacienteIdSelecionado !== "all";

  const limparFiltros = () => {
    setTermoBusca("");
    setData(undefined);
    setPacienteIdSelecionado("all");
  };

  const historicoFiltrado = useMemo(() => {
    return itensHistorico.filter((item) => {
      // Busca textual
      const correspondeBusca =
        item.patientName.toLowerCase().includes(termoBusca.toLowerCase()) ||
        item.medicationName.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (item.analysis?.recommendation || "")
          .toLowerCase()
          .includes(termoBusca.toLowerCase());

      // Filtro de data
      const correspondeData = data
        ? new Date(item.timestamp).toDateString() === data.toDateString()
        : true;

      // Filtro de paciente
      const correspondePaciente =
        pacienteIdSelecionado === "all"
          ? true
          : item.patientId === pacienteIdSelecionado;

      // Filtro por aba
      let correspondeAba = true;
      if (abaAtiva === "symptom") {
        correspondeAba =
          !!item.subjectiveState.effects ||
          item.subjectiveState.mood <= 3 ||
          item.subjectiveState.sleep <= 4;
      } else if (abaAtiva === "recommendation") {
        correspondeAba = !!item.analysis.recommendation;
      } else if (abaAtiva === "alert") {
        correspondeAba =
          !!item.analysis?.riskAssessment &&
          item.analysis.riskAssessment.length > 0 &&
          item.analysis.riskAssessment.some((r) => r.level !== "Baixo");
      }

      return (
        correspondeBusca && correspondeData && correspondePaciente && correspondeAba
      );
    });
  }, [itensHistorico, termoBusca, data, pacienteIdSelecionado, abaAtiva]);

  const estatisticas = useMemo<EstatisticasHistorico>(() => {
    const totalFiltrado = historicoFiltrado.length;
    const pacientesUnicos = new Set(
      historicoFiltrado.map((i) => i.patientId)
    ).size;
    const eficaciaMedia =
      totalFiltrado > 0
        ? Math.round(
            historicoFiltrado.reduce(
              (acc, i) => acc + (i.analysis?.efficacyPrediction || 0),
              0
            ) / totalFiltrado
          )
        : 0;
    const quantidadeAlertas = historicoFiltrado.filter((i) =>
      i.analysis?.riskAssessment?.some((r) => r.level !== "Baixo")
    ).length;

    return { totalFiltrado, pacientesUnicos, eficaciaMedia, quantidadeAlertas };
  }, [historicoFiltrado]);

  return {
    filtros: {
      termoBusca,
      setTermoBusca,
      data,
      setData,
      pacienteIdSelecionado,
      setPacienteIdSelecionado,
      abaAtiva,
      setAbaAtiva,
      limparFiltros,
      temFiltrosAtivos,
    },
    historicoFiltrado,
    estatisticas,
  };
}
