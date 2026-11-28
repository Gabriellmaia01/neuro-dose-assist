import { useState, useMemo } from "react";
import { ItemHistorico, EstatisticasHistorico } from "@/lib/tiposHistorico";
import type { ActivityLog } from "@/lib/activityLog";
import type { Patient } from "@/lib/patients";

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
  atividadesFiltradas: ActivityLog[];
  estatisticas: EstatisticasHistorico;
}

export function useFiltrosHistorico(
  itensHistorico: ItemHistorico[],
  logsAtividade: ActivityLog[] = [],
  pacientes: Patient[] = []
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
    const query = termoBusca.trim().toLowerCase();
    return itensHistorico.filter((item) => {
      // Busca textual
      const correspondeBusca =
        !query ||
        item.patientName.toLowerCase().includes(query) ||
        item.medicationName.toLowerCase().includes(query) ||
        (item.analysis?.recommendation || "").toLowerCase().includes(query);

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

  const atividadesFiltradas = useMemo(() => {
    const safeLogs = Array.isArray(logsAtividade) ? logsAtividade : [];
    const query = termoBusca.trim().toLowerCase();
    const pacienteSelecionadoNome =
      pacienteIdSelecionado !== "all"
        ? pacientes
            .find((p) => p.id === pacienteIdSelecionado)
            ?.name?.toLowerCase() || ""
        : "";

    return safeLogs.filter((log) => {
      const entityName = (log.entityName || "").toLowerCase();
      const description = (log.description || "").toLowerCase();
      const userName = (log.userName || "").toLowerCase();
      const userEmail = (log.userEmail || "").toLowerCase();

      const correspondeBusca =
        !query ||
        entityName.includes(query) ||
        description.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query);

      const correspondeData = data
        ? (() => {
            const dt = new Date(log.timestamp);
            return !Number.isNaN(dt.getTime()) && dt.toDateString() === data.toDateString();
          })()
        : true;

      const correspondePaciente =
        pacienteIdSelecionado === "all"
          ? true
          : log.entityId === pacienteIdSelecionado ||
            (pacienteSelecionadoNome.length > 0 &&
              (entityName.includes(pacienteSelecionadoNome) ||
                description.includes(pacienteSelecionadoNome)));

      return correspondeBusca && correspondeData && correspondePaciente;
    });
  }, [logsAtividade, pacientes, termoBusca, data, pacienteIdSelecionado]);

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
    atividadesFiltradas,
    estatisticas,
  };
}
